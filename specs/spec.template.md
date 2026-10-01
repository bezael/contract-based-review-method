# Spec: {{TITLE}}

> Task contract. It is signed before delegating and it is what the verdict is
> issued against. If something is not written here, it is not part of the task.

**Issue:** {{#N}} · {{link or path}}
**Date:** {{YYYY-MM-DD}}
**Status:** draft | signed | done

## What we want

{{Two or three lines. What changes for whoever uses the API, not how it is built.}}

## What is out of scope

- {{Everything nearby that this task does NOT touch. This section prevents more rework than the previous one.}}

## Acceptance criteria

One row per criterion. The command in the third column is what `pnpm verdict`
runs: if a criterion has no command, it is verified by hand and the verdict
marks it MANUAL.

| # | Criterion | How it is verified |
|---|---|---|
| 1 | {{Observable behaviour, with concrete data}} | `pnpm vitest run path/to/file.test.ts -t "test name"` |
| 2 | The existing suite stays green without touching its assertions | `pnpm test` |
| 3 | Types and lint with no new exceptions | `pnpm typecheck && pnpm lint` |

## Modification scope

One path per bullet, in backticks. Anything outside this list makes the verdict
fail, and the hook blocks it if it is also an AGENTS.md boundary.

- `src/{{...}}`
- `src/{{...}}.test.ts`

## Risks

- {{What could break and which criterion catches it.}}

## Verdict

> Filled in by `pnpm verdict --write` when the task is finished.
