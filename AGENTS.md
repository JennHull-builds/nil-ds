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
| Room / in-page section switching (Tab enters on the selected tab; ArrowLeft, ArrowRight, Home and End move and select) | `TabStrip` |
| CLI key-value | `Meta` |
| Terminal line | `Prompt` |
| Multi-line chat or command input | `Composer` |
| A modal decision or short form | `Dialog` |
| A list of actions on one thing (rename, duplicate, delete) | `Menu` |
| App navigation: grouped links, the current page marked, collapses | `Sidebar` |
| Full-size image viewer | `Lightbox` |
| An icon, beside text or alone | `Icon`. Decorative unless you give it a `label` |
| A button that is only an icon | `Button` with `icon` and `aria-label` (or `aria-labelledby`). It does not compile without a name |
| Chart colours: categories, or amounts | `--nil-color-chart-*`, outlined. See *Gotcha: chart colours* |
| Destructive action | `Button` with `variant="danger"` |
| Destructive item inside a `Menu` | `variant="danger"` on the item: red text, never a red `Button` |
| Large stat | `Readout` |
| Saying what the system is doing, has done, or why it failed, beside the control | `Message` |

## App vs NIL boundary

- **NIL tokens:** bg, surface, text, border, accent, spacing, motion.
- **App tokens:** product category colours, bucket hues, feature-specific semantics. Map in consumer `@theme`, not in `tokens.json`.

## Registry

See `registry.json` for per-component token dependencies and props.

## Never

- Import Radix/shadcn into NIL kit source
- Use `#000` / `#fff` unless explicitly requested
- Copy an icon from a library (Lucide, Feather, Heroicons) or add an icon dependency. Draw it in the kit's style, see *Gotcha: the icon set*
- Bring back the `[ LABEL ]` brackets on a Button. They are retired. (Meta keeps its own brackets, it is not a button.)
- Put a Button's focus on an outline ring. Its focus is the accent shadow
- Hardcode corner radius in components. Use `--nil-radius-default` (the soft brutalist default)
- Invent magic pixel values. Use `--nil-spacing-*` and layout tokens

## About this repo

Public token + primitive kit. Brutalist CLI lineage extracted from `mothership-stable`,
plus new instrument primitives (Dial, Stack, Panel). Live at nil-ds.vercel.app.
Architecture north star is `PLAN.md` (`@nilds/*`).

## What this repo is for

It is **kit #1** and a showroom of taste, not a product. The standing decision: kits are showroom plus dogfood, **not
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

`tokens:validate` is load-bearing. If it fails, the token architecture claim this kit
makes stops being true.

## Visual system

Brutalist CLI: a soft brutalist default radius (`radius-default`), hard borders
(`border-width`, `border-width-thick`), IBM Plex Sans and IBM Plex Mono, warm off-white and dark. **Not Soft Bento**, which belongs
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

`tokens:validate` now carries a stale-hex guard. Any hex in `README.md`, `ARCHITECTURE.md`,
`FIGMA.md`, or a `.ts`, `.tsx` or `.md` file under `demo/` or `src/` (outside `src/tokens/`)
must be a value `tokens.json` currently holds, or be allowlisted in `ALLOWED_HEX` with a
reason. This file and `APPLY.md` are not scanned, so the dated hexes above are not checked. Demo scenes read the accent from `tokens.json` rather than typing it.

Still not caught: raw pixel values, and components reaching for `--nil-primitive-*`
directly. `AGENTS.md` forbids both in prose, and prose is exactly what this gotcha is
about.

`PLAN.md` is exempt and must stay exempt. Its hexes are dated decision entries recording
what was true that day; correcting them into the present would falsify the log.

## Who consumes this kit

Checked 2026-11-04: TetherLog's `main` does not depend on this kit. TetherLog vendored a copy
until its decision D-001 (2026-09-18) deleted `src/nil-ds/` and `scripts/sync-nil-ds.sh`.
Its draft branch `nil-ds-capture` brings the kit back as a git dependency pinned to a commit
of this repo. If that merges, a change here reaches TetherLog only when its pin moves, and
nothing errors in the meantime.

## Gotcha: a green axe test does not mean contrast passes

