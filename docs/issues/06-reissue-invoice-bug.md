# [bug] Emitir dos veces una factura le cambia el número

Labels: bug

## Qué pasa

Si se llama a `POST /facturas/:id/emitir` sobre una factura que ya está
`ISSUED`, la factura recibe un número nuevo y una fecha de emisión nueva. El
número anterior queda huérfano y la numeración correlativa tiene un hueco.
Un reintento de red del cliente basta para provocarlo.

## Qué debería pasar

Solo un `DRAFT` se puede emitir. Cualquier otro estado devuelve
`409 ESTADO_INVALIDO` y no modifica nada.

## Cómo reproducirlo

```bash
curl -s -X POST localhost:3000/facturas/<id>/emitir   # numero: F-2026-0001
curl -s -X POST localhost:3000/facturas/<id>/emitir   # numero: F-2026-0002 (esperado: 409)
```

## Criterios de aceptación (verificables)

- [ ] Existe un test de regresión que emite dos veces y comprueba que la
      segunda devuelve `409 ESTADO_INVALIDO` y que `numero` y `emitidaEn` no cambian.
- [ ] Emitir un `DRAFT` sigue funcionando exactamente igual.
- [ ] La suite existente sigue en verde sin modificar sus asserts.

## Alcance sugerido

- `src/services/invoices.ts`
- `src/services/invoices.test.ts`
- `src/routes/invoices.test.ts`
