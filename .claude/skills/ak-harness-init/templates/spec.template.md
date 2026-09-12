# Spec: {{TITLE}}

> The contract. Sign it **before** writing code.
> If it does not fit on two pages, the task is too large: split it.

**Issue:** {{ISSUE_LINK}}
**Date:** {{DATE}}

## What is wanted

{{Two or three sentences. The observable result, not the implementation.}}

## What is out of scope

{{What someone might assume is included but is not. This section prevents
80% of unnecessary code. If it is empty, you have not thought hard enough.}}

## Acceptance criteria

Each criterion needs a command that proves it. A criterion that cannot be
verified with a command is an opinion, and opinions are reviewed manually —
which is exactly what we are trying to avoid.

| # | Criterion | How it is verified |
|---|-----------|--------------------|
| 1 | {{Observable behavior}} | `{{command}}` |
| 2 | {{Observable behavior}} | `{{command}}` |
| 3 | {{Observable behavior}} | `{{command}}` |

## Change scope

The files expected to be touched. If the agent needs to leave this list, stop and ask.

- `{{path}}`
- `{{path}}`

## Risks

{{What could break that works today, and which harness command would detect it.
If the answer is "none would detect it," you have found a harness gap.}}

---

## Verdict

> Fill this in when finished. This is what you read instead of the diff.

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | | | |
| 2 | | | |
| 3 | | | |

**Long loop:** {{summarized output}}
**Out-of-scope changes:** {{none / list with justification}}
