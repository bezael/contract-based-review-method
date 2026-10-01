# AGENTS.template.md

> Template for a repository's **permanent contract**: what an agent needs to
> know before touching a line, and what it must not touch without permission.
> Copy it to the root of the repo as `AGENTS.md` and replace it entirely.
>
> This is not documentation. It is the file that decides whether you can trust
> the diff without reading it. When the agent does something you did not want,
> the answer is almost always "that was not in here".

## How to use it

1. Copy this file to the repo root and rename it to `AGENTS.md`.
2. With Claude Code, also create `CLAUDE.md` with a single line: `@AGENTS.md`.
   One contract, two doors into it.
3. **Run every command before writing it down.** This is the golden rule and it
   has no exceptions: a harness with invented commands is worse than no harness,
   because the agent thinks it is verified and so do you.
4. Everything between `{{ }}` is filled with data **verified in Phase 1**. If a
   datum could not be verified, do not write it: leave it out and report it as a
   gap.
5. Delete every instruction quote (lines starting with `>`) and every
   `[CHANGE]` / `[COPY]` / `[FIXED FORMAT]` marker. None of them survive into
   the final `AGENTS.md`.
6. Run the checklist at the end, then delete it too.

### Markers used in this template

| Marker | Meaning |
|---|---|
| `{{LIKE_THIS}}` | Your data. If you did not verify it, do not write it. |
| `> Block quote` | Instruction for you. Delete before committing. |
| **[CHANGE]** | Rewrite the whole section. Copying it as-is is lying in the contract. |
| **[COPY]** | Portable across repos. Change it only if you know why. |
| **[FIXED FORMAT]** | Scripts and hooks parse it. Change the content, never the structure. |

### How long it should be

Two screens. Past roughly 150 lines nobody reads it — not the new teammate, not
the agent with a full context window. What does not fit goes to `docs/` and is
linked from here.

---

<!-- ↓↓↓ Everything below this line is what you copy into AGENTS.md ↓↓↓ -->

# AGENTS.md

> **[CHANGE]** Two or three sentences: what this project is, who it is for and
> — above all — **what it is NOT**. That last part disarms expensive
> assumptions. A real example: "It is not public: all traffic comes through the
> gateway, so there is no authentication or rate limiting here, and none should
> be added." Without that sentence the agent adds auth "just in case" and you
> find out during review.

{{WHAT THIS PROJECT IS. WHAT IT DOES AND WHO USES IT.}}

{{WHAT IT IS NOT. WHAT A WELL-MEANING CONTRIBUTOR MIGHT ADD AND MUST NOT.}}

This file is the permanent contract of the repo. Each task's contract lives in
`specs/<slug>/spec.md`.

## Stack — [CHANGE]

> Exact versions, not ranges. And say where each datum comes from: the package
> manager is derived from the lockfile, not from team habit. If there are two
> lockfiles, that is your first bug.

- **Language:** {{LANGUAGE_AND_VERSION}}, {{RUNTIME_AND_VERSION}}
- **Framework:** {{FRAMEWORK_AND_VERSION}}
- **Package manager:** {{MANAGER}} — derived from `{{LOCKFILE}}`. Do not use another.
- **Persistence:** {{DATABASE / ORM / WHERE THE FILE OR CONNECTION LIVES}}
- **Tests:** {{RUNNER_AND_VERSION}}, {{HOW THEY ARE ORGANIZED}}
- **Lint / format:** {{TOOL}}, configuration in `{{FILE}}`

## How we work — [COPY], with step 5 made your own

1. Every task starts from an Issue and is signed off in `specs/<slug>/spec.md`
   before any code is written (template in `specs/spec.template.md`).
2. The branch is named `feat/<slug>`, `fix/<slug>` or `refactor/<slug>`. The
   slug matches the spec folder, so the guardrail and the verdict know which
   contract applies.
3. Implement only what the spec asks for, inside its modification scope.
4. Before opening the PR: `{{VERDICT_COMMAND}} specs/<slug>/spec.md`. What comes
   out of it is what the reviewer reads, instead of the diff.
