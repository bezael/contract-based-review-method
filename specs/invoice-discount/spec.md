# Spec: Whole-number percentage discount on invoice creation

> Task contract. It is signed before delegating and it is what the verdict is
> issued against. If something is not written here, it is not part of the task.

**Issue:** #2 · [https://github.com/bezael/contract-based-review-method/issues/2](https://github.com/bezael/contract-based-review-method/issues/2)
**Date:** 2026-10-01
**Status:** signed

## What we want

`POST /invoices` accepts an optional `discountPct`, a whole number from 0 to 100.
The discount is taken off the subtotal before tax is calculated, so a 10%
discount on `100.00` gives tax on `90.00`. Every invoice in the API, created or
read back, carries `discountPct` and `discount` (the discounted amount as a
decimal string), and `tax` and `total` already reflect it. `subtotal` stays the
gross sum of the lines, before discount.

Leaving `discountPct` out behaves exactly like today, with `discountPct: 0` and
`discount: "0.00"` added to the response.

## What is out of scope

- Per-line discounts.
- Coupons, promo codes or customer-level discounts.
- Changing the discount of an invoice that already exists. No new endpoint, no update of the field.
- Discounts on invoices that have already been issued. `issueInvoice` is not touched.
- Fractional percentages. `12.5` is rejected, not rounded.
- Fixed-amount discounts (`discount: "5.00"` as input).
- `src/lib/money.ts`. `percentage(cents, bps)` already rounds half up; it is used, not edited. `TAX_BPS` stays as it is.
- Backfilling existing invoices beyond the column default of `0`.
- Customers, the error catalog in `src/lib/errors.ts`, and `app.ts`.



## Acceptance criteria

One row per criterion. The command in the third column is what `pnpm verdict`
runs: if a criterion has no command, it is verified by hand and the verdict
marks it MANUAL.

The constraints learned in `specs/better-sqlite3-install/spec.md` apply here
too: no `|` in a command, no `pnpm` (tools are driven through `node` and their
JS entry points), and no backticks in a MANUAL row.

One more, found while writing this spec: `vitest run -t "<name>"` **exits 0
when no test matches the name** (checked on `main`: `-t "discount"` → 6
skipped, exit 0). A criterion that only filters by name would pass before the
test is written. So every test criterion writes a JSON report to the
git-ignored `specs/invoice-discount/.work/` and fails unless at least one test
actually passed.

The tests named in rows 1–6 do not exist yet. Writing them, with exactly these
names, is part of the task.


| #   | Criterion                                                                                                                                                                                                                | How it is verified                                                                                                                                                                                                                                                                                                            |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `POST /invoices` with `discountPct: 10` and lines adding up to `100.00` returns `201` with `discountPct: 10`, `discount: "10.00"`, `subtotal: "100.00"`, `tax: "16.20"`, `total: "106.20"`                               | `node node_modules/vitest/vitest.mjs run src/routes/invoices.test.ts -t "applies discountPct to the subtotal before tax" --reporter=json --outputFile=specs/invoice-discount/.work/c1.json && node -e "if (require('./specs/invoice-discount/.work/c1.json').numPassedTests<1) throw new Error('no test matched')"`           |
| 2   | Without `discountPct`, the invoice returns `discountPct: 0`, `discount: "0.00"` and today's totals for the existing fixture lines: `subtotal: "125.00"`, `tax: "22.50"`, `total: "147.50"`                               | `node node_modules/vitest/vitest.mjs run src/routes/invoices.test.ts -t "defaults discountPct to 0 when omitted" --reporter=json --outputFile=specs/invoice-discount/.work/c2.json && node -e "if (require('./specs/invoice-discount/.work/c2.json').numPassedTests<1) throw new Error('no test matched')"`                   |
| 3   | A `discountPct` of `101`, `-1` or `12.5` returns `400` with `error: "VALIDATION"`, and no invoice is created. One test covers the three values                                                                           | `node node_modules/vitest/vitest.mjs run src/routes/invoices.test.ts -t "rejects discountPct 101, -1 and 12.5 with 400 VALIDATION" --reporter=json --outputFile=specs/invoice-discount/.work/c3.json && node -e "if (require('./specs/invoice-discount/.work/c3.json').numPassedTests<1) throw new Error('no test matched')"` |
| 4   | The discount rounds half up: one line of `0.05` with `discountPct: 10` returns `subtotal: "0.05"`, `discount: "0.01"`                                                                                                    | `node node_modules/vitest/vitest.mjs run src/routes/invoices.test.ts -t "rounds the discount half up" --reporter=json --outputFile=specs/invoice-discount/.work/c4.json && node -e "if (require('./specs/invoice-discount/.work/c4.json').numPassedTests<1) throw new Error('no test matched')"`                              |
| 5   | `GET /invoices/:id` of an invoice created with `discountPct: 10` returns the same `discountPct`, `discount`, `subtotal`, `tax` and `total` as the creation response                                                      | `node node_modules/vitest/vitest.mjs run src/routes/invoices.test.ts -t "returns the same discount fields as creation" --reporter=json --outputFile=specs/invoice-discount/.work/c5.json && node -e "if (require('./specs/invoice-discount/.work/c5.json').numPassedTests<1) throw new Error('no test matched')"`             |
| 6   | The service stores the discount in integer cents and basis points: `discountPct: 10` on `10000` cents persists `discountBps: 1000`, `discountCents: 1000`, `taxCents: 1620`, `totalCents: 10620`, `subtotalCents: 10000` | `node node_modules/vitest/vitest.mjs run src/services/invoices.test.ts -t "stores the discount in cents before tax" --reporter=json --outputFile=specs/invoice-discount/.work/c6.json && node -e "if (require('./specs/invoice-discount/.work/c6.json').numPassedTests<1) throw new Error('no test matched')"`                |
| 7   | The new columns are `Int`, never `Float`, and default to `0`                                                                                                                                                             | `node -e "const s=require('node:fs').readFileSync('prisma/schema.prisma','utf8'); for (const c of ['discountBps','discountCents']) if (!new RegExp(c+'\\s+Int\\s+@default\\(0\\)').test(s)) throw new Error(c+' is not Int @default(0)')"`                                                                                    |
| 8   | The existing suite stays green without touching its assertions                                                                                                                                                           | `node node_modules/vitest/vitest.mjs run`                                                                                                                                                                                                                                                                                     |
| 9   | Types with no new exceptions                                                                                                                                                                                             | `node node_modules/typescript/bin/tsc --noEmit`                                                                                                                                                                                                                                                                               |
| 10  | Lint with no new exceptions                                                                                                                                                                                              | `node node_modules/eslint/bin/eslint.js .`                                                                                                                                                                                                                                                                                    |
| 11  | The app still boots and serves `/health`                                                                                                                                                                                 | `node node_modules/tsx/dist/cli.mjs scripts/smoke.ts`                                                                                                                                                                                                                                                                         |
| 12  | The new migration only adds the two columns: no table is dropped, no existing column changes.                                                                                                                            | MANUAL — a person reads the migration SQL before signing the PR, as AGENTS.md requires for every migration.                                                                                                                                                                                                                   |




