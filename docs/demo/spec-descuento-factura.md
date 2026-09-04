# Spec: Descuento por factura

> Contrato de referencia de la feature que se construye en el workshop
> (Módulos 2 a 7). En la grabación se escribe en directo desde el Issue 00;
> esta es la versión firmada, para comparar.

**Issue:** #0 · docs/issues/00-demo-descuento-factura.md
**Fecha:** 2026-09-20
**Estado:** firmada

## Qué se quiere

Al crear una factura se puede indicar `descuentoPct`, un entero de 0 a 100.
El descuento se aplica sobre el subtotal antes del ITBIS. La respuesta
incluye `descuentoPct`, el importe `descuento` y los totales ya descontados,
tanto al crear como al consultar.

## Qué queda fuera

- Descuentos por línea, cupones o descuentos por cliente.
- Modificar el descuento después de crear la factura.
- Descuentos sobre facturas ya emitidas.
- Cualquier cambio en `src/lib/money.ts`: `porcentaje()` ya hace el redondeo que se necesita.

## Criterios de aceptación

| # | Criterio | Cómo se verifica |
|---|---|---|
| 1 | `POST /facturas` con `descuentoPct: 10` y subtotal 100.00 devuelve `descuento: "10.00"`, `impuesto: "16.20"`, `total: "106.20"` | `pnpm vitest run src/routes/facturas.test.ts -t "descuento del 10"` |
| 2 | Sin `descuentoPct`, devuelve `descuentoPct: 0`, `descuento: "0.00"` y los totales de siempre | `pnpm vitest run src/routes/facturas.test.ts -t "sin descuento"` |
| 3 | `descuentoPct` 101, -1 o 12.5 devuelve 400 VALIDACION | `pnpm vitest run src/routes/facturas.test.ts -t "descuento inválido"` |
| 4 | El importe del descuento se redondea a mitad hacia arriba: 0.05 al 10 % descuenta 0.01 | `pnpm vitest run src/services/facturas.test.ts -t "redondea el descuento"` |
| 5 | `GET /facturas/:id` devuelve los mismos campos de descuento | `pnpm vitest run src/routes/facturas.test.ts -t "devuelve el descuento"` |
| 6 | La suite existente sigue en verde sin tocar sus asserts | `pnpm test` |
| 7 | Tipos y lint sin excepciones nuevas | `pnpm typecheck && pnpm lint` |

## Alcance de modificación

- `prisma/schema.prisma` — columnas `descuentoBps Int @default(0)` y `descuentoCent Int @default(0)` en `Factura`. **Límite de AGENTS.md, autorizado por Bezael el 2026-09-20: es una columna nueva con valor por defecto, no destruye datos.**
- `prisma/migrations/**` — la migración generada con `pnpm db:migrate --name descuento-factura`. Misma autorización.
- `src/services/facturas.ts`
- `src/routes/facturas.ts`
- `src/services/facturas.test.ts`
- `src/routes/facturas.test.ts`

## Riesgos

- Que el descuento se aplique después del ITBIS en lugar de antes. Lo detecta el criterio 1 (el impuesto sería 18.00, no 16.20).
- Que se guarde el porcentaje como Float. Lo detecta `pnpm typecheck` si el tipo de Prisma es `Int`, y el criterio 3 si se admite 12.5.
- Que la migración rompa las facturas existentes. Lo detecta `pnpm test`: los tests aplican todas las migraciones sobre datos creados sin descuento.
- Que el redondeo se haga con `Math.round` o `Math.floor` en vez de `porcentaje()`. Lo detecta el criterio 4.

## Veredicto

> Lo rellena `pnpm verdict --write` al terminar.
