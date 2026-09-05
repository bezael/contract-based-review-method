# [bug] Un precio con un solo decimal se registra mal

Labels: bug

## Qué pasa

Al crear una factura con `precioUnitario: "4.5"`, la línea se guarda con
`precioUnitario: "4.05"` y el subtotal sale mal. Operaciones lo detectó en
una factura de `12.5` que salió como `12.05`.

## Qué debería pasar

`"4.5"` son 450 céntimos, igual que `"4.50"`. El formato de la API admite uno
o dos decimales, así que ambos tienen que dar el mismo resultado.

## Cómo reproducirlo

```bash
curl -s -X POST localhost:3000/facturas -H 'content-type: application/json' \
  -d '{"clienteId":"<id>","lineas":[{"descripcion":"X","cantidad":1,"precioUnitario":"4.5"}]}'
# subtotal: "4.05"  (esperado: "4.50")
```

## Criterios de aceptación (verificables)

- [ ] Existe un test de regresión en `src/lib/money.test.ts` que falla antes
      del arreglo y pasa después: `aCentimos("4.5") === 450`, `aCentimos("0.5") === 50`.
- [ ] `aCentimos("4.50")` y `aCentimos("4.5")` devuelven lo mismo.
- [ ] Un test de ruta crea una factura con `precioUnitario: "12.5"` y obtiene `subtotal: "12.50"`.
- [ ] La suite existente sigue en verde sin modificar sus asserts.

## Alcance sugerido

- `src/lib/money.ts`. **Está en los límites de AGENTS.md: la spec tiene que
  autorizarlo explícitamente y decir por qué.**
- `src/lib/money.test.ts`
- `src/routes/invoices.test.ts`
