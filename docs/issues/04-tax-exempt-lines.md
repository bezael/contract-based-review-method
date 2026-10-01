# [feat] Tax-exempt lines

Labels: feature

## What we want

Some services are exempt from tax. Every invoice line accepts an optional
`taxExempt: true` field. Tax is calculated only over the sum of the non-exempt
lines. The response shows, per line, whether it is exempt, and on the invoice
the exempt and the taxable subtotals.

## What is out of scope

- Tax rates other than the general one.
- Changing a line's exemption after the invoice is created.
- Customer-level exemption.

## Acceptance criteria (verifiable)

- [ ] An invoice with one exempt line of `100.00` and one taxable line of `100.00`
      returns `subtotal: "200.00"`, `taxableBase: "100.00"`, `exemptBase: "100.00"`,
      `tax: "18.00"`, `total: "218.00"`.
- [ ] Without `taxExempt` on the line, it behaves as today (`taxExempt: false`).
- [ ] A `taxExempt` value that is not a boolean returns `400 VALIDATION`.
- [ ] An invoice where every line is exempt has `tax: "0.00"`.
- [ ] `GET /invoices/:id` returns `taxExempt` on each line.
- [ ] The existing suite stays green without modifying its assertions.

## Suggested scope

- `prisma/schema.prisma` and a migration: column `taxExempt` on `InvoiceLine`
  defaulting to `false`. **AGENTS.md boundary: whoever signs the spec authorizes it.**
- `src/services/invoices.ts`
- `src/routes/invoices.ts`
- Their tests
