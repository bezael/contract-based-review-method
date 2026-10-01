# Spec: pnpm install stops compiling a better-sqlite3 nobody imports

> Task contract. It is signed before delegating and it is what the verdict is
> issued against. If something is not written here, it is not part of the task.

**Issue:** — · raised from a failed `pnpm install` on Windows, not from a tracked Issue
**Date:** 2026-09-12
**Status:** signed

## What we want

Nothing changes for whoever uses the API. `pnpm install` fails on any machine
without a native toolchain (`gyp ERR! not ok` in `better-sqlite3@13.0.3`), and
it fails before the `postinstall` runs, so the Prisma client is never generated
and the whole harness is unrunnable on a fresh clone.

There are two copies of better-sqlite3 in the tree:

| Version | Where it comes from | Binary in the tarball | Why it needs a compiler |
|---|---|---|---|
| `13.0.3` | direct dependency in `package.json` | N-API prebuilds for win32/linux/darwin | none of its own — it ships no `install` script, so pnpm applies the implicit `node-gyp rebuild` that npm gives to any package with a `binding.gyp` |
| `12.11.1` | required by `@prisma/adapter-better-sqlite3@7.10.0` (`^12.6.0`) | none | its `install` script is `prebuild-install \|\| node-gyp rebuild`, and `prebuild-install` downloads a binary for Node 24 / win32-x64 without compiling |

The copy that broke the install is `13.0.3`, and **nothing imports it**:
`src/lib/db.ts` imports `@prisma/adapter-better-sqlite3`, which resolves its own
`12.11.1`. The direct dependency is dead weight that only exists to be
compiled. Removing it leaves one copy in the tree, whose install script
downloads its binary, so no machine needs MSVC or Xcode to install this repo.

`allowBuilds` in `pnpm-workspace.yaml` is keyed by package name, not by version,
so it cannot allow the download for `12.11.1` while blocking the compile for
`13.0.3`. Dropping the direct dependency is what makes a single `true` correct.

## What is out of scope

- Upgrading `@prisma/adapter-better-sqlite3`, or overriding its `better-sqlite3` range to v13. It declares `^12.6.0`; forcing a major on a dependency we do not own is a bigger change than the bug.
- Every other entry in `allowBuilds`. `prisma`, `@prisma/engines` and `esbuild` download binaries and keep their permission untouched.
- Installing a native toolchain on any machine. The point of the task is that none is needed.
- The stale "Known reds" block in AGENTS.md is corrected because the file is already in scope for the `allowBuilds` note, but no source file is touched to make typecheck pass: it already passes.
- Every other file in the repo.

## Acceptance criteria

One row per criterion. The command in the third column is what `pnpm verdict`
runs: if a criterion has no command, it is verified by hand and the verdict
marks it MANUAL.

Three constraints on what can go in this column, all of them learned by watching
this spec fail for reasons that had nothing to do with the task:

1. **No `|` anywhere in the command.** `acceptanceCriteria()` in
   `scripts/lib/spec.mjs` splits the row on every pipe before looking for the
   backticked command, so a `||` or an escaped `\|` silently turns the row into
   MANUAL. Shell pipelines cannot be expressed here.
2. **No `pnpm ...`.** The verdict spawns each criterion with `shell: true`,
   which is `cmd.exe` on Windows, and pnpm's `.CMD` shim is double-quoted on
   this machine, so every `pnpm` criterion dies with "no se reconoce como un
   comando". The tools are invoked through `node` and their JS entry points
   instead, which is also what makes these rows portable across cmd.exe and sh.
3. **A MANUAL row carries no backticks at all.** The parser takes the first
   backticked span in the cell as the command, so a row that explains by hand
   what to type gets that sample executed. Criterion 8 said MANUAL and still
   ran, deleted `node_modules` and failed.

| # | Criterion | How it is verified |
|---|---|---|
| 1 | better-sqlite3 is not a direct dependency of the project any more | `node -e "const p=require('./package.json'); if (p.dependencies['better-sqlite3']) throw new Error('better-sqlite3 is still in dependencies'); if (p.devDependencies['@types/better-sqlite3']) throw new Error('@types/better-sqlite3 is still in devDependencies')"` |
| 2 | Exactly one copy of better-sqlite3 is left in the tree, the adapter's v12 | `node -e "const d=require('node:fs').readdirSync('node_modules/.pnpm').filter(n=>n.startsWith('better-sqlite3@')); if (d.length!==1) throw new Error('expected exactly 1 copy, found '+d.length); if (!d[0].startsWith('better-sqlite3@12.')) throw new Error('expected v12, found '+d[0])"` |
| 3 | The resolved better-sqlite3 has a binary that loads, obtained without a compiler | `node -e "const fs=require('node:fs'),p='node_modules/.pnpm/'+fs.readdirSync('node_modules/.pnpm').find(n=>n.startsWith('better-sqlite3@'))+'/node_modules/better-sqlite3/build/Release/better_sqlite3.node'; const o={exports:{}}; process.dlopen(o,require('node:path').resolve(p)); if (!o.exports.Database) throw new Error('binary loaded but exports no Database')"` |
| 4 | The existing suite stays green without touching its assertions | `node node_modules/vitest/vitest.mjs run` |
| 5 | Types with no new exceptions | `node node_modules/typescript/bin/tsc --noEmit` |
| 6 | Lint with no new exceptions | `node node_modules/eslint/bin/eslint.js .` |
| 7 | The app still boots and serves `/health` | `node node_modules/tsx/dist/cli.mjs scripts/smoke.ts` |
| 8 | A clean install from the lockfile compiles nothing and runs the postinstall to the end | MANUAL — delete node_modules, run pnpm install --frozen-lockfile, and confirm three things: exit 0, no "gyp ERR" anywhere in the output, and a "Generated Prisma Client" line. Not automated: it deletes the dependencies it is checking, and it cannot call pnpm for the reason above. Note the cell holds no backticks on purpose, or the parser would pick the first span out of the prose and run it. |

