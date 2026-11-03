# NIL DS eval: does the agent guidance make Claude use the system correctly?

This measures one thing. Claude is given a real UI task and the NIL DS kit, once with the kit's
agent guidance and once without. A deterministic checker then scores what it wrote against the
kit's own rules. No AI judge anywhere: every score can be recomputed by running the checker again.

It is a probe, not a study. Three runs per task per arm. There are no significance claims.

```
git archive 094d15b ──▶ fresh temp kit (outside the repo, never the working tree)
        │ arm A: strip AGENTS.md, CLAUDE.md, DESIGN.md, registry.json, design-md/
        │ arm B: arm A + the four files from eval/guidance/round-N/ (N = 1 in round 1, 2 in round 2)
        ▼
claude -p  (Sonnet, 5 tools, project settings only) ──writes──▶ eval-output/Result.tsx
        │ session ends; scoring uses a FRESH copy of the kit plus eval-output/ only
        ▼
check.mjs  R1..R10 ──▶ score.json, trace.json, meta.json ──▶ summarise.mjs ──▶ summary.md
```

## The question, and what the two arms are

Does the agent layer (`CLAUDE.md`, `AGENTS.md`, `DESIGN.md`, `registry.json`) add anything over the
docs a design system already ships for humans? A real system has human docs, so that is the control.

| Arm | Label everywhere | Contains |
|---|---|---|
| A | **kit plus its human docs** | the archived kit minus the four agent files and `design-md/` |
| B | **kit plus its human docs plus agent guidance** | arm A plus the four files from `eval/guidance/round-N/`. Round 1's are byte-identical to commit `094d15b`; round 2 changes `AGENTS.md` only (below) |

**Arm A is not guidance-free, on purpose.** These human docs stay in it, and several state the
token rules in prose. Quoted from the files (checked against `094d15b`):

- `ARCHITECTURE.md` lines 17 to 20: "A component asking for `--nil-primitive-blue-600` is a component
  that breaks when the brand changes" and "The dotted edge is enforced, not advisory", then
  "`tokens:validate` fails on a hardcoded hex or a raw px." That covers R1, R2 and R4.
- `ARCHITECTURE.md` line 74: "**Components reference the token, never a literal.**" (R1, R4)
- `src/tokens/tokens.json`, the `_readme` key: "Components only reference --nil-\*" (R2, R3) and
  "4px default radius (soft brutalist), 2px borders" (R5).
- `README.md` line 35: "Namespace: `--nil-*` (consumer) · `--nil-primitive-*` (raw)" (R2, R3).

So a smaller gap between the arms on R1 to R5 is a finding about how much the human docs already
carry, not a flaw in the harness. R6 to R10 are barely touched by arm A's prose. Arm A also keeps
`PLAN.md`, `APPLY.md`, `FIGMA.md`, the component source and tests, `demo/` and `docs/`.

`CLAUDE.md` in arm B is the one line `@AGENTS.md`, so `AGENTS.md` reaches the model without Claude
opening it. `DESIGN.md` and `registry.json` arrive only if Claude reads them; each run's
`trace.json` records whether it did.

### Round 2: one change, and how to see it

Round 2 changes one thing: arm B's `AGENTS.md`. Arm B's four files come from `eval/guidance/round-2/` (the runner takes `--guidance 2`). Arm A, the kit, the tasks, the rules, the fixtures and the checker are exactly what they were in round 1, so how far arm A moves between the rounds is the noise band. Who chose the change, and what they had seen, is under "Why T5 is sealed".

The change is additions to `AGENTS.md` and nothing removed: four numbered token rules and one paragraph. `diff -u eval/guidance/round-1/AGENTS.md eval/guidance/round-2/AGENTS.md` shows all of it.

- Rule 5: look a token up before using it, never guess. `DESIGN.md`'s tables name colour, border width, breakpoint and motion tokens only, so spacing and type names come from `tokens.css`.
- Rules 6 and 7: the exact spacing and type-scale names, and that the type scale has no `md`.
- Rule 8: the two border-width names.
- Under "When to use what": until the kit has a danger Button, use the primary Button and set only its background and border colour to the danger token through the `style` prop.

Every token name in the added lines exists in the archived `tokens.css`. The other three files are byte-identical to round 1's. The hashes, from `shasum -a 256 eval/guidance/round-1/* eval/guidance/round-2/*`:

