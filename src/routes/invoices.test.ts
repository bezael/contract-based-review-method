import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { buildApp } from '../app.js'
import { testCustomer, createTestDb } from '../test/db.js'

let app: ReturnType<typeof buildApp>
let clienteId: string

beforeEach(async () => {
  const db = await createTestDb()
  clienteId = (await testCustomer(db)).id
  app = buildApp({ db })
})

afterEach(async () => {
  await app.close()
})

const lines = [
  { descripcion: 'Consultoría', cantidad: 2, precioUnitario: '12.50' },
  { descripcion: 'Licencia', cantidad: 1, precioUnitario: '100.00' },
]

describe('POST /facturas', () => {
  it('crea un borrador y devuelve los importes formateados', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/facturas',
      payload: { clienteId, lineas: lines },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject({
      estado: 'DRAFT',
      numero: null,
      subtotal: '125.00',
      impuesto: '22.50',
      total: '147.50',
      emitidaEn: null,
    })
    expect(response.json().lineas[0]).toMatchObject({ precioUnitario: '12.50', total: '25.00' })
  })

  it('rechaza una factura sin líneas con 400', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/facturas',
      payload: { clienteId, lineas: [] },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json().error).toBe('VALIDACION')
  })

  it('devuelve 404 si el cliente no existe', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/facturas',
      payload: { clienteId: 'nada', lineas: lines },
    })

    expect(response.statusCode).toBe(404)
    expect(response.json().error).toBe('CLIENTE_NO_ENCONTRADO')
  })
})

describe('GET /facturas/:id', () => {
  it('devuelve la factura con sus líneas', async () => {
    const created = await app.inject({ method: 'POST', url: '/facturas', payload: { clienteId, lineas: lines } })
    const response = await app.inject({ method: 'GET', url: `/facturas/${created.json().id}` })

    expect(response.statusCode).toBe(200)
    expect(response.json().lineas).toHaveLength(2)
  })

  it('devuelve 404 si no existe', async () => {
    const response = await app.inject({ method: 'GET', url: '/facturas/nada' })
    expect(response.statusCode).toBe(404)
    expect(response.json().error).toBe('FACTURA_NO_ENCONTRADA')
  })
})

describe('POST /facturas/:id/emitir', () => {
  it('emite el borrador y devuelve el número asignado', async () => {
    const created = await app.inject({ method: 'POST', url: '/facturas', payload: { clienteId, lineas: lines } })
    const response = await app.inject({ method: 'POST', url: `/facturas/${created.json().id}/emitir` })

    expect(response.statusCode).toBe(200)
    expect(response.json().estado).toBe('ISSUED')
    expect(response.json().numero).toMatch(/^F-\d{4}-0001$/)
    expect(response.json().emitidaEn).toMatch(/Z$/)
  })
})
