# Revisión por Contrato · repositorio del workshop

API de facturación interna en TypeScript con el harness completo montado:
contrato (`AGENTS.md` + specs), carril (límites declarados e impedidos) y
veredicto (`pnpm verdict`). Es el repositorio sobre el que se graba el workshop
**SDD + Agentic Engineering** de Dominicode y el que clonas para practicar.

```
Contrato  ->  Carril  ->  Veredicto
 (spec)     (harness)   (verificación)
```

## Arrancar en tres minutos

Necesitas Node 24 y pnpm 10 o superior (`corepack enable` lo instala solo).

```bash
git clone <url-del-repo> revision-por-contrato
cd revision-por-contrato
pnpm install          # instala y genera el cliente de Prisma
pnpm db:setup         # crea data/facturas.db y aplica las migraciones
pnpm test             # 26 tests en verde
pnpm dev              # http://localhost:3000/health
```

Prueba la API:

```bash
curl -s -X POST localhost:3000/clientes -H 'content-type: application/json' \
  -d '{"nombre":"Operaciones SRL","rnc":"131234567"}'

curl -s -X POST localhost:3000/facturas -H 'content-type: application/json' \
  -d '{"clienteId":"<id>","lineas":[{"descripcion":"Consultoría","cantidad":2,"precioUnitario":"12.50"}]}'

curl -s -X POST localhost:3000/facturas/<id>/emitir
```

## El harness

| Qué | Comando | Cuándo |
|---|---|---|
| Tipos | `pnpm typecheck` | después de cada cambio |
| Lint | `pnpm lint` | después de cada cambio |
| Tests unitarios | `pnpm test:unit` | después de cada cambio |
| Build | `pnpm build` | antes de la PR |
| Tests completos | `pnpm test` | antes de la PR |
| Smoke | `pnpm smoke` | antes de la PR |
| **Veredicto** | `pnpm verdict specs/<slug>/spec.md` | antes de la PR |

Todo está en `AGENTS.md`, que es el contrato permanente del repo. Claude Code lo
lee a través de `CLAUDE.md`; Codex, Cursor, Gemini CLI y el resto lo leen directamente.

## Mapa del repositorio

```
AGENTS.md                      contrato permanente: stack, verificación, convenciones, límites
CLAUDE.md                      @AGENTS.md
specs/
  spec.template.md             contrato de tarea: criterios con comando + alcance de modificación
  INDEX.md                     memoria del proyecto
src/
  lib/money.ts                 céntimos, ITBIS, redondeo (está en los límites)
  lib/errors.ts                AppError y catálogo de códigos
  services/                    lógica de dominio (clientes, facturas)
  routes/                      handlers Fastify con JSON Schema
  test/db.ts                   SQLite en memoria con las migraciones aplicadas
scripts/
  verdict.mjs                  el veredicto: ejecuta criterios y comprueba el alcance
  smoke.ts                     arranca la app y pide /health
.claude/
  settings.json                hook PreToolUse -> guard-boundaries
  hooks/guard-boundaries.mjs   el carril impedido: bloquea escrituras en los límites
  skills/                      harness-init, sdd-creator, contrato, revision-codigo, revision-pr
prompts/                       los mismos flujos como prompt suelto, para Codex / Cursor / Gemini CLI
docs/
  issues/                      10 issues para practicar (Módulo 8)
  checklists/                  Harness Engineering y Verificación
  workflows/                   code review y PR review con segundo agente
  diagrama-arquitectura.md     Issue -> Spec -> Harness -> Código -> Veredicto -> Review -> PR
  demo/                        guion y parche de la demo del veredicto
.github/
  ISSUE_TEMPLATE/              feature, bug, refactor
  PULL_REQUEST_TEMPLATE.md     contrato, veredicto, harness, alcance
  workflows/ci.yml             el bucle largo, en cada PR
```

## Practicar: los 10 issues

Están en `docs/issues/`. Elige uno, crea la spec con `specs/spec.template.md`
(o con la skill `contrato`), abre la rama `feat/<slug>`, implementa con tu
agente y cierra con `pnpm verdict`. Con `gh` instalado, `scripts/create-issues.sh`
los publica como Issues reales en tu fork.

## Bugs que ya sabemos que hay

Dos, a propósito, para los issues 05 y 06. No los arregles fuera de su spec:
código de más es código sin contrato.
