/**
 * Nivel 4 del harness: el veredicto sobre el contrato.
 *
 * Los niveles 1-3 (build, tipos, tests, lint, CI) ya te dicen si el código
 * funciona. Ninguno te dice si el agente hizo lo que el contrato pedía y nada
 * más. Eso es lo que decide este módulo.
 *
 * La regla del método: el modelo opina, tu código decide. Jev devuelve
 * probabilidades calibradas; el umbral y la política los pones tú, aquí,
 * donde se pueden leer en una review y versionar en git.
 */

import { TypeSafeClient, choice, noul, score } from '@typesafe-ai/sdk'

export type GateInput = {
  /** El contrato: qué se puede tocar y qué criterios de aceptación hay. */
  contract: string
  /** El diff del agente, recortado. El estado sucio le baja la puntería. */
  diff: string
}

/**
 * La forma REAL de la respuesta, comprobada contra `jev-1.13.0` el 2026-09-20.
 * Ojo: una `noul` no devuelve un número pelado, devuelve un objeto con el
 * número dentro. Una `score` trae además `legend` y la distribución completa.
 * Evidencia cruda en `fixtures/respuesta-real.json`.
 */
export type NoulAnswer = { type: 'noul'; noul: number }
export type ChoiceAnswer = {
  type: 'choice'
  choice: string
  confidence: number
  probabilities: Record<string, number>
}
export type ScoreAnswer = {
  type: 'score'
  score: number
  confidence: number
  legend: Record<string, string>
  probabilities: Record<string, number>
}

export type GateAnswers = {
  staysInLane: NoulAnswer
  meetsCriteria: NoulAnswer
  breaksPublicApi: NoulAnswer
  verdict: ChoiceAnswer
  risk: ScoreAnswer
}

export type GateDecision = {
  decision: 'pass' | 'review' | 'block'
  reasons: string[]
  answers: GateAnswers
}

export type Thresholds = {
  /** Por debajo de esto, el veredicto no es fiable y lo mira una persona. */
  minVerdictConfidence: number
  /** Probabilidad mínima de que el cambio respete el carril del contrato. */
  minStaysInLane: number
  /** Probabilidad mínima de que cumpla los criterios de aceptación. */
  minMeetsCriteria: number
  /** Por encima de esto, romper la API pública bloquea. */
  maxBreaksPublicApi: number
  /** Riesgo (0-4) a partir del cual no se mergea sin revisión humana. */
  maxRisk: number
  /**
   * La banda de "no sé" de una `noul`. Una noul no trae `confidence` aparte:
   * el propio número es la creencia, así que su distancia a 0,5 ES la
   * confianza. Dentro de esta banda el modelo no está diciendo "no", está
   * diciendo que no lo tiene claro — y sobre eso no se bloquea un PR.
   */
  uncertainLow: number
  uncertainHigh: number
}

export const DEFAULT_THRESHOLDS: Thresholds = {
  minVerdictConfidence: 0.7,
  minStaysInLane: 0.8,
  minMeetsCriteria: 0.8,
  maxBreaksPublicApi: 0.2,
  maxRisk: 2,
  uncertainLow: 0.35,
  uncertainHigh: 0.65,
}

/**
 * Las preguntas van en inglés: es el idioma principal de entrenamiento del
 * modelo. El contrato y el diff pueden ir en castellano sin problema.
 *
 * Todas viajan en la misma request (fan-out). Jev las evalúa en paralelo
 * contra el mismo `state`, así que añadir preguntas casi no cuesta latencia.
 */
export function buildQuestions() {
  return {
    staysInLane: noul(
      'Does `diff` only touch the files and modules allowed by `contract`?'
    ),
    meetsCriteria: noul(
      'Does `diff` satisfy every acceptance criterion listed in `contract`?'
    ),
    breaksPublicApi: noul(
      'Does `diff` change a public API signature in a backward-incompatible way?'
    ),
    verdict: choice('What is the review verdict for `diff` against `contract`?', {
      approve: 'The change implements the contract and nothing else',
      revise: 'The change is close but violates part of the contract',
      reject: 'The change does something the contract does not describe',
    }),
    risk: score('How risky is merging `diff` without human review?', [
      'None',
      'Low',
      'Medium',
      'High',
      'Critical',
    ]),
  }
}

