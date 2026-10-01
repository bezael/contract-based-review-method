# Contract Gate con Jev — nivel 4 del harness

El veredicto sobre el contrato: lo que ningún test puede comprobar.

Los niveles 1-3 del harness (build, tipos, tests, lint, CI) te dicen si el
código funciona. Ninguno te dice si el agente hizo **lo que el contrato pedía y
nada más**. Eso lo decide este módulo.

## Por qué Jev y no un LLM de juez

Un juez LLM devuelve `"verdict": "approve", "confidence": "high"`. Sobre un
adjetivo no se escribe un `if`. Jev devuelve una probabilidad calibrada, y
sobre eso sí.

Medido el 2026-09-20 contra `jev-1.13.0`: **~700 ms** por veredicto completo
(cinco preguntas en una sola request), 831 tokens de entrada. Un juez LLM tarda
segundos y cobra la salida cinco veces más cara que la entrada.

## Arranque

```bash
npm install
npm test          # 12 tests, sin red
npm run typecheck

export TYPESAFE_API_KEY=...        # o ponla en .env.local
node src/cli.ts fixtures/contract.md fixtures/diff-fuera-de-carril.diff
node src/cli.ts fixtures/contract.md fixtures/diff-en-carril.diff
```

Sin key: añade `--mock` y verás el formato con una respuesta real grabada.

## Los tres resultados

| Código | Resultado | Qué significa |
|---|---|---|
| `0` | PASA | Dentro del contrato y por encima de todos los umbrales |
| `1` | REVISIÓN HUMANA | El modelo no lo tiene claro. No es un "no" |
| `2` | BLOQUEADO | El modelo está seguro de que esto no entra |

Los dos fixtures dan resultados distintos contra la API real:

- `diff-fuera-de-carril.diff` → **BLOQUEADO**. Toca `schema.sql` y `package.json`,
  que el contrato prohíbe, y cambia la firma de `login()`. `carril 0.01`,
  `rompe API 0.97`, veredicto `reject` con confianza 0.94.
- `diff-en-carril.diff` → **REVISIÓN HUMANA**. Respeta el carril (`0.97`) y no
  toca la API pública (`0.09`), pero el modelo no está seguro de que cumpla
  todos los criterios: `0.59`, confianza `0.35`.

Ese segundo caso es el importante. Un gate que bloquea cambios buenos se
desactiva en dos semanas.

## La decisión de diseño que hay que entender

**Una `noul` no trae `confidence` aparte: el propio número es la creencia.** Su
distancia a 0,5 es la confianza. Por eso la política tiene **tres tramos**, no
dos:

```
0.00 ─────── 0.35 ─────────── 0.65 ─────── 1.00
   "no"        "no lo sé"        "sí"
  bloquea       revisión        adelante
```

Un `0.44` no es un "no". Es el modelo encogiéndose de hombros. Bloquear ahí es
el falso positivo que mata el harness.

Y el veredicto solo bloquea **si el modelo está seguro**: por debajo de
`minVerdictConfidence` degrada a revisión humana. Sin calibración esa línea no
se puede escribir, y es toda la diferencia entre un gate y un adorno.

## La regla del método

> El modelo opina. Tu código decide.

Los umbrales viven en `DEFAULT_THRESHOLDS`, en tu repo, versionados. Se
cambian en un PR, se discuten en una review y dentro de tres meses puedes
saber por qué se bloqueó algo. Un prompt no te da nada de eso.

## Ponerlo en CI

`.github/workflows/contract-gate.yml` lo ejecuta en cada PR, comenta el
veredicto y aplica la política. Dos detalles que importan:

1. **Corre después de los niveles 1-3.** Con el CI en rojo, este gate no aporta.
2. **Recorta el diff.** Nada de lockfiles ni de `dist/`: el estado sucio le baja
   la puntería al modelo.

## Archivos

| Archivo | Qué es |
|---|---|
| `src/contract-gate.ts` | Las cinco preguntas y la política |
| `src/cli.ts` | El gate como comando, con códigos de salida |
| `src/contract-gate.test.ts` | 12 tests de la política, sin red |
| `fixtures/contract.md` | Un contrato de ejemplo |
| `fixtures/diff-*.diff` | Un diff que lo viola y otro que lo respeta |
| `fixtures/respuesta-real.json` | Respuesta literal de `jev-1.13.0`. Evidencia de la forma real de la API |

## Límites

- Jev **no te dice por qué**. No genera texto. Si el gate sale rojo, el contexto
  lo pones tú: qué pregunta falló, con qué probabilidad y qué dice el contrato.
- Puede devolver un valor válido y equivocado. El umbral es tu red, no una
  garantía.
- Está en early access con waitlist. Sin key, `--mock`.
