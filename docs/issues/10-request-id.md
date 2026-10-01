# [cross-cutting] Request id in responses and logs

Labels: refactor, observability

## What we want

Support cannot correlate a customer complaint with the logs. Every API response
carries an `x-request-id` header. If the request already came with one, it is
respected; if not, one is generated. Every log line of that request includes the
same identifier, and `AppError` responses and `500`s return it in the body too
(`requestId`).

## What is out of scope

- Distributed tracing, OpenTelemetry.
- Changing the log format.
- Adding dependencies: Fastify already generates an id per request and already uses pino.

## Acceptance criteria (verifiable)

- [ ] Every response (200, 201, 400, 404, 409, 500) includes `x-request-id`.
- [ ] If the request carries `x-request-id: abc-123`, the response returns the same value.
- [ ] An error body includes `requestId` with the same value as the header.
- [ ] An incoming id longer than 64 characters, or with characters outside
      `[A-Za-z0-9._-]`, is discarded and a new one is generated.
- [ ] `pnpm typecheck && pnpm lint` green and `package.json` unchanged.
- [ ] The existing suite stays green without modifying its assertions.

## Suggested scope

- `src/app.ts`
- `src/app.test.ts`
- `src/routes/*.test.ts` only if a case needs adding; existing assertions are not touched.
