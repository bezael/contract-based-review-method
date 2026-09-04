import { beforeEach, describe, expect, it } from 'vitest'
import type { Db } from '../lib/db.js'
import { AppError } from '../lib/errors.js'
import { clienteDePrueba, crearDbDePrueba } from '../test/db.js'
import { crearFactura, emitirFactura, obtenerFactura } from './facturas.js'

let db: Db
let clienteId: string

beforeEach(async () => {
  db = await crearDbDePrueba()
  clienteId = (await clienteDePrueba(db)).id
})

describe('crearFactura', () => {
  it('calcula subtotal, ITBIS y total en céntimos', async () => {
    const factura = await crearFactura(db, {
      clienteId,
      lineas: [
        { descripcion: 'Consultoría', cantidad: 2, precioUnitario: '12.50' },
        { descripcion: 'Licencia', cantidad: 1, precioUnitario: '100.00' },
      ],
    })

    expect(factura.estado).toBe('BORRADOR')
    expect(factura.numero).toBeNull()
    expect(factura.subtotalCent).toBe(12500)
    expect(factura.impuestoCent).toBe(2250)
    expect(factura.totalCent).toBe(14750)
    expect(factura.lineas).toHaveLength(2)
    expect(factura.lineas[0]?.totalCent).toBe(2500)
  })

  it('falla si el cliente no existe', async () => {
    await expect(
      crearFactura(db, {
        clienteId: 'no-existe',
        lineas: [{ descripcion: 'X', cantidad: 1, precioUnitario: '1.00' }],
      }),
    ).rejects.toMatchObject({ codigo: 'CLIENTE_NO_ENCONTRADO' })
  })
})

describe('obtenerFactura', () => {
  it('lanza FACTURA_NO_ENCONTRADA si no existe', async () => {
    await expect(obtenerFactura(db, 'nada')).rejects.toBeInstanceOf(AppError)
  })
})

describe('emitirFactura', () => {
  const lineas = [{ descripcion: 'Servicio', cantidad: 1, precioUnitario: '50.00' }]

  it('pasa a EMITIDA y asigna número correlativo por año', async () => {
    const fecha = new Date('2026-03-10T15:00:00.000Z')
    const primera = await crearFactura(db, { clienteId, lineas })
    const segunda = await crearFactura(db, { clienteId, lineas })

    const emitida = await emitirFactura(db, primera.id, fecha)
    expect(emitida.estado).toBe('EMITIDA')
    expect(emitida.numero).toBe('F-2026-0001')
    expect(emitida.emitidaEn?.toISOString()).toBe('2026-03-10T15:00:00.000Z')

    const siguiente = await emitirFactura(db, segunda.id, fecha)
    expect(siguiente.numero).toBe('F-2026-0002')
  })

  it('reinicia la numeración cada año', async () => {
    const del2026 = await crearFactura(db, { clienteId, lineas })
    const del2027 = await crearFactura(db, { clienteId, lineas })

    await emitirFactura(db, del2026.id, new Date('2026-12-31T23:59:59.000Z'))
    const emitida = await emitirFactura(db, del2027.id, new Date('2027-01-01T00:00:00.000Z'))

    expect(emitida.numero).toBe('F-2027-0001')
  })
})
