# AGENTS.md

> Template. Everything between `{{ }}` is filled with data **verified in Phase 1**.
> If a datum could not be verified, do not write it: leave it out and report it as a gap.

---

# {{PROJECT_NAME}}

{{ONE_SENTENCE: what this project is and who it is for}}

## Stack

- **Language:** {{LANGUAGE_AND_VERSION}}
- **Framework:** {{FRAMEWORK_AND_VERSION}}
- **Package manager:** {{MANAGER}} — derived from `{{LOCKFILE}}`. Do not use another.
- **Runtime / version:** {{RUNTIME}}

## Verification

These commands have been run and checked. They are the harness: if one fails, the work is not done.

### Short loop — after every change

```bash
{{TYPECHECK_COMMAND}}   # {{TIME}}
{{LINT_COMMAND}}        # {{TIME}}
{{UNIT_TESTS_COMMAND}}  # {{TIME}}
```

### Long loop — before opening the PR

```bash
{{BUILD_COMMAND}}       # {{TIME}}
{{FULL_TESTS_COMMAND}}  # {{TIME}}
{{E2E_COMMAND}}         # {{TIME}}
```

### Known reds

{{LIST of commands that currently fail for causes predating the agent, with the number of failures.
This lets the agent distinguish what it broke from what was already broken.
If there are none, write: "None. The entire harness is green as of {{DATE}}."}}

## Conventions

Detected by reading existing code, not imposed from outside:

- {{CONVENTION_1}}
- {{CONVENTION_2}}
- {{CONVENTION_3}}

## Boundaries

What the agent must not touch without explicit permission:

- Database migrations and schema
- Deployment and infrastructure configuration files
- Dependencies: do not add or update packages without asking first
- Secrets, `.env` files, and credentials
- {{PROJECT_SPECIFIC_BOUNDARY}}

## Definition of done

A task is done when:

1. The short loop passes green.
2. The long loop passes green.
3. Every acceptance criterion in the spec has evidence: which command proves it and what its output was.
4. The diff contains nothing the spec did not request.

Point 4 is the one most often missed. Extra code is code without a contract.
