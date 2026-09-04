import type { FastifyPluginAsync } from 'fastify'
import type { Db } from '../lib/db.js'
import {
  aDto,
  crearFactura,
  emitirFactura,
  obtenerFactura,
  type NuevaFactura,
} from '../services/facturas.js'

const nuevaFacturaSchema = {
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

export const rutasFacturas: FastifyPluginAsync<{ db: Db }> = async (app, { db }) => {
  app.post<{ Body: NuevaFactura }>(
    '/facturas',
    { schema: { body: nuevaFacturaSchema } },
    async (request, reply) => {
      const factura = await crearFactura(db, request.body)
      return reply.status(201).send(aDto(factura))
    },
  )

  app.get<{ Params: { id: string } }>('/facturas/:id', async (request) => {
    return aDto(await obtenerFactura(db, request.params.id))
  })

  app.post<{ Params: { id: string } }>('/facturas/:id/emitir', async (request) => {
    return aDto(await emitirFactura(db, request.params.id))
  })
}
