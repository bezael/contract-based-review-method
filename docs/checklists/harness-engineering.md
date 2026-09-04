# Checklist de Harness Engineering

Qué configurar y delimitar **antes** de autorizar al agente a tocar el
código. Es el Módulo 3. Se recorre una vez por repositorio y se revisa
cuando el proyecto cambia de verdad.

Regla de oro: **nunca metas en el harness un comando que no hayas
ejecutado.** Un harness con comandos inventados es peor que no tener harness.

## 1. Auditoría (solo lectura)

- [ ] Stack identificado por sus manifiestos, y gestor de paquetes derivado del **lockfile**, no de la costumbre.
- [ ] Inventario de mecanismos de feedback: build, tipos, tests, lint/format, CI, e2e/smoke. Fuentes: scripts del manifiesto, `Makefile`/`Justfile`, `.github/workflows`.
- [ ] Cada candidato **ejecutado**, con exit code, duración y últimas líneas si falla.
- [ ] Configuración de agente existente localizada (`AGENTS.md`, `CLAUDE.md`, `.cursorrules`, `.cursor/rules/`, `copilot-instructions.md`). Si existe, no se sobrescribe: se propone el diff.
- [ ] Tabla de estado cerrada: mecanismo, comando, OK / FALLA / NO EXISTE, tiempo.

## 2. Contrato permanente (`AGENTS.md`)

- [ ] Dos líneas de contexto: qué es el proyecto y para quién. Incluye lo que **no** es.
- [ ] Stack con versiones y gestor de paquetes con "no uses otro".
- [ ] **Bucle corto** (< 60 s, después de cada cambio) y **bucle largo** (antes de la PR), con el tiempo medido al lado de cada comando.
- [ ] **Rojos conocidos**: lo que falla hoy por causas anteriores al agente, con el número de fallos. Si no hay: "Ninguno. Todo en verde a fecha de …".
- [ ] Convenciones **detectadas leyendo el código**, con ejemplos reales. Ninguna que el código existente incumpla.
- [ ] Límites: qué no se toca sin permiso. Migraciones, despliegue, dependencias, secretos, asserts existentes, y los dos o tres ficheros que ya han mordido en este repo.
- [ ] Definición de terminado con el punto 4: *el diff no contiene nada que la spec no pidiera*.
- [ ] `CLAUDE.md` con `@AGENTS.md` si se usa Claude Code. Sin duplicar contenido.

## 3. Contrato de tarea (`specs/spec.template.md`)

- [ ] Plantilla con criterios de aceptación en tabla y **un comando por criterio**.
- [ ] Sección "Qué queda fuera" obligatoria.
- [ ] Alcance de modificación como lista cerrada de ficheros.
- [ ] Riesgos con el comando que los detectaría.
- [ ] Sección "Veredicto" que rellena el harness, no la persona.

## 4. Carril: las tres capas

- [ ] **Declarado**: la sección Límites de `AGENTS.md`. Diez minutos.
- [ ] **Impedido**: hook que rechaza escrituras en los límites salvo que la spec activa los autorice (`.claude/hooks/guard-boundaries.mjs`), permisos de la herramienta, ficheros de solo lectura donde se pueda.
- [ ] **Detectado**: CI que ejecuta el bucle largo en cada PR, protección de rama que exige CI verde, veredicto de alcance (`pnpm verdict:scope`) y de asserts intactos.

## 5. Veredicto

- [ ] Script o comando que ejecuta los criterios de la spec y devuelve pasa / no pasa por cláusula (`pnpm verdict`).
- [ ] Comprobación automática de alcance: ficheros cambiados contra la lista de la spec.
- [ ] Comprobación automática de asserts existentes.
- [ ] Salida escrita en la spec para que la PR la enlace (`--write`).

## 6. Segundo agente

- [ ] Skill o prompt de revisión que arranca por el cumplimiento del contrato y cierra con un veredicto de alineación (Exacto / Enredado / Incompleto).
- [ ] El revisor corre en una sesión sin el contexto del implementador.
- [ ] Plantilla de PR con contrato, veredicto, harness, alcance y "para quien revisa".

## 7. Nivel del harness

| Nivel | Qué hay | Qué se te cuela |
|---|---|---|
| 0 · Sin harness | Nada automático | Todo. Revisas línea a línea |
| 1 · Compila | Build o tipos | Lo que degrada sin romper |
| 2 · Se comporta | Tests y lint | Lo que nadie ejecuta antes de la PR |
| 3 · Automático | CI en cada PR | Lo que el contrato no nombra |
| 4 · Con veredicto | Criterios de la spec + segundo agente | Lo que solo una persona puede juzgar: si pediste lo correcto |

Un movimiento por informe. Quien intenta subir tres niveles a la vez no sube ninguno.
