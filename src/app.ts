import Fastify, { type FastifyError } from 'fastify'
import type { Db } from './lib/db.js'
import { esAppError } from './lib/errors.js'
import { rutasClientes } from './routes/clientes.js'
import { rutasFacturas } from './routes/facturas.js'

export type OpcionesApp = {
  db: Db
  logger?: boolean
}

/**
 * Construye la aplicación sin arrancarla. Los tests la usan con `inject`;
 * `server.ts` la arranca de verdad.
 */
export function buildApp({ db, logger = false }: OpcionesApp) {
  const app = Fastify({ logger })

  app.setErrorHandler((error: FastifyError, _request, reply) => {
    if (esAppError(error)) {
      return reply.status(error.status).send({ error: error.codigo, mensaje: error.message })
    }
    if (error.validation) {
      return reply.status(400).send({ error: 'VALIDACION', mensaje: error.message })
    }
    app.log.error(error)
    return reply.status(500).send({ error: 'INTERNO', mensaje: 'Error interno' })
  })

  app.get('/health', async () => ({ ok: true }))

  app.register(rutasClientes, { db })
  app.register(rutasFacturas, { db })

  return app
}
