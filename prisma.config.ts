import { defineConfig } from 'prisma/config'

// La URL no sale de .env a propósito: el fichero SQLite vive en data/ y no hay
// nada secreto en ella. Los tests no usan esta base: crean la suya en un
// directorio temporal (ver src/test/db.ts).
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL ?? 'file:./data/invoices.db',
  },
})
