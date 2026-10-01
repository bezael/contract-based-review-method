# Fixture: a criterion that fails with colored output

> Test fixture for `specs/verdict-git-color/spec.md`. Not a task contract.
> Its only criterion fails on purpose and prints an ANSI-colored line. The
> verdict's FAIL excerpt must show the text `red` without the escape codes.

## Acceptance criteria

| # | Criterion | How it is verified |
|---|---|---|
| 1 | Fails and prints a colored line | `node -e "process.stdout.write('\x1b[31mred\x1b[0m\n');process.exit(1)"` |

## Modification scope

- `scripts/verdict.mjs`
- `specs/verdict-git-color/`
