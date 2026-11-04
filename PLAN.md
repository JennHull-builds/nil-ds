# NIL DS: PLAN

**Name:** NIL DS · repo/folder `nil-ds` · npm org target `@nilds/*`  
**Status:** Public GitHub + live demo (`nil-ds.vercel.app`). Kit #1 active.  
**Lineage:** Token + primitive extract from `mothership-stable` (brutalist CLI),
neutral surfaces + swappable accent: not Soft Bento (console → dx-grid).

Locked name 2026-08-21 (Jen). Was working-name `design-foundry`.

---

## What this is

Showroom of taste + usable primitives for real builds and fit-first DS/PD
contract proof. Honest extraction framing: generalised for reuse, not a
public Mothership reincarnation and not Soft Bento.

**Two looks that must not be fused:**

| Look | Where it belongs |
|------|------------------|
| **Brutalist CLI** | Portfolio + mothership-stable (live intent) → this kit’s lineage |
| **Bento (Soft Bento)** | Console spillover → dx-grid → kit #5 later |

---

## Kit pipeline

| # | Kit | Status |
|---|-----|--------|
| **1** | **NIL DS** (this repo) | **Active** |
| **2** | Neumorphism | Wanted: after DS industry scan |
| **3** | TetherLog extract | After TetherLog UI |
| **4** | More ideas | Parked: learn before spray |
| **5** | Soft Bento | Parked: separate style |

One active kit build at a time. Product UI in other repos ≠ this kit.

---

## Now vs north star (Gemini filtered)

Gemini sketched a full `@nilds/*` monorepo. **Keep the shape as the target.**
**Do not jump the whole monorepo today**: current tree is a single package
with tokens + primitives + Vite demo. Grow into packages when a split earns it.

### Keep (north star)

| Piece | Call |
|-------|------|
| **`@nilds/tokens`** | Raw + semantic contracts → CSS / TS maps. Target home for today’s `src/tokens/`. |
| **`@nilds/core`** | Resets, brutalist layout primitives, base CSS (`radius-default`, hard borders, high contrast). |
| **`@nilds/react`** (or `@nilds/ui`) | React primitives: today’s `src/components/`. |
| **`@nilds/cli`** | Later near-term: `nilds add …`, token sync (shadcn-shaped distribution). |
| **`@nilds/icons`** | Later: 1-bit / geometric / CLI glyphs. Not day one. |
| **3-tier tokens** | Primitive → semantic → component. CSS namespace: `--nil-*` / `--nil-primitive-*`. |
| **Scoped imports** | `import { Button } from '@nilds/react'` once packages exist. |

### Defer / ignore for now

| Piece | Why |
|-------|-----|
| Full `packages/` + `apps/` monorepo day one | Premature; rename/split when consumers need it |
| Radix as a hard dependency | Extract isn’t Radix-based; add only if a primitive needs it |
| Next.js `apps/docs` + `sandbox` | Vite demo now; **Storybook parked** until it earns the cost; Next docs optional later |
| `.nilrc` | Optional once CLI exists |
| Tailwind v4 `@theme` preset as mandatory | Fine as a later `@nilds/core` export; kit must work without forcing TW |
| Soft Bento chrome | Wrong system: kit #5 |

### Near-term slices

1. ~~Storybook stub (or keep demo until Storybook earns the cost)~~ **parked**: Vite demo stays
2. Figma variables path (document + sync plan: not Code Connect day one)
3. npm publish readiness under `@nilds/*` (gated until the owner says publish)
4. ~~Start `--nil-*` token rename when touching tokens next~~ **done 2026-08-21**

---

## Current tree (v0: single package)

```text
nil-ds/
├── PLAN.md
├── README.md
├── package.json          # name: nil-ds (private); grows into @nilds/* workspace
├── demo/                 # Vite showroom and the /proof page
├── eval/                 # agent-guidance eval (eval/README.md)
├── scripts/              # tokens:build and tokens:validate
└── src/
    ├── tokens/           # → future @nilds/tokens
    ├── core/             # → future @nilds/core (reset + layout CSS)
    ├── components/       # → future @nilds/react
    └── index.ts
```

