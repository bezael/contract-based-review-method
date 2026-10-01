# [feat] Record payments against an invoice

Labels: feature

## What we want

Record the money collected against an issued invoice. `POST /invoices/:id/payments`
with `{ "amount": "50.00" }` stores the payment. When the payments add up to the
invoice total, the invoice moves to `PAID`. `GET /invoices/:id` includes the list
of payments and the outstanding amount.

## What is out of scope

- Payment methods, bank references, reconciliation.
- Refunds or negative payments.
- Payments on drafts or voided invoices.

## Acceptance criteria (verifiable)

- [ ] A payment on an `ISSUED` invoice returns `201` with the payment and the
      updated `outstanding`.
- [ ] Two payments adding up to the total leave the invoice at `PAID` and
      `outstanding: "0.00"`.
- [ ] A payment above the outstanding amount returns `400 VALIDATION` and is not stored.
- [ ] A payment on `DRAFT`, `PAID` or `VOIDED` returns `409 INVALID_STATUS`.
- [ ] An `amount` with an invalid format (`"50"`, `"-1.00"`, `"abc"`) returns `400 VALIDATION`.
- [ ] `GET /invoices/:id` returns `payments: [...]` ordered by date, plus `outstanding`.
- [ ] The existing suite stays green without modifying its assertions.

## Suggested scope

- `prisma/schema.prisma` and a migration: table `Payment` (`id`, `invoiceId`,
  `amountCents`, `createdAt`). **AGENTS.md boundary: whoever signs the spec authorizes it.**
- `src/services/invoices.ts` (or a new `src/services/payments.ts`)
- `src/routes/invoices.ts`
- Their tests
