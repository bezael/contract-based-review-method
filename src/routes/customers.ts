import type { FastifyPluginAsync } from 'fastify'
import type { Db } from '../lib/db.js'
import { createCustomer, getCustomer, type NewCustomer } from '../services/customers.js'

const newCustomerSchema = {
  type: 'object',
  required: ['name', 'taxId'],
  additionalProperties: false,
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 120 },
    // Company RNC (9 digits) or personal ID (11 digits).
    taxId: { type: 'string', pattern: '^([0-9]{9}|[0-9]{11})$' },
    email: { type: 'string', format: 'email' },
  },
} as const

export const customerRoutes: FastifyPluginAsync<{ db: Db }> = async (app, { db }) => {
  app.post<{ Body: NewCustomer }>(
    '/customers',
    { schema: { body: newCustomerSchema } },
    async (request, reply) => {
      const customer = await createCustomer(db, request.body)
      return reply.status(201).send(customer)
    },
  )

  app.get<{ Params: { id: string } }>('/customers/:id', async (request) => {
    return getCustomer(db, request.params.id)
  })
}
