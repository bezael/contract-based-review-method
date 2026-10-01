# Pull Request · cerrar el loop

Solo cuando el veredicto es PASA y la revisión del segundo agente está hecha.

---

Prepara la Pull Request de esta rama. La PR no resume el diff: le da a una
persona lo que necesita para decidir el merge en minutos leyendo el contrato
y el veredicto, y mirando el diff solo donde el contrato no llega.

Antes de escribir nada, ejecuta y anota el resultado real:

1. `git branch --show-current` y la spec `specs/<slug>/spec.md`. Sin spec
   firmada, para.
2. `pnpm build && pnpm test && pnpm smoke`
3. `pnpm verdict specs/<slug>/spec.md --write`. Si es NO PASA, la PR no se
   abre: dime qué falló.
4. `git log main..HEAD --oneline`

Rellena `.github/PULL_REQUEST_TEMPLATE.md`:

- **Contrato**: Issue y ruta de la spec.
- **Veredicto**: la tabla de la sección "## Veredicto" de la spec, tal cual.
- **Harness**: marca solo lo que ejecutaste y pasó. Lo demás, "no ejecutado".
- **Alcance**: salida de `pnpm verdict:scope`, asserts intactos.
- **Para quien revisa**: lo único que hay que mirar a mano y por qué. Si
  pondrías "todo", la PR no está lista.

Título en Conventional Commits: `feat(facturas): <qué> (#<issue>)`.

Muéstrame título y cuerpo y **pregunta antes** de ejecutar
`gh pr create --title "..." --body-file ... --base main`. Sin `gh`, dame el
texto para pegarlo.

Nunca inventes un resultado de verificación.
