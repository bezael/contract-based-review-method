# [feat] Líneas exentas de ITBIS

Labels: feature

## Qué se quiere

Algunos servicios están exentos de ITBIS. Cada línea de factura acepta un
campo opcional `exento: true`. El ITBIS se calcula solo sobre la suma de las
líneas no exentas. La respuesta muestra, por línea, si está exenta, y en la
factura el subtotal exento y el gravado.

## Qué queda fuera

- Tipos de impuesto distintos del ITBIS general.
- Cambiar la exención de una línea después de crear la factura.
- Exención por cliente.

## Criterios de aceptación (verificables)

- [ ] Factura con una línea de `100.00` exenta y otra de `100.00` gravada
      devuelve `subtotal: "200.00"`, `baseGravada: "100.00"`, `baseExenta: "100.00"`,
      `impuesto: "18.00"`, `total: "218.00"`.
- [ ] Sin `exento` en la línea, se comporta como hoy (`exento: false`).
- [ ] `exento` con un valor que no es booleano devuelve `400 VALIDACION`.
- [ ] Una factura con todas las líneas exentas tiene `impuesto: "0.00"`.
- [ ] `GET /facturas/:id` devuelve `exento` en cada línea.
- [ ] La suite existente sigue en verde sin modificar sus asserts.

## Alcance sugerido

- `prisma/schema.prisma` y una migración: columna `exento` en `LineaFactura`
  con valor por defecto `false`. **Límite de AGENTS.md: lo autoriza quien firma la spec.**
- `src/services/facturas.ts`
- `src/routes/facturas.ts`
- Sus tests
