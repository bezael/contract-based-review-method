# Spec: CI runs its actions on the node24 runtime

> Task contract. It is signed before delegating and it is what the verdict is
> issued against. If something is not written here, it is not part of the task.

**Issue:** — · raised from a CI run log, not from a tracked Issue
**Date:** 2026-09-12
**Status:** signed

## What we want

Nothing changes for whoever uses the API. The three actions in `ci.yml` still
declare `using: node20` in their own `action.yml`, so every run prints
"Node 20 is being deprecated. This workflow is running with Node 24 by default"
plus two `DeprecationWarning`s from the `@actions/*` toolkit they bundle.
Pinning them to majors that already run on node24 removes the warnings and
takes the workflow off a runtime the runner is force-upgrading anyway.

`pnpm/action-setup` goes to v6 rather than v5 because v6 is the release that
added support for pnpm v11, and `package.json` pins `pnpm@11.1.3`.

## What is out of scope

- The Node version the project's own scripts run under (`node-version: 24`) — already correct.
- The `cache: pnpm` setting and the step order. `setup-node@v5` caches automatically when `packageManager` is present, but the explicit setting keeps the current behaviour and is left alone.
- `actions/checkout@v7`, the current latest. v7 blocks fork-PR checkout for `pull_request_target`/`workflow_run`; this workflow triggers on `pull_request` and `push`, so v7 adds risk surface and no benefit. v5 is the minimum that is on node24.
- Every other file in the repo. This task changes CI pinning only.

## Acceptance criteria

One row per criterion. The command in the third column is what `pnpm verdict`
runs: if a criterion has no command, it is verified by hand and the verdict
marks it MANUAL.

| # | Criterion | How it is verified |
|---|---|---|
| 1 | The three actions are pinned to majors that run on node24 | `grep -q 'actions/checkout@v5' .github/workflows/ci.yml && grep -q 'pnpm/action-setup@v6' .github/workflows/ci.yml && grep -q 'actions/setup-node@v5' .github/workflows/ci.yml` |
| 2 | No `@v4` pin is left behind in the workflow | `node -e "const s=require('node:fs').readFileSync('.github/workflows/ci.yml','utf8'); if (s.includes('@v4')) throw new Error('a @v4 pin is still there')"` |
| 3 | The workflow is still valid YAML and keeps its nine steps | `node -e "const s=require('node:fs').readFileSync('.github/workflows/ci.yml','utf8').match(/^      - name:/gm); if (!s) throw new Error('no steps found'); if (s.length !== 9) throw new Error('expected 9 steps, found '+s.length)"` |
| 4 | The existing suite stays green without touching its assertions | `pnpm test` |
| 5 | Types and lint with no new exceptions | `pnpm typecheck && pnpm lint` |
| 6 | A real run on the PR prints no node20 deprecation notice and no `DEP0040`/`DEP0169` warnings | MANUAL — read the Actions log of the first run on this branch |

## Modification scope

One path per bullet, in backticks. Anything outside this list makes the verdict
fail, and the hook blocks it if it is also an AGENTS.md boundary.

- `.github/workflows/ci.yml`

## Risks

- A major bump changes behaviour beyond the runtime. Mitigated by reading each major's breaking changes first: `checkout@v5` and `setup-node@v5` are runtime-only for this workflow, `action-setup@v6` adds pnpm 11 support. Criteria 3, 4 and 5 catch a workflow that no longer parses or a toolchain that no longer installs; criterion 6 is the only one that proves the warning is actually gone, and it cannot run locally.
- `setup-node@v5` starts caching automatically when `packageManager` exists. `cache: pnpm` stays explicit, so the behaviour is unchanged, but a future removal of that line would no longer mean "no cache".

## Verdict

> Filled in by `pnpm verdict --write` when the task is finished.