Target layout when we split (not required yet):

```text
nil-ds/
├── packages/
│   ├── tokens/
│   ├── core/
│   ├── react/
│   ├── icons/            # later
│   └── cli/              # later
├── apps/
│   └── docs/             # Storybook or Next: later
└── package.json          # workspace root
```

---

## Version control

- **Local git:** yes
- **Remote:** **public** GitHub: https://github.com/JennHull-builds/nil-ds
- **Demo:** https://nil-ds.vercel.app
- Commits from here on

---

## Hygiene debt (cross-repo: parked)

Portfolio + mothership-stable = brutalist CLI. Soft Bento = console → dx-grid.
Docs/component names that still fuse them need a dedicated cleanup pass.

---

## Open questions

- [x] Real name → **NIL DS**
- [x] Remote → **public GitHub** (flipped 2026-09-02)
- [x] Accent vs neutral-only for v0.1 → **accent kept** (swappable `--nil-color-accent`; not a grey-only slice)
- [x] Mothership light base + accent lock → **light semantic from `colours.light`; accent `#0241e3` (Jen)**
- [x] Storybook vs Vite demo → **park Storybook**; keep Vite demo for polish
- [x] First `--nil-*` token migration slice

---

## Extract gaps (2026-08-21 audit)

Mothership foundations vs this kit. Six mapped primitives + Input/Divider are in.
Hygiene debt (Bento* names in mothership) stays parked.

**Next craft slices (ranked):**

1. ~~**Meta** (from MetaRow)~~ **done 2026-08-21** — bracket key-value; restores CLI vocab Badge left behind
2. ~~**ThemeToggle**~~ **done 2026-08-21** — sharp segmented control; controlled theme object, not demo Button
3. ~~**Layout tokens + core CSS**~~ **done 2026-08-21** — container / 12-col / gutters / reset (`src/core` → `@nilds/core`)

Also worth later: ~~Lightbox; CLI motion extras (`enter`, `blink`, `grid-bg`)~~ **done 2026-08-21**.

**Skip:** Header, Hero, WorkListItem, ProjectCard, CaseStudyQuickLinks, ThemeProvider
reinjection, brand lime/mint/pork, Soft Bento, page/print chrome.

---

## Log

- 2026-11-04: **Sidebar.** App navigation in the kit's own look: a column on the surface colour with the
  kit's rule on one edge, mono uppercase muted section headings like Panel's header, and full-width mono
  links. The current page is marked by `aria-current="page"` plus a thick left rule and the emphasis
  weight, so colour is never the only cue. The toggle is the kit Button, a disclosure with `aria-expanded`
  and `aria-controls`. Collapsing hides the list with `hidden` and leaves the nav and toggle, in flow with
  no drawer, so nothing is trapped; focus moves to the toggle first if a link had it. Uncontrolled, it
  starts collapsed below the md breakpoint, read from the token. Links are plain anchors, and `renderLink`
  lets a router's link in without a dependency. No new token and no value changed: the column width is the
  caller's, since the kit has no size token for it. Nothing animates.
- 2026-11-04: **Menu, and one roving-focus hook for Menu and TabStrip.** Menu is an action menu on the
  WAI-ARIA menu button pattern with no UI library: the kit Button as trigger, a `role="menu"` named by
  it, items as data (with optional separators), and a danger variant that is red text, never a filled
  row, after the eval's menu task showed filled red Buttons standing in for it. Choosing an item puts
  focus back on the trigger before `onSelect` runs, so an action that opens a Dialog hands it an opener.
  Tab closes by moving focus to the trigger first, so nothing is trapped. It is not a portal: the list
  sits below the trigger in a relative wrapper and flips edge if it would leave the viewport. Nothing
  animates, so reduced motion has nothing to switch off. The highlighted row is the canvas colour on the
  surface, which are close, so it also carries a thick left rule in the text colour. `useRovingFocus`
  owns which item is in the Tab order, the arrows, Home and End, wrapping and disabled items, and gave
  TabStrip its arrow keys with automatic activation (arrows move and select), because `onTabChange` is
  cheap in every current use. No token value changed. axe has no rule for an unnamed `role="menu"`, so
  the name is asserted with a role query. Typeahead is left for later.
