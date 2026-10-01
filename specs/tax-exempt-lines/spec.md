# Spec: Tax-exempt invoice lines

> Task contract. It is signed before delegating and it is what the verdict is
> issued against. If something is not written here, it is not part of the task.

**Issue:** #6 · [https://github.com/bezael/contract-based-review-method/issues/6](https://github.com/bezael/contract-based-review-method/issues/6)
**Date:** 2026-10-02
**Status:** signed

## What we want

Every line in `POST /invoices` accepts an optional `taxExempt` boolean. Tax is
calculated only over the non-exempt lines. Every invoice in the API, created or
read back, carries `taxExempt` on each line and two new invoice fields,
`taxableBase` and `exemptBase`, as decimal strings.

`subtotal` stays the gross sum of all lines, as today. Leaving `taxExempt` out
behaves exactly like today, with `taxExempt: false` on the line,
`taxableBase` equal to `subtotal - discount` and `exemptBase: "0.00"`.

**Interaction with `discountPct`** (the Issue does not mention it; decided here,
change it before signing if it is wrong): the invoice discount is spread over
both bases proportionally. Both bases are net of discount, so
`taxableBase + exemptBase = subtotal - discount` always holds, and
`tax = 18% of taxableBase`. The taxable share of the discount is
`percentage(taxableGross, discountBps)`; the exempt base takes the rounding
remainder. With no exempt lines this is identical to today's calculation.

`taxableBase` and `exemptBase` are derived from the lines and `discountBps`,
not stored: the only new column is `InvoiceLine.taxExempt`, as the Issue
suggests. One function in the service computes them, used by both
`createInvoice` (to get `taxCents`) and `toDto` (to show them).

## What is out of scope

- Tax rates other than the general one. `TAX_BPS` stays as it is.
- Changing a line's exemption after the invoice is created. No new endpoint, no update.
- Customer-level exemption. `Customer` and `src/services/customers.ts` are not touched.
- `src/lib/money.ts`. `percentage()` and `sum()` are used, not edited.
- Storing `taxableBase` / `exemptBase` as columns on `Invoice`.
- Strict boolean validation. Fastify's default Ajv coerces `"true"`, `"false"`, `1`, `0` and `null` to booleans; disabling that means touching `src/app.ts`, which this task does not do (see Risks).
- `issueInvoice`, the error catalog in `src/lib/errors.ts`, and `app.ts`.
- Backfilling existing lines beyond the column default of `false`.

## Acceptance criteria

One row per criterion. The command in the third column is what `pnpm verdict`
runs: if a criterion has no command, it is verified by hand and the verdict
marks it MANUAL.

The constraints from `specs/better-sqlite3-install/spec.md` and
`specs/invoice-discount/spec.md` apply: no `|` in a command, no `pnpm`, no
backticks in a MANUAL row, and every test criterion writes a JSON report to the
git-ignored `specs/tax-exempt-lines/.work/` and fails unless at least one test
actually passed (`vitest run -t` exits 0 when nothing matches).

The tests named in rows 1–7 do not exist yet. Writing them, with exactly these
names, is part of the task.

