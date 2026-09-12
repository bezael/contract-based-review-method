# Issues to practise on

Ten real tasks on this API, in three levels. None of them comes with the spec
written: writing it is half the exercise (Module 2). Pick one, open the branch
with its slug and reproduce the whole cycle without following the instructor:
contract → lane → implementation → verdict → review → PR.

| # | Type | Task | Level | Touches boundaries |
|---|---|---|---|---|
| 01 | feature | Void an issued invoice | ★☆☆ | no |
| 02 | feature | Record payments and move to PAID | ★★☆ | migration |
| 03 | feature | List invoices with filters and pagination | ★★☆ | no |
| 04 | feature | Tax-exempt lines | ★★☆ | migration |
| 05 | bug | A price with a single decimal is stored wrong | ★☆☆ | `money.ts` |
| 06 | bug | Issuing twice changes the invoice number | ★☆☆ | no |
| 07 | refactor | Extract numbering into its own service | ★★☆ | no |
| 08 | architecture | Status change history | ★★★ | migration |
| 09 | feature | Credit notes | ★★★ | migration (and it has to be split) |
| 10 | cross-cutting | Request id in responses and logs | ★★☆ | no |

`00-invoice-discount-demo.md` is the feature built in front of you during the
workshop. It is here so you can repeat it on your own.

## Publishing them in your fork

With `gh` authenticated and the repo pointing at your fork:

```bash
bash scripts/create-issues.sh
```

It creates one Issue per file, with its label. `scripts/create-issues.sh --dry-run`
only shows what it would do.

## Recommended order

Start with 06 (small bug, no boundaries), continue with 01 (feature with no
migration) and then 05 (it forces you to authorize a boundary in the spec).
From there, whichever one looks most like your own work.
