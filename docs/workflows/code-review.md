# Workflow · Code Review con un segundo agente

Módulo 6. Un agente que **no escribió el código** compara el diff real con la
spec firmada. Encuentra lo que ningún test encuentra: decisiones de diseño
que no encajan, código que nadie pidió, criterios cubiertos de nombre pero
no de comportamiento.

## Por qué un segundo agente y no el mismo

El que implementó tiene en su contexto el plan, los rodeos y las
justificaciones. Revisa su propio trabajo con la misma ceguera con la que lo
escribió. El revisor arranca sin ese contexto: solo tiene el contrato y el
diff, que es exactamente lo que tendrá la persona que haga el merge.

Reglas de independencia:

- Sesión nueva o `context: fork` (la skill `ak-code-review` ya lo hace).
- No lee el resumen del implementador. Lee `git diff main...HEAD`.
- No se fía de "los tests pasan": ejecuta `pnpm verdict` y lo lee.

## El flujo

```
spec firmada + diff de la rama
        │
        ▼
1. Cumplimiento del contrato   ──► veredicto de alineación
   criterios, alcance, asserts       Exacto / Enredado / Incompleto
        │
        ▼
2. Corrección  ·  3. Seguridad y datos  ·  4. Tests  ·  5. Mantenibilidad
        │
        ▼
Informe: PASA | CAMBIOS NECESARIOS
        │
        ├── CAMBIOS ──► el implementador corrige dentro del alcance ──► vuelve a 1
        │
        └── PASA ──► revision-pr (Módulo 7)
```

## Cómo lanzarlo

**Claude Code** (skill incluida en el repo):

```
/revision-codigo
```

**Codex / Cursor / Gemini CLI**: sesión nueva y pegar `prompts/code-review.md`.

**GitHub** (opcional): el mismo prompt como acción sobre `pull_request`,
o un bot de review con `AGENTS.md` y la spec como contexto. La salida va como
comentario de la PR.

## El veredicto de alineación

| Veredicto | Qué significa | Qué se hace |
|---|---|---|
| **Exacto** | Cubre todos los criterios y nada más | Puede ser PASA |
| **Enredado** | Hay código que ningún criterio pidió | Se quita, o se lleva a su propia spec |
| **Incompleto** | Falta algún criterio | Se termina, o se descarta por escrito en la spec |
| **Incompleto y Enredado** | Las dos cosas | Las dos cosas |

Lo enredado no es inofensivo: es ruido que esconde defectos y puede bloquear
la aprobación de la parte válida. Lo incompleto es deuda técnica con un check
verde encima.

## Lo que el revisor nunca hace

- Aceptar un PASA con alineación distinta de Exacto sin que una persona haya
  aceptado la desviación y la haya llevado a la spec.
- Inventar requisitos. La revisión es evidencia derivada, no una fuente
  nueva de requisitos: si descubre un hueco durable, se corrige la spec
  primero.
- Revisar estilo que ya cubre el linter.
- Reportar como PASA una verificación que no ejecutó.

## Cerrar el loop del aprendizaje

Una revisión termina cuando lo durable que enseñó vive donde la siguiente
sesión lo leerá: `specs/INDEX.md`, sección "Decisiones compartidas". Solo
sube lo transversal: decisión confirmada o revocada, alternativa descartada
con motivo, riesgo que se materializó. Los arreglos de código se quedan en
la revisión.
