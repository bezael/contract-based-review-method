# AGENTS.md

API de facturación interna. Emite y consulta facturas para el equipo de
operaciones. No es pública: todo el tráfico entra por el gateway, así que no
hay autenticación ni rate limiting aquí, y no hay que añadirlos.

Es el repositorio del workshop **SDD + Agentic Engineering · Revisión por
Contrato** (Dominicode). Este fichero es el contrato permanente del repo. El
contrato de cada tarea vive en `specs/<slug>/spec.md`.

## Stack

- **Lenguaje:** TypeScript 6.0, Node 24 LTS, ESM (`"type": "module"`, imports con extensión `.js`)
- **Framework:** Fastify 5
- **Gestor de paquetes:** pnpm 11 — derivado de `pnpm-lock.yaml`. No uses otro.
- **Base de datos:** SQLite vía Prisma 7 con el adaptador `better-sqlite3`. Fichero local en `data/`, sin servicios externos.
- **Tests:** Vitest 4, en dos proyectos: `unit` (lib y servicios) y `api` (rutas con `inject`)
- **Lint:** ESLint 10 con `typescript-eslint`, configuración plana en `eslint.config.js`

## Cómo se trabaja

1. Toda tarea nace de un Issue y se firma en `specs/<slug>/spec.md` antes de
   tocar código (plantilla en `specs/spec.template.md`).
2. La rama se llama `feat/<slug>`, `fix/<slug>` o `refactor/<slug>`. El slug es
   el de la carpeta de la spec: así el carril y el veredicto saben qué contrato aplica.
3. Se implementa solo lo que la spec pide, dentro de su alcance de modificación.
4. Antes de abrir la PR: `pnpm verdict specs/<slug>/spec.md --write`. Lo que
   sale ahí es lo que lee la persona que revisa, en vez del diff.
5. Al cambiar de rama, `pnpm db:generate`. El cliente de Prisma generado no
   está en git; si es de otro esquema, los tests fallan con "no such column".

## Verificación

Estos comandos están ejecutados y comprobados. Son el harness: si uno falla,
el trabajo no está hecho. Tiempos medidos en caliente en un portátil; la
primera ejecución tarda el doble.

### Bucle corto — después de cada cambio

```bash
pnpm typecheck      # 3s   tsc --noEmit
pnpm lint           # 3s   eslint .
pnpm test:unit      # 2s   vitest, proyecto unit
```

### Bucle largo — antes de abrir la PR

```bash
pnpm build          # 3s   tsc -p tsconfig.build.json -> dist/
pnpm test           # 5s   vitest, unit + api
pnpm smoke          # 3s   arranca la app en un puerto libre y pide /health
```

### Veredicto de la tarea

```bash
pnpm verdict specs/<slug>/spec.md       # ejecuta cada criterio de la spec y comprueba el alcance
pnpm verdict:scope                      # solo el alcance, sin ejecutar nada
```

### Rojos conocidos

Ninguno. Todo el harness está en verde a fecha de 4 de septiembre de 2026.
Si algo falla, lo rompiste tú.

## Convenciones

Detectadas leyendo el código, no impuestas desde fuera:

- Los handlers de `src/routes/` no hablan con Prisma. Pasan por un servicio en `src/services/`.
- Todo error de dominio es un `AppError` de `src/lib/errors.ts`, con un código del catálogo `CODIGOS`. No se lanzan strings ni `Error` pelado: eso es un 500 y se investiga.
- Los importes son enteros en céntimos en todo el código y en la base de datos. Entran y salen de la API como string decimal (`"1234.56"`) a través de `src/lib/money.ts`. Nunca `Float`.
- Los estados de factura se acotan en `ESTADOS` (`src/services/facturas.ts`), no en el esquema: SQLite no tiene enums.
- Los tests van junto al fichero que prueban, como `*.test.ts`. Cada fichero crea su propia SQLite en memoria con `crearDbDePrueba()`; no comparten estado.
- Las fechas se guardan y se devuelven siempre en UTC, en ISO 8601.
- La validación de entrada es JSON Schema en la ruta (`schema.body`). El servicio da por válida la forma y valida el dominio.
- Identificadores de dominio en español (`crearFactura`, `emitirFactura`); los de infraestructura en inglés (`buildApp`, `db`).

## Límites

Sin permiso explícito en la spec de la tarea, el agente no toca:

- `prisma/migrations/` ni `prisma/schema.prisma`. Una migración se revisa a mano, siempre.
- `.github/workflows/` ni nada de despliegue.
- `package.json` y `pnpm-lock.yaml`: no se añaden ni se actualizan dependencias. Si hace falta una, para y pregunta.
- `.env`, `.env.*` ni ningún fichero con credenciales.
- `src/lib/money.ts`. Es aritmética de céntimos y ya nos ha mordido dos veces.
- `.claude/hooks/` y `scripts/verdict.mjs`: es el harness. Quien recibe el veredicto no edita a quien lo emite.
- Los asserts de los tests que ya existen. Añadir tests nuevos, sí. Cambiar los que ya estaban, no: eso se corrige aparte y a mano.

Estos límites no son solo una señal: el hook `.claude/hooks/guard-boundaries.mjs`
bloquea la escritura en las rutas de esta lista salvo que la spec activa las
incluya en su alcance.

## Definición de terminado

Una tarea está terminada cuando:

1. El bucle corto pasa en verde.
2. El bucle largo pasa en verde.
3. Cada criterio de aceptación de la spec tiene evidencia: qué comando lo demuestra y cuál fue su salida (`pnpm verdict --write`).
4. El diff no contiene nada que la spec no pidiera.

El punto 4 es el que más veces se olvida. Código de más es código sin contrato.
