# NIL DS — PLAN

**Name:** NIL DS · repo/folder `nil-ds` · npm org target `@nilds/*`  
**Status:** Private GitHub until Jen flips to public. Kit #1 active.  
**Lineage:** Token + primitive extract from `mothership-stable` (brutalist CLI),
neutral/swappable default palette — not Soft Bento (console → dx-grid).

Locked name 2026-08-21 (Jen). Was working-name `design-foundry`.

---

## What this is

Showroom of taste + usable primitives for real builds and fit-first DS/PD
contract proof. Honest extraction framing — generalised for reuse, not a
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
| **2** | Neumorphism | Wanted — after DS industry scan |
| **3** | TetherLog extract | After TetherLog UI |
| **4** | More ideas | Parked — learn before spray |
| **5** | Soft Bento | Parked — separate style |

One active kit build at a time. Product UI in other repos ≠ this kit.

---

## Now vs north star (Gemini filtered)

Gemini sketched a full `@nilds/*` monorepo. **Keep the shape as the target.**
**Do not jump the whole monorepo today** — current tree is a single package
with tokens + primitives + Vite demo. Grow into packages when a split earns it.

### Keep (north star)

| Piece | Call |
|-------|------|
| **`@nilds/tokens`** | Raw + semantic contracts → CSS / TS maps. Target home for today’s `src/tokens/`. |
| **`@nilds/core`** | Resets, brutalist layout primitives, base CSS (0 radius, hard borders, high contrast). |
| **`@nilds/react`** (or `@nilds/ui`) | React primitives — today’s `src/components/`. |
| **`@nilds/cli`** | Later near-term: `nilds add …`, token sync (shadcn-shaped distribution). |
| **`@nilds/icons`** | Later — 1-bit / geometric / CLI glyphs. Not day one. |
| **3-tier tokens** | Primitive → semantic → component. CSS namespace: `--nil-*` / `--nil-primitive-*`. |
| **Scoped imports** | `import { Button } from '@nilds/react'` once packages exist. |

### Defer / ignore for now

| Piece | Why |
|-------|-----|
| Full `packages/` + `apps/` monorepo day one | Premature; rename/split when consumers need it |
| Radix as a hard dependency | Extract isn’t Radix-based; add only if a primitive needs it |
| Next.js `apps/docs` + `sandbox` | Vite demo now; Storybook next; Next docs optional later |
| `.nilrc` | Optional once CLI exists |
| Tailwind v4 `@theme` preset as mandatory | Fine as a later `@nilds/core` export; kit must work without forcing TW |
| Soft Bento chrome | Wrong system — kit #5 |

### Near-term slices (after private remote is live)

1. Storybook stub (or keep demo until Storybook earns the cost)
2. Figma variables path (document + sync plan — not Code Connect day one)
3. npm publish readiness under `@nilds/*` (still private or gated until Jen says public)
4. ~~Start `--nil-*` token rename when touching tokens next~~ **done 2026-08-21**

---

## Current tree (v0 — single package)

```text
nil-ds/
├── PLAN.md
├── README.md
├── package.json          # name: nil-ds (private); grows into @nilds/* workspace
├── demo/                 # Vite playground
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
│   └── docs/             # Storybook or Next — later
└── package.json          # workspace root
```

---

## Version control

- **Local git:** yes
- **Remote:** **private** GitHub until Jen switches to public
- Commits from here on

---

## Hygiene debt (cross-repo — parked)

Portfolio + mothership-stable = brutalist CLI. Soft Bento = console → dx-grid.
Docs/component names that still fuse them need a dedicated cleanup pass.

---

## Open questions

- [x] Real name → **NIL DS**
- [x] Remote → **private GitHub** until public flip
- [ ] Accent vs neutral-only for v0.1 shareable slice
- [ ] Storybook vs keep Vite demo for the next polish pass
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
