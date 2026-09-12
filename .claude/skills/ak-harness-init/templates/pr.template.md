## Contract

**Issue:** #{{NUMBER}}
**Spec:** {{SPEC_LINK}}

## Verdict

| # | Acceptance criterion | Evidence |
|---|----------------------|----------|
| 1 | | `command` -> output |
| 2 | | `command` -> output |
| 3 | | `command` -> output |

## Harness

- [ ] Short loop is green (type check, lint, unit tests)
- [ ] Long loop is green (build, full tests, e2e)
- [ ] No new reds compared with those known in `AGENTS.md`

## Scope

- [ ] The diff does not touch files outside the scope declared in the spec
- [ ] No dependencies were added or updated without agreement
- [ ] There is no code the spec did not request

## For the reviewer

{{The only thing they need to inspect manually, and why. If you write "everything",
this PR is not ready for review: it is asking someone to do the work the harness
was supposed to do.}}