```
b5dba409ff2dc719a1985d8c75faca635d6aad9f0ca31382e234be459de1f5ac  eval/guidance/round-1/AGENTS.md
336cc4fbf19beaada7ccf9986414fa91851a8d7a07dfb3ccbe800a69eed0ab49  eval/guidance/round-1/CLAUDE.md
d23f21f2e10210c5991b46d40c541b95274b6f088baa7b9538755a6ee5649d03  eval/guidance/round-1/DESIGN.md
12fdcc67449f6306e1169f45610814f058d4927020d6eb325ad01c30fe7059c6  eval/guidance/round-1/registry.json
384d8badfbe14857476363ddad57c62712e04ee8b9b266e7e58fed4db7eaf807  eval/guidance/round-2/AGENTS.md
336cc4fbf19beaada7ccf9986414fa91851a8d7a07dfb3ccbe800a69eed0ab49  eval/guidance/round-2/CLAUDE.md
d23f21f2e10210c5991b46d40c541b95274b6f088baa7b9538755a6ee5649d03  eval/guidance/round-2/DESIGN.md
12fdcc67449f6306e1169f45610814f058d4927020d6eb325ad01c30fe7059c6  eval/guidance/round-2/registry.json
```

Every arm B `meta.json` records its round's four hashes, and `node eval/compare-rounds.mjs` checks them against these files. Round 2 has its own first-prompt band, because the longer `AGENTS.md` makes arm B's opening prompt about 420 tokens larger (see "Every run guards itself").

## Tasks

`eval/tasks/T1.md` to `T5.md`. The same text in both arms. They never mention tokens, rules or any
guidance file, because that would leak guidance into arm A. Each says what to build, to import from
`'../src'`, not to install anything, and to write `eval-output/Result.tsx` as a default export.

| Task | What it is |
|---|---|
| T1 | Settings panel: heading, three on/off settings, an email field in its error state, Save and Cancel |
| T2 | Delete-project dialog: a trigger, a destructive confirm, a cancel, keyboard only |
| T3 | Chat composer: multi-line box, Enter sends, Shift+Enter adds a line, empty does not send |
| T4 | App shell: sidebar with two sections of links, current page marked, three stats |
| T5 | Project actions menu: a trigger opening Rename, Duplicate, Delete, keyboard only. **Held out.** |

The kit has no dialog, no textarea and no menu, so T2, T3 and T5 force hand-built parts. Those are
judged by the token rules like everything else. The kit's `Button` does not forward refs
(nothing in `src/components` uses `forwardRef`), so a `ref` on it fails R8. The checker does not
adjust for that, and each run records whether Claude tried one.

### Why T5 is sealed

Round 2 will be scored on the same four tasks the guidance fix is tuned on, and a reader would call
that overfitting. T5 runs in both rounds and nobody tuning the guidance sees its outputs, so it
shows whether the fix generalises. Its run folders go to `eval/results-sealed/` (gitignored until round 2 ended; see "After round 2" below).
`summarise.mjs` leaves it out of `summary.json` and `summary.md` and prints only "T5 sealed: N runs
completed". `summarise.mjs --unseal` refuses to run until round 2 has finished, then adds T5 as its
own held-out line, never folded into the four-task mean.

**A hole found after round 1, and closed.** Round 1's console log printed every run's score line as it
finished, T5's included, even though the summary files left T5 out. The person who built the harness read
six T5 pass counts in that log and has not repeated them anywhere. The runner now prints only "T5 sealed"
for a sealed task (no score, time, turns or cost), a stub run shows it, and the T5 lines were moved out of the
round 1 log into `eval/results-sealed/round-1/T5/run-log.txt` (both gitignored), counted rather than read. The
T5 score files were not opened. Nothing else prints a score.

**Who has seen what, for round 2.** The round-1 runner chat saw six T5 pass counts in the console log before the log was fixed (above). Round 2's guidance was chosen by Jen and the track lead from T1 to T4 only, and written by the chat that ran round 2, which never saw those counts and never opened `eval/results-sealed/` or `eval/logs/`. T5's round-1 results stay sealed until round 2 has finished, and `summarise.mjs --unseal` refuses to run before then. The six counts are the one known exception, and they were not part of choosing the guidance.

**After round 2.** T5 stayed sealed until round 2 ended on 2 November 2026. It was committed after the unseal, without `raw/` (the `eval/results*/**/raw/` line in `.gitignore` still covers `eval/results-sealed/`), so readers can open the files the T5 finding below rests on. It is now spent as a held-out task: an earlier chat and the track lead have both read its outputs. A later round needs a new held-out task.