| #   | Criterion | How it is verified |
| --- | --- | --- |
| 1   | `POST /invoices` with one exempt line of `100.00` and one taxable line of `100.00` returns `201` with `subtotal: "200.00"`, `taxableBase: "100.00"`, `exemptBase: "100.00"`, `tax: "18.00"`, `total: "218.00"`, and `taxExempt` `true` / `false` on the respective lines | `node node_modules/vitest/vitest.mjs run src/routes/invoices.test.ts -t "taxes only the non-exempt lines" --reporter=json --outputFile=specs/tax-exempt-lines/.work/c1.json && node -e "if (require('./specs/tax-exempt-lines/.work/c1.json').numPassedTests<1) throw new Error('no test matched')"` |
| 2   | Without `taxExempt`, the existing fixture lines return `taxExempt: false` on every line, `subtotal: "125.00"`, `taxableBase: "125.00"`, `exemptBase: "0.00"`, `tax: "22.50"`, `total: "147.50"` | `node node_modules/vitest/vitest.mjs run src/routes/invoices.test.ts -t "defaults taxExempt to false when omitted" --reporter=json --outputFile=specs/tax-exempt-lines/.work/c2.json && node -e "if (require('./specs/tax-exempt-lines/.work/c2.json').numPassedTests<1) throw new Error('no test matched')"` |
| 3   | A line with `taxExempt: "yes"` or `taxExempt: {}` returns `400` with `error: "VALIDATION"`, and no invoice is created. One test covers both values | `node node_modules/vitest/vitest.mjs run src/routes/invoices.test.ts -t "rejects a non-boolean taxExempt with 400 VALIDATION" --reporter=json --outputFile=specs/tax-exempt-lines/.work/c3.json && node -e "if (require('./specs/tax-exempt-lines/.work/c3.json').numPassedTests<1) throw new Error('no test matched')"` |
| 4   | An invoice where every line is exempt (two lines, `100.00` and `25.00`) returns `taxableBase: "0.00"`, `exemptBase: "125.00"`, `tax: "0.00"`, `total: "125.00"` | `node node_modules/vitest/vitest.mjs run src/routes/invoices.test.ts -t "charges no tax when every line is exempt" --reporter=json --outputFile=specs/tax-exempt-lines/.work/c4.json && node -e "if (require('./specs/tax-exempt-lines/.work/c4.json').numPassedTests<1) throw new Error('no test matched')"` |
| 5   | `GET /invoices/:id` of the invoice from criterion 1 returns `taxExempt` on each line and the same `subtotal`, `taxableBase`, `exemptBase`, `tax` and `total` as the creation response | `node node_modules/vitest/vitest.mjs run src/routes/invoices.test.ts -t "returns taxExempt and the bases on read" --reporter=json --outputFile=specs/tax-exempt-lines/.work/c5.json && node -e "if (require('./specs/tax-exempt-lines/.work/c5.json').numPassedTests<1) throw new Error('no test matched')"` |
| 6   | The discount spreads over both bases: one exempt line of `100.00`, one taxable line of `100.00` and `discountPct: 10` return `subtotal: "200.00"`, `discount: "20.00"`, `taxableBase: "90.00"`, `exemptBase: "90.00"`, `tax: "16.20"`, `total: "196.20"` | `node node_modules/vitest/vitest.mjs run src/routes/invoices.test.ts -t "spreads the discount over the taxable and exempt bases" --reporter=json --outputFile=specs/tax-exempt-lines/.work/c6.json && node -e "if (require('./specs/tax-exempt-lines/.work/c6.json').numPassedTests<1) throw new Error('no test matched')"` |
| 7   | The service persists the flag and taxes only the taxable cents, and the rounding remainder goes to the exempt base: one exempt line of `0.05`, one taxable line of `0.05` and `discountPct: 10` persist `taxExempt` `true` / `false` on the lines, `subtotalCents: 10`, `discountCents: 1`, `taxCents: 1`, `totalCents: 10`; and `toDto` returns `taxableBase: "0.04"`, `exemptBase: "0.05"` | `node node_modules/vitest/vitest.mjs run src/services/invoices.test.ts -t "taxes only the taxable cents and rounds the remainder into the exempt base" --reporter=json --outputFile=specs/tax-exempt-lines/.work/c7.json && node -e "if (require('./specs/tax-exempt-lines/.work/c7.json').numPassedTests<1) throw new Error('no test matched')"` |
| 8   | The new column is `Boolean` and defaults to `false` | `node -e "const s=require('node:fs').readFileSync('prisma/schema.prisma','utf8'); if (!/taxExempt\s+Boolean\s+@default\(false\)/.test(s)) throw new Error('taxExempt is not Boolean @default(false)')"` |
| 9   | The existing suite stays green without touching its assertions | `node node_modules/vitest/vitest.mjs run` |
| 10  | Types with no new exceptions | `node node_modules/typescript/bin/tsc --noEmit` |
| 11  | Lint with no new exceptions | `node node_modules/eslint/bin/eslint.js .` |
| 12  | The app still boots and serves `/health` | `node node_modules/tsx/dist/cli.mjs scripts/smoke.ts` |
| 13  | The new migration only adds the taxExempt column to InvoiceLine: no table is dropped or rebuilt, no existing column changes. | MANUAL — a person reads the migration SQL before signing the PR, as AGENTS.md requires for every migration. |

## Modification scope

One path per bullet, in backticks. Anything outside this list makes the verdict
fail, and the hook blocks it if it is also an AGENTS.md boundary.

