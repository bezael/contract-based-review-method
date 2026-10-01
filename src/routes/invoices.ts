import type { FastifyPluginAsync } from 'fastify'
import type { Db } from '../lib/db.js'
import {
  toDto,
  createInvoice,
  issueInvoice,
  getInvoice,
} from '../services/invoices.js'

type CreateInvoiceRequest = {
  customerId: string
  lines: Array<{
    description: string
    quantity: number
    unitPrice: string
  }>
  discountPct?: number
}

const newInvoiceSchema = {
  type: 'object',
  required: ['customerId', 'lines'],
  additionalProperties: false,
  properties: {
    customerId: { type: 'string', minLength: 1 },
    discountPct: { type: 'integer', minimum: 0, maximum: 100 },
    lines: {
      type: 'array',
      minItems: 1,
      maxItems: 100,
      items: {
        type: 'object',
        required: ['description', 'quantity', 'unitPrice'],
        additionalProperties: false,
        properties: {
          description: { type: 'string', minLength: 1, maxLength: 200 },
          quantity: { type: 'integer', minimum: 1 },
          unitPrice: { type: 'string', pattern: '^\\d{1,12}(\\.\\d{1,2})?$' },
        },
      },
    },
  },
} as const

export const invoiceRoutes: FastifyPluginAsync<{ db: Db }> = async (app, { db }) => {
  app.post<{ Body: CreateInvoiceRequest }>(
    '/invoices',
    { schema: { body: newInvoiceSchema } },
    async (request, reply) => {
      const invoice = await createInvoice(db, {
        customerId: request.body.customerId,
        lines: request.body.lines,
        discountPct: request.body.discountPct ?? 0,
      })
      return reply.status(201).send(toDto(invoice))
    },
  )

  app.get<{ Params: { id: string } }>('/invoices/:id', async (request) => {
    return toDto(await getInvoice(db, request.params.id))
  })

  app.post<{ Params: { id: string } }>('/invoices/:id/issue', async (request) => {
    return toDto(await issueInvoice(db, request.params.id))
  })
}
