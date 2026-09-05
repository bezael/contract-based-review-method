# Revisión por Contrato · repositorio del workshop

**SDD + Agentic Engineering** · Bezael Pérez · [Dominicode](https://dominicode.com)

Del GitHub Issue a una Pull Request verificada con agentes, sin leer las
cuatrocientas líneas que generó el agente. Este es el repositorio sobre el
que se graba el workshop y el que clonas para practicar: una API de
facturación en TypeScript con el sistema completo montado encima.

```
Contrato  ->  Carril  ->  Veredicto
 (spec)     (harness)   (verificación)
```

Firmas un contrato de cuarenta líneas antes de que el agente escriba nada. El
carril lo mantiene dentro de lo que firmaste. La verificación emite el
veredicto, y tú lees el veredicto en vez del diff.

## El workshop

| | |
|---|---|
| **Qué es** | Workshop bajo demanda, 9 módulos, unas 3 horas. El sistema montado delante de ti sobre este repo, de un Issue real a una PR con evidencia |
| **Para quién** | Developers que ya usan agentes a diario y pierden más tiempo revisando código generado del que ahorraron generándolo |
| **Web y acceso** | [workshop.dominicode.com](https://workshop.dominicode.com) |
| **Ebook gratuito** | [Revisión por Contrato](https://workshop.dominicode.com/ebook): por qué falla auditar código generado y qué es un contrato. Cubre el Módulo 0 y el concepto de los Módulos 1 a 3 |
| **Webinar gratuito** | [1 de octubre de 2026, 18:00 Santo Domingo](https://workshop.dominicode.com/webinar): una feature real entera, contrato, carril, veredicto y PR, en 55 minutos |
| **Lista de espera** | [Aviso de apertura](https://workshop.dominicode.com/lista) |
| **Q&A en vivo** | 22 de octubre de 2026, 60 minutos. Diez repos revisados en directo, por orden de compra. Trae el `AGENTS.md` que montaste |
| **Para equipos** | [Workshop para empresas](https://workshop.dominicode.com/workshop-empresas) |
| **Garantía** | Del carril, 14 días: monta el harness en un repo tuyo de verdad y, si revisar una PR te sigue costando lo mismo, enséñame el `AGENTS.md` y te devuelvo el dinero |

## Los 9 módulos y qué usas de este repo

| Módulo | Qué se hace | Dónde está |
|---|---|---|
| 0 · Antes de escribir código | El nuevo cuello de botella: tú eres la única verificación del sistema | Capítulos 1 y 2 del ebook |
| 1 · El sistema completo | El mapa del Issue a la PR verificada, y este repo corriendo en tu máquina | [`docs/architecture-diagram.md`](docs/architecture-diagram.md) · sección "Arrancar" de abajo |
| 2 · Del Issue a la spec ejecutable | Criterios que un comando puede rechazar, alcance cerrado, firma | [`specs/spec.template.md`](specs/spec.template.md) · skill `contrato` · [`prompts/contract.md`](prompts/contract.md) |
| 3 · Preparar el harness | `AGENTS.md` con comandos reales, límites en tres capas, CI. **Sobre tu repo** | [`AGENTS.md`](AGENTS.md) · skill `dominicode-harness-init` · [`prompts/harness-init.md`](prompts/harness-init.md) · [`docs/checklists/harness-engineering.md`](docs/checklists/harness-engineering.md) |
| 4 · Implementación agentic | Plan con comandos, implementación acotada, bucle corto tras cada cambio, el hook parando al agente | [`prompts/planning.md`](prompts/planning.md) · [`prompts/scoped-implementation.md`](prompts/scoped-implementation.md) · [`.claude/hooks/guard-boundaries.mjs`](.claude/hooks/guard-boundaries.mjs) |
| 5 · Verificación | Las capas del veredicto, dos velocidades, `pnpm verdict` nombrando la cláusula rota | [`scripts/verdict.mjs`](scripts/verdict.mjs) · skill `veredicto` · [`docs/checklists/verificacion.md`](docs/checklists/verificacion.md) · [`docs/demo/`](docs/demo/) |
| 6 · Code review con agentes | Un segundo agente sin el contexto del primero, veredicto de alineación | skill `revision-codigo` · [`docs/workflows/code-review.md`](docs/workflows/code-review.md) · [`prompts/code-review.md`](prompts/code-review.md) |
| 7 · Cerrar el loop | La PR con contrato, veredicto y evidencia; los 20 minutos de quien revisa | skill `revision-pr` · [`.github/PULL_REQUEST_TEMPLATE.md`](.github/PULL_REQUEST_TEMPLATE.md) · [`docs/workflows/pr-review.md`](docs/workflows/pr-review.md) |
| 8 · Tu turno | Diez issues reales para reproducir el ciclo sin seguir al instructor | [`docs/issues/`](docs/issues/) |

La feature que se construye en el workshop es el
[Issue 00, Descuento por factura](docs/issues/00-invoice-discount-demo.md).
La rama `feat/descuento-factura` tiene la solución de referencia con su
contrato y su veredicto escritos.

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

Si cambias de rama y el esquema de Prisma es distinto, ejecuta
`pnpm db:generate`: el cliente generado vive en `src/generated/`, fuera de
git, y si se queda desactualizado los tests fallan con "no such column".

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

Todo está en [`AGENTS.md`](AGENTS.md), que es el contrato permanente del repo.
Claude Code lo lee a través de `CLAUDE.md`; Codex, Cursor, Gemini CLI y el
resto lo leen directamente.

## Con qué agente

El sistema no depende de la herramienta. En las demos se usa Claude Code
porque las skills de `.claude/skills/` cargan solas; para Codex, Cursor,
Gemini CLI o cualquier agente con acceso al repo, los mismos flujos están en
[`prompts/`](prompts/README.md) como texto para pegar.

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
  create-issues.sh             publica docs/issues/ como Issues de GitHub
.claude/
  settings.json                hook PreToolUse -> guard-boundaries
  hooks/guard-boundaries.mjs   el carril impedido: bloquea escrituras en los límites
  skills/                      contrato, veredicto, revision-codigo, revision-pr, harness-init, sdd-creator
prompts/                       los mismos flujos como prompt suelto, para Codex / Cursor / Gemini CLI
docs/
  issues/                      10 issues para practicar (Módulo 8) + el Issue 00 de la demo
  checklists/                  Harness Engineering y Verificación
  workflows/                   code review y PR review con segundo agente
  diagrama-arquitectura.md     Issue -> Spec -> Harness -> Código -> Veredicto -> Review -> PR
  demo/                        guion, spec, parches y salida de la demo del veredicto
.github/
  ISSUE_TEMPLATE/              feature, bug, refactor
  PULL_REQUEST_TEMPLATE.md     contrato, veredicto, harness, alcance
  workflows/ci.yml             el bucle largo, en cada PR
```

## Practicar: los 10 issues

Están en [`docs/issues/`](docs/issues/README.md). Elige uno, crea la spec con
`specs/spec.template.md` (o con la skill `contrato`), abre la rama
`feat/<slug>`, implementa con tu agente y cierra con `pnpm verdict`. Con `gh`
instalado, `bash scripts/create-issues.sh` los publica como Issues reales en
tu fork.

## Llevarte el veredicto a tu repo

Tres ficheros sin dependencias, solo Node:

| Fichero | Qué hace |
|---|---|
| `scripts/verdict.mjs` + `scripts/lib/spec.mjs` | Lee `specs/<slug>/spec.md`, ejecuta cada criterio, comprueba el alcance contra `git diff` y detecta asserts existentes modificados |
| `.claude/hooks/guard-boundaries.mjs` + `.claude/settings.json` | Bloquea escrituras en los límites de `AGENTS.md` salvo que la spec de la rama los autorice |
| `specs/spec.template.md` | El formato de contrato que los dos anteriores entienden |

Cópialos, añade `"verdict": "node scripts/verdict.mjs"` a tus scripts y
escribe tu `AGENTS.md` con `harness-init`. Lo único que el veredicto necesita
es que cada criterio lleve un comando entre backticks y que la rama se llame
como la carpeta de la spec.

## Bugs que ya sabemos que hay

Dos, a propósito, para los issues 05 y 06. No los arregles fuera de su spec:
código de más es código sin contrato.

## Origen de las skills

- `dominicode-sdd-creator`: [github.com/bezael/sdd-creator](https://github.com/bezael/sdd-creator). Aquí va empaquetada tal cual; la skill `contrato` es su adaptación al formato de spec de este repo.
- `dominicode-harness-init`: la skill que audita un repo y genera su `AGENTS.md` con los comandos reales. Las demás (`contrato`, `veredicto`, `revision-codigo`, `revision-pr`) se escribieron para este workshop.

---

Hecho por [Bezael Pérez](https://dominicode.com) para el workshop
[SDD + Agentic Engineering](https://workshop.dominicode.com). Clónalo, rómpelo
y llévate a tu repo lo que te sirva.
