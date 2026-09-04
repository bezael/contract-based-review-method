// Lectura del contrato de una tarea: specs/<slug>/spec.md
//
// Lo usan `scripts/verdict.mjs` (el veredicto) y `.claude/hooks/guard-boundaries.mjs`
// (el carril). Sin dependencias: solo Node.
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { execSync } from 'node:child_process'

/** Devuelve el texto de una sección `## Título` hasta la siguiente `## `. */
export function seccion(markdown, titulo) {
  const lineas = markdown.split(/\r?\n/)
  const inicio = lineas.findIndex((l) => l.trim().toLowerCase() === `## ${titulo}`.toLowerCase())
  if (inicio === -1) return null
  const cuerpo = []
  for (const linea of lineas.slice(inicio + 1)) {
    if (/^## /.test(linea)) break
    cuerpo.push(linea)
  }
  return cuerpo.join('\n')
}

/**
 * Criterios de aceptación: filas de la tabla `| # | Criterio | Cómo se verifica |`.
 * El comando es lo que va entre backticks en la última columna. Si no hay
 * backticks, el criterio se considera manual y el veredicto lo marca aparte.
 */
export function criterios(markdown) {
  const texto = seccion(markdown, 'Criterios de aceptación')
  if (!texto) return []
  const filas = []
  for (const linea of texto.split('\n')) {
    if (!linea.trim().startsWith('|')) continue
    const celdas = linea.split('|').slice(1, -1).map((c) => c.trim())
    if (celdas.length < 3) continue
    const numero = Number(celdas[0])
    if (!Number.isInteger(numero)) continue
    const comando = celdas[2].match(/`([^`]+)`/)?.[1] ?? null
    filas.push({ numero, criterio: celdas[1], comando })
  }
  return filas
}

/** Alcance de modificación: viñetas `- \`ruta\``. Admite globs. */
export function alcance(markdown) {
  const texto = seccion(markdown, 'Alcance de modificación')
  if (!texto) return []
  return [...texto.matchAll(/^\s*-\s+`([^`]+)`/gm)].map((m) => normalizar(m[1]))
}

/** Límites permanentes de AGENTS.md: viñetas de `## Límites` que empiezan por ruta. */
export function limites(agentsMarkdown) {
  const texto = seccion(agentsMarkdown, 'Límites')
  if (!texto) return []
  return [...texto.matchAll(/^\s*-\s+`([^`]+)`/gm)]
    .map((m) => normalizar(m[1]))
    .filter((ruta) => !ruta.includes(' '))
}

export function normalizar(ruta) {
  return ruta.replace(/\\/g, '/').replace(/^\.\//, '')
}

/** Convierte un glob sencillo (`**`, `*`, `?`, `dir/`) en RegExp. */
export function globARegex(glob) {
  let patron = normalizar(glob)
  if (patron.endsWith('/')) patron += '**'
  const escapado = patron
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*\//g, '(?:.*/)?')
    .replace(/\*\*/g, '.*')
    .replace(/\*/g, '[^/]*')
    .replace(/\?/g, '[^/]')
  return new RegExp(`^${escapado}$`)
}

export function coincide(ruta, globs) {
  const limpia = normalizar(ruta)
  return globs.some((glob) => globARegex(glob).test(limpia))
}

/** Rama actual, o null si no estamos en un repo git. */
export function ramaActual(cwd = process.cwd()) {
  try {
    return execSync('git branch --show-current', { cwd, stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim()
  } catch {
    return null
  }
}

/**
 * La spec activa se deduce de la rama: `feat/descuento-factura` -> specs/descuento-factura/spec.md.
 * Se puede forzar con la variable de entorno SPEC=specs/<slug>/spec.md.
 */
export function rutaSpecActiva(cwd = process.cwd()) {
  if (process.env.SPEC) return process.env.SPEC
  const rama = ramaActual(cwd)
  if (!rama) return null
  const slug = rama.split('/').pop()
  const candidata = join(cwd, 'specs', slug, 'spec.md')
  return existsSync(candidata) ? candidata : null
}

export function leerSpec(ruta) {
  const markdown = readFileSync(ruta, 'utf8')
  return {
    ruta,
    markdown,
    titulo: markdown.match(/^#\s+(.+)$/m)?.[1] ?? ruta,
    criterios: criterios(markdown),
    alcance: alcance(markdown),
  }
}
