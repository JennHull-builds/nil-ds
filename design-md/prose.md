# NIL DS

## Overview

NIL DS is a brutalist CLI kit. It takes a terminal's vocabulary (bracketed key-value labels, a prompt with a blinking cursor, uppercase mono labels) and applies it to instrument-style interfaces: dials, readouts, schedules, panels. It is dense and structural. Borders do the work that shadows and gradients do elsewhere.

The kit has three layers: raw values, semantic roles, components. This file describes the semantic layer and the components built on it. If a design needs something that has no token here, add a token. Don't invent a value.

Everything in the front matter, and every table below, is generated from `src/tokens/tokens.json` and `registry.json`. This hand-written text names tokens and never states a value, because prose goes stale and generated values don't. To change the file, edit those sources or the files in `design-md/`, then run `npm run tokens:build`.

## Colors

`bg` is the canvas. `surface` is anything raised above it: panels, inputs, cards. `text` is the ink, `text-muted` is for secondary text, and `border` colours rules and outlines.

`primary` is the single accent. The token file calls it `accent`; it is named `primary` here because the DESIGN.md format and its linter look for that name. Use it for the main action, focus outlines and the indicators on gauges. `on-primary` is the text colour that sits on it.

`danger` and `success` carry status, as text and outlines on labels, badges and input errors. `overlay`, `overlay-fg` and `overlay-border` belong to the lightbox. `grid-line` draws the structural hatch.

### Dark theme

The DESIGN.md format has no concept of themes, so this file adds one small convention. Light is the default. Where a token's dark value differs from its light value, there is a second token with the same name and a `-dark` suffix, for example `bg` and `bg-dark`. A token with no `-dark` twin is the same in both themes. Component variants follow the same rule: `panel-dark` is `panel` with the `-dark` tokens swapped in. In CSS, dark applies under `data-theme="dark"` on any ancestor.

The convention uses only names the format already accepts, so tools read the file as an ordinary palette. They won't know that `-dark` means dark. That is stated only here.

### Names in code

In CSS, colours are the `--nil-color-*` custom properties. Use those, not the values in the front matter. The table maps each token here to its source in the token file and to its custom property.

{{colour-names}}

### Contrast

The linter checks the contrast of every component that has both a background and a text colour. Run `npm run tokens:validate` for the current findings and read them before putting text on a colour. A component that is transparent in code is listed against `bg`, the canvas it sits on by default, so moving it onto `surface` changes its contrast.

## Typography

Two families do all the work. The sans family sets reading text: body copy and headings. The mono family sets everything instrument-like: labels, buttons, tabs, rows, prompts. Large numerals in readouts use the display family, which is its own token so numerals can change without touching labels.

Labels, tabs, toggles, rows and button text are uppercase with generous letter spacing. The components apply that themselves, and the token file has no tokens for either, so the front matter can't carry it. If you build a label that isn't a component, match them.

A typography level here holds one family name, because that is what the format's slot takes. The fallback stack lives in the token file and in `--nil-font-body`, `--nil-font-mono` and `--nil-font-display`. Use the custom properties when writing styles.

Weights, line heights and letter spacing appear in the front matter only where the token file defines them. For the rest, the component sets its own, so read its source before overriding.

## Layout

Content sits in a centred container with a maximum width and a horizontal page inset. Inside it is a column grid with gutters, and sections are separated by vertical section padding. These are the `layout-*` entries in the spacing group, because the format has no layout group of its own.

The grid collapses to fewer columns at each breakpoint, and the page inset shrinks with it.

{{breakpoints}}

Every gap and padding comes from the spacing scale, which is `--nil-spacing-*` in CSS. Don't write pixel values by hand.

## Elevation & Depth

There are no blurred shadows. Depth comes from borders, from the step between `bg` and `surface`, and from offset layers. Stack shows the third: copies of the card peek out behind it, offset by geometry and not by box-shadow.

The format's component group has no border property, so borders are described here.

{{borders}}

Use the thin width for rules and outlines, and the thick width for emphasis: primary and secondary buttons, the active tab and the lightbox.

## Shapes

Bordered components use `rounded.default`, a small radius: soft brutalist, not sharp. The one exception is Toggle, which is a pill and uses `rounded.full`. Don't hardcode a radius. In CSS the scale is `--nil-radius-*`.

## Components

One group per primitive in `registry.json`: Button, Panel, Stack, Dial, Ring, Toggle, DataRow, TabStrip, Meta, Readout and Prompt. Variants use the format's related-key convention (`button-primary`, `button-secondary`), and the dark twin of any variant ends in `-dark`. Dial and Ring sizes are `size` entries such as `dial-sm` and `ring-md`.

What the front matter can't say:

- Borders. See Elevation & Depth.
- Interaction states other than disabled. Primary buttons brighten on hover, secondary and ghost buttons fill with `surface`, and focus is an outline in `primary`.
- The active data row's background. CSS mixes it from other tokens, so it has no entry of its own and the linter doesn't check it.
- Transparency. Components that are transparent in code (the ghost button, an off toggle, rows, tabs, meta labels, prompts, readouts, dials and rings) are listed on `bg`.

## Do's and Don'ts

- Do use the semantic `--nil-*` tokens. Don't reach for the raw `--nil-primitive-*` values in components or pages.
- Don't introduce pure black or pure white of your own. Use the colour tokens.
- Don't hardcode a corner radius or a pixel value. Use `rounded.default` and the spacing scale.
- Do keep product-specific colours, such as category or bucket hues, in the app's own theme. Don't add them to NIL's tokens.
- Do check the linter's contrast findings before pairing text with a background.
- Do pick a component by its job. `AGENTS.md` has the table.

## Motion

Motion has no group in the format, so the values are listed here. Every transition takes its duration from a token, never a literal. In CSS they are `--nil-motion-*`.

{{motion}}

Fast is for colour changes such as hover and tabs. Base is for button and toggle state. Enter is for things arriving on screen, and blink is the cursor.

With reduced motion on, every duration collapses to a near-instant one, the cursor stops blinking, and entrances arrive in place with no stagger.
