# NIL DS

Public token + primitive kit. Brutalist CLI lineage extracted from `mothership-stable`,
plus new instrument primitives (Dial, Stack, Panel). Live at nil-ds.vercel.app.

**Read `AGENTS.md` first** — it is the existing agent contract for this repo and the
source of truth. Architecture north star is `PLAN.md` (`@nilds/*`).

## What this repo is for

It is **kit #1** and a showroom of taste, not a product. Per
`~/chappie/chappie/memory/kit-market-verdict.md`: kits are showroom plus dogfood, **not
kit-SaaS**. Do not propose monetising it, adding a pricing page, or productising the
registry. Note ideas, do not build them.

One active kit build at a time. A second distinct look only if a real build earns it.

## Architecture

Primitive → semantic → component. Agent-readable `tokens.json` plus `registry.json` are
the point of the whole thing, not a side artefact — they are what makes the kit legible
to an agent, which is the actual pitch.

## Before committing

```bash
npm run tokens:validate   # JSON/CSS parity + stale-hex guard
npm run typecheck         # runs tokens:validate, then tsc
npm test
```

`tokens:validate` is load-bearing. If it fails, the token architecture claim in the
capability ledger stops being true.

## Visual system

Brutalist CLI: 4px default radius (soft brutalist, `radius-default`), 2px borders, IBM
Plex Sans and IBM Plex Mono, warm off-white and dark. **Not Soft Bento** — that belongs
to dx-grid-inspector. Do not merge the two systems; they are deliberately separate.

**Never restate a token value in prose, here or in any doc.** Name the token and let the
reader open `tokens.json`. See the gotcha below for what restating cost us.

## Gotcha: prose drifts, the generated CSS does not

Found 2026-09-14. The accent moved three times in eleven days (`#3b6ef5` to `#0241e3` to
`#1752eb` and back to `#3b6ef5`). `tokens.css` followed every time, because it is
generated. Eight hand-written files did not, and `tokens:validate` stayed green the whole
way, correctly: before today it only compared `tokens.json` against `tokens.css`.

The stale value reached `README.md`, `ARCHITECTURE.md`, `FIGMA.md`, three demo scenes, the
`_readme` key inside `tokens.json` itself, and this file. Nothing errored. Same family as
any plausible-output bug: the docs were well-formed and wrong.

`tokens:validate` now carries a stale-hex guard. Any hex in a doc, demo scene or component
must be a value `tokens.json` currently holds, or be allowlisted in `ALLOWED_HEX` with a
reason. Demo scenes read the accent from `tokens.json` rather than typing it.

Still not caught: raw pixel values, and components reaching for `--nil-primitive-*`
directly. `AGENTS.md` forbids both in prose, and prose is exactly what this gotcha is
about.

`PLAN.md` is exempt and must stay exempt. Its hexes are dated decision entries recording
what was true that day; correcting them into the present would falsify the log.

## This kit now has a downstream consumer, and it holds a COPY

Added 2026-09-16. `~/tetherlog` consumes this kit, but it does **not** read these files at
build time. It vendors `src/tokens/tokens.css` and `src/core/core.css` into its own
`src/nil-ds/` via `scripts/sync-nil-ds.sh`, because Vercel only checks out one repo and a
relative path to a sibling directory does not exist there. That failed a preview build the
first time the branch was pushed.

**So a change here does not reach TetherLog until someone reruns that script.** Nothing
errors. TetherLog keeps building, keeps deploying, and quietly serves the old tokens. It is
the stale-hex gotcha below, one repo further out, where `tokens:validate` cannot see it.

Verified 2026-09-16: the vendored copies are byte-identical to this repo's HEAD (`d1434e5`)
by sha256, and carry the reduced-motion block.

**If you change `tokens.json`, `tokens.css` or `core.css`, say so in the commit message and
tell whoever owns TetherLog to run `npm run sync-nil-ds`.** This kit is no longer only its
own consumer.

## Gotcha: a green axe test does not mean contrast passes

Added 2026-09-16, the same day the axe assertions landed. Every component test now ends
with `expect(await axe(container)).toHaveNoViolations()`, and all 20 pass.

**That covers roles, ARIA, labelling and semantic structure. It does not cover colour
contrast.** `vitest.config.ts` sets `css: false`, so jsdom computes no styles and axe
reports `color-contrast` as **incomplete** rather than passing. `toHaveNoViolations` only
fails on `violations`, never on `incomplete`, so the rule is silently not evaluated.
Verified by introspecting a result: 9 rules passed, `color-contrast` incomplete, 78
inapplicable.

Same family as the stale-hex gotcha above: nothing errors, the output is well-formed, and
it is only wrong if you believe it says more than it does.

**So: never write "accessibility tested" in the ledger, the README or public copy.** Write
what is true — semantics and ARIA are asserted per component. Contrast is a token-level
property and the honest home for it is `tokens:validate`, computing WCAG ratios over the
semantic colour pairs in `tokens.json`. Not built yet.

**Verify the matcher before trusting a green run.** These assertions were confirmed real by
rendering an image with no `alt` and a link with no text, and watching the suite fail. An
axe assertion that cannot fail is the same as no assertion.
