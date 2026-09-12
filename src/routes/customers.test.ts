import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { buildApp } from '../app.js'
import { createTestDb } from '../test/db.js'

let app: ReturnType<typeof buildApp>

beforeEach(async () => {
  app = buildApp({ db: await createTestDb() })
})

afterEach(async () => {
  await app.close()
})

describe('POST /customers', () => {
  it('creates a customer and returns 201', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/customers',
      payload: { name: 'Operaciones SRL', taxId: '131234567', email: 'ops@example.do' },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toMatchObject({ name: 'Operaciones SRL', taxId: '131234567' })
    expect(response.json().id).toEqual(expect.any(String))
  })

  it('returns 409 when the RNC already exists', async () => {
    const payload = { name: 'Uno', taxId: '131234567' }
    await app.inject({ method: 'POST', url: '/customers', payload })
    const duplicate = await app.inject({ method: 'POST', url: '/customers', payload })

    expect(duplicate.statusCode).toBe(409)
    expect(duplicate.json().error).toBe('DUPLICATE_RNC')
  })

  it('returns 400 when the body does not match the schema', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/customers',
      payload: { name: 'No tax id' },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json().error).toBe('VALIDATION')
  })
})

describe('GET /customers/:id', () => {
  it('returns 404 when it does not exist', async () => {
    const response = await app.inject({ method: 'GET', url: '/customers/nothing' })
    expect(response.statusCode).toBe(404)
    expect(response.json().error).toBe('CUSTOMER_NOT_FOUND')
  })
})
