# AGENTS.md

Internal invoicing API. It issues and queries invoices for the operations team.
It is not public: all traffic comes through the gateway, so there is no
authentication or rate limiting here, and none should be added.

This is the repository for the **SDD + Agentic Engineering · Contract-Based
Review** workshop (Dominicode). This file is the permanent contract of the repo.
Each task's contract lives in `specs/<slug>/spec.md`.

## Stack

- **Language:** TypeScript 6.0, Node 24 LTS, ESM (`"type": "module"`, imports with the `.js` extension)
- **Framework:** Fastify 5
- **Package manager:** pnpm 11 — derived from `pnpm-lock.yaml`. Do not use another.
- **Database:** SQLite through Prisma 7 with the `better-sqlite3` adapter. Local file in `data/`, no external services.
- **Tests:** Vitest 4, in two projects: `unit` (lib and services) and `api` (routes via `inject`)
- **Lint:** ESLint 10 with `typescript-eslint`, flat config in `eslint.config.js`

## How we work

1. Every task starts from an Issue and is signed off in `specs/<slug>/spec.md`
   before any code is written (template in `specs/spec.template.md`).
2. The branch is named `feat/<slug>`, `fix/<slug>` or `refactor/<slug>`. The slug
   is the spec folder's: that is how the guardrail and the verdict know which
   contract applies.
3. Implement only what the spec asks for, inside its modification scope.
4. Before opening the PR: `pnpm verdict specs/<slug>/spec.md --write`. What comes
   out of it is what the reviewer reads, instead of the diff.
5. After switching branches, `pnpm db:generate`. The generated Prisma client is
   not in git; if it belongs to another schema, the tests fail with "no such column".

## Verification

These commands have been run and checked. They are the harness: if one fails,
the work is not done. Times measured warm on a laptop; the first run takes twice
as long.

### Short loop — after every change

```bash
pnpm typecheck      # 3s   tsc --noEmit
pnpm lint           # 3s   eslint .
pnpm test:unit      # 2s   vitest, unit project
```

### Long loop — before opening the PR

```bash
pnpm build          # 3s   tsc -p tsconfig.build.json -> dist/
pnpm test           # 5s   vitest, unit + api
pnpm smoke          # 3s   boots the app on a free port and hits /health
```

### Task verdict

```bash
pnpm verdict specs/<slug>/spec.md       # runs every criterion in the spec and checks the scope
pnpm verdict:scope                      # scope only, running nothing
```

### Known reds

None. As of September 28, 2026 the whole harness is green on `main`: typecheck,
lint, build, the 26 tests and the smoke test. Anything that fails, you broke it.

## Conventions

Detected by reading the code, not imposed from outside:

- Handlers in `src/routes/` do not talk to Prisma. They go through a service in `src/services/`.
- Every domain error is an `AppError` from `src/lib/errors.ts`, with a code from the `ERROR_CODES` catalog. No strings and no bare `Error` get thrown: that is a 500 and it gets investigated.
- Amounts are integer cents throughout the code and in the database. They enter and leave the API as a decimal string (`"1234.56"`) through `src/lib/money.ts`. Never `Float`.
- Invoice statuses are constrained in `STATUSES` (`src/services/invoices.ts`), not in the schema: SQLite has no enums.
- Tests live next to the file they test, as `*.test.ts`. Each file creates its own in-memory SQLite with `createTestDb()`; they share no state.
- Dates are stored and returned in UTC, ISO 8601.
- Input validation is JSON Schema in the route (`schema.body`). The service assumes the shape is valid and validates the domain.
- Everything is English, including the public API: paths (`/customers`, `/invoices/:id/issue`), JSON fields (`name`, `taxId`, `number`, `status`, `lines`) and error codes (`INVOICE_NOT_FOUND`, `DUPLICATE_RNC`). `toDto()` in `src/services/invoices.ts` shapes the invoice output.

## Boundaries

> `boundaries()` in `scripts/lib/spec.mjs` parses this literal section title.
> Rename the heading and the guardrail silently protects nothing.

Without explicit permission in the task spec, the agent does not touch. One path
per bullet: the hook only reads the first one on each line.

- `prisma/migrations/` — a migration is always reviewed by hand.
- `prisma/schema.prisma` — the schema changes with a person present.
- `.github/workflows/` — CI and deployment.
- `package.json` — no dependencies are added or updated. If one is needed, stop and ask.
- `pnpm-lock.yaml` — same, and it does not get regenerated "along the way".
- `.env*` — credentials. Covers `.env`, `.env.example` and any `.env.<whatever>`.
- `src/lib/money.ts` — cent arithmetic, and it has bitten us twice already.
- `.claude/hooks/` — the guardrail is not edited from inside.
- `scripts/verdict.mjs` — whoever receives the verdict does not edit whoever issues it.
- The assertions of tests that already exist. Adding new tests, yes. Changing the ones that were already there, no: that is fixed separately and by hand.

These boundaries are not just a sign: the `.claude/hooks/guard-boundaries.mjs`
hook blocks writes to the paths in this list unless the active spec includes them
in its scope.

## Definition of done

A task is done when:

1. The short loop passes green.
2. The long loop passes green.
3. Every acceptance criterion in the spec has evidence: which command proves it and what its output was (`pnpm verdict --write`).
4. The diff contains nothing the spec did not request.

Point 4 is the one most often missed. Extra code is code without a contract.
