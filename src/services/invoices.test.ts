import { beforeEach, describe, expect, it } from 'vitest'
import type { Db } from '../lib/db.js'
import { AppError } from '../lib/errors.js'
import { testCustomer, createTestDb } from '../test/db.js'
import { createInvoice, issueInvoice, getInvoice } from './invoices.js'

let db: Db
let customerId: string

beforeEach(async () => {
  db = await createTestDb()
  customerId = (await testCustomer(db)).id
})

describe('createInvoice', () => {
  it('calcula subtotal, ITBIS y total en céntimos', async () => {
    const invoice = await createInvoice(db, {
      customerId,
      lines: [
        { description: 'Consultoría', quantity: 2, unitPrice: '12.50' },
        { description: 'Licencia', quantity: 1, unitPrice: '100.00' },
      ],
    })

    expect(invoice.status).toBe('DRAFT')
    expect(invoice.number).toBeNull()
    expect(invoice.subtotalCents).toBe(12500)
    expect(invoice.taxCents).toBe(2250)
    expect(invoice.totalCents).toBe(14750)
    expect(invoice.lines).toHaveLength(2)
    expect(invoice.lines[0]?.totalCents).toBe(2500)
  })

  it('falla si el cliente no existe', async () => {
    await expect(
      createInvoice(db, {
        customerId: 'no-existe',
        lines: [{ description: 'X', quantity: 1, unitPrice: '1.00' }],
      }),
    ).rejects.toMatchObject({ errorCode: 'CLIENTE_NO_ENCONTRADO' })
  })
})

describe('getInvoice', () => {
  it('lanza FACTURA_NO_ENCONTRADA si no existe', async () => {
    await expect(getInvoice(db, 'nada')).rejects.toBeInstanceOf(AppError)
  })
})

describe('issueInvoice', () => {
  const lines = [{ description: 'Servicio', quantity: 1, unitPrice: '50.00' }]

  it('pasa a ISSUED y asigna número correlativo por año', async () => {
    const date = new Date('2026-03-10T15:00:00.000Z')
    const first = await createInvoice(db, { customerId, lines })
    const second = await createInvoice(db, { customerId, lines })

    const issued = await issueInvoice(db, first.id, date)
    expect(issued.status).toBe('ISSUED')
    expect(issued.number).toBe('F-2026-0001')
    expect(issued.issuedAt?.toISOString()).toBe('2026-03-10T15:00:00.000Z')

    const next = await issueInvoice(db, second.id, date)
    expect(next.number).toBe('F-2026-0002')
  })

  it('reinicia la numeración cada año', async () => {
    const from2026 = await createInvoice(db, { customerId, lines })
    const from2027 = await createInvoice(db, { customerId, lines })

    await issueInvoice(db, from2026.id, new Date('2026-12-31T23:59:59.000Z'))
    const issued = await issueInvoice(db, from2027.id, new Date('2027-01-01T00:00:00.000Z'))

    expect(issued.number).toBe('F-2027-0001')
  })
})