## The ten rules

Each rule reports how many places it inspected. A rule that inspected nothing is `na`, never
`pass`, and is left out of the run's score. Run score = rules passed / rules that apply. R1 to R7
read the code as a syntax tree with the TypeScript compiler API (literals, template strings, JSX
attributes, object-literal style props), never bare regex over the file, and also scan any `.css`
file the subject wrote.

| Rule | What it checks | Source in the kit's `AGENTS.md` |
|---|---|---|
| R1 | no raw colour: hex, `rgb()`, `hsl()`, `oklch()`, named colours. `transparent`, `currentColor` and CSS-wide keywords are allowed | token rule 2; Never list |
| R2 | no `var(--nil-primitive-*)` | token rule 3 |
| R3 | every `var(--nil-*)` exists in the archived `tokens.css`; invented names are listed | token rule 2 |
| R4 | no raw px or rem for padding, margin, gap, inset, border width, font size. 0, % and token-only `calc()` are allowed | Never: "Invent magic pixel values" |
| R5 | border-radius only from `--nil-radius-*` (0 allowed) | Never: "Hardcode corner radius" |
| R6 | imports only from react, react-dom and the kit. Radix, shadcn, MUI, Chakra, Headless UI, Ariakit, React Aria and anything else fail | Never: "Import Radix/shadcn" |
| R7 | at least one import from the kit, and no raw `<button>`, checkbox input or `role="switch"` element where Button or Toggle covers it | "When to use what" |
| R8 | `tsc --noEmit` against the archived kit | (type safety) |
| R9 | axe, in jsdom, no violations | (accessibility) |
| R10 | task behaviour, with Testing Library and user-event (below) | (the task text) |

R10 per task: **T1** the email input is `aria-invalid` and its error text is linked by
`aria-describedby` or `aria-errormessage`. **T2** the trigger opens a dialog with an accessible name,
focus is inside it, Escape closes it and focus returns to the trigger, confirm calls `onConfirm`.
**T3** the textbox has an accessible name, "hello" then Enter calls `onSend("hello")`, Shift+Enter
and Enter on empty do not. **T4** a navigation landmark holds a link with `aria-current="page"`.
**T5** `aria-expanded` is false then true, focus moves into the list, Duplicate is reachable and
chosen by keyboard alone, Escape closes and returns focus; if `role="menu"` is used, ArrowDown must
move focus between items.

**R9 asserts semantics and ARIA only. Contrast is not covered.** With `css: false` jsdom computes
no styles, so axe reports `color-contrast` as incomplete and `toHaveNoViolations` never looks at
incomplete results. Every report says so. R9 scans each top-level element in `body` (the render
container, plus anything portalled out of it), which matches how the kit's own tests call axe on the
container. Scanning `document.body` as one context adds the page-level `region` rule, which does not
apply to a component.

### What the rules do not catch

Two blind spots were found after round 1 by reading the generated files, and a third after round 2 by reading the T5 files. No rule was changed afterwards, on purpose: changing the test after seeing the results would tune it to the answer.

- **R7** looks for a raw `<button>`, an `<input type="checkbox">` and a `role="switch"` element. It does not look at headings or text, so a raw heading or paragraph is not flagged, whether or not the kit has a component for it.
- **R4** covers padding, margin, gap, top, right, bottom, left, inset, font-size and border width. It does not cover width, height (or their min and max), font-weight, letter-spacing or line-height. In the round-1 T1 to T4 files, found by grep and not by the checker, both arms wrote raw numbers there: `width` and `max-width` (for example `width: 240`, `maxWidth: 440`, `width: '16rem'`), `height`, `fontWeight` (600 and 700) and `letterSpacing: '0.08em'`. No raw `line-height` turned up in either arm.
- **R7**, a second gap: it cannot tell a restyled button from a menu item the kit does not have. A kit `Button` with `role="menuitem"` and a `style` override passes. A raw `<button role="menuitem">`, which is how a menu item is normally built when the kit has no menu, fails. Round 2's T5 files show both (see "Notes on the results").

### Two kit gaps round 1 found

These are gaps in the kit, not in the eval. The kit stays frozen at `094d15b` for both rounds, so round 2 measures the guidance and nothing else.

