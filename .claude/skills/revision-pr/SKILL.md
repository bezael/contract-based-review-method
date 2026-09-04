---
name: revision-pr
description: "Cierra el ciclo: genera la Pull Request que conecta Issue, spec, diff, veredicto y revisión, usando .github/PULL_REQUEST_TEMPLATE.md y solo evidencia real (ejecuta pnpm verdict --write antes). Úsala cuando el usuario diga 'abre la PR', 'pull request', 'cierra el loop' o 'prepara el merge'. Es el Módulo 7 del workshop. No abre la PR sin confirmación."
disable-model-invocation: true
allowed-tools: Bash(git *) Bash(gh *) Bash(pnpm *) Read Glob Grep
---

# Pull Request · cerrar el loop

La PR no es un resumen del diff. Es el documento que permite a una persona
decidir el merge en minutos leyendo el contrato y el veredicto, y mirando el
diff solo donde el contrato no llega.

## Antes de escribir nada

1. Rama actual y spec: `git branch --show-current` → `specs/<slug>/spec.md`.
   Sin spec firmada no hay PR: para y dilo.
2. Bucle largo: `pnpm build && pnpm test && pnpm smoke`. Anota qué pasó.
3. Veredicto escrito en la spec: `pnpm verdict specs/<slug>/spec.md --write`.
   Si sale NO PASA, la PR no se abre. Se arregla o se descarta por escrito.
4. Revisión del segundo agente: si no se ha hecho, pide ejecutar `revision-codigo`
   primero. Una PR sin revisión independiente le pide a la persona el trabajo
   que tenía que hacer el harness.
5. Commits de la rama: `git log main..HEAD --oneline`.

## Construir la PR con la plantilla

Rellena `.github/PULL_REQUEST_TEMPLATE.md` con datos reales:

- **Contrato**: número del Issue y ruta de la spec.
- **Veredicto**: pega la tabla de la sección "## Veredicto" de la spec, tal cual.
- **Harness**: marca solo lo que ejecutaste y pasó. Lo no ejecutado se escribe "no ejecutado".
- **Alcance**: la salida de `pnpm verdict:scope` y la confirmación de asserts intactos.
- **Para quien revisa**: lo único que hace falta mirar a mano y por qué. Suele ser una decisión de diseño o un nombre de dominio. Si aquí pondrías "todo", la PR no está lista.

Título en Conventional Commits: `feat(facturas): anular factura emitida (#12)`.

## Abrir la PR

Muestra título y cuerpo y **pregunta antes de ejecutar**:

```bash
gh pr create --title "<título>" --body-file <fichero-temporal> --base main
```

Sin `gh`, entrega el texto para pegarlo a mano.

## Reglas

- Nunca inventes un resultado de verificación. "No ejecutado" es un valor honesto; un PASA inventado no.
- Si la rama mezcla dos contratos, propón dividirla.
- La PR enlaza el Issue con `Closes #<n>` solo si la spec lo nombra.
