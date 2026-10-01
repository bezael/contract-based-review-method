# Specs · memoria del proyecto

Una fila por contrato. El estado lo dicta la propia spec.

## Decisiones compartidas

| Decisión | Motivo | Origen |
|---|---|---|
| Los importes son enteros en céntimos. Nunca Float. | Aritmética exacta; `money.ts` ya nos mordió dos veces con decimales | AGENTS.md |
| Los estados de factura se acotan en `services/invoices.ts`, no en el esquema | SQLite no tiene enums | AGENTS.md |
| Todo error de dominio es un `AppError` con código del catálogo | Un `Error` pelado es un 500 que nadie puede rechazar por contrato | AGENTS.md |
| Los tests crean su propia SQLite en memoria aplicando `prisma/migrations` | Aislamiento total y el mismo esquema que producción | `src/test/db.ts` |
| Un criterio con `vitest -t` escribe un informe JSON en `specs/<slug>/.work/` y falla si `numPassedTests < 1` | `vitest run -t` sale con 0 si ningún test coincide: el criterio pasaría antes de escribir el test | `specs/invoice-discount/spec.md` |

## Specs

| Slug | Qué | Estado | Issue |
|---|---|---|---|
| `invoice-discount` | Descuento porcentual entero (0–100) al crear factura, aplicado antes del impuesto | firmada | [#2](https://github.com/bezael/contract-based-review-method/issues/2) |
| `tax-exempt-lines` | Líneas exentas de impuesto (`taxExempt`); el impuesto solo grava la base imponible, el descuento se reparte entre ambas bases | borrador | [#6](https://github.com/bezael/contract-based-review-method/issues/6) |
