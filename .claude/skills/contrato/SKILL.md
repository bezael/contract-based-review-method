---
name: contrato
description: "Convierte un GitHub Issue (o una petición en prosa) en el contrato de la tarea: specs/<slug>/spec.md con criterios de aceptación que un comando puede rechazar y un alcance de modificación explícito. Úsala al empezar cualquier tarea de este repo, cuando el usuario diga 'contrato', 'spec', 'firma la spec', 'del issue a la spec' o pegue un issue. Es el Módulo 2 del workshop. Si la tarea no cabe en dos páginas, la divide o escala a dominicode-sdd-creator para plan y tasks."
---

# Contrato · del Issue a la spec ejecutable

Parte del sistema **Revisión por Contrato**: `Contrato -> Carril -> Veredicto`.

Un contrato es una especificación contra la que algo puede fallar. Si ninguna
línea de la spec puede rechazar el trabajo del agente sin una persona
mirando, no hay contrato: hay una carta de intenciones.

## Entrada

Un Issue (número, URL o texto pegado) o una petición en prosa. Si es un número
y `gh` está disponible: `gh issue view <n> --json title,body,labels,url`.

## Procedimiento

### 1. Leer el contrato permanente

Lee `AGENTS.md` entero antes de escribir nada. De ahí salen los comandos de
verificación reales, las convenciones y los límites. No inventes comandos:
solo los que están en la sección Verificación o los que puedas componer con
`pnpm vitest run <fichero> -t "<nombre>"`.

### 2. Elegir el slug

Kebab-case, corto, en español: `anular-factura`, `descuento-factura`. La spec
va en `specs/<slug>/spec.md` y la rama se llamará `feat/<slug>` (o `fix/`,
`refactor/`). El carril y el veredicto dependen de esa coincidencia.

### 3. Escribir la spec con `specs/spec.template.md`

Sección a sección, con estas reglas:

- **Qué se quiere**: el resultado observable en dos o tres frases. Nada de implementación.
- **Qué queda fuera**: obligatorio y con contenido. Si el Issue no lo dice, dedúcelo de lo que alguien podría suponer incluido.
- **Criterios de aceptación**: cada fila lleva un comando entre backticks que sale con código distinto de cero si el criterio no se cumple. Pásale a cada uno la prueba de una línea: *¿puedo escribir algo que compruebe esto sin mí?* Lo que no la pase va a "Qué se quiere" como intención, no a la tabla.
  - Los tests que aún no existen se nombran ya: `pnpm vitest run src/routes/invoices.test.ts -t "anular"`. Escribir el test es parte de la tarea.
  - Siempre incluye las dos cláusulas fijas: suite existente en verde sin tocar asserts (`pnpm test`) y tipos + lint sin excepciones nuevas (`pnpm typecheck && pnpm lint`).
- **Alcance de modificación**: lista cerrada de ficheros, con sus tests. Si un fichero de los límites de `AGENTS.md` tiene que entrar (migraciones, `money.ts`, `package.json`), escríbelo con el motivo y deja claro que lo firma una persona. El hook lo bloqueará si no está aquí.
- **Riesgos**: qué de lo que hoy funciona podría romperse y qué comando lo detectaría. "Ninguno lo detectaría" es un hueco del harness: anótalo.

### 4. Parar y pedir la firma

Muestra la spec completa y **para**. No escribas código en el mismo turno.
La persona firma cambiando `Estado: borrador` a `Estado: firmada`, o te pide
cambios. Un contrato sin firma no autoriza nada.

### 5. Si no cabe en dos páginas

Divide en dos o más specs con dependencia explícita, o, si la feature tiene
varias entidades y flujos, usa `dominicode-sdd-creator` para producir además
`plan.md` y `tasks.md`. El contrato de este repo (criterios con comando +
alcance) sigue siendo la fuente de verdad del veredicto.

### 6. Registrar en `specs/INDEX.md`

Añade la fila (slug, qué, estado, issue). Si la spec introduce una decisión
transversal, súbela a "Decisiones compartidas".

## Lo que nunca haces

- Criterios con adjetivos: rápido, robusto, bien, correcto, mantenible.
- Un alcance vacío o con `src/**`.
- Código en el mismo turno que la spec.
- Inventar un comando de verificación que no hayas visto en `AGENTS.md` ni compuesto con vitest.