1. **No danger variant on Button.** `Button` has `primary`, `secondary` and `ghost`. All six round-1 T2 files built the destructive confirm from the primary Button plus `--nil-color-danger`. Arm A wrote a raw white text colour in all three of its T2 runs (R1 failed in 3 of 3); arm B wrote none in its three. Round 2's `AGENTS.md` tells arm B how to do it with tokens alone.
2. **The spacing and type scales name their middle step differently.** Spacing has `md`. The type scale has `base` and no `md`. One arm B run (T2, run 1) wrote `var(--nil-type-scale-md)`, and R3 failed on it. It looks like analogy with `--nil-spacing-md`: DESIGN.md was opened in none of the 12 arm B runs, so it was not the source.

## How the checker was broken on purpose

A green result means nothing until the check has been seen to fail.

- **Fixtures** (`eval/fixtures/`): 7 good solutions that must pass all ten rules with places
  inspected, and 18 bad ones, each breaking exactly one rule (R10 once per task, plus sub-behaviours).
  `eval/check.test.ts` asserts a bad fixture's own rule equals `fail` (not merely "not pass", so a
  rule that was switched off and reports `na` cannot slip through) and that no other rule fails.
  The good fixtures also carry every "allowed" case the rules promise: `transparent`, `currentColor`,
  `inherit`, `0`, a percentage, a token-only `calc()`, and a radius of `0`.
- **Mutation**: `CHECKER_DISABLE=R1 npm test` makes the matching fixture tests fail. `npm run
  eval:mutate` does it for all ten rules and prints one line each. `--as na` switches the detector
  off by making the rule report `na` instead of `pass`.
- **Stub subjects** (`--subject stub:good | stub:bad-R3 | stub:none | stub:limit`) run the whole
  pipeline without spending usage. Their output goes to `eval/results-stub/`, which is gitignored.
