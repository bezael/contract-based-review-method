#!/usr/bin/env node
// El veredicto.
//
//   pnpm verdict specs/<slug>/spec.md            ejecuta cada criterio y comprueba el alcance
//   pnpm verdict                                 usa la spec de la rama actual (o SPEC=...)
//   pnpm verdict --base origin/main              contra qué rama se calcula el diff (defecto: main)
//   pnpm verdict --only-scope                    solo el alcance, sin ejecutar comandos
//   pnpm verdict --write                         escribe la tabla en la sección "## Veredicto" de la spec
//
// Sale con código 1 si algún criterio no pasa o hay ficheros fuera de alcance.
// Es lo que lees en vez del diff.
import { execSync, spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { relative } from 'node:path'
import { coincide, leerSpec, normalizar, ramaActual, rutaSpecActiva } from './lib/spec.mjs'

const args = process.argv.slice(2)
const flag = (nombre) => args.includes(nombre)
const valor = (nombre, defecto) => {
  const i = args.indexOf(nombre)
  return i === -1 ? defecto : args[i + 1]
}
const rutaSpec = args.find((a) => !a.startsWith('--') && a.endsWith('.md')) ?? rutaSpecActiva()

if (!rutaSpec) {
  console.error('No encuentro la spec. Pásala como argumento: pnpm verdict specs/<slug>/spec.md')
  process.exit(2)
}

const spec = leerSpec(rutaSpec)
const rama = ramaActual() ?? '(sin git)'
const base = valor('--base', rama === 'main' ? 'HEAD' : 'main')
const soloAlcance = flag('--only-scope')

// ---------------------------------------------------------------------------
// Ficheros cambiados: commits de la rama + working tree + no trackeados
// ---------------------------------------------------------------------------
function git(cmd) {
  try {
    return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().split(/\r?\n/).filter(Boolean)
  } catch {
    return []
  }
}

const cambiados = new Set([
  ...(base === 'HEAD' ? [] : git(`git diff --name-only ${base}...HEAD`)),
  ...git('git diff --name-only HEAD'),
  ...git('git ls-files --others --exclude-standard'),
].map(normalizar))

// La propia spec y su carpeta siempre están en alcance.
const carpetaSpec = normalizar(relative(process.cwd(), rutaSpec)).replace(/\/spec\.md$/, '')
const alcance = [...spec.alcance, `${carpetaSpec}/**`]

const fueraDeAlcance = [...cambiados].filter((f) => !coincide(f, alcance))
const dentro = [...cambiados].filter((f) => coincide(f, alcance))

// ---------------------------------------------------------------------------
// Asserts existentes: el examinado no corrige su propio examen.
// Cualquier línea con `expect(` que desaparezca o cambie en un test que ya
// existía es una cláusula rota, aunque la suite esté en verde.
// ---------------------------------------------------------------------------
function assertsModificados() {
  const diffs = [
    ...(base === 'HEAD' ? [] : git(`git diff --unified=0 ${base}...HEAD -- "*.test.ts"`)),
    ...git('git diff --unified=0 HEAD -- "*.test.ts"'),
  ]
  const resultado = []
  let fichero = ''
  for (const linea of diffs) {
    if (linea.startsWith('--- a/')) fichero = normalizar(linea.slice(6))
    else if (linea.startsWith('-') && !linea.startsWith('---') && /\bexpect\s*\(/.test(linea)) {
      resultado.push({ fichero, linea: linea.slice(1).trim() })
    }
  }
  return resultado
}
const assertsRotos = assertsModificados()

// ---------------------------------------------------------------------------
// Criterios: ejecutar cada comando
// ---------------------------------------------------------------------------
const resultados = []
if (!soloAlcance) {
  for (const criterio of spec.criterios) {
    if (!criterio.comando) {
      resultados.push({ ...criterio, estado: 'MANUAL', ms: 0, salida: '' })
      continue
    }
    const inicio = Date.now()
    const proceso = spawnSync(criterio.comando, { shell: true, encoding: 'utf8', stdio: 'pipe' })
    const ms = Date.now() - inicio
    const completa = `${proceso.stdout ?? ''}${proceso.stderr ?? ''}`
    let salida = completa.trim().split(/\r?\n/).slice(-12).join('\n')
    let estado = proceso.status === 0 ? 'PASA' : 'NO PASA'
    // Vitest sale con 0 cuando el filtro -t no encuentra ningún test. Eso no
    // es un PASA: es un criterio que nadie ha comprobado.
    if (estado === 'PASA' && /vitest/.test(criterio.comando) && !/Tests\s+\d+\s+passed/.test(completa)) {
      estado = 'NO PASA'
      salida = 'El comando no ejecutó ningún test: el filtro -t no coincide con ningún nombre. Escribe el test antes de dar el criterio por cumplido.'
    }
    resultados.push({
      ...criterio,
      estado,
      codigo: proceso.status,
      ms,
      salida,
    })
  }
}

// ---------------------------------------------------------------------------
// Informe
// ---------------------------------------------------------------------------
const segundos = (ms) => `${(ms / 1000).toFixed(1)}s`
const pad = (s, n) => String(s).padEnd(n)

console.log('')
console.log(`VEREDICTO · ${spec.titulo}`)
console.log(`Spec: ${normalizar(relative(process.cwd(), rutaSpec))} · Rama: ${rama} · Base: ${base}`)
console.log('')

if (!soloAlcance) {
  console.log('Criterios de aceptación')
  if (resultados.length === 0) {
    console.log('  (la spec no tiene criterios con comando: no hay nada que un proceso pueda rechazar)')
  }
  for (const r of resultados) {
    console.log(`  ${pad(r.numero, 3)}${pad(r.estado, 9)}${pad(segundos(r.ms), 7)} ${r.criterio}`)
    if (r.estado === 'NO PASA') {
      console.log(`       ↳ ${r.comando}  (exit ${r.codigo})`)
      for (const linea of r.salida.split('\n')) console.log(`         ${linea}`)
    }
    if (r.estado === 'MANUAL') {
      console.log('       ↳ sin comando: este criterio lo revisa una persona. Cuenta como intención, no como cláusula.')
    }
  }
  console.log('')
}

console.log(`Alcance de modificación (${cambiados.size} ficheros cambiados)`)
for (const f of dentro) console.log(`  DENTRO   ${f}`)
for (const f of fueraDeAlcance) console.log(`  FUERA    ${f}   ← no está en el alcance de la spec`)
if (cambiados.size === 0) console.log('  (sin cambios respecto a la base)')
console.log('')

console.log('Asserts de tests existentes')
if (assertsRotos.length === 0) console.log('  INTACTOS')
for (const a of assertsRotos) console.log(`  MODIFICADO  ${a.fichero}: ${a.linea}`)
console.log('')

const incumplidos = resultados.filter((r) => r.estado === 'NO PASA').length
const manuales = resultados.filter((r) => r.estado === 'MANUAL').length
const pasa = incumplidos === 0 && fueraDeAlcance.length === 0 && assertsRotos.length === 0

const partes = []
if (incumplidos) partes.push(`${incumplidos} criterio${incumplidos > 1 ? 's' : ''} incumplido${incumplidos > 1 ? 's' : ''}`)
if (fueraDeAlcance.length) partes.push(`${fueraDeAlcance.length} fichero${fueraDeAlcance.length > 1 ? 's' : ''} fuera de alcance`)
if (assertsRotos.length) partes.push(`${assertsRotos.length} assert${assertsRotos.length > 1 ? 's' : ''} existente${assertsRotos.length > 1 ? 's' : ''} modificado${assertsRotos.length > 1 ? 's' : ''}`)
if (manuales) partes.push(`${manuales} criterio${manuales > 1 ? 's' : ''} manual${manuales > 1 ? 'es' : ''}`)

console.log(`Resultado: ${pasa ? 'PASA' : 'NO PASA'}${partes.length ? ' · ' + partes.join(' · ') : ''}`)
console.log('')

// ---------------------------------------------------------------------------
// --write: dejar el veredicto en la spec, para que la PR lo enlace
// ---------------------------------------------------------------------------
if (flag('--write')) {
  const fecha = new Date().toISOString().slice(0, 16).replace('T', ' ')
  const filas = resultados
    .map((r) => `| ${r.numero} | ${r.criterio} | ${r.estado} | ${r.comando ? `\`${r.comando}\` → exit ${r.codigo ?? '-'} (${segundos(r.ms)})` : 'revisión manual'} |`)
    .join('\n')
  const bloque = [
    '## Veredicto',
    '',
    `> Generado por \`pnpm verdict --write\` el ${fecha} UTC · rama \`${rama}\` · base \`${base}\``,
    '',
    '| # | Criterio | Estado | Evidencia |',
    '|---|---|---|---|',
    filas || '| - | (sin criterios ejecutables) | - | - |',
    '',
    `**Alcance:** ${fueraDeAlcance.length === 0 ? 'todos los cambios dentro del alcance' : `fuera de alcance: ${fueraDeAlcance.map((f) => `\`${f}\``).join(', ')}`}`,
    `**Asserts existentes:** ${assertsRotos.length === 0 ? 'intactos' : `${assertsRotos.length} modificados`}`,
    `**Resultado:** ${pasa ? 'PASA' : 'NO PASA'}`,
    '',
  ].join('\n')

  const original = readFileSync(rutaSpec, 'utf8')
  // Desde "## Veredicto" hasta la siguiente sección o el final del fichero.
  const patron = /^## Veredicto\b[\s\S]*?(?=\n## |$(?![\s\S]))/m
  const actualizado = patron.test(original)
    ? original.replace(patron, bloque.trimEnd())
    : `${original.trimEnd()}\n\n${bloque}`
  writeFileSync(rutaSpec, actualizado)
  console.log(`Veredicto escrito en ${normalizar(relative(process.cwd(), rutaSpec))}`)
}

process.exit(pasa ? 0 : 1)
