import Fastify, { type FastifyError } from 'fastify'
import type { Db } from './lib/db.js'
import { isAppError } from './lib/errors.js'
import { customerRoutes } from './routes/customers.js'
import { invoiceRoutes } from './routes/invoices.js'

export type AppOptions = {
  db: Db
  logger?: boolean
}

/**
 * Builds the application without starting it. Tests use it with `inject`;
 * `server.ts` actually starts it.
 */
export function buildApp({ db, logger = false }: AppOptions) {
  const app = Fastify({ logger })

  app.setErrorHandler((error: FastifyError, _request, reply) => {
    if (isAppError(error)) {
      return reply.status(error.status).send({ error: error.code, message: error.message })
    }
    if (error.validation) {
      return reply.status(400).send({ error: 'VALIDATION', message: error.message })
    }
    app.log.error(error)
    return reply.status(500).send({ error: 'INTERNAL', message: 'Internal error' })
  })

  app.get('/health', async () => ({ ok: true }))

  app.register(customerRoutes, { db })
  app.register(invoiceRoutes, { db })

  return app
}
