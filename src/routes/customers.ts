import type { FastifyPluginAsync } from 'fastify'
import type { Db } from '../lib/db.js'
import { createCustomer, getCustomer, type NewCustomer } from '../services/customers.js'

const newCustomerSchema = {
  type: 'object',
  required: ['nombre', 'rnc'],
  additionalProperties: false,
  properties: {
    nombre: { type: 'string', minLength: 1, maxLength: 120 },
    // RNC de empresa (9 dígitos) o cédula (11 dígitos).
    rnc: { type: 'string', pattern: '^([0-9]{9}|[0-9]{11})$' },
    email: { type: 'string', format: 'email' },
  },
} as const

export const customerRoutes: FastifyPluginAsync<{ db: Db }> = async (app, { db }) => {
  app.post<{ Body: NewCustomer }>(
    '/clientes',
    { schema: { body: newCustomerSchema } },
    async (request, reply) => {
      const customer = await createCustomer(db, request.body)
      return reply.status(201).send(customer)
    },
  )

  app.get<{ Params: { id: string } }>('/clientes/:id', async (request) => {
    return getCustomer(db, request.params.id)
  })
}
