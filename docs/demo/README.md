# The verdict demo

The standalone video on the critical path: the agent delivers, verification
fails, and the screen shows which clause of the contract broke. No cuts. It is
the CTA in the middle of the ebook (chapter 5) and the material expanded in the
webinar.

## What has to be visible

Three broken clauses, of three different kinds, in a single run of
`pnpm verdict`:

| Clause | How it breaks | How the verdict shows it |
|---|---|---|
| Acceptance criterion (half-up rounding) | The implementation uses `Math.floor` for the discount | `4  FAIL` with the vitest output (`- 1 / + 0`). It drags criterion 6 down with it, because the full suite includes that test |
| Modification scope | `discount()` is added to `src/lib/money.ts`, which is inside the boundaries | `OUT_OF_SCOPE  src/lib/money.ts ← not included in the spec scope` |
| Existing assertions | `minItems: 1` is removed from the route schema, the existing test goes red, and its two `expect`s are changed so it passes | `MODIFIED  src/routes/invoices.test.ts: expect(response.statusCode).toBe(400)` (and the error one) |

The full output, exactly as it appears on screen, is in `verdict-output.txt`:

```
Result: FAIL · 2 failed criteria · 1 file out of scope · 2 existing assertions modified
```

And then the fix: `money.ts` is reverted, `minItems` and the assertions are
restored, `percentage()` is used with half-up rounding, and `pnpm verdict` turns
to PASS. What you read is the table, not the diff.

## Files

| File | What it is |
|---|---|
| `invoice-discount-spec.md` | The signed reference contract (the one written live in Module 2) |
| `solution.patch` | The correct implementation against `main`: schema, migration, service, route and tests. Same content as the `feat/invoice-discount` branch |
| `verdict.patch` | The delivery with the three broken clauses, against `main` |
| `verdict-output.txt` | What `pnpm verdict` prints with the broken patch applied |

The patches do not include `specs/`: the spec is copied separately, because by
the time the recording reaches this point it already exists.

## Preparation

1. Starting branch with the signed spec:
   `git checkout -b feat/invoice-discount main`, copy
   `docs/demo/invoice-discount-spec.md` to `specs/invoice-discount/spec.md`
   and commit. (Or just `git checkout grabacion/m2-fin`.)
2. Apply the "agent's" implementation with the three broken clauses:
   ```bash
   git apply --check docs/demo/verdict.patch   # has to print nothing
   git apply docs/demo/verdict.patch
   pnpm db:generate                              # the patch changes the Prisma schema
   ```
3. Check cold that `pnpm verdict` shows the same thing as `verdict-output.txt`.
   If `main` moved and the patch no longer applies, regenerate it (see below).

To record live with the real agent: launch it with the spec and
`prompts/scoped-implementation.md`. If it behaves on the first try (it often
does), show the PASS and then apply the patch as "what it gave me on another
run". The honest thing is to say so out loud: *"this is what it handed me
yesterday"*.

## Script (5-7 minutes)

1. **Contract on screen** (30 s). The criteria table of the spec. Read criterion
   4 and the scope out loud. "This is what I signed before it wrote a line."
2. **The diff, without reading it** (20 s). `git diff --stat`. "Seven files, a hundred-odd
   lines. This is where my two hours used to start."
3. **The verdict** (60 s). `pnpm verdict specs/invoice-discount/spec.md`. Wait
   for it to finish. Read the three red lines out loud.
4. **What each one means** (2 min). The criterion: the agent rounded down, the
   contract said half-up. The scope: it touched `money.ts`, which is inside the
   boundaries, and the hook did not stop it because the agent wrote it with a
   shell command, which is why the "detected" layer exists. The assertion: it
   changed the exam to pass it. "I would not have caught any of the three on
   line 230 at eleven at night."
5. **The fix** (2 min). Revert `money.ts`, restore the assertion, use
   `percentage()`. `pnpm verdict` again: PASS. `--write` and show the table in
   the spec. "This is what goes in the PR. This is what I read."
6. **Closing** (20 s). "Twenty minutes. And I know which clause broke before I
   open the diff."

## Regenerating the patches

From the branch with the correct solution (`feat/invoice-discount`, tag
`grabacion/m4-fin`):

```bash
git checkout feat/invoice-discount
git diff main -- . ':!specs' > docs/demo/solution.patch

# introduce the three breakages by hand:
#   1. add to src/lib/money.ts:  export function discount(c, pct) { return Math.floor((c * pct) / 100) }
#      and use it in src/services/invoices.ts instead of percentage()
#   2. remove `minItems: 1` from the schema in src/routes/invoices.ts
#   3. in src/routes/invoices.test.ts, rename "rejects an invoice with no lines with 400"
#      to "accepts an invoice with no lines" and change its two expects (201 and empty lines)
git diff main -- . ':!specs' > docs/demo/verdict.patch
node scripts/verdict.mjs > docs/demo/verdict-output.txt 2>&1
git checkout -- .
```

Write both patches to a file outside the repo first and move them in
afterwards: writing them straight into `docs/demo/` makes the second diff
include the first patch.

The patches are against `main`. If `main` moves forward, regenerate them and
run `git apply --check` again.