- `prisma/schema.prisma` — **AGENTS.md boundary.** Adds `taxExempt Boolean @default(false)` to `InvoiceLine`, nothing else. Authorized by whoever signs this spec.
- `prisma/migrations/*_add_line_tax_exempt/migration.sql` — **AGENTS.md boundary.** Exactly one new migration, folder name ending in `_add_line_tax_exempt`. Existing migrations and `migration_lock.toml` are not matched and stay untouched. Authorized by whoever signs this spec; reviewed by hand (criterion 13).
- `src/services/invoices.ts`
- `src/services/invoices.test.ts` — new test only.
- `src/routes/invoices.ts`
- `src/routes/invoices.test.ts` — new tests only.
- `specs/tax-exempt-lines/spec.md`
- `specs/INDEX.md`

## Risks

- **Fastify strips unknown line fields instead of rejecting them** (default Ajv `removeAdditional: true` with `additionalProperties: false` on the line). If the line schema is not updated, `taxExempt` is silently dropped and every line is taxed, with a `201`. Criteria 1 and 4 catch it.
- **Fastify coerces body types** (default Ajv `coerceTypes`). `"true"`, `1`, `0` and `null` are accepted as booleans instead of rejected, so the Issue's "a value that is not a boolean returns 400" only holds for non-coercible values. Criterion 3 tests `"yes"` and `{}` for that reason. Rejecting the coercible ones requires changing Ajv options in `src/app.ts`: out of scope, and **no criterion covers it**. Harness gap, noted so nobody assumes it is rejected.
- **Tax calculated over all lines, or over the exempt ones.** Criteria 1, 4 and 7 catch it.
- **Discount applied only to the taxable base, or bases shown gross of discount.** Criterion 6 catches both (it would give `taxableBase: "80.00"` / `tax: "14.40"`, or bases summing to `200.00`).
- **Rounding drift: `taxableBase + exemptBase` off by one cent from `subtotal - discount`.** Criterion 7 catches it on the `0.05` data.
- **`toDto` and `createInvoice` compute the bases differently**, so a read shows a `taxableBase` whose 18% is not the stored `tax`. Criteria 5 and 7 catch it for the cases tested; any future change to the discount or tax rule also changes the derived bases of historical invoices. That is the price of not storing them (out of scope by decision).
- **Existing discount behaviour regresses** (`invoice-discount` criteria). Criterion 9 runs those tests.
- **The generated Prisma client belongs to the old schema.** Tests fail with "no such column" until `pnpm db:generate` runs. Environment, not code: regenerate before running the verdict.
- **The migration rebuilds the `InvoiceLine` table** (Prisma does this on SQLite for some changes) and loses data or the `onDelete: Cascade` on a real database. Tests build from migrations on an empty in-memory DB, so **no automated criterion would detect data loss**. Harness gap; criterion 13 is the only line of defence.
- **`data/` local database** used by `pnpm dev` does not have the new column until `prisma migrate deploy` runs on it. Criterion 12 only hits `/health`, so nothing detects it. Harness gap.

## Verdict

> Generated by `pnpm verdict --write` on 2026-10-01 22:42 UTC · branch `feat/tax-exempt-lines` · base `main`

