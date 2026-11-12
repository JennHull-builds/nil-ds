# Changelog

## Unreleased

### Added

- **`Message` component.** A status or error line that sits beside a control: `tone` (`neutral`, `success`, `danger`) and `busy`. It is a live region that is always rendered, even empty. Danger is `role="alert"` with the error icon, success is `role="status"` with the check icon, and `busy` follows the words with the kit's blinking cursor. Each tone is a mapped text pair on `bg` and on `surface`.
- **`Input` takes a `trailing` control.** A small control drawn inside the field at its end, such as an icon `Button` that shows or hides a secret. With no `trailing` the markup is unchanged. With one, the input and the control share a `.nil-input-field` wrapper, and the input gets end padding so typed text never runs under the control.

### Changed

- **`Input` is as tall as the tap size.** `.nil-input` reads `--nil-size-tap` for its `min-height`, so an Input beside a md Button is no longer 2 px short.

## 0.3.0

An icon set, a new Button, and a chart palette.

### Added

- **Icon set, "Cut".** 36 icons drawn for the kit: straight lines only, curves cut into 45 degree facets, square ends, mitre joins. The stroke comes from the border tokens (`border-width` at 16 px, `border-width-thick` at 20 and 24 px). Mic, eye, eye-off, sun and trash have a simpler form at 16 px so no gap is thinner than the stroke beside it. No icon library, no dependency.
- **`Icon` component.** Decorative by default (`aria-hidden`); pass `label` for one that stands alone. Sizes `sm`, `md`, `lg`.
- **Button `icon` prop**, and icon-only buttons. An icon-only `Button` requires `aria-label` or `aria-labelledby`, and the TypeScript type enforces it.
- **Chart palette tokens**, `--nil-color-chart-*`: four categorical colours (blue, pale blue, orange, pale orange) and a five step ramp, light and dark, each with a `-text` token for text on the fill. Every chart mark takes an outline in the border colour; the outline carries the 3:1 contrast, not the fill. The text pairs are mapped in `design-md/structure.json`, so `tokens:validate` holds them to 4.5:1.
- **Size tokens:** `size-icon-sm|md|lg`, `size-tap`, `size-button-sm`, `size-offset`, `size-offset-hover`, `size-offset-focus`, `size-offset-lift`.
- **Lightbox** takes optional `onPrevious` and `onNext`, which show chevron buttons and answer ArrowLeft and ArrowRight.
- **Showroom:** an Icons and buttons section (the set at 24, 20 and 16 px, every Button state, light and dark) and a Chart colour section (palette, outlined charts, ramp, contrast numbers, a suggested TetherLog mapping as a table).
- `tokens.css` applies the light theme under `[data-theme='light']` as well as `:root`, so a light panel can sit inside a dark page.

### Changed

- **Button is rebuilt as "Offset".** The `[ ]` brackets are gone. A 2 px frame with a hard shadow in the border colour: hover lifts it, pressing pushes it in, and a toggle that is on (`aria-pressed`) stays pushed in and inverted. Keyboard focus turns the shadow to the accent colour; there is no outline ring (forced-colours mode gets a system outline). `md` is 44 px tall, `sm` is 36 px with its tap area extended to 44 px. `aria-disabled` and `aria-busy` behave as before.
- **ThemeToggle** is two small icon Buttons (sun and moon) in place of the text characters. **Dialog** closes with an icon Button. **Lightbox** closes with an icon Button and sets its controls in the dark theme. **Menu** shows a chevron icon, **Sidebar** a menu icon, and **Composer** puts an arrow-up icon beside Send and a stop icon beside Stop.
- **TabStrip** tabs are 44 px tall, and their focus turns the underline and label to the accent instead of drawing an outline ring.

### Removed

- The Button bracket markup and its `.nil-btn__bracket` rules.
- ThemeToggle's segmented border, divider and dimmed inactive icon.

### Known limits

- Firefox and Safari are unchecked for everything above.
- At 20 px the full mic, eye, sun and trash drawings still have gaps narrower than the stroke. At 24 px the mic and eye-off do. The gap rule was applied at 16 px.
- Menu items, Sidebar links, Toggle and Input are still under 44 px tall.
