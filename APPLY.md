# APPLY — wire NIL DS into a consumer app

Step-by-step for Vite + React. Tailwind v4 optional.

## 1. Link the kit

```json
{
  "dependencies": {
    "nil-ds": "file:../nil-ds"
  }
}
```

```bash
npm install
```

## 2. Import CSS (order matters)

```ts
// main.tsx
import 'nil-ds/tokens/tokens.css';
import 'nil-ds/core/core.css';
```

Or relative paths if not using package name resolution:

```ts
import '../nil-ds/src/tokens/tokens.css';
import '../nil-ds/src/core/core.css';
```

## 3. Use components

```tsx
import { Button, Panel, Dial } from 'nil-ds';

export function Example() {
  return (
    <Panel title="Status">
      <Dial value="21.4" unit="°C" progress={71} />
      <Button variant="primary">Park</Button>
    </Panel>
  );
}
```

## 4. Tailwind v4 alias map (optional)

Copy `src/core/tailwind-theme.css` or add to your `index.css`:

```css
@import "tailwindcss";
@import "nil-ds/tokens/tokens.css";
@import "nil-ds/core/core.css";

@theme {
  --color-paper: var(--nil-color-bg);
  --color-raised: var(--nil-color-surface);
  --color-line: var(--nil-color-border);
  --color-ink: var(--nil-color-text);
  --color-muted: var(--nil-color-text-muted);
  --color-mark: var(--nil-color-accent);
  --color-mark-text: var(--nil-color-accent-contrast);
}
```

Then use `bg-paper`, `text-ink`, `border-line`, `bg-mark`.

## 5. App ui wrappers (recommended)

Thin re-exports under `src/components/ui/`:

```tsx
import { Button as NilButton, type ButtonProps } from 'nil-ds';

export function Button(props: ButtonProps) {
  return <NilButton {...props} />;
}
```

Keeps app imports stable if you customize later.

## 6. App-owned tokens

Product-specific colours (tags, buckets, categories) stay in consumer `@theme`:

```css
@theme {
  --color-tag-now: #d4764e;
  --color-do: #6a9e6a;
}
```

Do not add these to NIL `tokens.json`.

## 7. Theme

Light default on `:root`. Dark:

```tsx
<div data-theme="dark">…</div>
```

## 8. Camera rehearsal (Loom)

| Shot | Where |
|------|-------|
| Showroom scroll | `nil-ds` → `npm run dev` |
| Token source | `src/tokens/tokens.json` in editor |
| Token Lab | Accent/canvas swap in demo |
| Consumer wiring | TetherLog `nil-consumer-wip` branch — `index.css` imports + `@theme` |
| Honest gap | TetherLog `main` may differ from wip — merge is separate lane |

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Unstyled components | CSS import order; tokens before core |
| Wrong colours | Check `data-theme`; Token Lab swatches |
| Peer react errors | `react` + `react-dom` >= 18 in consumer |
| Drift after token edit | `npm run tokens:build` in nil-ds |
