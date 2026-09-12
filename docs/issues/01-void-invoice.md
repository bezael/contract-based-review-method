# [feat] Void an issued invoice

Labels: feature

## What we want

Operations needs to void invoices issued by mistake. An `ISSUED` invoice moves
to `VOIDED` with `POST /invoices/:id/void`. A voided invoice keeps its number
(numbering cannot have gaps) and can no longer be issued or modified.

## What is out of scope

- Reason for voiding and who voided it.
- Voiding drafts (a draft is discarded, not voided: out of this issue).
- Credit notes (issue 09).

## Acceptance criteria (verifiable)

- [ ] `POST /invoices/:id/void` on an `ISSUED` invoice returns `200` with
      `status: "VOIDED"` and the same `number` it had.
- [ ] On a `DRAFT`, `PAID` or `VOIDED` invoice it returns `409 INVALID_STATUS`.
- [ ] On an id that does not exist it returns `404 INVOICE_NOT_FOUND`.
- [ ] `POST /invoices/:id/issue` on a `VOIDED` invoice returns `409 INVALID_STATUS`.
- [ ] The existing suite stays green without modifying its assertions.

## Suggested scope

- `src/services/invoices.ts`
- `src/routes/invoices.ts`
- `src/services/invoices.test.ts`
- `src/routes/invoices.test.ts`