/**
 * La política. Vive en tu código, no en el prompt.
 *
 * Que esté aquí y no dentro del modelo es lo que te permite cambiar un umbral
 * en un PR, discutirlo en una review y saber por qué se bloqueó algo hace
 * tres meses.
 */
export function decide(
  answers: GateAnswers,
  thresholds: Thresholds = DEFAULT_THRESHOLDS
): GateDecision {
  const reasons: string[] = []
  let decision: GateDecision['decision'] = 'pass'

  const orden = { pass: 0, review: 1, block: 2 } as const
  const escalate = (next: GateDecision['decision']) => {
    if (orden[next] > orden[decision]) decision = next
  }

  /**
   * Una `noul` que debería salir alta (staysInLane, meetsCriteria).
   * Tres tramos, no dos: sí, no sé, y no. El tramo del medio es el que evita
   * que el gate bloquee cambios buenos, que es como se mata un harness.
   */
  const exigirAlta = (valor: number, minimo: number, etiqueta: string) => {
    if (valor >= minimo) return
    if (valor >= thresholds.uncertainLow) {
      reasons.push(`${etiqueta}: ${valor.toFixed(2)} — el modelo no lo tiene claro, lo mira una persona`)
      escalate('review')
      return
    }
    reasons.push(`${etiqueta}: ${valor.toFixed(2)} < ${minimo}`)
    escalate('block')
  }

  /** Una `noul` que debería salir baja (breaksPublicApi). */
  const exigirBaja = (valor: number, maximo: number, etiqueta: string) => {
    if (valor <= maximo) return
    if (valor <= thresholds.uncertainHigh) {
      reasons.push(`${etiqueta}: ${valor.toFixed(2)} — el modelo no lo tiene claro, lo mira una persona`)
      escalate('review')
      return
    }
    reasons.push(`${etiqueta}: ${valor.toFixed(2)} > ${maximo}`)
    escalate('block')
  }

  // El veredicto solo bloquea si el modelo está seguro. Esto es exactamente
  // lo que compra la calibración: sin una probabilidad que signifique algo,
  // esta línea no se puede escribir.
  const veredictoFiable = answers.verdict.confidence >= thresholds.minVerdictConfidence

  if (answers.verdict.choice === 'reject') {
    reasons.push('Veredicto: reject — el cambio hace algo que el contrato no describe')
    escalate(veredictoFiable ? 'block' : 'review')
  }
  if (answers.verdict.choice === 'revise') {
    reasons.push('Veredicto: revise — el cambio incumple parte del contrato')
    escalate('review')
  }

  exigirAlta(answers.staysInLane.noul, thresholds.minStaysInLane, 'Se sale del carril')
  exigirAlta(answers.meetsCriteria.noul, thresholds.minMeetsCriteria, 'No cumple los criterios de aceptación')
  exigirBaja(answers.breaksPublicApi.noul, thresholds.maxBreaksPublicApi, 'Rompe la API pública')

  if (answers.risk.score > thresholds.maxRisk) {
    reasons.push(`Riesgo ${answers.risk.score.toFixed(2)} por encima del máximo ${thresholds.maxRisk}`)
    escalate('review')
  }

  if (!veredictoFiable) {
    reasons.push(
      `Confianza ${answers.verdict.confidence.toFixed(2)} por debajo de ${thresholds.minVerdictConfidence}: decide una persona`
    )
    escalate('review')
  }

  if (reasons.length === 0) reasons.push('Dentro del contrato y por encima de todos los umbrales')
  return { decision, reasons, answers }
}

/** Una request, cinco decisiones. */
export async function askJev(input: GateInput, client?: TypeSafeClient): Promise<GateAnswers> {
  const jev = client ?? new TypeSafeClient()
  const { answers } = await jev.systemOne({
    model: 'jev-latest',
    state: { contract: input.contract, diff: input.diff },
    questions: buildQuestions(),
  })
  return answers as unknown as GateAnswers
}

export async function contractGate(
  input: GateInput,
  thresholds: Thresholds = DEFAULT_THRESHOLDS,
  client?: TypeSafeClient
): Promise<GateDecision> {
  return decide(await askJev(input, client), thresholds)
}
