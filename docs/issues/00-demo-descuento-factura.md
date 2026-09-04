# [feat] Descuento por factura

Labels: feature, demo

## Qué se quiere

Al crear una factura se puede indicar un descuento en porcentaje entero
(`descuentoPct`, de 0 a 100). El descuento se aplica sobre el subtotal, antes
de calcular el ITBIS. La respuesta de la API incluye el porcentaje y el
importe descontado, y los totales ya reflejan el descuento.

## Qué queda fuera

- Descuentos por línea.
- Cupones, códigos promocionales o descuentos por cliente.
- Cambiar el descuento de una factura ya creada.
- Descuentos en facturas ya emitidas.

## Criterios de aceptación (verificables)

- [ ] `POST /facturas` con `descuentoPct: 10` y líneas que suman `100.00`
      devuelve `descuentoPct: 10`, `descuento: "10.00"`, `subtotal: "100.00"`,
      `impuesto: "16.20"`, `total: "106.20"`.
- [ ] Sin `descuentoPct` en el cuerpo, la factura devuelve `descuentoPct: 0`,
      `descuento: "0.00"` y los mismos totales que hoy.
- [ ] `descuentoPct` con valor `101`, `-1` o `12.5` devuelve `400 VALIDACION`.
- [ ] El importe del descuento se redondea a mitad hacia arriba: subtotal
      `0.05` con `descuentoPct: 10` descuenta `0.01`.
- [ ] `GET /facturas/:id` devuelve los mismos campos de descuento que la creación.
- [ ] La suite existente sigue en verde sin modificar sus asserts.

## Alcance sugerido

- `prisma/schema.prisma` y una migración nueva: columnas `descuentoBps` y
  `descuentoCent` en `Factura`. **Límite de AGENTS.md: lo autoriza quien
  firma la spec.**
- `src/services/facturas.ts`
- `src/routes/facturas.ts`
- `src/services/facturas.test.ts`
- `src/routes/facturas.test.ts`

## Contexto

`src/lib/money.ts` ya tiene `porcentaje(centimos, bps)` con el redondeo
correcto. No hace falta tocar ese fichero.
