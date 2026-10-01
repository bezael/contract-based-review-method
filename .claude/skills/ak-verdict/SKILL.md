---
name: ak-verdict
description: "Ejecuta pnpm verdict sobre la spec de la rama actual, interpreta el resultado (criterios, alcance, asserts) y dice qué cláusula del contrato se rompió y cuál es el siguiente paso. Úsala cuando el usuario diga 'veredicto', 'verifica', '¿pasa?', 'está terminado', o después de implementar. Es el Módulo 5 del workshop."
allowed-tools: Bash(pnpm *) Bash(git *) Read
---

# Veredicto

Un veredicto no es una opinión. Es un proceso que termina en pasa o no pasa.

## Procedimiento

1. Localiza la spec: `specs/<slug>/spec.md` con el slug de la rama, o la que
   indique el usuario.
2. Ejecuta `pnpm verdict specs/<slug>/spec.md`. Muestra la salida completa,
   sin resumirla: es lo que la persona lee en vez del diff.
3. Interpreta, en este orden:
   - **Criterios NO PASA**: cita el número y el criterio. Lee la salida del
     comando y di qué falló. Si el fallo es del código, arréglalo dentro del
     alcance y vuelve a ejecutar. Si el criterio es ambiguo o pide dos cosas
     a la vez, para: el contrato está mal escrito, y eso se corrige en la
     spec con la persona, no en el código.
   - **FUERA de alcance**: cita el fichero. No lo "arregles" moviendo código:
     o el cambio sobra y se revierte, o hacía falta y la spec tiene que
     ampliar el alcance con una persona firmándolo.
   - **Asserts modificados**: se revierten siempre. Si el assert antiguo
     estaba mal, eso es otra tarea, con su propia spec.
   - **Criterios MANUAL**: dilo explícitamente. No cuentan como verificados.
4. Cuando todo pasa: `pnpm verdict specs/<slug>/spec.md --write` para dejar
   la evidencia en la spec, y anuncia que la tarea cumple la definición de
   terminado de `AGENTS.md`.

## Reglas

- Nunca edites el comando de un criterio, bajes un umbral ni borres un assert
  para convertir un NO PASA en PASA.
- Nunca digas "pasa" sin haber ejecutado el comando en este turno.
- Un rojo que no está en "Rojos conocidos" de `AGENTS.md` lo rompiste tú.
