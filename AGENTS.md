# NIL DS agent guide

Read this before generating UI with NIL primitives.

## Token rules

1. Load `tokens.css` then `core.css` on the consumer root.
2. Components consume **only** `--nil-*` semantic tokens.
3. Never reference `--nil-primitive-*` in component or page code.
4. Swap brand by changing `primitive.color.accent`, `accent-text` and `accent-text-dark` in `tokens.json`, then `npm run tokens:build`. `tokens:validate` fails if a mapped pair no longer meets WCAG AA.
5. Accent or danger as text uses `--nil-color-text-accent` or `--nil-color-text-danger`. The plain fill tokens, `--nil-color-accent` and `--nil-color-danger`, fail as text, and `tokens:validate` rejects them.

## When to use what

| Need | Use |
|------|-----|
| Bordered instrument shell with header | `Panel` |
| Simple bordered cell | `Card` |
| Stacked depth (hero, brand) | `Stack` |
| Circular gauge with ticks | `Dial` |
| Small % ring | `Ring` |
| ON/OFF schedule pill | `Toggle` |
| Theme light/dark | `ThemeToggle` |
| Schedule / table row | `DataRow` |
| Room / section nav | `TabStrip` |
| CLI key-value | `Meta` |
| Terminal line | `Prompt` |
| Multi-line chat or command input | `Composer` |
| A modal decision or short form | `Dialog` |
| Full-size image viewer | `Lightbox` |
| Destructive action | `Button` with `variant="danger"` |
| Large stat | `Readout` |

## App vs NIL boundary

- **NIL tokens:** bg, surface, text, border, accent, spacing, motion.
- **App tokens:** product category colours, bucket hues, feature-specific semantics. Map in consumer `@theme`, not in `tokens.json`.

## Registry

See `registry.json` for per-component token dependencies and props.

## Never

- Import Radix/shadcn into NIL kit source
- Use `#000` / `#fff` unless explicitly requested
- Hardcode corner radius in components. Use `--nil-radius-default` (4px soft brutalist)
- Invent magic pixel values. Use `--nil-spacing-*` and layout tokens

## About this repo

Public token + primitive kit. Brutalist CLI lineage extracted from `mothership-stable`,
plus new instrument primitives (Dial, Stack, Panel). Live at nil-ds.vercel.app.
Architecture north star is `PLAN.md` (`@nilds/*`).

## What this repo is for

It is **kit #1** and a showroom of taste, not a product. Per
`~/mothership/brain/chappie/memory/kit-market-verdict.md`: kits are showroom plus dogfood, **not
kit-SaaS**. Do not propose monetising it, adding a pricing page, or productising the
registry. Note ideas, do not build them.

One active kit build at a time. A second distinct look only if a real build earns it.

## Architecture

Primitive → semantic → component. Agent-readable `tokens.json` plus `registry.json` are
the point of the whole thing, not a side artefact, and they are what makes the kit legible
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
Plex Sans and IBM Plex Mono, warm off-white and dark. **Not Soft Bento**, which belongs
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

## No repo consumes this kit today

Checked 2026-11-03 across `~/mothership`: no repo depends on this kit or holds a vendored copy
of its CSS. The one hit, a test fixture, is a copy of the kit itself.
TetherLog vendored a copy until its decision D-001 (2026-09-18) deleted `src/nil-ds/` and
`scripts/sync-nil-ds.sh`.

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
what is true: semantics and ARIA are asserted per component. Contrast is a token-level
property and the honest home for it is `tokens:validate`.

**Built as a gate 2026-11-03** (it was a report from 2026-10-17). `tokens:validate` runs the
DESIGN.md linter, which computes WCAG ratios on the text and background pairs mapped in
`design-md/structure.json`, and a contrast miss now fails the run. It covers only the pairs
someone mapped. It can't see anything dimmed with `opacity`: ThemeToggle's inactive icon is
one, and only a comment in `core.css` guards its number. It doesn't see states either. Hover and
pressed states of Button and ThemeToggle were measured from pixels on 2026-11-03 and clear 4.5:1,
but a hover rule is not a mapped pair, so a later change to one is not caught. So the true sentence is: every text and
background pair mapped in `design-md/structure.json` meets WCAG AA, and `tokens:validate` fails
if one does not. Unmapped pairs are not covered. Never write "contrast tested" or "accessible"
for it.

