# Fixture: a Vitest criterion whose -t filter matches nothing

> Test fixture for `specs/verdict-ansi-output/spec.md`. Not a task contract.
> `pnpm verdict` must keep reporting it as FAIL ("the -t filter matched no test
> name"), with or without color.

## Acceptance criteria

| # | Criterion | How it is verified |
|---|---|---|
| 1 | A test name that does not exist | `pnpm vitest run src/lib/money.test.ts -t "this test name does not exist"` |

## Modification scope

- `scripts/verdict.mjs`
- `specs/verdict-ansi-output/`
