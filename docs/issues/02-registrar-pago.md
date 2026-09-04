# [feat] Registrar pagos de una factura

Labels: feature

## Qué se quiere

Registrar los cobros de una factura emitida. `POST /facturas/:id/pagos` con
`{ "importe": "50.00" }` guarda el pago. Cuando la suma de pagos alcanza el
total de la factura, la factura pasa a `PAGADA`. `GET /facturas/:id` incluye
la lista de pagos y el importe pendiente.

## Qué queda fuera

- Métodos de pago, referencias bancarias, conciliación.
- Devoluciones o pagos negativos.
- Pagos en borradores o anuladas.

## Criterios de aceptación (verificables)

- [ ] Un pago sobre una factura `EMITIDA` devuelve `201` con el pago y el
      `pendiente` actualizado.
- [ ] Dos pagos que suman el total dejan la factura en `PAGADA` y `pendiente: "0.00"`.
- [ ] Un pago que supera el pendiente devuelve `400 VALIDACION` y no se guarda.
- [ ] Un pago sobre `BORRADOR`, `PAGADA` o `ANULADA` devuelve `409 ESTADO_INVALIDO`.
- [ ] `importe` con formato inválido (`"50"`, `"-1.00"`, `"abc"`) devuelve `400 VALIDACION`.
- [ ] `GET /facturas/:id` devuelve `pagos: [...]` ordenados por fecha y `pendiente`.
- [ ] La suite existente sigue en verde sin modificar sus asserts.

## Alcance sugerido

- `prisma/schema.prisma` y una migración: tabla `Pago` (`id`, `facturaId`,
  `importeCent`, `creadoEn`). **Límite de AGENTS.md: lo autoriza quien firma la spec.**
- `src/services/facturas.ts` (o un `src/services/pagos.ts` nuevo)
- `src/routes/facturas.ts`
- Sus tests
