# La demo del veredicto

El vídeo suelto de la ruta crítica: el agente entrega, la verificación falla
y en pantalla se ve qué línea del contrato se rompió. Sin cortes. Es el CTA
de mitad del ebook (capítulo 5) y el material que se amplía en el webinar.

## Qué tiene que verse

Tres cláusulas rotas, de tres tipos distintos, en una sola ejecución de
`pnpm verdict`:

| Cláusula | Cómo se rompe | Cómo lo enseña el veredicto |
|---|---|---|
| Criterio de aceptación (redondeo half-up) | La implementación usa `Math.floor` en el descuento | `4  NO PASA` con la salida de vitest (`- 1 / + 0`). Arrastra al criterio 6, porque la suite completa incluye ese test |
| Alcance de modificación | Se añade `descuento()` en `src/lib/money.ts`, que está en los límites | `FUERA  src/lib/money.ts ← no está en el alcance de la spec` |
| Asserts existentes | Se quita `minItems: 1` del esquema de la ruta, el test existente se pone en rojo y se cambian sus dos `expect` para que pase | `MODIFICADO  src/routes/invoices.test.ts: expect(respuesta.statusCode).toBe(400)` (y el del error) |

La salida completa, tal cual sale en pantalla, está en `verdict-output.txt`:

```
Resultado: NO PASA · 2 criterios incumplidos · 1 fichero fuera de alcance · 2 asserts existentes modificados
```

Y después, el arreglo: se revierte `money.ts`, se restaura `minItems` y los
asserts, se usa `porcentaje()` con half-up, y `pnpm verdict` pasa a PASA. Lo
que se lee es la tabla, no el diff.

## Ficheros

| Fichero | Qué es |
|---|---|
| `invoice-discount-spec.md` | El contrato firmado de referencia (el que se escribe en directo en el Módulo 2) |
| `solution.patch` | La implementación correcta contra `main`: esquema, migración, servicio, ruta y tests. Es lo mismo que la rama `feat/descuento-factura` |
| `verdict.patch` | La entrega con las tres cláusulas rotas, contra `main` |
| `verdict-output.txt` | Lo que imprime `pnpm verdict` con el parche roto aplicado |

Los parches no incluyen `specs/`: la spec se copia aparte, porque en la
grabación ya existe cuando se llega a este punto.

## Preparación

1. Rama de partida con la spec firmada:
   `git checkout -b feat/descuento-factura main`, copiar
   `docs/demo/invoice-discount-spec.md` a `specs/descuento-factura/spec.md`
   y hacer commit. (O directamente `git checkout grabacion/m2-fin`.)
2. Aplicar la implementación "del agente" con las tres cláusulas rotas:
   ```bash
   git apply --check docs/demo/verdict.patch   # tiene que salir en silencio
   git apply docs/demo/verdict.patch
   pnpm db:generate                              # el parche cambia el esquema de Prisma
   ```
3. Comprobar en frío que `pnpm verdict` muestra lo mismo que
   `verdict-output.txt`. Si `main` cambió y el parche no aplica,
   regenerarlo (ver abajo).

Para grabar en directo con el agente real: lanzarlo con la spec y
`prompts/scoped-implementation.md`. Si se porta bien a la primera (pasa a
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

## Regenerar los parches

Desde la rama con la solución correcta (`feat/descuento-factura`, tag
`grabacion/m4-fin`):

```bash
git checkout feat/descuento-factura
git diff main -- . ':!specs' > docs/demo/solution.patch

# introducir las tres roturas a mano:
#   1. añadir en src/lib/money.ts:  export function descuento(c, pct) { return Math.floor((c * pct) / 100) }
#      y usarla en src/services/invoices.ts en vez de porcentaje()
#   2. quitar `minItems: 1` del esquema en src/routes/invoices.ts
#   3. en src/routes/invoices.test.ts, renombrar "rechaza una factura sin líneas con 400"
#      a "acepta una factura sin líneas" y cambiar sus dos expect (201 y lineas vacías)
git diff main -- . ':!specs' > docs/demo/verdict.patch
pnpm verdict > docs/demo/verdict-output.txt 2>&1
git checkout -- .
```

Los parches son contra `main`. Si `main` avanza, se regeneran y se vuelve a
probar `git apply --check`.