5. {{THE REPO RITUAL THAT ALWAYS GETS FORGOTTEN AND BREAKS THE TESTS:
   regenerating the ORM client after switching branches, starting a container,
   seeding the DB. Write the symptom too, so it is recognizable: "otherwise the
   tests fail with 'no such column'".}}

## Verification — [CHANGE] the commands, [FIXED FORMAT] the structure

> The two loops are not decoration. The agent runs the short one on its own
> after every change, which is why it must stay under 60 seconds: any slower and
> it stops running it. The long one is the gate for the PR.
>
> Every command carries its measured time, not an estimate. And every one of
> them was run by you before it appeared here.

These commands have been run and checked. They are the harness: if one fails,
the work is not done. Times measured warm; the first run takes twice as long.

### Short loop — after every change

```bash
{{TYPECHECK_COMMAND}}   # {{N}}s
{{LINT_COMMAND}}        # {{N}}s
{{UNIT_TESTS_COMMAND}}  # {{N}}s
```

### Long loop — before opening the PR

```bash
{{BUILD_COMMAND}}       # {{N}}s
{{FULL_TESTS_COMMAND}}  # {{N}}s
{{SMOKE_E2E_COMMAND}}   # {{N}}s
```

### Task verdict

```bash
{{VERDICT_COMMAND}} specs/<slug>/spec.md   # runs every criterion and checks the scope
```

### Known reds

> What already failed before the agent arrived, with the number of failures. It
> lets the agent tell what it broke from what was already broken. An honest
> harness with two reds is worth more than a fake green one.
>
> If there are none, say so with a date: "None. The entire harness is green as
> of {{YYYY-MM-DD}}. If something fails, you broke it." That last sentence takes
> away the "it was already like that" excuse.

{{LIST OF KNOWN REDS, WITH THEIR COMMAND AND FAILURE COUNT · OR THE SENTENCE ABOVE WITH ITS DATE}}

## Conventions — [CHANGE]

> This is where most people write wishes instead of facts. Conventions are
> **detected by reading your code**, not imported from a style guide. Open five
> or ten real files and write down what is already being done.
>
> Each bullet: what is done, where it lives, and why — or what happened the time
> someone did not. The "why" is what stops the agent from negotiating it.
>
> Categories that almost always yield a useful convention: which layer may talk
> to which · domain errors · delicate types (money, dates, ids) · where input is
> validated · where tests live and how they are isolated · naming and language
> of the code.

Detected by reading existing code, not imposed from outside:

- {{WHICH LAYER MAY TALK TO WHICH. E.g.: route handlers never touch the ORM; they go through a service.}}
- {{HOW DOMAIN ERRORS ARE SIGNALLED, and what it means to bypass that.}}
- {{THE TYPE THAT HAS ALREADY BITTEN YOU: money, dates, time zones, ids.}}
- {{WHERE INPUT IS VALIDATED AND WHAT EACH LAYER ASSUMES IS ALREADY VALID.}}
- {{WHERE TESTS LIVE AND HOW THEY ARE ISOLATED FROM EACH OTHER.}}
- {{NAMING AND LANGUAGE: what is named in what, and by which rule.}}

## Límites — [FIXED FORMAT]

> Yes, the heading stays in Spanish when you use the guardrail hook from this
> repo: `boundaries()` in `scripts/lib/spec.mjs` looks for the literal section
> `## Límites`. Rename the heading to `## Boundaries` and the hook silently
> protects nothing. If you want it in English, change the string in
> `scripts/lib/spec.mjs` **and** in `.claude/hooks/guard-boundaries.mjs`, then
> verify with the command in the checklist below.
>
> The rest of the format, because a machine reads it:
>
> - **One path per bullet, in backticks, and only the first one on the line
>   counts.** Write "- `a.ts` and `b.ts`" and only `a.ts` ends up protected.
> - No spaces inside the path.
> - Globs are supported: `folder/` (everything under it), `*`, `**`, `?`. For a
>   family of files use `.env*` in one bullet instead of two.
> - The text after the backticks is for humans: put the reason there. Boundaries
>   that are explained get argued about less.
>
> The bullets below are the portable minimum: point them at your repo's paths,
> but do not drop them. The one that is really yours is the file that has
> already bitten the team.

Without explicit permission in the task spec, the agent does not touch. One path
per bullet: the hook only reads the first one on each line.

- `{{path/to/migrations/}}` — a migration is always reviewed by hand.
- `{{path/to/schema}}` — the schema changes with a person present.
- `{{.github/workflows/}}` — CI and deployment.
- `{{manifest}}` — no dependencies are added or updated. If one is needed, stop and ask.
- `{{lockfile}}` — same, and it does not get regenerated "along the way".
- `{{.env*}}` — credentials.
- `{{path/to/the/file/that/bit/you}}` — {{why touching it hurts}}.
- `{{path/to/the/harness}}` — whoever receives the verdict does not edit whoever issues it.
- The assertions of tests that already exist. Adding new tests, yes. Changing
  the ones that were already there, no: that is fixed separately and by hand.

> **[COPY]** the paragraph below if you have the hook installed. Delete it if
> you do not: promising a fence that does not exist is worse than declaring a
> sign.

These boundaries are not just a sign: the `.claude/hooks/guard-boundaries.mjs`
hook blocks writes to the paths in this list unless the active spec includes
them in its scope.

## Definition of done — [COPY]

A task is done when:

1. The short loop passes green.
2. The long loop passes green.
3. Every acceptance criterion in the spec has evidence: which command proves it
   and what its output was.
4. The diff contains nothing the spec did not request.

Point 4 is the one most often missed. Extra code is code without a contract.

<!-- ↑↑↑ Everything above this line is what you copy into AGENTS.md ↑↑↑ -->

---

## Before you call your AGENTS.md done — delete this section

- [ ] **No placeholder left.** `grep -n "{{" AGENTS.md` returns nothing.
- [ ] **No template instructions left.** No help quotes, no `[CHANGE]`,
      `[COPY]`, `[FIXED FORMAT]` markers, no cut comments.
- [ ] **Every command was run**, with its real time next to it. None copied from
      another repo or inferred from the manifest.
- [ ] **The short loop stays under 60 seconds.** If not, move something into the
      long loop.
- [ ] **The parser can see your boundaries.** If you copied the harness from
      this repo, do not eyeball it — print them:

  ```bash
  node -e "import('./scripts/lib/spec.mjs').then(m => console.log(m.boundaries(require('fs').readFileSync('AGENTS.md', 'utf8'))))"
  ```

  What it prints is **the only thing** the fence protects. Count the bullets in
  your `## Límites` section: fewer paths printed than written means two of them
  share a line. Anything missing from that list is a sign, not a boundary.
- [ ] **The conventions come from your code**, not from your good intentions:
      each one can be pointed at a file and a line.
- [ ] **It fits in two screens**, and an agent with no other context can start
      from this file alone.
