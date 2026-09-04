import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { crearDb, type Db } from '../lib/db.js'

/**
 * Base de datos SQLite en memoria con las migraciones aplicadas.
 *
 * Cada fichero de test crea la suya: aislamiento total y cero ficheros que
 * limpiar. Las migraciones se leen de prisma/migrations, así que los tests
 * prueban el mismo esquema que producción.
 */
export async function crearDbDePrueba(): Promise<Db> {
  const db = crearDb(':memory:')
  const directorio = join(process.cwd(), 'prisma', 'migrations')
  const carpetas = readdirSync(directorio)
    .filter((nombre) => /^\d/.test(nombre))
    .sort()

  for (const carpeta of carpetas) {
    const sql = readFileSync(join(directorio, carpeta, 'migration.sql'), 'utf8')
    const sentencias = sql
      .split(';')
      .map((sentencia) => sentencia.trim())
      .filter((sentencia) => sentencia.length > 0)
    for (const sentencia of sentencias) {
      await db.$executeRawUnsafe(sentencia)
    }
  }
  return db
}

export async function clienteDePrueba(db: Db, rnc = '101010101') {
  return db.cliente.create({ data: { nombre: 'Cliente de prueba', rnc } })
}
