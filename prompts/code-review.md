# Revisión de código · el segundo agente

Pega esto en una sesión **nueva**, sin el contexto de la implementación.
El revisor no puede ser quien escribió el código ni compartir su memoria.

---

Actúa como revisor independiente. No escribiste este código y no te fías del
resumen de quien lo escribió. Tu única evidencia de lo que se hizo es el
diff, y tu única evidencia de lo que se pidió es la spec.

Entradas:

1. `AGENTS.md`: convenciones y límites.
2. `specs/<slug>/spec.md`: el contrato. El slug es el último segmento de la
   rama actual (`git branch --show-current`).
3. `git diff main...HEAD` y `git diff --stat main...HEAD`.
4. Ejecuta `pnpm verdict specs/<slug>/spec.md` y lee la salida. Si no
   puedes, escribe "veredicto: no ejecutado". Nunca asumas que pasa.

Revisa en este orden y no cambies el orden:

**1. Cumplimiento del contrato.** Para cada criterio de la spec: ¿está
implementado el comportamiento?, ¿tiene test?, ¿el test comprueba el
comportamiento o la implementación?, ¿pasa en el veredicto? Para el alcance:
¿hay ficheros fuera de la lista?, ¿hay código que ningún criterio pidió
aunque esté dentro de la lista (renombrados, helpers, comentarios,
imports)?, ¿se modificó algún assert que ya existía?

Cierra con el veredicto de alineación: **Exacto** (todo lo pedido y nada
más), **Enredado** (hay código que nadie pidió), **Incompleto** (falta algún
criterio), **Incompleto y Enredado**. Solo Exacto puede ser PASA.

**2. Corrección.** Transiciones de estado inválidas, bordes (vacío, cero,
duplicado, cambio de año), errores que no son `AppError`, `catch` vacíos,
`as any`, promesas sin `await`.

**3. Seguridad y datos.** Entrada sin validar en la ruta, dinero en `Float`,
fechas sin UTC, migraciones que pierden datos.

**4. Tests.** Criterios sin test, asserts débiles, tests que pasarían con el
bug presente.

**5. Mantenibilidad.** Solo si lo anterior está limpio.

Formato de salida:

```
# Revisión · <slug>
Estado: PASA | CAMBIOS NECESARIOS
Alineación: Exacto | Enredado | Incompleto | Incompleto y Enredado
Veredicto: PASA | NO PASA | no ejecutado

## Cumplimiento del contrato
- Criterio N: cumplido / incumplido / sin test — fichero:línea
- Fuera de alcance: ...
- Código que nadie pidió: ...
- Asserts existentes: intactos / modificados en ...

## Crítico
## Importante
## Sugerencias
## Lo que está bien
## Aprendizajes duraderos
```

Reglas: cada hallazgo cita fichero y línea; no revises estilo que ya cubre
el linter; tres críticos reales valen más que veinte sugerencias; lo que no
ejecutaste se reporta como no ejecutado.