## Modification scope

One path per bullet, in backticks. Anything outside this list makes the verdict
fail, and the hook blocks it if it is also an AGENTS.md boundary.

- `prisma/schema.prisma` — **AGENTS.md boundary.** Adds `discountBps Int @default(0)` and `discountCents Int @default(0)` to `Invoice`. Authorized by whoever signs this spec.
- `prisma/migrations/*_add_invoice_discount/migration.sql` — **AGENTS.md boundary.** Exactly one new migration, folder name ending in `_add_invoice_discount`. Existing migrations and `migration_lock.toml` are not matched and stay untouched. Authorized by whoever signs this spec; reviewed by hand (criterion 12).
- `src/services/invoices.ts`
- `src/services/invoices.test.ts` — new test only.
- `src/routes/invoices.ts`
- `src/routes/invoices.test.ts` — new tests only.
- `specs/invoice-discount/spec.md`
- `specs/INDEX.md`



## Risks

- **Fastify strips unknown body fields instead of rejecting them** (default Ajv `removeAdditional: true`). If the route schema is not updated, `discountPct` is silently dropped and the invoice is created with no discount and a `201`. Criteria 1 and 3 catch it.
- **Fastify coerces body types** (default Ajv `coerceTypes`). A string `"10"` would be accepted as `10`. Not part of the Issue and not covered by any criterion: a gap, not a bug, noted so nobody assumes it is rejected.
- **Discount applied after tax instead of before.** It would give `tax: "18.00"` and `total: "108.00"` on the criterion 1 data. Criteria 1 and 6 catch it.
- `subtotal` **redefined as net of discount.** It would break the `subtotal: "100.00"` in criterion 1 and could leak into existing tests. Criteria 1 and 8 catch it.
- **The generated Prisma client belongs to the old schema.** Tests fail with "no such column" until `pnpm db:generate` runs. That is environment, not code: regenerate before running the verdict.
- **The migration rebuilds the** `Invoice` **table** (Prisma does this on SQLite for some changes) and loses data or the `lines` cascade on a real database. Tests build from migrations on an empty in-memory DB, so **no automated criterion would detect data loss**. Harness gap; criterion 12 is the only line of defence.
- `data/` **local database** used by `pnpm dev` and the smoke test does not have the new columns until `prisma migrate deploy` runs on it. Criterion 11 catches it if the smoke test touches invoices; if it only hits `/health`, nothing does. Harness gap.
- **A test criterion passing with no test behind it.** Closed by the JSON-report guard on rows 1–6; a renamed test makes its row fail.



