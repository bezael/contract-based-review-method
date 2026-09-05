# [feat] Notas de crédito

Labels: feature

## Qué se quiere

Cuando una factura emitida tiene un error o una devolución parcial, se emite
una nota de crédito contra ella. La nota tiene su propia numeración
(`NC-AAAA-NNNN`), referencia a la factura original, líneas propias con sus
importes y el mismo cálculo de ITBIS. Una factura puede tener varias notas,
pero la suma no puede superar el total de la factura. Una nota de crédito
por el total completo deja la factura en `VOIDED`. Las notas se listan
junto a la factura en `GET /facturas/:id`.

## Qué queda fuera

- Notas de débito.
- Aplicar la nota a otra factura del mismo cliente.
- Anular una nota de crédito.

## Criterios de aceptación (verificables)

- [ ] `POST /facturas/:id/notas-credito` sobre una `ISSUED` crea la nota con número `NC-AAAA-0001`.
- [ ] La nota calcula subtotal, ITBIS y total con las mismas reglas que la factura.
- [ ] Una nota cuyo total supera el pendiente de la factura devuelve `400 VALIDACION`.
- [ ] Una nota por el total completo deja la factura en `VOIDED`.
- [ ] Sobre `DRAFT` o `VOIDED` devuelve `409 ESTADO_INVALIDO`.
- [ ] `GET /facturas/:id` incluye `notasCredito: [...]`.
- [ ] La numeración de notas es independiente de la de facturas y se reinicia cada año.
- [ ] La suite existente sigue en verde sin modificar sus asserts.

## Alcance sugerido

- `prisma/schema.prisma` y migraciones. **Límite de AGENTS.md.**
- `src/services/notas-credito.ts` (nuevo), `src/services/invoices.ts`, `src/services/numerador.ts` si existe
- `src/routes/notas-credito.ts` (nuevo), `src/app.ts`
- Sus tests

## Contexto

Este issue **no cabe en una spec de dos páginas**. Parte del ejercicio es
dividirlo: por ejemplo, (1) modelo y creación de la nota con numeración
propia, (2) reglas de importe máximo y anulación automática, (3) exposición
en `GET /facturas/:id`. Cada parte con su contrato, su rama y su PR.
