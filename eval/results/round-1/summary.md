# Round 1 summary (generated)

Generated 2026-11-02T12:55:01.651Z by eval/summarise.mjs. Every number below is computed from the per-run files; none is typed. **This is a probe, not a study: no significance claims.** 24 scored runs. Model: claude-sonnet-5-5. Contrast is not covered anywhere (axe asserts semantics and ARIA only).

## Score per arm

Run score = rules passed / rules that apply. Arm score = mean of its runs.

| Arm | Scored runs | Mean | Min | Max | Not run |
|---|---|---|---|---|---|
| A: kit plus its human docs | 12 | 0.96 | 0.89 | 1.00 | 0 |
| B: kit plus its human docs plus agent guidance | 12 | 0.99 | 0.89 | 1.00 | 0 |

## Mean score per task

| Task | A: kit plus its human docs | B: kit plus its human docs plus agent guidance |
|---|---|---|
| T1 | 1.00 (n=3) | 1.00 (n=3) |
| T2 | 0.89 (n=3) | 0.96 (n=3) |
| T3 | 1.00 (n=3) | 1.00 (n=3) |
| T4 | 0.93 (n=3) | 1.00 (n=3) |

## Pass rate per rule

Pass / (pass + fail). A rule that inspected nothing in a run is n/a for that run and is left out.

| Rule | A | B |
|---|---|---|
| R1 | 63% (5/8), n/a in 4 | 100% (7/7), n/a in 5 |
| R2 | 100% (12/12) | 100% (12/12) |
| R3 | 100% (12/12) | 92% (11/12) |
| R4 | 83% (10/12) | 100% (12/12) |
| R5 | 100% (3/3), n/a in 9 | 100% (2/2), n/a in 10 |
| R6 | 100% (12/12) | 100% (12/12) |
| R7 | 100% (12/12) | 100% (12/12) |
| R8 | 100% (12/12) | 100% (12/12) |
| R9 | 100% (12/12) | 100% (12/12) |
| R10 | 100% (12/12) | 100% (12/12) |

## Invented tokens (R3)

Names written as var(--nil-...) that do not exist in tokens.css, with how many runs used each.

- **A:** none
- **B:** `--nil-type-scale-md` (1)

## Did arm B open the files that are not auto-loaded?

Of 12 arm B runs: DESIGN.md opened in 0, registry.json in 12, AGENTS.md in 0 (AGENTS.md arrives through CLAUDE.md without being opened; DESIGN.md and registry.json arrive only if Claude reads them).

## Ref on a kit component

Runs where Claude put a ref on a kit component (the kit's Button does not forward refs): A 0, B 0.

## How runs ended

A run that hit the turn cap or the ten-minute timeout is scored on what it wrote. These are counted apart so a 0 from a timeout never reads like a 0 from bad code.

| Arm | completed | max_turns | timeout | turn-cap-runner |
|---|---|---|---|---|
| A | 12 | 0 | 0 | 0 |
| B | 12 | 0 | 0 | 0 |

No run scored 0.

## Not run, and excluded attempts

Runs not run, by reason: none.

Attempts excluded, by reason (counts every attempt that produced no score, including ones that were retried and then succeeded): none.



Runs that were not run are excluded from every mean above.

## Validity checks

- Runs where Claude changed a kit file outside eval-output/: 0.
- Arm B first-turn prompt larger than arm A's, median gap in tokens per task: T1 3783, T2 3783, T3 3783, T4 3783. A run whose first prompt was outside its cell's calibrated size was excluded as it happened.

## Cost and usage

24 runs: 777 s of wall-clock time, $2.23 as the CLI reports it (an API-price equivalent, not a bill; the runs draw on a Claude plan). Tokens: 260 input, 74309 output, 1412227 cache read, 337416 cache write.
Plan usage windows as reported in the stream, first to last run: five-hour 0% to 26%, seven-day 28% to 30%.
