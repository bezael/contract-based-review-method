# Fixture: a Vitest criterion that passes

> Test fixture for `specs/verdict-ansi-output/spec.md`. Not a task contract.
> `pnpm verdict` must report it as PASS whether or not Vitest colors its output.

## Acceptance criteria

| # | Criterion | How it is verified |
|---|---|---|
| 1 | An existing money test passes | `pnpm vitest run src/lib/money.test.ts -t "converts a decimal with two digits to cents"` |

## Modification scope

- `scripts/verdict.mjs`
- `specs/verdict-ansi-output/`