| # | Criterion | Status | Evidence |
|---|---|---|---|
| 1 | `POST /invoices` with one exempt line of `100.00` and one taxable line of `100.00` returns `201` with `subtotal: "200.00"`, `taxableBase: "100.00"`, `exemptBase: "100.00"`, `tax: "18.00"`, `total: "218.00"`, and `taxExempt` `true` / `false` on the respective lines | PASS | `node node_modules/vitest/vitest.mjs run src/routes/invoices.test.ts -t "taxes only the non-exempt lines" --reporter=json --outputFile=specs/tax-exempt-lines/.work/c1.json && node -e "if (require('./specs/tax-exempt-lines/.work/c1.json').numPassedTests<1) throw new Error('no test matched')"` → exit 0 (1.2s) |
| 2 | Without `taxExempt`, the existing fixture lines return `taxExempt: false` on every line, `subtotal: "125.00"`, `taxableBase: "125.00"`, `exemptBase: "0.00"`, `tax: "22.50"`, `total: "147.50"` | PASS | `node node_modules/vitest/vitest.mjs run src/routes/invoices.test.ts -t "defaults taxExempt to false when omitted" --reporter=json --outputFile=specs/tax-exempt-lines/.work/c2.json && node -e "if (require('./specs/tax-exempt-lines/.work/c2.json').numPassedTests<1) throw new Error('no test matched')"` → exit 0 (1.2s) |
| 3 | A line with `taxExempt: "yes"` or `taxExempt: {}` returns `400` with `error: "VALIDATION"`, and no invoice is created. One test covers both values | PASS | `node node_modules/vitest/vitest.mjs run src/routes/invoices.test.ts -t "rejects a non-boolean taxExempt with 400 VALIDATION" --reporter=json --outputFile=specs/tax-exempt-lines/.work/c3.json && node -e "if (require('./specs/tax-exempt-lines/.work/c3.json').numPassedTests<1) throw new Error('no test matched')"` → exit 0 (1.2s) |
| 4 | An invoice where every line is exempt (two lines, `100.00` and `25.00`) returns `taxableBase: "0.00"`, `exemptBase: "125.00"`, `tax: "0.00"`, `total: "125.00"` | PASS | `node node_modules/vitest/vitest.mjs run src/routes/invoices.test.ts -t "charges no tax when every line is exempt" --reporter=json --outputFile=specs/tax-exempt-lines/.work/c4.json && node -e "if (require('./specs/tax-exempt-lines/.work/c4.json').numPassedTests<1) throw new Error('no test matched')"` → exit 0 (1.2s) |
| 5 | `GET /invoices/:id` of the invoice from criterion 1 returns `taxExempt` on each line and the same `subtotal`, `taxableBase`, `exemptBase`, `tax` and `total` as the creation response | PASS | `node node_modules/vitest/vitest.mjs run src/routes/invoices.test.ts -t "returns taxExempt and the bases on read" --reporter=json --outputFile=specs/tax-exempt-lines/.work/c5.json && node -e "if (require('./specs/tax-exempt-lines/.work/c5.json').numPassedTests<1) throw new Error('no test matched')"` → exit 0 (1.2s) |
| 6 | The discount spreads over both bases: one exempt line of `100.00`, one taxable line of `100.00` and `discountPct: 10` return `subtotal: "200.00"`, `discount: "20.00"`, `taxableBase: "90.00"`, `exemptBase: "90.00"`, `tax: "16.20"`, `total: "196.20"` | PASS | `node node_modules/vitest/vitest.mjs run src/routes/invoices.test.ts -t "spreads the discount over the taxable and exempt bases" --reporter=json --outputFile=specs/tax-exempt-lines/.work/c6.json && node -e "if (require('./specs/tax-exempt-lines/.work/c6.json').numPassedTests<1) throw new Error('no test matched')"` → exit 0 (1.2s) |
| 7 | The service persists the flag and taxes only the taxable cents, and the rounding remainder goes to the exempt base: one exempt line of `0.05`, one taxable line of `0.05` and `discountPct: 10` persist `taxExempt` `true` / `false` on the lines, `subtotalCents: 10`, `discountCents: 1`, `taxCents: 1`, `totalCents: 10`; and `toDto` returns `taxableBase: "0.04"`, `exemptBase: "0.05"` | PASS | `node node_modules/vitest/vitest.mjs run src/services/invoices.test.ts -t "taxes only the taxable cents and rounds the remainder into the exempt base" --reporter=json --outputFile=specs/tax-exempt-lines/.work/c7.json && node -e "if (require('./specs/tax-exempt-lines/.work/c7.json').numPassedTests<1) throw new Error('no test matched')"` → exit 0 (1.0s) |
| 8 | The new column is `Boolean` and defaults to `false` | PASS | `node -e "const s=require('node:fs').readFileSync('prisma/schema.prisma','utf8'); if (!/taxExempt\s+Boolean\s+@default\(false\)/.test(s)) throw new Error('taxExempt is not Boolean @default(false)')"` → exit 0 (0.1s) |
| 9 | The existing suite stays green without touching its assertions | PASS | `node node_modules/vitest/vitest.mjs run` → exit 0 (1.9s) |
| 10 | Types with no new exceptions | PASS | `node node_modules/typescript/bin/tsc --noEmit` → exit 0 (1.7s) |
| 11 | Lint with no new exceptions | PASS | `node node_modules/eslint/bin/eslint.js .` → exit 0 (1.4s) |
| 12 | The app still boots and serves `/health` | PASS | `node node_modules/tsx/dist/cli.mjs scripts/smoke.ts` → exit 0 (0.7s) |
| 13 | The new migration only adds the taxExempt column to InvoiceLine: no table is dropped or rebuilt, no existing column changes. | MANUAL | manual review |

**Scope:** out of scope: `docs/architecture-diagram.md`
**Existing assertions:** unchanged
**Result:** FAIL