## Verdict

> Generated by `pnpm verdict --write` on 2026-10-01 20:15 UTC · branch `feat/invoice-discount` · base `main`

| # | Criterion | Status | Evidence |
|---|---|---|---|
| 1 | `POST /invoices` with `discountPct: 10` and lines adding up to `100.00` returns `201` with `discountPct: 10`, `discount: "10.00"`, `subtotal: "100.00"`, `tax: "16.20"`, `total: "106.20"` | PASS | `node node_modules/vitest/vitest.mjs run src/routes/invoices.test.ts -t "applies discountPct to the subtotal before tax" --reporter=json --outputFile=specs/invoice-discount/.work/c1.json && node -e "if (require('./specs/invoice-discount/.work/c1.json').numPassedTests<1) throw new Error('no test matched')"` → exit 0 (1.4s) |
| 2 | Without `discountPct`, the invoice returns `discountPct: 0`, `discount: "0.00"` and today's totals for the existing fixture lines: `subtotal: "125.00"`, `tax: "22.50"`, `total: "147.50"` | PASS | `node node_modules/vitest/vitest.mjs run src/routes/invoices.test.ts -t "defaults discountPct to 0 when omitted" --reporter=json --outputFile=specs/invoice-discount/.work/c2.json && node -e "if (require('./specs/invoice-discount/.work/c2.json').numPassedTests<1) throw new Error('no test matched')"` → exit 0 (1.3s) |
| 3 | A `discountPct` of `101`, `-1` or `12.5` returns `400` with `error: "VALIDATION"`, and no invoice is created. One test covers the three values | PASS | `node node_modules/vitest/vitest.mjs run src/routes/invoices.test.ts -t "rejects discountPct 101, -1 and 12.5 with 400 VALIDATION" --reporter=json --outputFile=specs/invoice-discount/.work/c3.json && node -e "if (require('./specs/invoice-discount/.work/c3.json').numPassedTests<1) throw new Error('no test matched')"` → exit 0 (1.2s) |
| 4 | The discount rounds half up: one line of `0.05` with `discountPct: 10` returns `subtotal: "0.05"`, `discount: "0.01"` | PASS | `node node_modules/vitest/vitest.mjs run src/routes/invoices.test.ts -t "rounds the discount half up" --reporter=json --outputFile=specs/invoice-discount/.work/c4.json && node -e "if (require('./specs/invoice-discount/.work/c4.json').numPassedTests<1) throw new Error('no test matched')"` → exit 0 (1.7s) |
| 5 | `GET /invoices/:id` of an invoice created with `discountPct: 10` returns the same `discountPct`, `discount`, `subtotal`, `tax` and `total` as the creation response | PASS | `node node_modules/vitest/vitest.mjs run src/routes/invoices.test.ts -t "returns the same discount fields as creation" --reporter=json --outputFile=specs/invoice-discount/.work/c5.json && node -e "if (require('./specs/invoice-discount/.work/c5.json').numPassedTests<1) throw new Error('no test matched')"` → exit 0 (1.4s) |
| 6 | The service stores the discount in integer cents and basis points: `discountPct: 10` on `10000` cents persists `discountBps: 1000`, `discountCents: 1000`, `taxCents: 1620`, `totalCents: 10620`, `subtotalCents: 10000` | PASS | `node node_modules/vitest/vitest.mjs run src/services/invoices.test.ts -t "stores the discount in cents before tax" --reporter=json --outputFile=specs/invoice-discount/.work/c6.json && node -e "if (require('./specs/invoice-discount/.work/c6.json').numPassedTests<1) throw new Error('no test matched')"` → exit 0 (0.9s) |
| 7 | The new columns are `Int`, never `Float`, and default to `0` | PASS | `node -e "const s=require('node:fs').readFileSync('prisma/schema.prisma','utf8'); for (const c of ['discountBps','discountCents']) if (!new RegExp(c+'\\s+Int\\s+@default\\(0\\)').test(s)) throw new Error(c+' is not Int @default(0)')"` → exit 0 (0.1s) |
| 8 | The existing suite stays green without touching its assertions | PASS | `node node_modules/vitest/vitest.mjs run` → exit 0 (1.7s) |
| 9 | Types with no new exceptions | PASS | `node node_modules/typescript/bin/tsc --noEmit` → exit 0 (1.6s) |
| 10 | Lint with no new exceptions | PASS | `node node_modules/eslint/bin/eslint.js .` → exit 0 (2.0s) |
| 11 | The app still boots and serves `/health` | PASS | `node node_modules/tsx/dist/cli.mjs scripts/smoke.ts` → exit 0 (0.7s) |
| 12 | The new migration only adds the two columns: no table is dropped, no existing column changes. | MANUAL | manual review |

**Scope:** all changes are in scope
**Existing assertions:** unchanged
**Result:** PASS