# [architecture] Status change history

Labels: feature, architecture

## What we want

Audit needs to know when each invoice changed status. Every transition
(`DRAFT → ISSUED`, and any others that exist: voiding, payment) leaves an event
with the previous status, the new one and the date. `GET /invoices/:id/history`
returns the list in chronological order.

## What is out of scope

- Who made the change (this API has no users).
- Events that are not status changes.
- Deleting or editing the history.

## Acceptance criteria (verifiable)

- [ ] Creating an invoice records a `null → DRAFT` event.
- [ ] Issuing records a `DRAFT → ISSUED` event with the same date as `issuedAt`.
- [ ] `GET /invoices/:id/history` returns the events ordered by date ascending,
      with `from`, `to` and `date` in ISO UTC.
- [ ] On an id that does not exist it returns `404 INVOICE_NOT_FOUND`.
- [ ] Writing the event and changing the status happen in the same transaction:
      if one fails, the other is not left behind (a test that forces the failure).
- [ ] The existing suite stays green without modifying its assertions.

## Suggested scope

- `prisma/schema.prisma` and a migration: table `InvoiceEvent`.
  **AGENTS.md boundary: whoever signs the spec authorizes it.**
- `src/services/invoices.ts`
- `src/routes/invoices.ts`
- Their tests

## Context

If issues 01 or 02 have already been implemented, their transitions generate an
event too. If not, the spec leaves them out explicitly.
