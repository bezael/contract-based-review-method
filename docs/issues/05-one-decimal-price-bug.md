# [bug] A price with a single decimal is stored wrong

Labels: bug

## What happens

When creating an invoice with `unitPrice: "4.5"`, the line is stored as
`unitPrice: "4.05"` and the subtotal comes out wrong. Operations caught it on
an invoice of `12.5` that came out as `12.05`.

## What should happen

`"4.5"` is 450 cents, the same as `"4.50"`. The API format accepts one or two
decimals, so both have to give the same result.

## How to reproduce it

```bash
curl -s -X POST localhost:3000/invoices -H 'content-type: application/json' -d '{"customerId":"<id>","lines":[{"description":"X","quantity":1,"unitPrice":"4.5"}]}'
# subtotal: "4.05"  (expected: "4.50")
```

## Acceptance criteria (verifiable)

- [ ] There is a regression test in `src/lib/money.test.ts` that fails before
      the fix and passes after: `toCents("4.5") === 450`, `toCents("0.5") === 50`.
- [ ] `toCents("4.50")` and `toCents("4.5")` return the same value.
- [ ] A route test creates an invoice with `unitPrice: "12.5"` and gets `subtotal: "12.50"`.
- [ ] The existing suite stays green without modifying its assertions.

## Suggested scope

- `src/lib/money.ts`. **It is inside the AGENTS.md boundaries: the spec has to
  authorize it explicitly and say why.**
- `src/lib/money.test.ts`
- `src/routes/invoices.test.ts`
