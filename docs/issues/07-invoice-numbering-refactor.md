# [refactor] Extract invoice numbering into its own service

Labels: refactor

## What changes and why

Sequential numbering lives as a private function inside
`src/services/invoices.ts`. It is going to grow (series per branch office,
credit notes with their own prefix) and right now it cannot be tested on its
own. It moves to `src/services/numbering.ts` with a function
`nextNumber(db, prefix, date)` and its own tests.

## Behaviour that is preserved

- Format `F-YYYY-NNNN`, four digits with leading zeros.
- Numbering resets every year, in UTC.
- Issuing still assigns the number exactly the same way: no test in
  `invoices.test.ts` changes.

## Acceptance criteria (verifiable)

- [ ] The existing suite passes without modifying a single assertion.
- [ ] `src/services/numbering.test.ts` covers the format, the yearly reset and
      the case of the first invoice of the year.
- [ ] `src/services/invoices.ts` no longer contains numbering logic: it only
      imports `nextNumber`.
- [ ] `pnpm typecheck && pnpm lint` green, with no new exceptions.

## Suggested scope

- `src/services/numbering.ts` (new)
- `src/services/numbering.test.ts` (new)
- `src/services/invoices.ts`
