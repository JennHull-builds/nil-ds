# Round 2 summary (generated)

Generated 2026-11-02T17:52:36.020Z by eval/summarise.mjs. Every number below is computed from the per-run files; none is typed. **This is a probe, not a study: no significance claims.** 24 scored runs. Model: claude-sonnet-5-5. Contrast is not covered anywhere (axe asserts semantics and ARIA only).

## Score per arm

Run score = rules passed / rules that apply. Arm score = mean of its runs.

| Arm | Scored runs | Mean | Min | Max | Not run |
|---|---|---|---|---|---|
| A: kit plus its human docs | 12 | 0.94 | 0.75 | 1.00 | 0 |
| B: kit plus its human docs plus agent guidance | 12 | 1.00 | 1.00 | 1.00 | 0 |

## Mean score per task

| Task | A: kit plus its human docs | B: kit plus its human docs plus agent guidance |
|---|---|---|
| T1 | 1.00 (n=3) | 1.00 (n=3) |
| T2 | 0.93 (n=3) | 1.00 (n=3) |
| T3 | 0.92 (n=3) | 1.00 (n=3) |
| T4 | 0.90 (n=3) | 1.00 (n=3) |

## Pass rate per rule

Pass / (pass + fail). A rule that inspected nothing in a run is n/a for that run and is left out.

| Rule | A | B |
|---|---|---|
| R1 | 67% (4/6), n/a in 6 | 100% (6/6), n/a in 6 |
| R2 | 100% (12/12) | 100% (12/12) |
| R3 | 92% (11/12) | 100% (12/12) |
| R4 | 67% (8/12) | 100% (12/12) |
| R5 | 100% (3/3), n/a in 9 | 100% (3/3), n/a in 9 |
| R6 | 100% (12/12) | 100% (12/12) |
| R7 | 100% (12/12) | 100% (12/12) |
| R8 | 100% (12/12) | 100% (12/12) |
| R9 | 100% (12/12) | 100% (12/12) |
| R10 | 100% (12/12) | 100% (12/12) |

## Invented tokens (R3)

Names written as var(--nil-...) that do not exist in tokens.css, with how many runs used each.

- **A:** `--nil-space-2` (1)
- **B:** none

## Did arm B open the files that are not auto-loaded?

Of 12 arm B runs: DESIGN.md opened in 0, registry.json in 1, AGENTS.md in 0 (AGENTS.md arrives through CLAUDE.md without being opened; DESIGN.md and registry.json arrive only if Claude reads them).

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
- Arm B first-turn prompt larger than arm A's, median gap in tokens per task: T1 4209, T2 4207, T3 4209, T4 4207. A run whose first prompt was outside its cell's calibrated size was excluded as it happened.

## Cost and usage

24 runs: 707 s of wall-clock time, $2.05 as the CLI reports it (an API-price equivalent, not a bill; the runs draw on a Claude plan). Tokens: 246 input, 68707 output, 1243434 cache read, 310762 cache write.
Plan usage windows as reported in the stream, first to last run: five-hour 0% to 26%, seven-day 35% to 37%.

## Held-out task T5 (its own line, not in the means above)

| Arm | Scored runs | Mean | Min | Max |
|---|---|---|---|---|
| A: kit plus its human docs | 3 | 0.74 | 0.44 | 0.89 |
| B: kit plus its human docs plus agent guidance | 3 | 0.97 | 0.90 | 1.00 |
