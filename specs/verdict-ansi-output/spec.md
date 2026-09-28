# Spec: The verdict reads Vitest results even when the output is colored

> Task contract. It is signed before delegating and it is what the verdict is
> issued against. If something is not written here, it is not part of the task.

**Issue:** — · found while closing `invoice-discount` (TASK-91), 2026-09-28
**Date:** 2026-09-28
**Status:** signed — bezael, 2026-09-28 ("haz la opción 2")

## What we want

`pnpm verdict` reports a Vitest criterion as PASS when its test passes, in any
terminal. Today it only works inside an AI agent.

- `scripts/verdict.mjs` marks a Vitest criterion as FAIL ("the -t filter matched
  no test name") whenever its output does not match `/Tests\s+\d+\s+passed/`.
- On Windows, Vitest 4.1 prints ANSI color even when its output is piped:
  `Tests \x1b[22m \x1b[1m\x1b[32m1 passed`. The regex does not match, so a
  passing test is reported as FAIL.
- Vitest turns color off only when it detects an agent (`CLAUDECODE`,
  `AI_AGENT`) or when `NO_COLOR` is set. So the verdict passes inside Claude
  Code and fails in a person's Git Bash.
- `CI=true` also turns color on. Any CI job that runs the verdict would fail
  the same way.

After the fix, the verdict removes ANSI codes before it checks the output, and
the check that catches a `-t` filter matching no test still works.

## What is out of scope

- The Vitest configuration, and the spec commands of any contract. The fix is
  in the reader, not in what it reads: no `--no-color` in commands, no
  `NO_COLOR` in `package.json` scripts.
- Running the verdict in CI (`.github/workflows/ci.yml`). This fix makes it
  possible, but adding the job is another task.
- Other ways the verdict reads output: how many lines it keeps, its own output
  format, and the `--write` markdown.
- Showing the real Vitest output instead of the generic "matched no test name"
  message. It would have made this bug easier to find, but it is a different
  change.
- `scripts/lib/spec.mjs` and `.claude/hooks/guard-boundaries.mjs`.
- Updating AGENTS.md "Known reds" or adding a note about `NO_COLOR=1`.

## Acceptance criteria

One row per criterion. The command in the third column is what `pnpm verdict`
runs: if a criterion has no command, it is verified by hand and the verdict
marks it MANUAL.

Criteria 1 and 2 run the verdict against the fixture specs with color forced
on and without the agent variables, so they reproduce a person's terminal from
any environment, including an agent's. Checked on `main` on 2026-09-28:
criterion 1 fails today (`FAIL … matched no test name`); criteria 2 and 3 pass
today and must keep passing.

| # | Criterion | How it is verified |
|---|---|---|
| 1 | With color forced on and no agent variables, a Vitest criterion whose test passes is reported as PASS | `node -e "const {spawnSync}=require('node:child_process');const e={...process.env,FORCE_COLOR:'1'};delete e.NO_COLOR;delete e.CLAUDECODE;delete e.AI_AGENT;const r=spawnSync('node scripts/verdict.mjs specs/verdict-ansi-output/fixtures/test-passes/spec.md',{shell:true,encoding:'utf8',env:e});process.stdout.write(r.stdout+r.stderr);process.exit(r.status)"` |
| 2 | With color forced on, a `-t` filter that matches no test is still reported as FAIL with "matched no test name" | `node -e "const {spawnSync}=require('node:child_process');const e={...process.env,FORCE_COLOR:'1'};delete e.NO_COLOR;delete e.CLAUDECODE;delete e.AI_AGENT;const r=spawnSync('node scripts/verdict.mjs specs/verdict-ansi-output/fixtures/test-name-missing/spec.md',{shell:true,encoding:'utf8',env:e});const o=r.stdout+r.stderr;if(r.status!==1)throw new Error('expected exit 1, got '+r.status);if(!o.includes('matched no test name'))throw new Error('the no-match guard did not fire')"` |
| 3 | Without color, the passing fixture is still PASS | `node -e "const {spawnSync}=require('node:child_process');const e={...process.env,NO_COLOR:'1'};delete e.FORCE_COLOR;const r=spawnSync('node scripts/verdict.mjs specs/verdict-ansi-output/fixtures/test-passes/spec.md',{shell:true,encoding:'utf8',env:e});process.stdout.write(r.stdout+r.stderr);process.exit(r.status)"` |
| 4 | The existing suite stays green without touching its assertions | `pnpm test` |
| 5 | Types and lint with no new exceptions | `pnpm typecheck && pnpm lint` |
| 6 | A person runs `pnpm verdict specs/invoice-discount/spec.md` in their own Git Bash on the `invoice-discount` branch with this fix merged, without `NO_COLOR`, and gets 9/9 PASS | MANUAL — the terminal where the bug was found |

## Modification scope

One path per bullet, in backticks. Anything outside this list makes the verdict
fail, and the hook blocks it if it is also an AGENTS.md boundary.

- `scripts/verdict.mjs` — **AGENTS.md boundary** ("whoever receives the verdict does not edit whoever issues it"). The only change allowed: strip ANSI escape codes from the combined output before the `Tests N passed` check. Whoever signs this spec authorizes that change, and a person reviews the diff line by line.
- `specs/verdict-ansi-output/fixtures/test-passes/spec.md` — fixture, written together with this contract.
- `specs/verdict-ansi-output/fixtures/test-name-missing/spec.md` — fixture, written together with this contract.

## Risks

- **The fix hides a real no-match.** If the check is loosened instead of made to ignore color, for example by dropping the regex or accepting any exit 0, a `-t` that matches nothing would pass again. Criterion 2 catches it.
- **A regex that is too broad eats real text.** Removing more than SGR color codes (`\x1b[…m`) could change the output the verdict shows or writes. The scope allows only ANSI stripping for the check; the review of the diff is the control. No command checks the displayed output: harness gap.
- **The fixtures depend on this branch's diff.** Their scope lists `scripts/verdict.mjs` and `specs/verdict-ansi-output/`. If the branch touches another file, the inner verdict reports `OUT_OF_SCOPE` and criteria 1 and 3 fail for a reason unrelated to color. That is visible in the output: it says `OUT_OF_SCOPE`, not `matched no test name`.
- **The no-match check fires on any command that contains "vitest".** `verdict.mjs` applies it when `/vitest/` appears anywhere in the command, not only when the command runs Vitest. Fixtures first named `vitest-pass/` made criteria 2 and 3 fail for that reason alone, which is why they are named `test-passes/` and `test-name-missing/`. This fix does not change that rule; it is recorded so the next contract that wraps the verdict does not fall into it.
- **Future agent detection in Vitest.** If a future Vitest version detects agents through another variable, the environment of criteria 1 and 2 would no longer turn color on inside an agent, and criterion 1 would pass without testing anything. Mitigation: before implementing, check that criterion 1 fails on `main`. As of 2026-09-28, with Vitest 4.1.11, it does.
- **Everything already signed.** The `invoice-discount` verdict written into its `spec.md` was generated without color (inside Claude Code), so its PASS is real. This fix does not change that result. Criterion 6 confirms it from a person's terminal.

## Verdict

> Filled in by `pnpm verdict --write` when the task is finished.
