# Round 1 and round 2, side by side (generated)

Generated 2026-11-03T04:07:48.376Z by eval/compare-rounds.mjs. Every number is computed from the per-run files; none is typed. **A probe, not a study: three runs per cell, twelve per arm over T1 to T4, no significance claims.** Contrast is not covered anywhere. The only thing that changed between the rounds is arm B's AGENTS.md; arm A is identical in both, so its change from round 1 to round 2 is the noise band.

## Held-out T5 (first, because it is the only measure of whether the change generalises)

Not folded into any mean below. Scores are listed run by run, since there are only three per arm per round.

| Arm | Round 1 | Round 2 | Change |
|---|---|---|---|
| A: kit plus its human docs | 0.875 (min 0.875, max 0.875, n=3); scores 0.875, 0.875, 0.875 | 0.736 (min 0.444, max 0.889, n=3); scores 0.875, 0.444, 0.889 | -0.139 |
| B: kit plus its human docs plus agent guidance | 0.900 (min 0.900, max 0.900, n=3); scores 0.900, 0.900, 0.900 | 0.967 (min 0.900, max 1.000, n=3); scores 1.000, 0.900, 1.000 | +0.067 |

- Round 1, arm A, T5 rules that failed (runs): R4 (3).
- Round 1, arm B, T5 rules that failed (runs): R7 (3).
- Round 2, arm A, T5 rules that failed (runs): R4 (2), R7 (2), R1 (1), R2 (1), R3 (1).
- Round 2, arm B, T5 rules that failed (runs): R7 (1).

## T1 to T4 per arm

| Arm | Round 1 | Round 2 | Change |
|---|---|---|---|
| A: kit plus its human docs | 0.956 (min 0.889, max 1.000, n=12) | 0.936 (min 0.750, max 1.000, n=12) | -0.020 |
| B: kit plus its human docs plus agent guidance | 0.991 (min 0.889, max 1.000, n=12) | 1.000 (min 1.000, max 1.000, n=12) | +0.009 |

### Per task (mean of three runs)

| Task | A round 1 | A round 2 | A drift | B round 1 | B round 2 | B change |
|---|---|---|---|---|---|---|
| T1 | 1.000 | 1.000 | +0.000 | 1.000 | 1.000 | +0.000 |
| T2 | 0.889 | 0.926 | +0.037 | 0.963 | 1.000 | +0.037 |
| T3 | 1.000 | 0.917 | -0.083 | 1.000 | 1.000 | +0.000 |
| T4 | 0.933 | 0.900 | -0.033 | 1.000 | 1.000 | +0.000 |

## Noise band (arm A) and arm B's change

Arm A runs identically in both rounds, so how far it moves is how far an unchanged arm moves by chance. Arm B's change only means something against that.

- Arm A, T1 to T4 mean: 0.956 then 0.936, drift -0.020. Largest single-task drift: T3 -0.083.
- Arm B, T1 to T4 mean: 0.991 then 1.000, change +0.009.
- Arm B's change minus arm A's drift: +0.029. Arm B started at 0.991 out of a maximum of 1.000, so it has at most 0.009 of headroom on this measure.
- T5 (held out): arm A drift -0.139, arm B change +0.067.

## Did the agent open the files that are not auto-loaded?

Counted from each run's trace.json (a Read of that file name). Arm A has no DESIGN.md or registry.json in its folder, so a count there is a failed read of a file that is not there.

| | Arm | Round 1 | Round 2 |
|---|---|---|---|
| DESIGN.md | A | 0 of 12 (T1 to T4); T5 0 of 3 | 0 of 12 (T1 to T4); T5 0 of 3 |
| DESIGN.md | B | 0 of 12 (T1 to T4); T5 0 of 3 | 0 of 12 (T1 to T4); T5 0 of 3 |
| registry.json | A | 0 of 12 (T1 to T4); T5 0 of 3 | 0 of 12 (T1 to T4); T5 0 of 3 |
| registry.json | B | 12 of 12 (T1 to T4); T5 2 of 3 | 1 of 12 (T1 to T4); T5 0 of 3 |

## Token lookups and tool calls (T1 to T4)

Counted from each run's trace.json, T1 to T4 only. A run counts once if it made at least one matching call. The Grep column counts calls whose path contains tokens.css, so a Grep with no path, or on a folder, is not counted.

| Measure | A round 1 | A round 2 | B round 1 | B round 2 |
|---|---|---|---|---|
| Runs with a Grep whose path contains tokens.css | 2 of 12 | 3 of 12 | 6 of 12 | 11 of 12 |
| Runs with a Read of registry.json | 0 of 12 | 0 of 12 | 12 of 12 | 1 of 12 |
| Total tool calls | 134 | 125 | 124 | 102 |

## Invented tokens (R3)

Names written as var(--nil-...) that are not in tokens.css, with how many runs used each.

- Arm A, round 1: T1 to T4 none; T5 none.
- Arm A, round 2: T1 to T4 --nil-space-2 (1); T5 --nil-primitive-color-danger-fg (1).
- Arm B, round 1: T1 to T4 --nil-type-scale-md (1); T5 none.
- Arm B, round 2: T1 to T4 none; T5 none.

## Rule failures (T1 to T4), runs failing each rule

| Rule | A round 1 | A round 2 | B round 1 | B round 2 |
|---|---|---|---|---|
| R1 | 3 | 2 | 0 | 0 |
| R3 | 0 | 1 | 1 | 0 |
| R4 | 2 | 4 | 0 | 0 |

## Which guidance each round's arm B actually ran with

- Round 1: 15 of 15 arm B runs record guidance round 1 with all four sha256 hashes equal to eval/guidance/round-1/ on disk. AGENTS.md b5dba409ff2dc719...
- Round 2: 15 of 15 arm B runs record guidance round 2 with all four sha256 hashes equal to eval/guidance/round-2/ on disk. AGENTS.md 384d8badfbe14857...
- AGENTS.md: differs between the rounds.
- CLAUDE.md: byte-identical in both rounds.
- DESIGN.md: byte-identical in both rounds.
- registry.json: byte-identical in both rounds.

## Counts, cost and the plan's usage windows

- **Round 1**: 30 scored runs (T5 included); not run: none; excluded attempts: none; ended: completed (30).
  Wall-clock 966 s, $2.73 as the CLI reports it (an API-price equivalent, not a bill). Five-hour window 0% at the start, 28% at the end; seven-day 28% at the start, 31% at the end.
- **Round 2**: 30 scored runs (T5 included); not run: none; excluded attempts: none; ended: completed (30).
  Wall-clock 921 s, $2.55 as the CLI reports it (an API-price equivalent, not a bill). Five-hour window 0% at the start, 28% at the end; seven-day 35% at the start, 37% at the end.

