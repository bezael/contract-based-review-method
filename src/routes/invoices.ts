import type { FastifyPluginAsync } from 'fastify'
import type { Db } from '../lib/db.js'
import {
  toDto,
  createInvoice,
  issueInvoice,
  getInvoice,
} from '../services/invoices.js'

type CreateInvoiceRequest = {
  clienteId: string
  lineas: Array<{
    descripcion: string
    cantidad: number
    precioUnitario: string
  }>
}

const newInvoiceSchema = {
  type: 'object',
  required: ['clienteId', 'lineas'],
  additionalProperties: false,
  properties: {
    clienteId: { type: 'string', minLength: 1 },
    lineas: {
      type: 'array',
      minItems: 1,
      maxItems: 100,
      items: {
        type: 'object',
        required: ['descripcion', 'cantidad', 'precioUnitario'],
        additionalProperties: false,
        properties: {
          descripcion: { type: 'string', minLength: 1, maxLength: 200 },
          cantidad: { type: 'integer', minimum: 1 },
          precioUnitario: { type: 'string', pattern: '^\\d{1,12}(\\.\\d{1,2})?$' },
        },
      },
    },
  },
} as const

export const invoiceRoutes: FastifyPluginAsync<{ db: Db }> = async (app, { db }) => {
  app.post<{ Body: CreateInvoiceRequest }>(
    '/facturas',
    { schema: { body: newInvoiceSchema } },
    async (request, reply) => {
      const invoice = await createInvoice(db, {
        customerId: request.body.clienteId,
        lines: request.body.lineas.map((line) => ({
          description: line.descripcion,
          quantity: line.cantidad,
          unitPrice: line.precioUnitario,
        })),
      })
      return reply.status(201).send(toDto(invoice))
    },
  )

  app.get<{ Params: { id: string } }>('/facturas/:id', async (request) => {
    return toDto(await getInvoice(db, request.params.id))
  })

  app.post<{ Params: { id: string } }>('/facturas/:id/emitir', async (request) => {
    return toDto(await issueInvoice(db, request.params.id))
  })
}