Added 2026-09-16, the same day the axe assertions landed. Every component test file carries
an `expect(await axe(container)).toHaveNoViolations()` assertion: 20 files then, 24 now
(counted 2026-11-04), and all pass.

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
someone mapped. It can't see anything dimmed with `opacity`: a disabled Button is one (it is dimmed
on purpose, and disabled controls are exempt from the contrast rule). It doesn't see states either.
The Offset Button's hover, focus and pressed states change position, shadow and frame colour, and
neither fill nor text, so they add no text pair. A pressed toggle is a pair, and `button-pressed` and
`theme-toggle-pressed` map it. A later change to a state rule is not caught. So the true sentence is: every text and
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
  errored for eight in a row (2026-09-18, written up in TetherLog's own `AGENTS.md`); the
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
  Updated 2026-11-04: Dial's sizes in the registry now include `xl`. Card, Grid, Heading, Text and
  Divider still have no entry, and Stack still lists `shadow-stack`, which nothing reads.
  Updated 2026-11-09 (0.3.0): Icon is a new entry, and so is ChartPalette, which is tokens and no component.
  Of the 25 component files the registry now covers 20, and Card, Grid, Heading, Text and Divider still
  have no entry. Button's, ThemeToggle's and Lightbox's lists and props were rewritten from the code.

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
  that becomes natively `disabled` sends focus to the page, the same trap Composer had. Button gives
  `aria-disabled="true"` the same look as `disabled` in every variant, and no hover or pressed rule
  applies to it. Dialog's `busy` prop does the same for the dialog: aria-busy, a dimmed Close, and
  Escape, Close and the backdrop ignored without calling `onClose`. The buttons in the actions row
  are the caller's. Mark the unavailable ones aria-disabled, so they dim. Mark the one doing the work
  `aria-busy`: it keeps its look at full strength, with a progress cursor and no hover or pressed
  change, so the working thing stays visible. The caller ignores its clicks.
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

## Gotcha: Menu and the shared roving-focus hook

Added with Menu. Each of these fails quietly if someone "tidies" it.

- **One hook owns the arrow keys.** `useRovingFocus` handles which item is in the Tab order, the
  arrow keys for an orientation, Home and End, wrapping, skipping disabled items and moving DOM
  focus. Menu (vertical) and TabStrip (horizontal) both use it. Do not add a second copy of the key
  handling to either.
- **Choosing an item puts focus back on the trigger before `onSelect` runs.** An action that opens a
  Dialog then hands the Dialog the trigger as its opener, and focus returns to it on close. Swap the
  order and the Dialog records the closing menu item, which is gone by then.
- **Tab closes the menu by moving focus to the trigger first.** The browser then carries the Tab on
  from the trigger, so nothing is trapped and focus never drops to the page when the menu hides.
- **Disabled items are `aria-disabled`, never `disabled`.** Arrow keys skip them, a click on one does
  nothing, and a screen reader still reads them.
- **A danger item is red text.** It uses `--nil-color-text-danger`. A filled red row, or a red
  `Button` in a menu, is the wrong build.
- **A closed menu is hidden, not removed.** The list stays in the document with `hidden`, so the
  trigger's `aria-controls` always points at something. `core.css` has an explicit rule so the
  `display` on the class does not beat `hidden`.
- **axe has no rule for a nameless `role="menu"`.** Removing the menu's `aria-labelledby` passes axe.
  Menu's tests assert the name with a role query for that reason, and its axe guards break the
  menu items and the `role="menu"` parent instead.
- **jsdom has no layout.** The flip that keeps the menu inside the viewport, the hover highlight and
  the real Tab order were checked in Chromium, not in jsdom. Typeahead is not built. Firefox and
  Safari are unchecked.

## Gotcha: Sidebar collapses in flow, and the list is hidden for everyone

Added with Sidebar. Each of these fails quietly if someone "tidies" it.

- **App navigation goes to Sidebar, in-page switching stays with TabStrip.** Sidebar is a named
  `<nav>` of links. TabStrip is a `tablist` that swaps a view on the same page.
- **Collapsing sets `hidden` on the list, and the nav and toggle stay.** The links leave the page for
  sight, keyboard and screen reader alike, while the landmark and the toggle remain, so the way back is
  announced. `core.css` has an explicit `[hidden]` rule because the `display` on the class would beat it.
- **It is in flow, never a drawer.** No fixed or absolute positioning, so there is nothing to trap. A
  test fails if a position or transform declaration appears in the `.nil-sidebar*` rules.
- **Focus goes to the toggle before the list hides.** Collapsing with a link focused would otherwise
  drop focus to the page. The toggle handler moves it first, and a layout effect does the same when a
  controlled parent collapses it. Both are asserted in jsdom. Only the toggle path was driven in a browser.
- **The current page is marked by more than colour.** `aria-current="page"` on the link, a thick left
  rule in the text colour and the emphasis weight. The component marks every link flagged `current`, so
  the caller must flag exactly one.
- **The narrow start is read once.** Uncontrolled and without `defaultCollapsed`, it starts collapsed
  below the md breakpoint, read from `--nil-breakpoint-md`, and resizing later does not move it. The
  `@media` blocks in `core.css` still hold the literal, as the other blocks there do.
- **A router's link goes through `renderLink`.** `renderLink={({ href, ...rest }) => <Link to={href} {...rest} />}`
  keeps the kit free of a router. The render props carry the class and `aria-current`, so spread them all.
- **Two navigation landmarks need different names.** That is the rule axe can check: a sidebar with no
  `label` beside a second nameless `<nav>` fails `landmark-unique`, and Sidebar's axe test is built that
  way. A single nameless `<nav>` alone passes axe, so the name is also asserted with a role query.

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
- **`emptyAction` swaps with Send, and `sendLabel` renames it.** While the box has no characters and
  status is idle, `emptyAction` takes the button slot, so the footer holds only one of the two.
  The first character swaps in Send, and a cleared draft swaps it back. Whitespace counts as a
  character, so it shows a disabled Send. Streaming always shows Stop. If focus was on the button that
  leaves, it moves to the text box.

## Gotcha: borders may draw thinner than the border token says

Added 2026-11-03. `--nil-border-width` resolves to 1.5px, but Chromium 153 computes and draws every
border that uses it as 1px, at device pixel ratio 1 and 2. Measured on the Gallery: Composer, Input
and Card all compute the same. Firefox and Safari are unchecked. Whether to change the token is a
later decision.
## Gotcha: the Offset Button

Added 2026-11-09, with 0.3.0. The bracket look is gone. Each of these fails quietly if someone "tidies" it.

- **A Button is a frame with a hard shadow in the border colour.** Rest, hover, focus and pressed all
  move the same shadow, and every distance is a token (`--nil-size-offset`, `-hover`, `-focus`, `-lift`).
  Add no literal pixel. `Button.test.tsx` fails on one, and on a hex or a literal duration.
- **Focus is the accent shadow, and there is no outline ring.** `outline: none` is deliberate and
  only safe because the shadow is the indicator. The forced-colours block restores a system outline,
  where shadows are not drawn. The focus rule sits after the unavailable rule on purpose, so an
  `aria-disabled` Button that holds focus (the busy Dialog pattern) still shows where it is.
- **A transition makes focus look absent for 120 ms.** Reading `getComputedStyle` right after Tab shows the
  resting shadow. Measured 2026-11-09: after 300 ms it is the accent shadow at the focus offset, lifted by
  the lift token, `outline-style: none`. Wait before asserting on it.
- **Never position a Button with `transform`.** Hover, focus and press all set `transform`, so a
  parent's `translate` is overwritten and the button jumps. Lightbox's side buttons are placed with `top`
  for this reason.
- **The shadow is outside the box, so an `overflow: hidden` parent clips it.** ThemeToggle pads for it,
  and so should anything else that puts a Button in a clipped or scrolling container.
- **`sm` is 36 px to see and 44 px to tap.** An invisible `::after` extends the hit area, and it is never
  narrower than the tap size. Measured 2026-11-09 with `elementFromPoint`: a point 3 px outside the
  visible box hits the button and a point 5 px outside does not. md is 44 px tall at every size.
- **An icon-only Button needs a name, and the types enforce it.** `<Button icon="close" />` does not
  compile (a `@ts-expect-error` test holds that, and `npm run typecheck` is what runs it). At run time
  nothing stops it, so a JS consumer can still ship a nameless one.
- **The one that is pressed (`aria-pressed`) is pushed in and inverted.** That is also how ThemeToggle
  shows light or dark, so the state is not carried by colour alone.
- **Lightbox sets its controls in the dark theme** with `data-theme="dark"` on the scrim, because the
  scrim is dark in both themes and an ink shadow would vanish on it. The light tokens now also apply under
  `[data-theme='light']`, so a light panel can sit inside a dark page.
- **TabStrip and Toggle are not Offset buttons.** A tab is a tab: its active mark is the underline, and its
  focus turns that underline and label to the accent. Toggle is still a pill with an outline focus ring.
  Both are decisions waiting on Jen, listed in the 0.3.0 report. Menu items and Sidebar links are rows, not
  buttons, and are about 36 px tall.

## Gotcha: the icon set

Added 2026-11-09. 36 icons in `src/components/icons.ts`, drawn for this kit, not copied.

- **Straight lines only.** What would be a curve is cut into 45 degree facets. `Icon.test.tsx` fails on any
  path command that is not M, L, H, V or Z, and on a coordinate outside the 24 unit grid.
- **The stroke is a token and it is set in `core.css`, not in the drawing.** The border width at the small
  size and the thick border width at the other two, kept at that many screen pixels by a non-scaling stroke.
- **The gap rule.** A gap between two strokes is never thinner than the stroke beside it, checked at 16 px.
  In drawing units that is about 4.5 between two separate strokes, centre to centre. Icons that could not
  keep it at 16 px have a simpler `small` drawing: mic, eye, eye-off, sun and trash. The check was a
  closing filter on a rendered raster: fill every gap narrower than the stroke and look at what fills.
  Narrow wedges where two strokes meet at a join (an envelope's flap, a chevron's inside) are joins, not gaps.
- **What was checked and what was not.** Measured 2026-11-09 on the final drawings, by the closing filter
  above. At 16 px nothing is left above 8 square drawing units except join wedges (mic 6.8, mail 8,
  printer 7.6, trash 5.8, key 5.5, volume-off 5.3, all read as joins by eye). At 20 px the full mic, eye, sun
  and trash still have real gaps narrower than the stroke (areas 24.7, 27.8, 31 and 45.2), and eye-off,
  clock, mail, warning and volume-off have small ones. At 24 px the full mic (27.6), eye-off (13.2) and eye
  (8.1) do. 20 px is the strictest size in drawing units, because the stroke is 2 px on a grid scaled down to
  20. Only 16 px was fixed, as decided. Mic, eye, eye-off and sun are the drawings Jen approved, so changing
  them at 20 and 24 px is hers to decide.
- **eye-off cuts its slash out with an SVG mask,** and the mask id comes from `useId` so two on one page
  never share one. A test renders two and compares.
- **Icons are decorative by default** (`aria-hidden`). Give `label` only for an icon that stands alone.
  Inside a Button, never label the icon: the Button's own name is the name.

## Gotcha: Message is a live region

Added 2026-11-12, with Message. Each of these fails quietly if someone "tidies" it.

- **It is always rendered, even empty.** A live region has to be in the page before its text arrives, or a
  screen reader does not announce the text. Render `<Message tone="danger" />` with nothing in it and fill
  it later. Do not mount it only when there is something to say.
- **Danger is `role="alert"`, the other tones are `role="status"`.** An alert interrupts, a status waits its
  turn. A `role` you pass wins, so a danger line that should not interrupt can ask for `status`.
- **The icon is there so the state is not carried by colour alone.** Danger leads with the error icon and
  success with the check icon, both decorative. Neutral has none.
- **`busy` reuses the kit's cursor, `.nil-cursor-blink`.** It follows the words, in the accent text role,
  and holds still under reduced motion like Prompt's. Do not write a second blink. With no words there is
  no cursor.

## Gotcha: chart colours

Added 2026-11-09. `--nil-color-chart-*` in `tokens.json`: four categorical colours (blue, pale blue, orange,
pale orange) and a five-step ramp, each with a matching `-text` token.

- **Every mark is outlined in `--nil-color-border` at `--nil-border-width`.** The outline is what clears 3:1
  against the page, so the pale fills may sit below it. An unoutlined pale mark does not meet 3:1, and
  `tokens:validate` cannot see that. It maps only text on fill.
- **More than four categories: group into Other or label them. Do not add colours.**
- **Wins stay `--nil-color-success`.** The chart colours are not status colours.
- **Text on a swatch is the `-text` token,** mapped under `ChartPalette` in `design-md/structure.json` and
  held to 4.5:1 by `tokens:validate`. The text is white on the light blue and on the dark ramp's first three
  steps, and ink on the rest, so use the token, not a guess.
- **The palette validator flags the pale tints, and that is expected.** It was written for unoutlined
  fills. Its lightness band, chroma floor and 3:1 surface checks fail on the pale fills, and its
  normal-vision floor of 15 is missed by pale blue against pale orange (12.5 in light, just under 15 in dark).
  Its colour-blindness checks pass: worst pair 10.9 light and 13.2 dark. The mitigation is the outline and
  a label on every mark, never colour alone.
- **TetherLog mapping (suggested, not applied):** Do is blue, Wonder is pale blue, Drop is orange, Later is
  pale orange, wins are success green, and an hour chart is the ramp with the busiest hour at full strength.

