import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createDb, type Db } from '../lib/db.js'

/**
 * In-memory SQLite database with every migration applied.
 *
 * Each test file creates its own: full isolation and no files to clean up.
 * Migrations are read from prisma/migrations, so tests exercise the same
 * schema as production.
 */
export async function createTestDb(): Promise<Db> {
  const db = createDb(':memory:')
  const directory = join(process.cwd(), 'prisma', 'migrations')
  const folders = readdirSync(directory)
    .filter((name) => /^\d/.test(name))
    .sort()

  for (const folder of folders) {
    const sql = readFileSync(join(directory, folder, 'migration.sql'), 'utf8')
    const statements = sql
      .split(';')
      .map((statement) => statement.trim())
      .filter((statement) => statement.length > 0)
    for (const statement of statements) {
      await db.$executeRawUnsafe(statement)
    }
  }
  return db
}

export async function testCustomer(db: Db, taxId = '101010101') {
  return db.customer.create({ data: { name: 'Test customer', taxId } })
}
