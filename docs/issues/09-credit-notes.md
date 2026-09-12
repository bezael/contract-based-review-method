# [feat] Credit notes

Labels: feature

## What we want

When an issued invoice has an error or a partial return, a credit note is issued
against it. The note has its own numbering (`NC-YYYY-NNNN`), a reference to the
original invoice, its own lines with their amounts and the same tax calculation.
An invoice can have several notes, but their sum cannot exceed the invoice
total. A credit note for the full total leaves the invoice at `VOIDED`. Notes
are listed alongside the invoice in `GET /invoices/:id`.

## What is out of scope

- Debit notes.
- Applying the note to another invoice of the same customer.
- Voiding a credit note.

## Acceptance criteria (verifiable)

- [ ] `POST /invoices/:id/credit-notes` on an `ISSUED` invoice creates the note
      with number `NC-YYYY-0001`.
- [ ] The note calculates subtotal, tax and total with the same rules as the invoice.
- [ ] A note whose total exceeds the invoice's outstanding amount returns `400 VALIDATION`.
- [ ] A note for the full total leaves the invoice at `VOIDED`.
- [ ] On `DRAFT` or `VOIDED` it returns `409 INVALID_STATUS`.
- [ ] `GET /invoices/:id` includes `creditNotes: [...]`.
- [ ] Note numbering is independent from invoice numbering and resets every year.
- [ ] The existing suite stays green without modifying its assertions.

## Suggested scope

- `prisma/schema.prisma` and migrations. **AGENTS.md boundary.**
- `src/services/credit-notes.ts` (new), `src/services/invoices.ts`,
  `src/services/numbering.ts` if it exists
- `src/routes/credit-notes.ts` (new), `src/app.ts`
- Their tests

## Context

This issue **does not fit in a two-page spec**. Part of the exercise is
splitting it: for example, (1) the model and creating the note with its own
numbering, (2) the maximum-amount rules and the automatic voiding, (3) exposing
it in `GET /invoices/:id`. Each part with its own contract, branch and PR.
