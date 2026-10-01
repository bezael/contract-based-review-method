# Spec: The verdict reads git diffs and shows failure output when color is forced on

> Task contract. It is signed before delegating and it is what the verdict is
> issued against. If something is not written here, it is not part of the task.

**Issue:** — · found while reviewing `scripts/verdict.mjs` after `verdict-ansi-output`, 2026-09-28
**Date:** 2026-09-28
**Status:** signed — bezael, 2026-09-28 ("aplicalo")

## What we want

`pnpm verdict` gives the same answer whether or not the tools it reads are
printing color. `verdict-ansi-output` fixed the Vitest `Tests N passed` check.
Two readers of colored text remain:

- `findModifiedAssertions` parses `git diff` text with `startsWith('--- a/')`
  and `startsWith('-')`. When git has `color.ui=always` or `color.diff=always`,
  every line arrives prefixed with an escape code (`\x1b[1m--- a/…`,
  `\x1b[31m-  expect(…`), neither prefix matches, and the verdict prints
  `UNCHANGED` for a test whose assertions did change. A silent false negative
  on an AGENTS.md boundary.
- The excerpt printed under a FAIL criterion (the last 12 lines of its output)
  is taken before ANSI codes are stripped. In a terminal it renders in color;
  captured by an agent, by CI or redirected to a file it is escape-code noise.

After the fix, the two `git diff` calls that are parsed ask git for no color,
and the FAIL excerpt is built from the ANSI-stripped output that the Vitest
check already uses.

## What is out of scope

- The git configuration of any machine, and the `.gitattributes` of the repo.
- `git diff --name-only` and `git ls-files`: git does not color them, they are
  left as they are.
- How many lines the excerpt keeps, the verdict's own output format, and the
  `--write` markdown.
- The Vitest `Tests N passed` check, already fixed in `verdict-ansi-output`.
- `scripts/lib/spec.mjs` and `.claude/hooks/guard-boundaries.mjs`.

## Acceptance criteria

One row per criterion. The command in the third column is what `pnpm verdict`
runs: if a criterion has no command, it is verified by hand and the verdict
marks it MANUAL.

Criterion 1 builds a throwaway git repository with a changed `expect(` and
runs the verdict inside it with `color.ui=always` set through `GIT_CONFIG_*`,
so no real config is touched. Criterion 2 runs the verdict against a fixture
whose only criterion fails printing an ANSI-colored line. Checked on
`fix/verdict-git-color` before the change, 2026-09-28: both fail today
(`UNCHANGED` in the first, escape codes in the excerpt of the second).
Criterion 3 reruns the `verdict-ansi-output` fixture; its scope does not list
this spec's files, so the inner verdict exits 1 for `OUT_OF_SCOPE` on this
branch and the check reads the criterion line (`1  PASS`) instead of the exit.

| # | Criterion | How it is verified |
|---|---|---|
| 1 | With git color forced on, a changed `expect(` in an existing test is reported as MODIFIED | `node specs/verdict-git-color/fixtures/modified-assertion.mjs` |
| 2 | The excerpt of a FAIL criterion keeps the text and drops the ANSI codes | `node -e "const {spawnSync}=require('node:child_process');const r=spawnSync('node scripts/verdict.mjs specs/verdict-git-color/fixtures/colored-fail/spec.md',{shell:true,encoding:'utf8'});const o=r.stdout+r.stderr;process.stdout.write(o);if(r.status!==1)throw new Error('expected exit 1, got '+r.status);if(!o.includes('red'))throw new Error('the excerpt lost the real text');if(o.includes('\x1b'))throw new Error('the excerpt still contains ANSI codes')"` |
| 3 | The `verdict-ansi-output` Vitest criterion is still PASS with color forced on | `node -e "const {spawnSync}=require('node:child_process');const e={...process.env,FORCE_COLOR:'1'};delete e.NO_COLOR;delete e.CLAUDECODE;delete e.AI_AGENT;const r=spawnSync('node scripts/verdict.mjs specs/verdict-ansi-output/fixtures/test-passes/spec.md',{shell:true,encoding:'utf8',env:e});const o=r.stdout+r.stderr;process.stdout.write(o);if(!/^\s+1\s+PASS\b/m.test(o))throw new Error('the Vitest criterion of the fixture is no longer PASS')"` |
| 4 | The existing suite stays green without touching its assertions | `pnpm test` |
| 5 | Types and lint with no new exceptions | `pnpm typecheck && pnpm lint` |
| 6 | A person with `color.ui=always` in their global git config runs `pnpm verdict` on a branch that changes an `expect(` and sees MODIFIED | MANUAL — needs a machine with that config |

