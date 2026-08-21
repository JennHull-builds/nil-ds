> **NIL DS** — private until Jen flips public. See `PLAN.md` for architecture
> north star (`@nilds/*`) and open questions.

# NIL DS

A small token + primitive kit, **extracted from a real production system**
(`mothership-stable`), not invented from scratch. Proof of a token architecture
pattern — primitive → semantic → component — plus React primitives generalised
for reuse outside the live **brutalist CLI** look. Soft Bento (console →
dx-grid) is a different system — not this kit.

## Why this exists

1. **Usable now** — dependency-light primitives for real builds.
2. **Showcase** — DS/PD craft proof for fit-first contract work — not a second paid offer.

## What's extracted vs new

| Component | Source |
|---|---|
| `Button` | `mothership-stable/foundations/components/BracketButton.tsx` |
| `Badge` | `.../TagPill.tsx` |
| `Card` | `.../BentoContainer.tsx` *(legacy name in mothership; aesthetic is CLI)* |
| `Grid` | `.../BentoGrid.tsx` |
| `Heading` | `.../SectionHeading.tsx` |
| `Text` | `.../BodyText.tsx` |
| `Input` | New |
| `Divider` | New |
| `Meta` | `.../MetaRow.tsx` (single item; compose for strips) |
| `ThemeToggle` | `.../ThemeToggle.tsx` (controlled; no ThemeProvider) |
| `Lightbox` | `.../Lightbox.tsx` (controlled; plain `<img>`) |

Tokens: restructured from mothership foundations into an explicit two-layer
model. Neutral default palette — swap accent without touching components.
Target CSS namespace: `--nil-*` (semantic / consumer) and `--nil-primitive-*`
(raw). Components read `--nil-*` only.

## Token architecture

```
primitive tokens (raw values)
        │
        ▼
semantic tokens (roles per theme)
        │
        ▼
components (--nil-* only — never --nil-primitive-*)
```

Source: `src/tokens/tokens.json` · CSS: `src/tokens/tokens.css`  
Layout / reset / CLI motion: `src/core/core.css` (future `@nilds/core`) — load after tokens.  
Classes: `.nil-container`, `.nil-grid`, `.nil-grid-bg`, `.nil-cursor-blink`, `.nil-enter` (+ `.is-visible`).  
Theme: `data-theme="dark"` on an ancestor (light defaults on `:root`).

## Usage (today — single package)

```tsx
import './tokens/tokens.css';
import './core/core.css';
import { Button, Card, Grid, Heading, Text } from 'nil-ds'; // or relative ./src

function Example() {
  return (
    <div className="nil-container">
      <div className="nil-grid">
        <Card style={{ gridColumn: 'span 6' }}>
          <Heading level={3}>Real usage</Heading>
          <Text muted>Every value traces back to a token.</Text>
          <Button variant="primary">Do the thing</Button>
        </Card>
      </div>
    </div>
  );
}
```

North star imports (after package split): `import { Button } from '@nilds/react'`.

## Demo

```bash
npm install
npm run dev          # localhost:5173
npm run build:demo
npm run typecheck
```

Vite is demo-only. Kit consumers: plain `.tsx` + `tokens.css` + optional `core.css`.

## Status

- [x] Name: **NIL DS** · folder/repo `nil-ds`
- [x] Private GitHub (until public flip)
- [x] Token architecture + primitives + demo
- [x] `--nil-*` token migration slice
- [ ] Storybook / Figma path / `@nilds/*` publish readiness
- [ ] Monorepo split when it earns its keep (`PLAN.md`)

## Not in scope here

No fake case studies, no client logos, no invented use cases.
