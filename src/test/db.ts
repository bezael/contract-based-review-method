import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createDb, type Db } from '../lib/db.js'

/**
 * Base de data SQLite en memoria con las migraciones aplicadas.
 *
 * Cada file de test crea la suya: aislamiento total y cero ficheros que
 * limpiar. Las migraciones se leen de prisma/migrations, así que los tests
 * prueban el mismo esquema que producción.
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

export async function testCustomer(db: Db, rnc = '101010101') {
  return db.customer.create({ data: { name: 'Test customer', taxId: rnc } })
}
