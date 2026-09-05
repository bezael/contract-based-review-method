import { buildApp } from './app.js'
import { createDb } from './lib/db.js'

const db = createDb(process.env.DATABASE_URL ?? 'file:./data/invoices.db')
const app = buildApp({ db, logger: true })
const port = Number(process.env.PORT ?? 3000)

await app.listen({ port, host: '0.0.0.0' })
