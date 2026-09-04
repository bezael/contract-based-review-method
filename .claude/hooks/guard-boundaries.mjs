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
import { coincide, limites, leerSpec, normalizar, rutaSpecActiva } from '../../scripts/lib/spec.mjs'

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

  const ruta = normalizar(isAbsolute(rutaBruta) ? relative(raiz, rutaBruta) : rutaBruta)
  if (ruta.startsWith('..')) process.exit(0) // fuera del repo: no es asunto de este hook

  const rutaAgents = join(raiz, 'AGENTS.md')
  if (!existsSync(rutaAgents)) process.exit(0)
  const protegidos = limites(readFileSync(rutaAgents, 'utf8'))

  if (!coincide(ruta, protegidos)) process.exit(0)

  const rutaSpec = rutaSpecActiva(raiz)
  if (rutaSpec) {
    const spec = leerSpec(rutaSpec)
    if (coincide(ruta, spec.alcance)) {
      process.stderr.write(`Límite de AGENTS.md autorizado por la spec (${normalizar(relative(raiz, rutaSpec))}): ${ruta}\n`)
      process.exit(0)
    }
  }

  process.stderr.write(
    [
      `BLOQUEADO por el carril: "${ruta}" está en los límites de AGENTS.md.`,
      rutaSpec
        ? `La spec activa (${normalizar(relative(raiz, rutaSpec))}) no lo incluye en "Alcance de modificación".`
        : 'No hay spec activa para esta rama (specs/<slug>/spec.md).',
      'Para y pregunta: si la tarea necesita tocar este fichero, hay que añadirlo al alcance de la spec, con una persona firmando el cambio.',
    ].join('\n') + '\n',
  )
  process.exit(2)
})
