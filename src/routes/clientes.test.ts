import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { buildApp } from '../app.js'
import { crearDbDePrueba } from '../test/db.js'

let app: ReturnType<typeof buildApp>

beforeEach(async () => {
  app = buildApp({ db: await crearDbDePrueba() })
})

afterEach(async () => {
  await app.close()
})

describe('POST /clientes', () => {
  it('crea un cliente y devuelve 201', async () => {
    const respuesta = await app.inject({
      method: 'POST',
      url: '/clientes',
      payload: { nombre: 'Operaciones SRL', rnc: '131234567', email: 'ops@ejemplo.do' },
    })

    expect(respuesta.statusCode).toBe(201)
    expect(respuesta.json()).toMatchObject({ nombre: 'Operaciones SRL', rnc: '131234567' })
    expect(respuesta.json().id).toEqual(expect.any(String))
  })

  it('devuelve 409 si el RNC ya existe', async () => {
    const payload = { nombre: 'Uno', rnc: '131234567' }
    await app.inject({ method: 'POST', url: '/clientes', payload })
    const repetida = await app.inject({ method: 'POST', url: '/clientes', payload })

    expect(repetida.statusCode).toBe(409)
    expect(repetida.json().error).toBe('RNC_DUPLICADO')
  })

  it('devuelve 400 si el cuerpo no cumple el esquema', async () => {
    const respuesta = await app.inject({
      method: 'POST',
      url: '/clientes',
      payload: { nombre: 'Sin RNC' },
    })

    expect(respuesta.statusCode).toBe(400)
    expect(respuesta.json().error).toBe('VALIDACION')
  })
})

describe('GET /clientes/:id', () => {
  it('devuelve 404 si no existe', async () => {
    const respuesta = await app.inject({ method: 'GET', url: '/clientes/nada' })
    expect(respuesta.statusCode).toBe(404)
    expect(respuesta.json().error).toBe('CLIENTE_NO_ENCONTRADO')
  })
})
