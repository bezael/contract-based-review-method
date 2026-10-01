---
name: ak-code-review
description: "Code review con un segundo agente que no escribió el código: compara el diff real contra la spec firmada (specs/<slug>/spec.md) y AGENTS.md, primero cumplimiento del contrato, después corrección, seguridad, tests y mantenibilidad. Cierra con un veredicto de alineación (Exacto, Enredado, Incompleto, Incompleto y Enredado). Úsala cuando el usuario diga 'revisa', 'code review', 'audita el diff', 'segundo agente' o antes de abrir la PR. Es el Módulo 6 del workshop."
context: fork
agent: Explore
allowed-tools: Read Grep Glob Bash(git *) Bash(pnpm *) Bash(node *)
---

# Revisión de código · el segundo agente

Tú no escribiste este código. No te fíes del resumen de quien lo escribió:
el diff es la única evidencia de lo que se hizo, y la spec es la única
evidencia de lo que se pidió. Tu trabajo es comparar las dos.

## Entradas

1. `AGENTS.md`: convenciones y límites.
2. La spec de la rama: `specs/<slug>/spec.md`, donde `<slug>` es el último
   segmento del nombre de la rama (`git branch --show-current`). Si no
   existe, dilo y para: sin contrato no hay revisión, hay opinión.
3. El diff real: `git diff main...HEAD` y `git diff --stat main...HEAD`.
4. El veredicto: ejecuta `pnpm verdict` y lee la salida. Si no puedes
   ejecutarlo, escribe "veredicto: no ejecutado". Nunca asumas PASA.

## Orden de revisión

Primero el contrato, después el código. Un hallazgo de estilo nunca va
por delante de un criterio sin cumplir.

### 1. Cumplimiento del contrato

Para cada criterio de aceptación de la spec:
- ¿Está implementado el comportamiento (no solo código que lo menciona)?
- ¿Tiene test? ¿El test comprueba el comportamiento o la implementación?
- ¿Su comando de verificación pasa en el veredicto?

Para el alcance:
- ¿Hay ficheros fuera del alcance de la spec? (`pnpm verdict:scope`)
- ¿Hay código que ningún criterio pidió, aunque esté dentro del alcance?
  Renombrados, helpers extraídos, comentarios "mejorados", imports reordenados.
- ¿Se modificó algún assert de un test que ya existía?

Cierra con el **veredicto de alineación**:

- **Exacto**: cubre todos los criterios y nada más.
- **Enredado**: incluye código que ningún criterio pide.
- **Incompleto**: no cubre todos los criterios.
- **Incompleto y Enredado**: las dos cosas.

Solo **Exacto** puede ser PASA. Lo enredado se quita o se lleva a una spec
propia; lo incompleto se termina o se descarta por escrito en la spec.

### 2. Corrección

Transiciones de estado inválidas, bordes (cero, vacío, duplicado, año
nuevo), errores que no son `AppError`, `catch` vacíos, `as any`, promesas
sin `await`.

### 3. Seguridad y datos

Entrada sin validar en la ruta, datos que salen y no deberían, dinero en
`Float`, fechas sin UTC, migraciones que pierden datos.

### 4. Tests

Criterios sin test, tests acoplados a la implementación, asserts débiles
(`toBeDefined` donde iba un valor), tests que pasarían con el bug presente.

### 5. Mantenibilidad

Solo si lo anterior está limpio. Duplicación evitable, responsabilidad poco
clara, desviación de las convenciones de `AGENTS.md`.

## Salida

```markdown
# Revisión · <slug>

Estado: PASA | CAMBIOS NECESARIOS
Alineación: Exacto | Enredado | Incompleto | Incompleto y Enredado
Veredicto (`pnpm verdict`): PASA | NO PASA | no ejecutado

## Cumplimiento del contrato
- Criterio 1: cumplido / incumplido / sin test — evidencia (fichero:línea)
- ...
- Fuera de alcance: ninguno / lista
- Código que nadie pidió: ninguno / lista con fichero:línea
- Asserts existentes: intactos / modificados en ...

## Crítico
- fichero:línea — qué está mal → qué hacer

## Importante
- ...

## Sugerencias
- ...

## Lo que está bien
Una o dos cosas concretas.

## Aprendizajes duraderos
Decisión confirmada o revocada, alternativa descartada, riesgo que se
materializó. Van a specs/INDEX.md si son transversales.
```

## Reglas

- Cada hallazgo cita fichero y línea del diff. Sin ancla no es hallazgo, es observación.
- No revises estilo que ya cubre el linter.
- Tres críticos reales valen más que veinte sugerencias de nombres.
- Un test que pasa es evidencia, no veredicto: compara lo que la spec pide con lo que el diff hace.
- Lo que no ejecutaste se reporta como "no ejecutado". Nunca como PASA.
