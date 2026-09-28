# Specs · memoria del proyecto

Una fila por contrato. El estado lo dicta la propia spec.

## Decisiones compartidas

| Decisión | Motivo | Origen |
|---|---|---|
| Los importes son enteros en céntimos. Nunca Float. | Aritmética exacta; `money.ts` ya nos mordió dos veces con decimales | AGENTS.md |
| Los estados de factura se acotan en `services/facturas.ts`, no en el esquema | SQLite no tiene enums | AGENTS.md |
| Todo error de dominio es un `AppError` con código del catálogo | Un `Error` pelado es un 500 que nadie puede rechazar por contrato | AGENTS.md |
| Los tests crean su propia SQLite en memoria aplicando `prisma/migrations` | Aislamiento total y el mismo esquema que producción | `src/test/db.ts` |

## Specs

| Slug | Qué | Estado | Issue |
|---|---|---|---|
| `verdict-ansi-output` | The verdict reads Vitest results even when the output is colored (false FAIL outside agents) | signed | — · found in `invoice-discount` TASK-91 |
