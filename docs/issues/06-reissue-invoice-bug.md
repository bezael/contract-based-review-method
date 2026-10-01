# [bug] Issuing an invoice twice changes its number

Labels: bug

## What happens

If `POST /invoices/:id/issue` is called on an invoice that is already `ISSUED`,
the invoice gets a new number and a new issue date. The previous number is left
orphaned and the sequential numbering has a gap. A network retry from the client
is enough to trigger it.

## What should happen

Only a `DRAFT` can be issued. Any other status returns `409 INVALID_STATUS` and
changes nothing.

## How to reproduce it

```bash
curl -s -X POST localhost:3000/invoices/<id>/issue   # number: F-2026-0001
curl -s -X POST localhost:3000/invoices/<id>/issue   # number: F-2026-0002 (expected: 409)
```

## Acceptance criteria (verifiable)

- [ ] There is a regression test that issues twice and checks that the second
      call returns `409 INVALID_STATUS` and that `number` and `issuedAt` do not change.
- [ ] Issuing a `DRAFT` keeps working exactly as before.
- [ ] The existing suite stays green without modifying its assertions.

## Suggested scope

- `src/services/invoices.ts`
- `src/services/invoices.test.ts`
- `src/routes/invoices.test.ts`
