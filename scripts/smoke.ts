/**
 * Smoke test: la aplicación arranca de verdad, escucha en un puerto y
 * responde. No prueba lógica; prueba que nada del arranque está roto
 * (imports, cliente de Prisma generado, binario de SQLite, plugins).
 */
import { buildApp } from '../src/app.js'
import { crearDbDePrueba } from '../src/test/db.js'

const app = buildApp({ db: await crearDbDePrueba() })

try {
  const direccion = await app.listen({ port: 0, host: '127.0.0.1' })
  const respuesta = await fetch(`${direccion}/health`)
  const cuerpo = (await respuesta.json()) as { ok?: boolean }
  if (respuesta.status !== 200 || cuerpo.ok !== true) {
    throw new Error(`/health respondió ${respuesta.status}: ${JSON.stringify(cuerpo)}`)
  }
  console.log(`SMOKE OK · ${direccion}/health -> ${respuesta.status}`)
} catch (error) {
  console.error('SMOKE FALLÓ')
  console.error(error)
  process.exitCode = 1
} finally {
  await app.close()
}
