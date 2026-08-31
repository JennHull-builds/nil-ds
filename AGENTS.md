# NIL DS — Agent guide

Read this before generating UI with NIL primitives.

## Token rules

1. Load `tokens.css` then `core.css` on the consumer root.
2. Components consume **only** `--nil-*` semantic tokens.
3. Never reference `--nil-primitive-*` in component or page code.
4. Swap brand by changing `primitive.color.accent` in `tokens.json` then `npm run tokens:build`.

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
| Large stat | `Readout` |

## App vs NIL boundary

- **NIL tokens:** bg, surface, text, border, accent, spacing, motion.
- **App tokens:** product category colours, bucket hues, feature-specific semantics — map in consumer `@theme`, not in `tokens.json`.

## Registry

See `registry.json` for per-component token dependencies and props.

## Never

- Import Radix/shadcn into NIL kit source
- Use `#000` / `#fff` unless explicitly requested
- Hardcode corner radius in components — use `--nil-radius-default` (4px soft brutalist)
- Invent magic pixel values — use `--nil-spacing-*` and layout tokens
