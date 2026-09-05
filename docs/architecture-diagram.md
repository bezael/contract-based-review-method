# Diagrama de arquitectura · del Issue a la PR verificada

El ciclo completo, con las tres capas del sistema: contrato, carril y
veredicto. Cada caja nombra el artefacto o el comando real de este repo.

```mermaid
flowchart TB
    subgraph CONTRATO["CONTRATO · qué hay que construir"]
        I[GitHub Issue<br/>docs/issues · .github/ISSUE_TEMPLATE]
        S[Spec firmada<br/>specs/slug/spec.md<br/>criterios con comando · alcance]
        A[AGENTS.md<br/>contrato permanente<br/>stack · verificación · convenciones · límites]
        I -->|skill contrato · Módulo 2| S
        A -.->|lo lee el agente| S
    end

    subgraph CARRIL["CARRIL · por dónde no puede salirse"]
        H1[Declarado<br/>AGENTS.md § Límites]
        H2[Impedido<br/>.claude/hooks/guard-boundaries.mjs<br/>bloquea escrituras fuera del alcance]
        H3[Detectado<br/>CI en cada PR · protección de rama<br/>pnpm verdict:scope · asserts intactos]
        H1 --> H2 --> H3
    end

    subgraph EJECUCION["IMPLEMENTACIÓN · Módulo 4"]
        P[Plan<br/>prompts/planning.md<br/>pasos con comando al final]
        C[Código + tests<br/>dentro del alcance<br/>bucle corto tras cada cambio]
        P --> C
    end

    subgraph VEREDICTO["VEREDICTO · cómo sabemos que está bien"]
        BC[Bucle corto · < 60 s<br/>pnpm typecheck · lint · test:unit]
        BL[Bucle largo<br/>pnpm build · test · smoke]
        V[pnpm verdict spec.md<br/>criterio a criterio · alcance · asserts<br/>PASA / NO PASA]
        BC --> BL --> V
    end

    subgraph REVISION["REVISIÓN · Módulos 6 y 7"]
        R[Segundo agente<br/>skill revision-codigo<br/>alineación: Exacto / Enredado / Incompleto]
        F[Correcciones<br/>dentro del alcance]
        PR[Pull Request<br/>.github/PULL_REQUEST_TEMPLATE.md<br/>contrato · veredicto · harness · alcance]
        D[Decisión humana<br/>veredicto → contrato → diff apuntando<br/>20 minutos]
        R -->|cambios| F --> V
        R -->|PASA · Exacto| PR --> D
    end

    S --> P
    CARRIL -.->|acota| C
    C --> BC
    V -->|NO PASA: qué cláusula| C
    V -->|PASA| R
    D -->|merge| M[(main)]
    D -->|el contrato estaba mal| S
```

## Los diez pasos, en una línea cada uno

| # | Paso | Artefacto o comando | Módulo |
|---|---|---|---|
| 1 | GitHub Issue | `docs/issues/*.md`, plantillas de issue | 2 |
| 2 | Spec | `specs/<slug>/spec.md` desde `specs/spec.template.md` | 2 |
| 3 | Contexto + Harness | `AGENTS.md`, hook, CI, `harness-init` | 3 |
| 4 | Plan | `prompts/planning.md` | 4 |
| 5 | Implementación | `prompts/scoped-implementation.md`, bucle corto | 4 |
| 6 | Tests + Checks | `pnpm typecheck && pnpm lint && pnpm test` | 5 |
| 7 | Veredicto | `pnpm verdict specs/<slug>/spec.md --write` | 5 |
| 8 | Code Review | skill `revision-codigo` / `prompts/code-review.md` | 6 |
| 9 | Pull Request | skill `revision-pr` / plantilla de PR | 7 |
| 10 | Decisión humana | `docs/workflows/pr-review.md` | 7 |

## Cómo exportarlo

GitHub renderiza el bloque `mermaid` directamente. Para PNG o SVG en alta
resolución (el "mapa visual" del workshop):

```bash
npx -y @mermaid-js/mermaid-cli -i docs/architecture-diagram.md -o docs/architecture-diagram.svg -b transparent
```