**Verify the matcher before trusting a green run.** These assertions were confirmed real by
rendering an image with no `alt` and a link with no text, and watching the suite fail. An
axe assertion that cannot fail is the same as no assertion.

## Gotcha: DESIGN.md is generated, and its lint stays out of the build

Added 2026-10-17, with the DESIGN.md work on branch `design-md`.

- **Do not edit `DESIGN.md` by hand.** `scripts/build-design-md.mjs` writes it from `tokens.json`,
  `registry.json` and the two files in `design-md/` (`structure.json` names which tokens each
  component uses, `prose.md` is the hand-written rationale). Change those, run `npm run
  tokens:build`. A hand edit fails `tokens:validate` and is overwritten.
- **The prose and structure files state no value.** `tokens:validate` fails on a hex, a
  measurement, a colour function or an em dash in them. It is the stale-hex gotcha above, guarded
  before it happens. Name the token; the generated front matter holds the value.
- **`designmd lint` runs in `tokens:validate` and `typecheck` only. Never put it, or any other
  check, in `build:demo`.** TetherLog put checks into its build and every Vercel deployment
  errored for eight in a row (`areas/products-tetherlog.md` in the brain, 2026-09-18); the
  mechanism was never found, and a green local build proved nothing. `build:demo` does run the
  *generator*, through `tokens:build`, and that has now built on Vercel: the Preview deployment for
  `094d15b` (GitHub deployment 7155578909, 2026-10-18) reports state success. If a later deploy
  errors, change `build:demo` to call `scripts/build-tokens.mjs` directly.
- **The linter is pinned to exactly 0.4.0, no caret.** The format is at spec version `alpha`. Bump it
  on purpose, after reading the new rules, because a rule change can turn a clean run into errors.
