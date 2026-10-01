import { describe, expect, it } from 'vitest'
import { buildApp } from './app.js'
import { createTestDb } from './test/db.js'

describe('GET /health', () => {
  it('responds ok', async () => {
    const app = buildApp({ db: await createTestDb() })
    const response = await app.inject({ method: 'GET', url: '/health' })
    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ ok: true })
    await app.close()
  })
})
