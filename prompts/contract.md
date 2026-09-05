# Contrato · del Issue a la spec

Pega esto con el Issue debajo (o el número, si tu agente tiene `gh`).

---

Convierte el Issue que te paso en el contrato de la tarea:
`specs/<slug>/spec.md`, usando la plantilla `specs/spec.template.md`.

Un contrato es una especificación contra la que algo puede fallar. Cada
criterio de aceptación tiene que llevar un comando que salga con código
distinto de cero si no se cumple. Antes de escribir cada criterio hazte la
pregunta: *¿puedo escribir algo que compruebe esto sin mí?* Si la respuesta
es no, no es un criterio: es una intención, y va en "Qué se quiere".

Reglas:

1. Lee `AGENTS.md` antes. Los comandos de verificación son los de ahí o los
   que compongas con `pnpm vitest run <fichero> -t "<nombre del test>"`.
   No inventes ninguno.
2. El slug es kebab-case y corto; la rama se llamará `feat/<slug>` (o
   `fix/`, `refactor/`). Dímelo antes de escribir la spec.
3. "Qué queda fuera" no puede estar vacío.
4. Incluye siempre estas dos cláusulas: la suite existente pasa sin tocar sus
   asserts (`pnpm test`) y tipos + lint sin excepciones nuevas
   (`pnpm typecheck && pnpm lint`).
5. El alcance de modificación es una lista cerrada de ficheros, con sus
   tests. Si necesitas un fichero de los límites de `AGENTS.md`, escríbelo
   con el motivo: lo firmo yo o no entra.
6. En "Riesgos", para cada riesgo di qué comando del harness lo detectaría.
7. Si no cabe en dos páginas, divídelo en dos specs con la dependencia
   explícita y propón el orden.

Cuando termines, muéstrame la spec completa y **para**. No escribas código.
Yo cambio `Estado: borrador` a `Estado: firmada` o te pido cambios. Después
añade la fila en `specs/INDEX.md`.

Issue:

<pega aquí el issue>
