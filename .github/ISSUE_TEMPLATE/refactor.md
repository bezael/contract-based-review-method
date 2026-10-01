---
name: Refactor
about: Cambiar la estructura sin cambiar el comportamiento
title: '[refactor] '
labels: refactor
---

## Qué se quiere cambiar y por qué

<!-- Qué duele hoy de la estructura actual. -->

## Comportamiento que se conserva

<!-- La lista de lo que NO cambia. Es la parte más importante de un refactor. -->

## Criterios de aceptación (verificables)

- [ ] La suite existente pasa sin modificar ni un assert
- [ ] `pnpm typecheck && pnpm lint` en verde, sin excepciones nuevas
- [ ] ...

## Alcance sugerido

- `src/...`