- **`registry.json` is not a complete record, and DESIGN.md inherits that.** Checked 2026-10-17
  against the components: it lists 11 of the 20 files in `src/components`; it leaves out tokens
  components read (Button reads `bg` and `text-muted`, neither listed); it lists one nothing reads
  (Stack's `shadow-stack`); and it gives Dial sizes as `sm|md|lg` while the component also accepts
  `xl`. The pairings in `design-md/structure.json` were therefore read from the component source and
  `core.css`, not from the registry. Do the same when adding one. Updated 2026-11-03: Badge, Input,
  ThemeToggle and Lightbox now have entries, with token lists derived from the CSS and the component
  source, so the registry lists 16 of the 21 files. The Meta and Prompt lists were completed the same way.
  Dialog brings it to 17 of the 22 files, and Button's list was completed from the code with it.

## Gotcha: Dialog is the native element, and jsdom cannot see most of it

Added 2026-11-03, with Dialog.

- **The scrim is the dialog element.** `.nil-dialog` fills the viewport and carries `--nil-color-overlay`.
  The panel inside it is the visible box. A click whose target is the dialog element itself is a
  backdrop click, and a press that starts inside the panel does not count. `::backdrop` is set
  transparent so the browser's own dim never stacks on the scrim. Keep the gutter around the panel as
  padding on the dialog, so clicks in it still land on the dialog.
- **Tab is wrapped in code.** `showModal()` makes the page inert, but Chromium gave the browser's own
  UI a Tab stop at each end of the dialog (measured 2026-11-03), so focus left the controls for one
  press. Dialog's `onKeyDown` wraps the ends.
- **jsdom fakes only the open attribute and the close event.** `src/test/setup.ts` shims `showModal()`
  and `close()` because jsdom 29 has neither. The top layer, the inert page behind, Escape producing a
  `cancel` event and Tab containment exist only in a real browser. The keyboard walk was run in
  Playwright on Chromium. Firefox and Safari are unchecked.
- **axe sees nothing inside a native `<dialog>` in jsdom.** Every rule comes back "incomplete", so a
  nameless button inside `<dialog open>` passes while the same button in a `<div>` fails, and
  `toHaveNoViolations` only fails on violations. Dialog's axe test runs on the same markup with the
  dialog swapped for `<div role="dialog">`, and two guard tests prove it can fail. Any new test of a
  native dialog needs the same treatment. Names and descriptions are also asserted with role queries.
- **Focus is moved in code.** On open it goes to `initialFocusRef`, else the first control in the body
  or actions, and to Close only when nothing else can take it. On close it returns to whatever had
  focus at open. A button click does not
  focus the button in Safari or in Firefox on macOS, so there may be nothing to return to there
  (unchecked). For a destructive confirmation, point `initialFocusRef` at Cancel.
- **A busy button stays focusable.** Mark it `aria-disabled` and ignore the click. A focused button
  that becomes natively `disabled` sends focus to the page, the same trap Composer had.
- **Leave `<form method="dialog">` out.** It closes the element behind the component's back. Handle
  `onSubmit` and call `onClose`.

## Gotcha: accent and danger are fills, and text has its own roles

Added 2026-11-03, with the contrast gate.

White text on the accent fill needs a darker blue than accent text on the dark canvas allows, so no
single blue passes both. Fill and text are separate roles. `--nil-color-accent` and
`--nil-color-danger` colour fills. `--nil-color-text-accent` and `--nil-color-text-danger` colour text,
each with its own dark value.

- **Text uses the text roles.** `tokens:validate` fails on a `color` declaration, in CSS or in a style
  object, that reads a fill token. Borders, backgrounds, outlines, strokes, SVG fills and `caret-color`
  may still use the fills.
- **The check has two blind spots.** A fill that reaches `color` through a variable or a lookup table
  goes unseen, so `toneColor` in `Meta.tsx` is checked by hand. Tailwind utilities go unseen too:
  `text-mark` and `text-danger` in `src/core/tailwind-theme.css` read the fills. Use `text-mark-ink` and
  `text-danger-ink` for text, and know that nothing guards the class names.
- **Surface is the harder background.** Cards, Panels and Inputs sit on `surface`, which is closer to
  the text colour than the canvas is, so a pair that passes on the canvas can still fail there.
  `design-md/structure.json` has an `-on-surface` entry for each Meta and Badge tone. Add one when you
  put coloured text in a Card.
- **Token Lab's accent swap sets both roles.** The live accent hands the text role back to the theme.
  Without that, picking it would drop accent text to the contrast of the fill. The overrides go on the
  demo wrapper. The wrapper carries its own `data-theme`, and in dark that block shadows anything set
  on `<html>`. The canvas swap still sets `<html>` and so does nothing in dark; the demo resets canvas
  overrides on every theme change anyway.

## Gotcha: Composer's focus, sizing and registry rules

Added 2026-11-03, with Composer. Each of these fails quietly if someone "tidies" it.

- **Its focus ring is its own rule, and `:has()` never joins the kit's shared focus list.** A
  browser that cannot parse one selector in a list drops the whole rule, so every component
  would lose its ring there. The text box's own outline is removed only inside
  `@supports selector(:has(*))`, so an older browser still rings the text box. `Composer.test.tsx`
  fails if either moves.
- **Focus never drops to the page.** Send and Stop move focus to the text box before the button
  can become disabled (a sent draft clears, and a Stop with an empty draft turns into a disabled
  Send). A focused button that becomes disabled sends focus to the body, and the next Tab starts
  from the top. The tests Tab to each button and press Space.
- **Height is CSS first.** `field-sizing: content` grows the box, `1lh` caps it at `maxRows`, and
  a measured fallback covers engines without `field-sizing`. The line height is written once as a
  unitless number in `core.css`, because the kit has no line-height token. Only Chromium was
  tested. Firefox and Safari are unknown.
- **The registry token list is checked against the CSS.** The test fails when `registry.json`
  and the tokens the `.nil-composer*` rules read disagree, which is how the registry drifted before.
- **Send's contrast comes from Button primary.** `composer-send` is mapped in
  `design-md/structure.json` so a change to the accent pair is checked here too.

## Gotcha: borders may draw thinner than the border token says

Added 2026-11-03. `--nil-border-width` resolves to 1.5px, but Chromium 153 computes and draws every
border that uses it as 1px, at device pixel ratio 1 and 2. Measured on the Gallery: Composer, Input
and Card all compute the same. Firefox and Safari are unchecked. Whether to change the token is a
later decision.
