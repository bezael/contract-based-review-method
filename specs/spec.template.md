# Spec: {{TÍTULO}}

> El contrato de la tarea. Se firma **antes** de escribir código.
> Si no cabe en dos páginas, la tarea es demasiado grande: divídela.
>
> Regla de una línea para cada criterio: *¿puedo escribir algo que compruebe esto sin mí?*
> Si la respuesta es no, es una intención. Va en "Qué se quiere", no en la tabla.

**Issue:** #{{NÚMERO}} · {{URL}}
**Fecha:** {{AAAA-MM-DD}}
**Estado:** borrador | firmada | cerrada

## Qué se quiere

{{Dos o tres frases. El resultado observable, no la implementación.}}

## Qué queda fuera

{{Lo que alguien podría suponer que está incluido y no lo está. Esta sección
evita el 80 % del código innecesario. Si está vacía, no has pensado lo suficiente.}}

## Criterios de aceptación

Cada criterio lleva el comando que lo demuestra. Un criterio sin comando es una
opinión, y las opiniones se revisan a mano, que es justo lo que queremos evitar.

| # | Criterio | Cómo se verifica |
|---|---|---|
| 1 | {{Comportamiento observable}} | `{{comando}}` |
| 2 | {{Comportamiento observable}} | `{{comando}}` |
| 3 | La suite existente sigue en verde sin tocar sus asserts | `pnpm test` |
| 4 | Tipos y lint sin excepciones nuevas | `pnpm typecheck && pnpm lint` |

## Alcance de modificación

Los ficheros que se espera tocar. Si el agente necesita salir de esta lista,
para y pregunta. Un fichero de los límites de `AGENTS.md` solo puede aparecer
aquí con una persona firmando el motivo.

- `{{ruta}}`
- `{{ruta}}`
- `{{ruta}}.test.ts`

## Riesgos

{{Qué podría romperse de lo que hoy funciona, y qué comando del harness lo
detectaría. Si la respuesta es "ninguno lo detectaría", has encontrado un hueco
en el harness: anótalo.}}

## Veredicto

> Lo rellena `pnpm verdict --write` al terminar. Es lo que se lee en vez del diff.
