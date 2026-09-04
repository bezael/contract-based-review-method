# Prompts maestros

Los mismos flujos que las skills de `.claude/skills/`, como texto suelto para
pegar en Codex, Cursor, Gemini CLI o cualquier agente con acceso al repo.
Todos asumen que el agente ha leído `AGENTS.md` (Codex, Cursor y Gemini lo
leen solos; si el tuyo no, pégalo delante del prompt).

| Prompt | Módulo | Para qué |
|---|---|---|
| `analisis-contexto.md` | 3 | Que el agente entienda el repo antes de tocarlo: stack, convenciones, límites, harness |
| `harness-init.md` | 3 | Auditar un repo cualquiera y generar su `AGENTS.md` con comandos reales |
| `contrato.md` | 2 | Del Issue a `specs/<slug>/spec.md` con criterios ejecutables y alcance |
| `sdd-creator.md` | 2–4 | Ciclo SDD completo (spec, plan, tasks) para features grandes |
| `planificacion.md` | 4 | De la spec firmada a un plan de pasos verificables, sin código todavía |
| `implementacion-acotada.md` | 4–5 | Implementar dentro del alcance con el bucle corto después de cada cambio |
| `revision-codigo.md` | 6 | Segundo agente: diff contra contrato, veredicto de alineación |
| `revision-pr.md` | 7 | La Pull Request con evidencia real |

Orden en una tarea: contexto (una vez por repo) → contrato → planificación →
implementación → `pnpm verdict` → revisión → PR.
