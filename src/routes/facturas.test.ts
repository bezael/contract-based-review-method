import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { buildApp } from '../app.js'
import { clienteDePrueba, crearDbDePrueba } from '../test/db.js'

let app: ReturnType<typeof buildApp>
let clienteId: string

beforeEach(async () => {
  const db = await crearDbDePrueba()
  clienteId = (await clienteDePrueba(db)).id
  app = buildApp({ db })
})

afterEach(async () => {
  await app.close()
})

const lineas = [
  { descripcion: 'Consultoría', cantidad: 2, precioUnitario: '12.50' },
  { descripcion: 'Licencia', cantidad: 1, precioUnitario: '100.00' },
]

describe('POST /facturas', () => {
  it('crea un borrador y devuelve los importes formateados', async () => {
    const respuesta = await app.inject({
      method: 'POST',
      url: '/facturas',
      payload: { clienteId, lineas },
    })

    expect(respuesta.statusCode).toBe(201)
    expect(respuesta.json()).toMatchObject({
      estado: 'BORRADOR',
      numero: null,
      subtotal: '125.00',
      impuesto: '22.50',
      total: '147.50',
      emitidaEn: null,
    })
    expect(respuesta.json().lineas[0]).toMatchObject({ precioUnitario: '12.50', total: '25.00' })
  })

  it('rechaza una factura sin líneas con 400', async () => {
    const respuesta = await app.inject({
      method: 'POST',
      url: '/facturas',
      payload: { clienteId, lineas: [] },
    })

    expect(respuesta.statusCode).toBe(400)
    expect(respuesta.json().error).toBe('VALIDACION')
  })

  it('devuelve 404 si el cliente no existe', async () => {
    const respuesta = await app.inject({
      method: 'POST',
      url: '/facturas',
      payload: { clienteId: 'nada', lineas },
    })

    expect(respuesta.statusCode).toBe(404)
    expect(respuesta.json().error).toBe('CLIENTE_NO_ENCONTRADO')
  })
})

describe('GET /facturas/:id', () => {
  it('devuelve la factura con sus líneas', async () => {
    const creada = await app.inject({ method: 'POST', url: '/facturas', payload: { clienteId, lineas } })
    const respuesta = await app.inject({ method: 'GET', url: `/facturas/${creada.json().id}` })

    expect(respuesta.statusCode).toBe(200)
    expect(respuesta.json().lineas).toHaveLength(2)
  })

  it('devuelve 404 si no existe', async () => {
    const respuesta = await app.inject({ method: 'GET', url: '/facturas/nada' })
    expect(respuesta.statusCode).toBe(404)
    expect(respuesta.json().error).toBe('FACTURA_NO_ENCONTRADA')
  })
})

describe('POST /facturas/:id/emitir', () => {
  it('emite el borrador y devuelve el número asignado', async () => {
    const creada = await app.inject({ method: 'POST', url: '/facturas', payload: { clienteId, lineas } })
    const respuesta = await app.inject({ method: 'POST', url: `/facturas/${creada.json().id}/emitir` })

    expect(respuesta.statusCode).toBe(200)
    expect(respuesta.json().estado).toBe('EMITIDA')
    expect(respuesta.json().numero).toMatch(/^F-\d{4}-0001$/)
    expect(respuesta.json().emitidaEn).toMatch(/Z$/)
  })
})