- `npm test` runs the fixture tests as well (about 12 seconds on top of the kit's own suite).

### Test counts, kept separable

When the eval merges into the kit, the kit's component tests have to stay countable on their own.
Every checker test file lives under `eval/` and matches `eval/**/*.test.ts`. As of 2 November 2026:

| | Tests | Files |
|---|---|---|
| The kit's own (`src/`) | 156 | 21 |
| The eval checker's (`eval/`: `check.test.ts` 171, `guards.test.ts` 22) | 193 | 2 |
| `npm test` runs both | 349 | 23 |

`npm run eval:count` recounts both from the test files, so these numbers can be checked, not trusted.
`npm run eval:test` runs only the eval's.

### The DOM shim (test-only)

jsdom 29.1.1 has `HTMLDialogElement` but no `showModal()`, `show()` or `close()`, no
`showPopover()`, `hidePopover()` or `togglePopover()`, and Escape fires no `cancel` event. A native
`<dialog>` or `popover` answer is the modern correct one, so `eval/behaviour/shim.ts` supplies those
behaviours in the checker's environment, following the HTML spec in outline. It fakes: the dialog
and popover methods and their events, focus moving in on open and back to the opener on close, Escape
closing the topmost modal dialog (after a cancelable `cancel` event) or auto popover, click-outside
light dismiss for popovers, and the `popovertarget` attribute. Because jsdom hides every `[popover]`
element, an open popover is shown with an inline `display` that is removed on hide.

**Focus containment is not checked in jsdom.** The shim does not trap Tab inside a modal, does not make
the page behind a modal inert, and has no top layer or `::backdrop`. A dialog that lets focus escape
passes R10 here. Two good T2 fixtures (a `role="dialog"` div and a native `<dialog>`) and two good T5
fixtures (`role="menu"` and a native popover) pass, and the bad ones still fail.

## The subject, and keeping it isolated

`claude -p --model sonnet --output-format stream-json --verbose --setting-sources project`, plus
`--strict-mcp-config --mcp-config '{"mcpServers":{}}' --disable-slash-commands --settings
'{"permissions":{"blockReadsOutsideWorkingDirectories":true}}'`, with two environment variables set on
its spawn only (below), run with the temp kit as its working directory, sequentially, never in parallel. Tools: Read, Write, Edit, Glob, Grep.
No Bash, no web. Permission mode `dontAsk`, so anything not allowed is denied. Capped at 30 turns and
10 minutes. Probed on CLI 2.1.316 (`eval/isolation.mjs`, `eval/calibrate.mjs`):

- **`--max-turns` is accepted but not listed in `--help`.** A cap of 1 ended a 3-step task with
  `error_max_turns`, and the CLI counted 2 turns, so the cap stops a session once the count
  exceeds N. The runner also counts assistant messages itself.
- **Permission rules.** Allowing `Read`, `Glob` and `Grep` with no path let the subject read, grep
  and glob a file outside its folder. `Read(./**)` alone confines all three to the temp kit, and
  `Write(eval-output/**)` and `Edit(eval-output/**)` confine writes. That is what the runner uses.
- **`--setting-sources project`** keeps the user's `CLAUDE.md`, memory index and hooks out.
- **The empty MCP config** is there because a claude.ai connector (8 tools) appeared once in the
  first probe call and never again in 21 later samples. It could not be shown to remove anything,
  because nothing was there to remove. **`--disable-slash-commands`** empties the registry of skills
  and commands and changes the model's first prompt by 0 to 2 tokens: the model could not see them.
- **The gate** (`npm run eval:isolation`) reports only whether a canary came back, never its value.
  Its main test is the size of the session's first prompt: with the project `CLAUDE.md` it is a known
  small amount above a folder with none, and a user `CLAUDE.md` or memory index adds thousands (the
  positive control, run without `--setting-sources project`, came in about 13,000 tokens higher). The
  model's recall of a planted nonce is reported but is not a pass condition: it missed in samples
  where the prompt size showed the file had loaded.

### Three safety settings, and where they come from

Added 2 November 2026, before round 1. Each was read in Claude Code's own documentation the same day.

| Setting | Where it is set | What the docs say | Source |
|---|---|---|---|
| `DISABLE_AUTOUPDATER=1` | environment of the subject's spawn only (`SUBJECT.env` in `config.mjs`, applied in `lib/claude.mjs`) | "Set to `1` to disable automatic background updates. Manual `claude update` still works." A mid-round update would change the CLI version and with it the first prompt, so the band file would stop being true. | code.claude.com/docs/en/env-vars |
| `ENABLE_CLAUDEAI_MCP_SERVERS=false` | same | "Set to `false` to stop Claude Code from fetching claude.ai MCP servers. Enabled by default for logged-in users." That is the connector seen once in the first probe call. `--strict-mcp-config` stays as well. | code.claude.com/docs/en/env-vars |
| `permissions.blockReadsOutsideWorkingDirectories: true` | `--settings` inline JSON (`SUBJECT.extraFlags`) | "Make the file tools refuse reads outside the working directories in every permission mode." Honoured from any scope; needs Claude Code 2.1.257 or later (the subject runs 2.1.316). | code.claude.com/docs/en/settings-reference and /settings |

The two variables are set only on the subject's `claude` process. Nothing is written to `~/.claude`, to a
shell profile, or to anyone's settings. The setting was also tested alone (`npm run eval:isolation --
permissions`): with only the old rules `Read`, `Glob` and `Grep` and no path, a file outside the folder
was readable and its content reached the model; add the setting and all three were refused.

### The gate's pass-line history

The gate's pass line changed twice on 2 November 2026, each time after a run failed on one line while
everything that mattered passed. Ten gate runs were made with the final flags (the tenth after the three
safety settings above were added). Seven were clean, and each of the three failures was on the line that
was being changed.

The gate was rerun once more on 2 November 2026 with `--guidance 2`, before round 2, so that its arm-integrity step builds arm B from round 2's `AGENTS.md`: clean. The canary probes and the inventory do not use the guidance files.

1. **Recall.** The model had to repeat back a random nonce planted in a project `CLAUDE.md`. In two
   reruns it did not (0 of 3 each), and in both the session's first prompt showed the file had loaded
   in every sample (about 3,090 tokens against about 2,915 for a folder with no `CLAUDE.md`, noise
   about 3). The file was in front of the model and it answered wrongly.
2. **Prompt size, with the answers still required.** Whether project instructions load is a fact about
   what the model was given, so it is now judged by the size of the first prompt. The project file adds
   about 180 tokens; a user `CLAUDE.md` and memory index add thousands (the control run, without
   `--setting-sources project`, came in about 13,000 tokens higher, which shows the check can see a leak).
   One run still failed because the model returned no answer to the nonce question.
3. **Current.** Size is the pass test. Questions `a` and `b`, the two that would reveal a leak, must be
   answered and must come back NONE. The nonce recall is printed as information only.

This makes the gate stronger, not looser: size is exact and has its own positive control, where recall
was neither. The cause of the model's missed recall is not known. It missed in some runs and not others,
with no pattern found.

**Four early misses that cannot be classified.** In the first two gate runs the nonce did not come back in
4 of 19 real-setting samples. The first-prompt size was not recorded for those four, so they cannot be
sorted into "did not load" and "loaded but answered wrongly". Across the ten later runs the model recalled
the nonce in 11 of 30 samples. All 19 misses were sorted by first-prompt size, and in every one the file
had loaded.

### Every run guards itself

1. **The init event.** Exactly the five tools, no MCP server, no non-built-in plugin. Checked the
   moment the session starts, so a bad session is stopped before it costs anything.
2. **The first-turn prompt size.** For one arm and one task the first prompt should be almost the same
   size every run. `eval/band-round-N.json` holds the size measured for each of the ten task and arm cells
   (`node eval/calibrate.mjs band --guidance N`), one file per guidance round, and a run must land within 100
   tokens of the file for its round. Round 1's file is never overwritten; round 2's carries arm A's cells over
   unchanged and re-measures arm B's, which are about 420 tokens larger because `AGENTS.md` grew. Measured noise is a
   few tokens; arm B's prompt is about 3,800 tokens larger than arm A's; a connector is worth thousands.
   Outside the band means something different loaded: arm B without its guidance, or something extra in
   either arm. The band records the CLI version and the runner refuses to run on a different one.
3. **What happens on a breach.** That attempt is excluded and counted by reason, and the run is retried
   once. Two breaches in a row stop the round. A clean scored run resets the count, so one blip at
   01:00 does not cost the night.

### Usage, and what counts as a failed run

The subject signs in with a Claude plan, not an API key (the runner refuses to start if
`ANTHROPIC_API_KEY` is set), so runs draw on the same limits as chat. `total_cost_usd` is an
API-price equivalent, not a bill. The stream carries a `rate_limit_event` with the five-hour and
seven-day utilisation and their reset times; the runner reads it before every run and records it.

- **Five-hour window above 85%** (or the line given by `--max-five-hour N`): wait for its reset time from the
  event, then carry on, as long as that is before `--stop-at`. A round run while someone is using the plan
  lowers the line, for example `--max-five-hour 50`, so the eval takes at most half the window.
- **Seven-day window above 60%:** stop. The remaining runs are recorded as not run, resumable, with the
  reset time in `not-run.json`. The week also has to carry other work.
- **A usage-limit error is not a failed run.** The round stops and the remaining runs are `not run`,
  never zeros, left out of every mean. `--resume` skips runs that already have a `score.json`. The text
  of a real limit error has not been seen; `stub:limit` exercises the path and `isUsageLimit()` in
  `eval/lib/claude.mjs` is the one place to fix if the real text differs.
- **Other infrastructure failures** are retried once, then recorded as `not run`.
- **A timeout** is retried once, then scored on whatever was written (0 if nothing), with
  `ended: "timeout"`. Hitting the turn cap is scored the same way, with `ended: "max_turns"`. The
  summary counts completed, max-turns and timeout endings separately, so a 0 from a timeout never
  reads like a 0 from bad code.
- Not-run runs and excluded attempts are counted in the summary by reason.
- **The CLI version is checked before every run**, not only at the start. A mismatch with the band file
  stops the round, resumable.
- **Each run gets its own fresh temp folder**, removed afterwards. Claude Code still creates an empty
  project and memory folder under `~/.claude/projects` for each one; all 129 inspected on 2 November 2026
  held 0 files, so nothing carries from one run to the next. Auto-memory is left on, as it is by default.
- **`--start-at HH:MM`** waits until then. **`--stop-at HH:MM`** is read as the next HH:MM after the START,
  not after now: typed at 02:00 for a 14:35 start, 04:00 means the following morning. Read from now it
  would be a time already past by the start, and the round would exit at once with zero runs.

Run the gate yourself: `npm run eval:isolation`. It spends a little usage.

## Rerun it

```bash
npm ci
npm test                     # the kit's own tests plus the checker's
npm run eval:mutate          # switch each rule off in turn, about 3 minutes
npm run eval:isolation       # the gate, about 2 minutes, a little usage
node eval/calibrate.mjs band # measure the first-prompt size of all ten cells for round 1, about 2 minutes
node eval/calibrate.mjs check # re-measure and compare with band-round-1.json without changing it
node eval/calibrate.mjs band --guidance 2 --arms B   # round 2's band: re-measure arm B only, carry arm A over
node eval/calibrate.mjs check --guidance 2           # all ten cells against band-round-2.json
node eval/isolation.mjs gate --guidance 2            # the gate, with arm B built from round 2

# rehearse the pipeline without spending usage
node eval/run.mjs --subject stub:good --round stub-demo --tasks T3 --runs 1

# a real round: 5 tasks x 2 arms x 3 runs = 30 runs, sequential, overnight, Mac plugged in and open
mkdir -p eval/logs
nohup caffeinate -is node eval/run.mjs --round 1 --runs 3 --start-at 14:35 --max-five-hour 50 --stop-at 04:00 > eval/logs/round-1.log 2>&1 &

node eval/run.mjs --round 1 --runs 3 --resume   # carry on after any stop
node eval/summarise.mjs --round 1               # summary.json and summary.md

# round 2: the same eval with guidance/round-2/ and band-round-2.json (--guidance 2 is what selects both)
nohup caffeinate -is node eval/run.mjs --round 2 --guidance 2 --runs 3 --start-at 19:35 --max-five-hour 50 --stop-at 04:00 > eval/logs/round-2.log 2>&1 &
node eval/summarise.mjs --round 2
node eval/summarise.mjs --round 2 --unseal      # only once round 2 has finished; then the same for --round 1
node eval/compare-rounds.mjs                    # round 1 and 2 side by side, T5 first, from the per-run files
```

Per run, `eval/results/round-N/<task>/<arm>/run-<k>/` holds `Result.tsx` (or `NO_RESULT.txt`),
`score.json`, `trace.json` (tool names and paths, never the transcript), `meta.json` and, if any
attempt was excluded, `attempts.json`. The raw stream goes to `raw/`, which is gitignored.
`meta.json` records the resolved model ID, turns, duration, cost as the CLI reports it, input, output,
cache read and cache write tokens, the usage windows before, at the start of and at the end of the
run, the first-turn prompt size against its band (and the name of the band file), any edit Claude made outside `eval-output/`, and
whether it put a `ref` on a kit component. It also records the harness commit and any uncommitted change
to it, the two environment variables and the extra flags the subject ran with, and the name of the run's temp folder.

## What this does not measure

- Visual quality. Nothing here looks at pixels.
- Contrast. R9 asserts semantics and ARIA only. Contrast is a token-level property; `tokens:validate`
  prints a DESIGN.md report on it, which is a report and not a gate.
- Anything beyond five tasks, three runs each, in one kit.
- Any model other than the one recorded in `meta.json` (the alias `sonnet` resolves to a model ID that
  is written to every run).
- Whether guidance helps a person. This is a model reading a folder.
- Focus containment in modals, and real browser behaviour: everything runs in jsdom.
- Whether arm A's human docs, rather than arm B's agent files, are what keeps R1 to R5 high. That is
  the question the two arms ask together, not something either arm can separate.

## Results

None are written here. The numbers live in the generated `eval/results/round-N/summary.md` and `eval/results/compare-rounds.md`.

### Notes on the results

**T5: arm B's gain came from a sentence written for a dialog, copied onto a menu.** Found after round 2 by reading `eval/results-sealed/round-2/T5/B/run-1/Result.tsx`, `run-2/Result.tsx` and `run-3/Result.tsx`.

- In round 1, all three arm B runs built the menu items from raw `<button role="menuitem">` elements and failed R7.
- In round 2, arm B runs 1 and 3 built every menu item from the kit's `Button`. They made Delete a filled red primary `Button`: `variant="primary"` with `background` and `borderColor` set to `var(--nil-color-danger)` through `style`. That is the destructive-actions sentence in round 2's `AGENTS.md`, applied word for word to a menu. Both passed R7.
- Run 2 built the items from raw buttons with `role="menuitem"`, tokens only, and showed Delete as danger-coloured text (until it is highlighted). That is a common menu pattern, and it failed R7 for it.
- So the checker scored the literal copy of the dialog sentence higher than the usual menu pattern. Arm B's gain on T5 is those two R7 passes.
- This is three runs, and arm A moved on T5 with nothing changed. The sentence is the likely cause, since it is the only thing that changed and the code matches it, but it is not proven.

The scores stay as measured. Changing a rule after seeing the results is what the held-out task was there to prevent. The fix belongs in the kit: a danger `Button` variant, then a menu with danger items. That is later work on another branch.
