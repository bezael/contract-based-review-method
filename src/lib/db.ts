import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '../generated/prisma/client.js'

export type Db = InstanceType<typeof PrismaClient>

/**
 * Crea un cliente de Prisma sobre SQLite.
 *
 * `url` is a file (`file:./data/invoices.db`) or `:memory:` for tests.
 * El cliente generado vive en src/generated/ y se regenera en `pnpm install`.
 */
export function createDb(url: string): Db {
  const adapter = new PrismaBetterSqlite3({ url })
  return new PrismaClient({ adapter })
}