## Modification scope

One path per bullet, in backticks. Anything outside this list makes the verdict
fail, and the hook blocks it if it is also an AGENTS.md boundary.

- `package.json`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- `AGENTS.md`

## Risks

- Removing `@types/better-sqlite3` breaks typecheck if the adapter's own `.d.ts` re-exports types from `better-sqlite3`. Criterion 5 catches it; if it fires, the devDependency goes back and only the runtime dependency is removed. It did not fire: nothing in `src/` imports better-sqlite3, and the adapter ships its own types.
- `prebuild-install` downloads from GitHub releases, so a clean install now needs network access to a host that `pnpm install` alone did not need. An air-gapped or GitHub-blocked machine trades a compiler error for a download error. Criterion 8 proves the happy path only.
- `pnpm-lock.yaml` is regenerated by this task. That is the one thing AGENTS.md says never happens "along the way" — here it is the deliverable, not a side effect, and it is in scope with a person signing off.
- Criterion 8 deletes `node_modules` before reinstalling, which is why it is manual and not part of the automated run. If it fails midway the working copy is left without dependencies, recovered with `pnpm install`.
- The verdict cannot run any `pnpm` criterion on this machine because pnpm's Windows `.CMD` shim is malformed. That is an environment bug, not a repo bug, and it is worth fixing separately: while it lasts, every spec in this repo has to drive tools through `node` to get an honest verdict.

## Verdict

> Generated by `pnpm verdict --write` on 2026-09-12 17:37 UTC · branch `fix/better-sqlite3-install` · base `main`

| # | Criterion | Status | Evidence |
|---|---|---|---|
| 1 | better-sqlite3 is not a direct dependency of the project any more | PASS | `node -e "const p=require('./package.json'); if (p.dependencies['better-sqlite3']) throw new Error('better-sqlite3 is still in dependencies'); if (p.devDependencies['@types/better-sqlite3']) throw new Error('@types/better-sqlite3 is still in devDependencies')"` → exit 0 (0.1s) |
| 2 | Exactly one copy of better-sqlite3 is left in the tree, the adapter's v12 | PASS | `node -e "const d=require('node:fs').readdirSync('node_modules/.pnpm').filter(n=>n.startsWith('better-sqlite3@')); if (d.length!==1) throw new Error('expected exactly 1 copy, found '+d.length); if (!d[0].startsWith('better-sqlite3@12.')) throw new Error('expected v12, found '+d[0])"` → exit 0 (0.1s) |
| 3 | The resolved better-sqlite3 has a binary that loads, obtained without a compiler | PASS | `node -e "const fs=require('node:fs'),p='node_modules/.pnpm/'+fs.readdirSync('node_modules/.pnpm').find(n=>n.startsWith('better-sqlite3@'))+'/node_modules/better-sqlite3/build/Release/better_sqlite3.node'; const o={exports:{}}; process.dlopen(o,require('node:path').resolve(p)); if (!o.exports.Database) throw new Error('binary loaded but exports no Database')"` → exit 0 (1.0s) |
| 4 | The existing suite stays green without touching its assertions | PASS | `node node_modules/vitest/vitest.mjs run` → exit 0 (6.2s) |
| 5 | Types with no new exceptions | PASS | `node node_modules/typescript/bin/tsc --noEmit` → exit 0 (1.8s) |
| 6 | Lint with no new exceptions | PASS | `node node_modules/eslint/bin/eslint.js .` → exit 0 (1.5s) |
| 7 | The app still boots and serves `/health` | PASS | `node node_modules/tsx/dist/cli.mjs scripts/smoke.ts` → exit 0 (0.8s) |
| 8 | A clean install from the lockfile compiles nothing and runs the postinstall to the end | MANUAL | manual review |

**Scope:** all changes are in scope
**Existing assertions:** unchanged
**Result:** PASS