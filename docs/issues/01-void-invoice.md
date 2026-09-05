# [feat] Anular una factura emitida

Labels: feature

## Qué se quiere

Operaciones necesita anular facturas emitidas por error. Una factura
`ISSUED` pasa a `VOIDED` con `POST /facturas/:id/anular`. Una factura
anulada conserva su número (la numeración no puede tener huecos) y no se
puede volver a emitir ni modificar.

## Qué queda fuera

- Motivo de anulación y quién la anuló.
- Anular borradores (un borrador se descarta, no se anula: fuera de este issue).
- Notas de crédito (issue 09).

## Criterios de aceptación (verificables)

- [ ] `POST /facturas/:id/anular` sobre una factura `ISSUED` devuelve `200`
      con `estado: "VOIDED"` y el mismo `numero` que tenía.
- [ ] Sobre una factura `DRAFT`, `PAID` o `VOIDED` devuelve
      `409 ESTADO_INVALIDO`.
- [ ] Sobre un id inexistente devuelve `404 FACTURA_NO_ENCONTRADA`.
- [ ] `POST /facturas/:id/emitir` sobre una `VOIDED` devuelve `409 ESTADO_INVALIDO`.
- [ ] La suite existente sigue en verde sin modificar sus asserts.

## Alcance sugerido

- `src/services/invoices.ts`
- `src/routes/invoices.ts`
- `src/services/invoices.test.ts`
- `src/routes/invoices.test.ts`
