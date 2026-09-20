import assert from 'node:assert/strict'
import { test } from 'node:test'

import { DEFAULT_THRESHOLDS, buildQuestions, decide, type GateAnswers } from './contract-gate.ts'

/** Respuesta limpia: todo dentro del contrato y con el modelo seguro. */
const LEGEND = { '0': 'None', '1': 'Low', '2': 'Medium', '3': 'High', '4': 'Critical' }
const LIMPIA: GateAnswers = {
  staysInLane: { type: 'noul', noul: 0.97 },
  meetsCriteria: { type: 'noul', noul: 0.94 },
  breaksPublicApi: { type: 'noul', noul: 0.03 },
  verdict: { type: 'choice', choice: 'approve', confidence: 0.93, probabilities: { approve: 0.93, revise: 0.05, reject: 0.02 } },
  risk: { type: 'score', score: 0.8, confidence: 0.88, legend: LEGEND, probabilities: { '0': 0.6, '1': 0.3, '2': 0.1, '3': 0, '4': 0 } },
}

const clonar = (parche: Partial<GateAnswers>): GateAnswers => ({ ...LIMPIA, ...parche })

test('las cinco preguntas viajan en una sola request', () => {
  const q = buildQuestions()
  assert.deepEqual(Object.keys(q), ['staysInLane', 'meetsCriteria', 'breaksPublicApi', 'verdict', 'risk'])
  assert.equal(q.staysInLane.type, 'noul')
  assert.equal(q.verdict.type, 'choice')
  assert.equal(q.risk.type, 'score')
})

test('las preguntas van en inglés: es el idioma de entrenamiento del modelo', () => {
  for (const pregunta of Object.values(buildQuestions())) {
    assert.match(String(pregunta.instructions), /^(Does|What|How)\b/)
  }
})

test('un cambio dentro del contrato pasa', () => {
  const r = decide(LIMPIA)
  assert.equal(r.decision, 'pass')
})

test('salirse del carril bloquea', () => {
  const r = decide(clonar({ staysInLane: { type: 'noul', noul: 0.31 } }))
  assert.equal(r.decision, 'block')
  assert.ok(r.reasons.some((m) => m.includes('carril')))
})

test('romper la API pública bloquea aunque el veredicto sea approve', () => {
  const r = decide(clonar({ breaksPublicApi: { type: 'noul', noul: 0.88 } }))
  assert.equal(r.decision, 'block')
})

test('un veredicto reject bloquea', () => {
  const r = decide(clonar({ verdict: { type: 'choice', choice: 'reject', confidence: 0.91, probabilities: { approve: 0.04, revise: 0.05, reject: 0.91 } } }))
  assert.equal(r.decision, 'block')
})

test('confianza baja no aprueba ni bloquea: la mira una persona', () => {
  const r = decide(clonar({ verdict: { type: 'choice', choice: 'approve', confidence: 0.41, probabilities: { approve: 0.41, revise: 0.38, reject: 0.21 } } }))
  assert.equal(r.decision, 'review')
  assert.ok(r.reasons.some((m) => m.includes('Confianza')))
})

test('una noul en la banda del medio es "no sé", y eso no bloquea un PR', () => {
  // 0,44 no es un "no": es el modelo encogiéndose de hombros. Bloquear aquí
  // es el falso positivo que hace que el equipo desactive el gate en dos
  // semanas. Una noul no trae confidence aparte — su distancia a 0,5 lo es.
  const r = decide(clonar({ meetsCriteria: { type: 'noul', noul: 0.44 } }))
  assert.equal(r.decision, 'review')
  assert.ok(r.reasons.some((m) => m.includes('no lo tiene claro')))
})

test('una noul baja de verdad sí bloquea', () => {
  const r = decide(clonar({ meetsCriteria: { type: 'noul', noul: 0.12 } }))
  assert.equal(r.decision, 'block')
})

test('un reject con confianza baja no bloquea: degrada a revisión', () => {
  // Sin calibración esta distinción no existe, y acabas bloqueando PRs
  // buenos porque el modelo sonaba seguro mientras se lo inventaba.
  const r = decide(
    clonar({
      verdict: { type: 'choice', choice: 'reject', confidence: 0.28, probabilities: { approve: 0.3, revise: 0.34, reject: 0.36 } },
    })
  )
  assert.equal(r.decision, 'review')
})

test('el riesgo alto degrada a revisión sin llegar a bloquear', () => {
  const r = decide(clonar({ risk: { ...LIMPIA.risk, score: 3.4 } }))
  assert.equal(r.decision, 'review')
})

test('los umbrales se pueden endurecer sin tocar el código del gate', () => {
  const estricto = { ...DEFAULT_THRESHOLDS, minVerdictConfidence: 0.99 }
  assert.equal(decide(LIMPIA, estricto).decision, 'review')
  assert.equal(decide(LIMPIA).decision, 'pass')
})
