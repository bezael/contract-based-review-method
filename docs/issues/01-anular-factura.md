# [feat] Anular una factura emitida

Labels: feature

## Qué se quiere

Operaciones necesita anular facturas emitidas por error. Una factura
`EMITIDA` pasa a `ANULADA` con `POST /facturas/:id/anular`. Una factura
anulada conserva su número (la numeración no puede tener huecos) y no se
puede volver a emitir ni modificar.

## Qué queda fuera

- Motivo de anulación y quién la anuló.
- Anular borradores (un borrador se descarta, no se anula: fuera de este issue).
- Notas de crédito (issue 09).

## Criterios de aceptación (verificables)

- [ ] `POST /facturas/:id/anular` sobre una factura `EMITIDA` devuelve `200`
      con `estado: "ANULADA"` y el mismo `numero` que tenía.
- [ ] Sobre una factura `BORRADOR`, `PAGADA` o `ANULADA` devuelve
      `409 ESTADO_INVALIDO`.
- [ ] Sobre un id inexistente devuelve `404 FACTURA_NO_ENCONTRADA`.
- [ ] `POST /facturas/:id/emitir` sobre una `ANULADA` devuelve `409 ESTADO_INVALIDO`.
- [ ] La suite existente sigue en verde sin modificar sus asserts.

## Alcance sugerido

- `src/services/facturas.ts`
- `src/routes/facturas.ts`
- `src/services/facturas.test.ts`
- `src/routes/facturas.test.ts`
