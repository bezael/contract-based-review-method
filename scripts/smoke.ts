/**
 * Smoke test: starts the application, listens on a port, and responds.
 * It does not test business logic; it verifies startup dependencies such as
 * imports, the generated Prisma client, the SQLite binary, and plugins.
 */
import { buildApp } from '../src/app.js'
import { createTestDb } from '../src/test/db.js';

const app = buildApp({ db: await createTestDb() });

try {
  const address = await app.listen({ port: 0, host: '127.0.0.1' })
  const response = await fetch(`${address}/health`)
  const body = (await response.json()) as { ok?: boolean }
  if (response.status !== 200 || body.ok !== true) {
    throw new Error(`/health returned ${response.status}: ${JSON.stringify(body)}`)
  }
  console.log(`SMOKE OK · ${address}/health -> ${response.status}`)
} catch (error) {
  console.error('SMOKE FAILED')
  console.error(error)
  process.exitCode = 1
} finally {
  await app.close()
}
