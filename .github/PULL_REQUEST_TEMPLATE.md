## Contrato

**Issue:** #
**Spec:** `specs/<slug>/spec.md`

## Veredicto

Pega aquí la salida de `pnpm verdict specs/<slug>/spec.md`, o enlaza la sección
"## Veredicto" de la spec si la escribiste con `--write`.

| # | Criterio de aceptación | Evidencia |
|---|---|---|
| 1 | | `comando` → salida |
| 2 | | `comando` → salida |
| 3 | | `comando` → salida |

## Harness

- [ ] Bucle corto en verde (`pnpm typecheck`, `pnpm lint`, `pnpm test:unit`)
- [ ] Bucle largo en verde (`pnpm build`, `pnpm test`, `pnpm smoke`)
- [ ] Sin rojos nuevos respecto a los conocidos en `AGENTS.md`

## Alcance

- [ ] El diff no toca ficheros fuera del alcance declarado en la spec (`pnpm verdict:scope`)
- [ ] No se añadieron ni actualizaron dependencias sin acordarlo
- [ ] No hay código que la spec no pidiera

## Para quien revisa

Lo único que hace falta mirar a mano, y por qué. Si aquí pone "todo", esta PR
no está lista: le está pidiendo a una persona el trabajo que tenía que hacer el
harness.
