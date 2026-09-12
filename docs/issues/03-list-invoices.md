# [feat] List invoices with filters and pagination

Labels: feature

## What we want

`GET /invoices` returns the most recent invoices first, with optional filters by
`status` and `customerId`, and pagination through `page` (starting at 1) and
`perPage` (20 by default, 100 maximum). The response includes the pagination
data so the client knows whether there is more.

## What is out of scope

- Filters by date or by amount.
- Full-text search.
- Configurable ordering.

## Acceptance criteria (verifiable)

- [ ] `GET /invoices` with no parameters returns `200` with `data: [...]`
      ordered by `createdAt` descending and `pagination: { page: 1, perPage: 20, total: N }`.
- [ ] `?status=ISSUED` returns only issued invoices; a status that is not in
      `STATUSES` returns `400 VALIDATION`.
- [ ] `?customerId=<id>` returns only that customer's invoices; a customer with
      no invoices returns an empty list and `total: 0`, not a 404.
- [ ] `?page=2&perPage=2` with 5 invoices returns exactly invoices 3 and 4 of the order.
- [ ] `perPage=101` or `page=0` return `400 VALIDATION`.
- [ ] Every element of `data` has the same shape as `GET /invoices/:id`
      (same DTO), lines included.
- [ ] The existing suite stays green without modifying its assertions.

## Suggested scope

- `src/services/invoices.ts`
- `src/routes/invoices.ts`
- Their tests
