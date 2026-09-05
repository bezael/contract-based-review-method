#!/usr/bin/env node
// El carril, segunda capa: impedido, no solo declarado.
//
// Hook PreToolUse de Claude Code. Antes de cada Edit/Write comprueba si el
// fichero está en los límites de AGENTS.md (sección "## Límites"). Si lo está,
// solo lo deja pasar cuando la spec activa (specs/<slug>/spec.md, deducida de
// la rama) lo incluye en su "Alcance de modificación". Si no, bloquea y explica.
//
// Un AGENTS.md es una señal. Esto es una valla. Ver capítulo 4 del ebook.
import { readFileSync, existsSync } from 'node:fs'
import { join, relative, isAbsolute } from 'node:path'
import { matchesGlob, boundaries, readSpec, normalizePath, activeSpecPath } from '../../scripts/lib/spec.mjs'

const raiz = process.env.CLAUDE_PROJECT_DIR ?? process.cwd()

let entrada = ''
process.stdin.setEncoding('utf8')
process.stdin.on('data', (trozo) => (entrada += trozo))
process.stdin.on('end', () => {
  let datos
  try {
    datos = JSON.parse(entrada)
  } catch {
    process.exit(0) // sin JSON no hay nada que comprobar
  }

  const rutaBruta = datos?.tool_input?.file_path ?? datos?.tool_input?.notebook_path
  if (!rutaBruta) process.exit(0)

  const ruta = normalizePath(isAbsolute(rutaBruta) ? relative(raiz, rutaBruta) : rutaBruta)
  if (ruta.startsWith('..')) process.exit(0) // fuera del repo: no es asunto de este hook

  const rutaAgents = join(raiz, 'AGENTS.md')
  if (!existsSync(rutaAgents)) process.exit(0)
  const protegidos = boundaries(readFileSync(rutaAgents, 'utf8'))

  if (!matchesGlob(ruta, protegidos)) process.exit(0)

  const rutaSpec = activeSpecPath(raiz)
  if (rutaSpec) {
    const spec = readSpec(rutaSpec)
    if (matchesGlob(ruta, spec.scope)) {
      process.stderr.write(`Límite de AGENTS.md autorizado por la spec (${normalizePath(relative(raiz, rutaSpec))}): ${ruta}\n`)
      process.exit(0)
    }
  }

  process.stderr.write(
    [
      `BLOQUEADO por el carril: "${ruta}" está en los límites de AGENTS.md.`,
      rutaSpec
        ? `La spec activa (${normalizePath(relative(raiz, rutaSpec))}) no lo incluye en "Alcance de modificación".`
        : 'No hay spec activa para esta rama (specs/<slug>/spec.md).',
      'Para y pregunta: si la tarea necesita tocar este fichero, hay que añadirlo al alcance de la spec, con una persona firmando el cambio.',
    ].join('\n') + '\n',
  )
  process.exit(2)
})
