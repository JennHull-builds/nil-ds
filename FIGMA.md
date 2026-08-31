# FIGMA — token sync path

No Code Connect day one. Manual sync until the kit earns automation.

## Layers in Figma Variables

| Figma collection | Maps to |
|------------------|---------|
| **Primitive** | `tokens.json` → `primitive.*` |
| **Semantic / Light** | `semantic.light.*` |
| **Semantic / Dark** | `semantic.dark.*` |

## Key primitives (v0.1)

| Token | Value |
|-------|-------|
| Canvas | `#F3F2EE` (`neutral-900`) |
| Surface | `#EAE9E5` (`neutral-700`) |
| Ink | `#0A0A0A` |
| Accent | `#1752eb` |

## Workflow

1. Designer edits Figma Variables (primitive + semantic).
2. Export via Tokens Studio → JSON (DTCG-compatible when needed).
3. Dev merges into `src/tokens/tokens.json` primitive/semantic blocks.
4. Run `npm run tokens:build` → regenerates `tokens.css`.
5. Run `npm run typecheck` → validates parity.

## Who edits what

| Role | Edits |
|------|-------|
| Designer | Figma variables, component specs in Figma |
| Dev | `tokens.json`, primitives, `registry.json` |
| Both | Semantic role names — agree before adding new `--nil-*` roles |

## Cadence

- **Now:** manual, per craft pass
- **Later:** Tokens Studio sync script or Style Dictionary pipeline (`@nilds/tokens`)

## Not in scope yet

- Figma Code Connect
- Automated Figma ↔ GitHub PRs
- Component library in Figma mirroring every React primitive
