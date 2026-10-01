# Spec: Invoice discount

> Reference contract for the feature built during the workshop (Modules 2 to 7).
> In the recording it is written live from Issue 00; this is the signed
> version, kept for comparison.

**Issue:** #0 · docs/issues/00-invoice-discount-demo.md
**Date:** 2026-09-20
**Status:** signed

## What we want

When creating an invoice you can pass `discountPct`, an integer from 0 to 100.
The discount applies to the subtotal before tax. The response includes
`discountPct`, the `discount` amount and the discounted totals, both when
creating and when reading the invoice.

## What is out of scope

- Per-line discounts, coupons or customer-level discounts.
- Changing the discount after the invoice has been created.
- Discounts on invoices that have already been issued.
- Any change to `src/lib/money.ts`: `percentage()` already does the rounding we need.

## Acceptance criteria

| # | Criterion | How it is verified |
|---|---|---|
| 1 | `POST /invoices` with `discountPct: 10` and subtotal 100.00 returns `discount: "10.00"`, `tax: "16.20"`, `total: "106.20"` | `pnpm vitest run src/routes/invoices.test.ts -t "10 percent discount"` |
| 2 | Without `discountPct` it returns `discountPct: 0`, `discount: "0.00"` and the usual totals | `pnpm vitest run src/routes/invoices.test.ts -t "zero discount"` |
| 3 | A `discountPct` of 101, -1 or 12.5 returns 400 VALIDATION | `pnpm vitest run src/routes/invoices.test.ts -t "invalid discountPct"` |
| 4 | The discount amount rounds half up: 0.05 at 10 % discounts 0.01 | `pnpm vitest run src/services/invoices.test.ts -t "rounds the discount"` |
| 5 | `GET /invoices/:id` returns the same discount fields | `pnpm vitest run src/routes/invoices.test.ts -t "discount fields"` |
| 6 | The existing suite stays green without touching its assertions | `pnpm test` |
| 7 | Types and lint with no new exceptions | `pnpm typecheck && pnpm lint` |

## Modification scope

- `prisma/schema.prisma` — columns `discountBps Int @default(0)` and `discountCents Int @default(0)` on `Invoice`. **AGENTS.md boundary, authorized by Bezael on 2026-09-20: a new column with a default value, it destroys no data.**
- `prisma/migrations/**` — the migration generated with `pnpm db:migrate --name invoice-discount`. Same authorization.
- `src/services/invoices.ts`
- `src/routes/invoices.ts`
- `src/services/invoices.test.ts`
- `src/routes/invoices.test.ts`

## Risks

- The discount being applied after tax instead of before. Criterion 1 catches it (tax would be 18.00, not 16.20).
- The percentage being stored as a Float. `pnpm typecheck` catches it if the Prisma type is `Int`, and criterion 3 catches it if 12.5 is accepted.
- The migration breaking existing invoices. `pnpm test` catches it: tests apply every migration over data created without a discount.
- The rounding being done with `Math.round` or `Math.floor` instead of `percentage()`. Criterion 4 catches it.

## Verdict

> Filled in by `pnpm verdict --write` when the task is finished.
