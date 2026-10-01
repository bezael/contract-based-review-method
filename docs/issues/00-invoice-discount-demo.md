# [feat] Invoice discount

Labels: feature, demo

## What we want

When creating an invoice you can pass a whole-number percentage discount
(`discountPct`, from 0 to 100). The discount applies to the subtotal, before
tax is calculated. The API response includes the percentage and the discounted
amount, and the totals already reflect the discount.

## What is out of scope

- Per-line discounts.
- Coupons, promo codes or customer-level discounts.
- Changing the discount of an invoice that already exists.
- Discounts on invoices that have already been issued.

## Acceptance criteria (verifiable)

- [ ] `POST /invoices` with `discountPct: 10` and lines adding up to `100.00`
      returns `discountPct: 10`, `discount: "10.00"`, `subtotal: "100.00"`,
      `tax: "16.20"`, `total: "106.20"`.
- [ ] Without `discountPct` in the body, the invoice returns `discountPct: 0`,
      `discount: "0.00"` and the same totals as today.
- [ ] A `discountPct` of `101`, `-1` or `12.5` returns `400 VALIDATION`.
- [ ] The discount amount rounds half up: subtotal `0.05` with
      `discountPct: 10` discounts `0.01`.
- [ ] `GET /invoices/:id` returns the same discount fields as creation does.
- [ ] The existing suite stays green without modifying its assertions.

## Suggested scope

- `prisma/schema.prisma` and a new migration: columns `discountBps` and
  `discountCents` on `Invoice`. **AGENTS.md boundary: whoever signs the spec
  authorizes it.**
- `src/services/invoices.ts`
- `src/routes/invoices.ts`
- `src/services/invoices.test.ts`
- `src/routes/invoices.test.ts`

## Context

`src/lib/money.ts` already has `percentage(cents, bps)` with the correct
rounding. There is no need to touch that file.
