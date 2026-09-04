import { describe, expect, it } from 'vitest'
import { buildApp } from './app.js'
import { crearDbDePrueba } from './test/db.js'

describe('GET /health', () => {
  it('responde ok', async () => {
    const app = buildApp({ db: await crearDbDePrueba() })
    const respuesta = await app.inject({ method: 'GET', url: '/health' })
    expect(respuesta.statusCode).toBe(200)
    expect(respuesta.json()).toEqual({ ok: true })
    await app.close()
  })
})
