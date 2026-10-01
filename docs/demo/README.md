# The verdict demo

The agent delivers, verification fails, and the screen shows which clause of
the contract broke. This folder lets you reproduce the Module 5 demo on your
own machine.

## What has to be visible

Three broken clauses, of three different kinds, in a single run of
`pnpm verdict`:

| Clause | How it breaks | How the verdict shows it |
|---|---|---|
| Acceptance criterion (half-up rounding) | The implementation uses `Math.floor` for the discount | `4  FAIL` with the vitest output (`- 1 / + 0`). It drags criterion 6 down with it, because the full suite includes that test |
| Modification scope | `discount()` is added to `src/lib/money.ts`, which is inside the boundaries | `OUT_OF_SCOPE  src/lib/money.ts ← not included in the spec scope` |
| Existing assertions | `minItems: 1` is removed from the route schema, the existing test goes red, and its two `expect`s are changed so it passes | `MODIFIED  src/routes/invoices.test.ts: expect(response.statusCode).toBe(400)` (and the error one) |

The full output is in `verdict-output.txt`:

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
| `solution.patch` | The correct implementation: schema, migration, service, route and tests |
| `verdict.patch` | The delivery with the three broken clauses |
| `verdict-output.txt` | What `pnpm verdict` prints with the broken patch applied |

The patches do not include `specs/`: the spec is copied separately.

## Reproduce it

1. Starting branch with the signed spec:
   ```bash
   git checkout -b feat/invoice-discount main
   mkdir -p specs/invoice-discount
   cp docs/demo/invoice-discount-spec.md specs/invoice-discount/spec.md
   git add specs && git commit -m "docs(spec): invoice discount contract"
   ```
2. Apply the "agent's" implementation with the three broken clauses:
   ```bash
   git apply --check docs/demo/verdict.patch   # has to print nothing
   git apply docs/demo/verdict.patch
   pnpm db:generate                              # the patch changes the Prisma schema
   ```
3. Run the verdict and compare it with `verdict-output.txt`:
   ```bash
   pnpm verdict specs/invoice-discount/spec.md
   ```
   The path is optional when the branch is named like the spec folder
   (`feat/invoice-discount` → `specs/invoice-discount/`).
4. Fix it yourself, or with `/ak-verdict`, until it says PASS. To compare with
   the reference implementation: `git checkout -- . && git clean -fd`, then
   `git apply docs/demo/solution.patch`.

If `git apply --check` complains, your `main` has moved past the one the
patches were made against: apply them on a fresh clone.
