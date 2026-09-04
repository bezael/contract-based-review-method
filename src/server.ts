import { buildApp } from './app.js'
import { crearDb } from './lib/db.js'

const db = crearDb(process.env.DATABASE_URL ?? 'file:./data/facturas.db')
const app = buildApp({ db, logger: true })
const port = Number(process.env.PORT ?? 3000)

await app.listen({ port, host: '0.0.0.0' })
