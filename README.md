> **NIL DS** — private until Jen flips public. See `PLAN.md` for architecture
> north star (`@nilds/*`).

# NIL DS

Token + primitive kit — brutalist CLI lineage from `mothership-stable`, plus
**new instrument primitives** (Dial, Stack, Panel, etc.). Primitive → semantic →
component architecture with agent-readable `tokens.json` + `registry.json`.

## Primitives (v0.1)

| Component | Notes |
|-----------|-------|
| `Button`, `Badge`, `Card`, `Grid`, `Input`, `Heading`, `Text`, `Divider` | Core + mothership extracts |
| `Meta`, `ThemeToggle`, `Lightbox` | CLI extracts |
| `Panel`, `Stack`, `Prompt`, `Readout` | Instrument shells |
| `Dial`, `Ring` | Circular gauges |
| `Toggle`, `DataRow`, `TabStrip` | Schedule / density UI |

## Tokens

- Source: `src/tokens/tokens.json` (edit this)
- CSS: `src/tokens/tokens.json` → `npm run tokens:build` → `tokens.css`
- Accent: `#1752eb` · Canvas: `#F3F2EE` · Ink: `#0A0A0A`
- Namespace: `--nil-*` (consumer) · `--nil-primitive-*` (raw)

## Quick start

```bash
npm install
npm run dev          # showroom localhost:5173
npm run tokens:build # regenerate CSS from JSON
npm run typecheck    # validate tokens + tsc
npm run build:demo   # dist-demo/
```

## Consumer wiring

See **[APPLY.md](APPLY.md)** — link, CSS import order, Tailwind `@theme`, ui wrappers.

## Agent / design ops

- **[AGENTS.md](AGENTS.md)** — token rules, composition guide
- **[registry.json](registry.json)** — component manifest
- **[FIGMA.md](FIGMA.md)** — variables sync path
- `src/core/tailwind-theme.css` — ready Tailwind v4 alias block

## Showroom

Five composed scenes (Intro, Climate, Instrument, Analytics, Token Lab) + Gallery appendix — not a flat component catalog.

## Status

- [x] v0.1 proper elevation — instrument primitives + Token Lab + build pipeline
- [x] Figma path documented (`FIGMA.md`)
- [x] Vite showroom (Storybook parked)
- [ ] `@nilds/*` publish / monorepo split when earned
