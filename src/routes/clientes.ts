import type { FastifyPluginAsync } from 'fastify'
import type { Db } from '../lib/db.js'
import { crearCliente, obtenerCliente, type NuevoCliente } from '../services/clientes.js'

const nuevoClienteSchema = {
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

export const rutasClientes: FastifyPluginAsync<{ db: Db }> = async (app, { db }) => {
  app.post<{ Body: NuevoCliente }>(
    '/clientes',
    { schema: { body: nuevoClienteSchema } },
    async (request, reply) => {
      const cliente = await crearCliente(db, request.body)
      return reply.status(201).send(cliente)
    },
  )

  app.get<{ Params: { id: string } }>('/clientes/:id', async (request) => {
    return obtenerCliente(db, request.params.id)
  })
}
