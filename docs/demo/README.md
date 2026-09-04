# La demo del veredicto

El vídeo suelto de la ruta crítica: el agente entrega, la verificación falla
y en pantalla se ve qué línea del contrato se rompió. Sin cortes. Es el CTA
de mitad del ebook (capítulo 5) y el material que se amplía en el webinar.

## Qué tiene que verse

Tres cláusulas rotas, de tres tipos distintos, en una sola ejecución de
`pnpm verdict`:

| Cláusula | Cómo se rompe | Cómo lo enseña el veredicto |
|---|---|---|
| Criterio de aceptación (redondeo half-up) | La implementación usa `Math.floor` en el descuento | `4  NO PASA  … test de redondeo` con la salida de vitest |
| Alcance de modificación | Se añade `descuento()` en `src/lib/money.ts`, que está en los límites | `FUERA  src/lib/money.ts ← no está en el alcance de la spec` |
| Asserts existentes | Se cambia un `expect` de `facturas.test.ts` para que cuadre | `MODIFICADO  src/routes/facturas.test.ts: expect(...)` |

Y después, el arreglo: se revierte `money.ts`, se restaura el assert, se usa
`porcentaje()` con half-up, y `pnpm verdict` pasa a PASA. Lo que se lee es
la tabla, no el diff.

## Preparación

1. Rama de partida con la spec firmada:
   `git checkout -b feat/descuento-factura` y copiar
   `docs/demo/spec-descuento-factura.md` a `specs/descuento-factura/spec.md`.
2. Aplicar la implementación "del agente" con las tres cláusulas rotas:
   `git apply docs/demo/veredicto.patch`.
3. Comprobar en frío que `pnpm verdict` muestra exactamente las tres. Si
   algo cambió en el repo y el parche no aplica, regenerarlo (ver abajo).

Para grabar en directo con el agente real: lanzarlo con la spec y
`prompts/implementacion-acotada.md`. Si se porta bien a la primera (pasa a
menudo), se enseña el PASA y después se aplica el parche como "lo que hizo
en otra ejecución". Lo honesto es decirlo: *"esto es lo que me entregó ayer"*.

## Guion (5–7 minutos)

1. **Contrato en pantalla** (30 s). La tabla de criterios de la spec. Leer
   el criterio 4 y el alcance. "Esto es lo que firmé antes de que escribiera
   una línea."
2. **El diff, sin leerlo** (20 s). `git diff --stat`. "Cuatro ficheros, 90
   líneas. Antes aquí empezaban mis dos horas."
3. **El veredicto** (60 s). `pnpm verdict specs/descuento-factura/spec.md`.
   Esperar a que termine. Leer en voz alta las tres líneas rojas.
4. **Qué significa cada una** (2 min). El criterio: el agente redondeó hacia
   abajo, el contrato decía half-up. El alcance: tocó `money.ts`, que está
   en los límites, y el hook no lo paró porque el agente lo escribió con un
   comando de shell, y por eso existe la capa "detectado". El assert: cambió
   el examen para aprobar. "Ninguna de las tres la habría visto en la línea
   230 a las once de la noche."
5. **El arreglo** (2 min). Revertir `money.ts`, restaurar el assert, usar
   `porcentaje()`. `pnpm verdict` otra vez: PASA. `--write` y enseñar la
   tabla en la spec. "Esto es lo que va en la PR. Esto es lo que leo."
6. **Cierre** (20 s). "Veinte minutos. Y sé qué cláusula se rompió antes de
   abrir el diff."

## Regenerar el parche

Desde la rama con la spec firmada y la implementación correcta ya hecha
(`docs/demo/` guarda también la solución de referencia):

```bash
git checkout feat/descuento-factura
# introducir las tres roturas a mano
git diff > docs/demo/veredicto.patch
git checkout -- .
```

El parche está pensado contra el estado inicial del repo (`main` del
workshop). Si `main` avanza, se regenera.
