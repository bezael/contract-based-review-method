import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { buildApp } from '../app.js'
import { testCustomer, createTestDb } from '../test/db.js'

let app: ReturnType<typeof buildApp>
let customerId: string

beforeEach(async () => {
  const db = await createTestDb()
  customerId = (await testCustomer(db)).id
  app = buildApp({ db })
})

afterEach(async () => {
  await app.close()
})

const lines = [
  { description: 'Consultoría', quantity: 2, unitPrice: '12.50' },
  { description: 'Licencia', quantity: 1, unitPrice: '100.00' },
]

describe('POST /invoices', () => {
  it('creates a draft and returns formatted amounts', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/invoices',
      payload: { customerId, lines },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject({
      status: 'DRAFT',
      number: null,
      subtotal: '125.00',
      tax: '22.50',
      total: '147.50',
      issuedAt: null,
    })
    expect(response.json().lines[0]).toMatchObject({ unitPrice: '12.50', total: '25.00' })
  })

  it('rejects an invoice with no lines with 400', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/invoices',
      payload: { customerId, lines: [] },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json().error).toBe('VALIDATION')
  })

  it('returns 404 when the customer does not exist', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/invoices',
      payload: { customerId: 'nothing', lines },
    })

    expect(response.statusCode).toBe(404)
    expect(response.json().error).toBe('CUSTOMER_NOT_FOUND')
  })

  it('applies discountPct to the subtotal before tax', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/invoices',
      payload: {
        customerId,
        discountPct: 10,
        lines: [{ description: 'Licencia', quantity: 1, unitPrice: '100.00' }],
      },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject({
      discountPct: 10,
      discount: '10.00',
      subtotal: '100.00',
      tax: '16.20',
      total: '106.20',
    })
  })

  it('defaults discountPct to 0 when omitted', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/invoices',
      payload: { customerId, lines },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject({
      discountPct: 0,
      discount: '0.00',
      subtotal: '125.00',
      tax: '22.50',
      total: '147.50',
    })
  })

  it('rejects discountPct 101, -1 and 12.5 with 400 VALIDATION', async () => {
    const db = await createTestDb()
    const ownCustomerId = (await testCustomer(db)).id
    const ownApp = buildApp({ db })

    try {
      for (const discountPct of [101, -1, 12.5]) {
        const response = await ownApp.inject({
          method: 'POST',
          url: '/invoices',
          payload: { customerId: ownCustomerId, discountPct, lines },
        })

        expect(response.statusCode).toBe(400)
        expect(response.json().error).toBe('VALIDATION')
      }
      expect(await db.invoice.count()).toBe(0)
    } finally {
      await ownApp.close()
    }
  })

  it('rounds the discount half up', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/invoices',
      payload: {
        customerId,
        discountPct: 10,
        lines: [{ description: 'Tornillo', quantity: 1, unitPrice: '0.05' }],
      },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject({ subtotal: '0.05', discount: '0.01' })
  })
})

describe('GET /invoices/:id', () => {
  it('returns the invoice with its lines', async () => {
    const created = await app.inject({ method: 'POST', url: '/invoices', payload: { customerId, lines } })
    const response = await app.inject({ method: 'GET', url: `/invoices/${created.json().id}` })

    expect(response.statusCode).toBe(200)
    expect(response.json().lines).toHaveLength(2)
  })

  it('returns the same discount fields as creation', async () => {
    const created = await app.inject({
      method: 'POST',
      url: '/invoices',
      payload: { customerId, discountPct: 10, lines },
    })
    const response = await app.inject({ method: 'GET', url: `/invoices/${created.json().id}` })

    expect(response.statusCode).toBe(200)
    const fields = ['discountPct', 'discount', 'subtotal', 'tax', 'total'] as const
    for (const field of fields) {
      expect(response.json()[field]).toBeDefined()
      expect(response.json()[field]).toEqual(created.json()[field])
    }
  })

  it('returns 404 when it does not exist', async () => {
    const response = await app.inject({ method: 'GET', url: '/invoices/nothing' })
    expect(response.statusCode).toBe(404)
    expect(response.json().error).toBe('INVOICE_NOT_FOUND')
  })
})

describe('POST /invoices/:id/issue', () => {
  it('issues the draft and returns the assigned number', async () => {
    const created = await app.inject({ method: 'POST', url: '/invoices', payload: { customerId, lines } })
    const response = await app.inject({ method: 'POST', url: `/invoices/${created.json().id}/issue` })

    expect(response.statusCode).toBe(200)
    expect(response.json().status).toBe('ISSUED')
    expect(response.json().number).toMatch(/^F-\d{4}-0001$/)
    expect(response.json().issuedAt).toMatch(/Z$/)
  })
})