## Modification scope

One path per bullet, in backticks. Anything outside this list makes the verdict
fail, and the hook blocks it if it is also an AGENTS.md boundary.

- `scripts/verdict.mjs` — **AGENTS.md boundary** ("whoever receives the verdict does not edit whoever issues it"). The only changes allowed: add `--no-color` to the two parsed `git diff` commands in `findModifiedAssertions`, and build the FAIL excerpt from the ANSI-stripped output. Whoever signs this spec authorizes those changes, and a person reviews the diff line by line.
- `specs/verdict-git-color/fixtures/modified-assertion.mjs` — fixture, written together with this contract.
- `specs/verdict-git-color/fixtures/colored-fail/spec.md` — fixture, written together with this contract.

## Risks

- **The excerpt fix eats real text.** `stripVTControlCharacters` removes more than SGR color (cursor moves, OSC links). Criterion 2 checks the text survives; the diff review is the control for anything else.
- **`--no-color` on an old git.** The flag exists since git 1.7; any machine running this repo has it.
- **The fixtures depend on this branch's diff.** The `colored-fail` fixture lists `scripts/verdict.mjs` and `specs/verdict-git-color/` as scope. If the branch touches another file, the inner verdict reports `OUT_OF_SCOPE`; criterion 2 still passes (it only checks exit 1, `red` and no escape codes), so that case is caught by this spec's own scope check, not by the fixture.
- **Criterion 1 needs a writable temp dir and git on PATH.** Both are true wherever the harness runs. The temp repository is removed in a `finally`.

## Verdict

> Generated by `pnpm verdict --write` on 2026-09-28 16:36 UTC · branch `fix/verdict-git-color` · base `main`

| # | Criterion | Status | Evidence |
|---|---|---|---|
| 1 | With git color forced on, a changed `expect(` in an existing test is reported as MODIFIED | PASS | `node specs/verdict-git-color/fixtures/modified-assertion.mjs` → exit 0 (1.0s) |
| 2 | The excerpt of a FAIL criterion keeps the text and drops the ANSI codes | PASS | `node -e "const {spawnSync}=require('node:child_process');const r=spawnSync('node scripts/verdict.mjs specs/verdict-git-color/fixtures/colored-fail/spec.md',{shell:true,encoding:'utf8'});const o=r.stdout+r.stderr;process.stdout.write(o);if(r.status!==1)throw new Error('expected exit 1, got '+r.status);if(!o.includes('red'))throw new Error('the excerpt lost the real text');if(o.includes('\x1b'))throw new Error('the excerpt still contains ANSI codes')"` → exit 0 (0.4s) |
| 3 | The `verdict-ansi-output` Vitest criterion is still PASS with color forced on | PASS | `node -e "const {spawnSync}=require('node:child_process');const e={...process.env,FORCE_COLOR:'1'};delete e.NO_COLOR;delete e.CLAUDECODE;delete e.AI_AGENT;const r=spawnSync('node scripts/verdict.mjs specs/verdict-ansi-output/fixtures/test-passes/spec.md',{shell:true,encoding:'utf8',env:e});const o=r.stdout+r.stderr;process.stdout.write(o);if(!/^\s+1\s+PASS\b/m.test(o))throw new Error('the Vitest criterion of the fixture is no longer PASS')"` → exit 0 (1.7s) |
| 4 | The existing suite stays green without touching its assertions | PASS | `pnpm test` → exit 0 (2.1s) |
| 5 | Types and lint with no new exceptions | PASS | `pnpm typecheck && pnpm lint` → exit 0 (4.1s) |
| 6 | A person with `color.ui=always` in their global git config runs `pnpm verdict` on a branch that changes an `expect(` and sees MODIFIED | MANUAL | manual review |

**Scope:** all changes are in scope
**Existing assertions:** unchanged
**Result:** PASS