- 2026-11-03: **Dialog, and the two Button changes it needed.** Dialog is the kit's base modal, on
  the native `<dialog>` with `showModal()`: a Panel-style header, a Lightbox-style Close, an actions
  row, and a scrim that is the dialog element itself. Focus goes in, stays in and returns to the
  opener, all moved in code. Escape closes, a backdrop click closes only when asked, and the
  default for that is off for both variants: a destructive confirmation should be answered with an
  explicit choice, and a stray click would throw away what someone typed. Focus starts on
  `initialFocusRef`, or on the first control in the body or actions, and on Close only when nothing
  else can take it. A danger Dialog adds a
  top rule in the danger fill, which is non-text and clears 3:1 on both edges. Its title stays in the
  normal text colour. Enter is a short fade and a small rise at `duration-base`, because someone
  waiting to answer a dialog should not wait 650ms, and it is switched off under reduced motion.
  Button gained `forwardRef` (so `initialFocusRef` can reach it) and `variant="danger"`, after the
  2 November eval showed six "Delete project" dialogs faking one by restyling the primary Button. New
  token `size-dialog`, no value changed. Two things only a browser showed: Chromium gave its own UI a
  Tab stop at each end of the dialog, so Tab is wrapped in code, and axe cannot see inside a native
  `<dialog>` in jsdom, so Dialog's axe test runs on the same markup with the dialog swapped for a
  `<div role="dialog">`. A `busy` prop holds the dialog open while something runs: aria-busy, a
  dimmed Close, and Escape, Close and the backdrop ignored. Button gives `aria-disabled` the same
  look as `disabled`, so a busy button says so and still keeps focus, and `aria-busy` keeps the button
  that is doing the work vivid, with a progress cursor. Left for later: Lightbox onto
  Dialog, and `forwardRef` on Input.
- 2026-11-03: **Contrast is a gate, and accent and danger have separate fill and text roles
  (candidate B).** The DESIGN.md linter reported six text and background pairs below WCAG AA
  (4.5:1), and `tokens:validate` only warned. One blue cannot do both jobs: white text on the fill
  needs the blue darker than accent text on the dark canvas allows, so no single value passes
  both. Two candidates were built side by side with every ratio recomputed from pixels: A, an
  accent per theme (dark mode would carry dark ink on a lighter blue), and B, separate text roles.
  B was chosen because the look holds. The fill moved from `#3b6ef5` to `#396bf2`, white text stays
  on every fill in both themes, and the danger fill is unchanged for the coming danger Button.
  New roles `color-text-accent` and `color-text-danger`, each with a dark value of its own: accent
  text `#2c5ce2` in light and `#4a7dff` in dark, danger text `#c62832` in light and `#ea4d4f` in
  dark. Success on the light theme moved from `#22a06b` to `#00774c`; its dark value is unchanged.
  Values are sized to clear 4.6:1 on a Card surface as well as the canvas, because the Gallery
  draws tones inside Cards and surface is the harder background. ThemeToggle's inactive icon went
  from 0.30 to 0.46 opacity (3:1 for non-text). Primary Button hover now darkens the fill, because
  the old brightness filter took white text to 4.08:1; it is 5.41:1 now. Contrast findings are
  now errors in `tokens:validate`, and a second check fails any text colour that reads
  `--nil-color-accent` or `--nil-color-danger`. Both cover mapped pairs and `color` declarations
  only: states, opacity and Tailwind utilities are outside them. The accent is still Jen's locked
  brand blue. It moved by a hair, on 2026-11-03, so that white text on it meets AA.
