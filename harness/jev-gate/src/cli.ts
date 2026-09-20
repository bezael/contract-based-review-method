#!/usr/bin/env node
/**
 * El gate, como se usa en CI.
 *
 *   node src/cli.ts fixtures/contract.md fixtures/diff-fuera-de-carril.diff
 *
 * Códigos de salida, que es lo que lee tu pipeline:
 *   0  pass   — dentro del contrato
 *   1  review — hace falta una persona
 *   2  block  — no entra
 *
 * Requiere TYPESAFE_API_KEY. Sin key, `--mock` usa una respuesta de ejemplo
 * para que puedas ver el formato sin gastar una llamada.
 */

import { readFileSync } from 'node:fs'

import { DEFAULT_THRESHOLDS, contractGate, decide, type GateAnswers } from './contract-gate.ts'

const SALIDA = { pass: 0, review: 1, block: 2 } as const

/** Copia literal de una respuesta real; ver fixtures/respuesta-real.json. */
const MOCK: GateAnswers = {
  staysInLane: { type: 'noul', noul: 0.01 },
  meetsCriteria: { type: 'noul', noul: 0.03 },
  breaksPublicApi: { type: 'noul', noul: 0.97 },
  verdict: { type: 'choice', choice: 'reject', confidence: 0.94, probabilities: { reject: 0.96, revise: 0.04, approve: 0 } },
  risk: { type: 'score', score: 3.88, confidence: 0.9, legend: { '0': 'None', '1': 'Low', '2': 'Medium', '3': 'High', '4': 'Critical' }, probabilities: { '0': 0, '1': 0, '2': 0, '3': 0.11, '4': 0.89 } },
}

function cargarClave(): void {
  if (process.env.TYPESAFE_API_KEY) return
  for (const ruta of ['.env.local', '../../../../.env.local']) {
    try {
      for (const linea of readFileSync(ruta, 'utf8').split('\n')) {
        const [nombre, ...resto] = linea.trim().split('=')
        if (nombre === 'TYPESAFE_API_KEY') {
          process.env.TYPESAFE_API_KEY = resto.join('=').replace(/^["']|["']$/g, '')
          return
        }
      }
    } catch { /* el fichero no existe: se prueba el siguiente */ }
  }
}

async function main(): Promise<number> {
  const args = process.argv.slice(2)
  const mock = args.includes('--mock')
  const [rutaContrato, rutaDiff] = args.filter((a) => !a.startsWith('--'))

  if (!rutaContrato || !rutaDiff) {
    console.error('Uso: node src/cli.ts <contrato.md> <cambios.diff> [--mock]')
    return 2
  }

  const contract = readFileSync(rutaContrato, 'utf8')
  const diff = readFileSync(rutaDiff, 'utf8')

  cargarClave()
  const inicio = performance.now()
  const resultado = mock
    ? decide(MOCK)
    : await contractGate({ contract, diff })
  const ms = performance.now() - inicio

  const etiqueta = { pass: 'PASA', review: 'REVISIÓN HUMANA', block: 'BLOQUEADO' }[resultado.decision]
  console.log(`\n${etiqueta}${mock ? ' (mock)' : ` · ${Math.round(ms)} ms`}\n`)
  for (const motivo of resultado.reasons) console.log(`  · ${motivo}`)

  const a = resultado.answers
  console.log('\n  carril       ', a.staysInLane.noul.toFixed(2))
  console.log('  criterios    ', a.meetsCriteria.noul.toFixed(2))
  console.log('  rompe API    ', a.breaksPublicApi.noul.toFixed(2))
  console.log('  veredicto    ', `${a.verdict.choice} (confianza ${a.verdict.confidence.toFixed(2)})`)
  console.log('  riesgo       ', `${a.risk.score.toFixed(2)} / 4`)
  console.log('\n  umbrales     ', JSON.stringify(DEFAULT_THRESHOLDS))

  return SALIDA[resultado.decision]
}

main().then(
  (codigo) => process.exit(codigo),
  (error) => {
    console.error('\nERROR:', error instanceof Error ? error.message : error)
    process.exit(2)
  }
)
