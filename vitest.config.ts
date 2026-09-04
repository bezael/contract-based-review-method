import { defineConfig } from 'vitest/config'

// Dos proyectos, dos velocidades:
//   unit → lógica pura (money, errores, servicios con DB en memoria). Bucle corto.
//   api  → rutas completas con Fastify inject. Bucle largo.
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['src/lib/**/*.test.ts', 'src/services/**/*.test.ts'],
        },
      },
      {
        test: {
          name: 'api',
          include: ['src/routes/**/*.test.ts', 'src/app.test.ts'],
        },
      },
    ],
  },
})