- 2026-10-17: **Dark mode in DESIGN.md: a `-dark` suffix, nothing else.** The DESIGN.md format
  (Google Labs, spec version `alpha`) has no theme concept: `designmd spec --rules`, read in full
  and grepped the same day, never mentions dark or mode, and uses "theme" once, for Tailwind theme
  configs. Chosen: light is the default and keeps the plain
  token names; a colour whose dark value differs gets a twin named with a `-dark` suffix (`bg`,
  `bg-dark`); a component whose colours differ gets a `-dark` variant, which is the spec's own
  related-key convention for states. Both use only names the spec says it accepts, so the linter
  raises nothing about the names and the contrast rule runs on the dark pairs too.
  Rejected: two files (the spec calls a DESIGN.md self-contained); a custom `themes:` key (probed:
  the linter warns `token-like-ignored` and every export drops it); dark in prose only (the prose
  may not state values). Cost, said in the file: no tool knows `-dark` means dark.
- 2026-10-17: **DESIGN.md is generated, and the rest of the mapping.** `scripts/build-design-md.mjs`
  writes it from `tokens.json`, `registry.json` and `design-md/`; `tokens:validate` fails on drift,
  checks that the hand-written prose states no value, and runs `designmd lint` (pinned to exact
  0.4.0). The linter never runs in `build:demo`. Calls made, each probed against the linter and
  the three export formats rather than assumed: the accent is named `primary` in this file
  because the linter warns without one; only the semantic layer is exposed; motion, border widths
  and breakpoints are generated tables in the body, because a custom top-level key is warned and
  dropped on export while an unknown `##` section is preserved; layout and grid values sit in
  `spacing` as `layout-*`; dial and ring sizes are component `size` entries; a font stack is
  reduced to its first family because a stack in `fontFamily` exports as one quoted name.
  No token value changed. Contrast findings are reported by `tokens:validate` and are Jen's to
  decide.
- 2026-09-02: **Public flip** — GitHub visibility public; Vercel SSO off;
  demo https://nil-ds.vercel.app shareable without auth.
- 2026-08-20: Scaffold as `design-foundry` (tokens, primitives, demo).
- 2026-08-21: Taxonomy fix (brutalist CLI ≠ Soft Bento). Local git init.
- 2026-08-21: Renamed **NIL DS** / `nil-ds`. Private GitHub. Gemini monorepo
  taken as north star; single-package now. Storybook / Figma / npm near-term.
- 2026-08-21: Craft pass — square CLI look, disabled state, semantic-only
  components, `--nil-*` / `--nil-primitive-*` CSS namespace.
- 2026-08-21: Extract gap audit parked (Meta → ThemeToggle → layout/core).
- 2026-08-21: Meta primitive (MetaRow extract) — bracket key-value, demo + README.
- 2026-08-21: ThemeToggle — controlled segmented light/dark; demo wired; no ThemeProvider.
- 2026-08-21: Layout tokens + `src/core/core.css` — reset, `.nil-container` / `.nil-grid`, demo on core layout.
- 2026-08-21: Lightbox + CLI motion (`enter` / `blink` / `grid-bg`) tokens and core utilities.
- 2026-08-21: Locked v0.1 colour — **accent kept** (not neutral-only).
- 2026-08-21: Parked Storybook — Vite demo remains the showroom.
- 2026-08-31: **Mothership light base** — semantic light tokens aligned to
  `mothership-stable/foundations/tokens.json` `colours.light` (bg `#EDECE8`,
  text/border/primary `#0A0A0A`, muted surface `#E2E1DC`). Brutalist defaults:
  `0px` radius, `2px` borders. **Accent locked `#0241e3`** (Jen — not Mothership
  orange `#CC3100`). Light is demo default (`data-theme="light"`). First consumer:
  TetherLog.
- 2026-08-31: **v0.1 proper elevation** — accent `#1752eb`, lighter canvas
  `#F3F2EE`. Token build pipeline (`scripts/build-tokens.mjs`, validate on
  typecheck). New primitives: Panel, Stack, Prompt, Readout, Dial, Ring, Toggle,
  DataRow, TabStrip. Five-scene Vite showroom + Token Lab. `registry.json`,
  `AGENTS.md`, `APPLY.md`, `FIGMA.md`, `tailwind-theme.css`, Vercel config.
