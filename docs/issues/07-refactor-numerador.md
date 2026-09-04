# [refactor] Extraer la numeración de facturas a un servicio propio

Labels: refactor

## Qué se quiere cambiar y por qué

La numeración correlativa vive como función privada dentro de
`src/services/facturas.ts`. Va a crecer (series por sucursal, notas de
crédito con prefijo propio) y ahora mismo no se puede probar sola. Se extrae
a `src/services/numerador.ts` con una función `siguienteNumero(db, prefijo, fecha)`
y sus propios tests.

## Comportamiento que se conserva

- Formato `F-AAAA-NNNN`, cuatro dígitos con ceros a la izquierda.
- Reinicio de la numeración cada año, en UTC.
- La emisión sigue asignando el número exactamente igual: ningún test de
  `facturas.test.ts` cambia.

## Criterios de aceptación (verificables)

- [ ] La suite existente pasa sin modificar ni un assert.
- [ ] `src/services/numerador.test.ts` prueba el formato, el reinicio anual y
      el caso de la primera factura del año.
- [ ] `src/services/facturas.ts` ya no contiene lógica de numeración: solo importa `siguienteNumero`.
- [ ] `pnpm typecheck && pnpm lint` en verde, sin excepciones nuevas.

## Alcance sugerido

- `src/services/numerador.ts` (nuevo)
- `src/services/numerador.test.ts` (nuevo)
- `src/services/facturas.ts`
