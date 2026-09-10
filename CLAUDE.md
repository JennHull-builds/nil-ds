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
npm run tokens:validate   # fails on hardcoded hex and raw px
npm run typecheck
npm test
```

`tokens:validate` is load-bearing. If it fails, the token architecture claim in the
capability ledger stops being true.

## Visual system

Brutalist CLI: zero border radius, 2px borders, Inter plus JetBrains Mono, warm
off-white and dark. **Not Soft Bento** — that belongs to dx-grid-inspector. Do not merge
the two systems; they are deliberately separate.
