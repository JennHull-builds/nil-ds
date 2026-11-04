---
version: alpha
name: "NIL DS"
description: "Brutalist CLI token and primitive kit: monospaced instrument UI on a warm canvas, light and dark, one accent."
colors:
  bg: "#f3f2ee"
  surface: "#eae9e5"
  text: "#0a0a0a"
  text-muted: "#4a4a4a"
  text-accent: "#2c5ce2"
  text-danger: "#c62832"
  border: "#0a0a0a"
  primary: "#396bf2"
  on-primary: "#ffffff"
  danger: "#c62832"
  success: "#00774c"
  overlay: "rgba(10, 10, 10, 0.92)"
  overlay-fg: "#f5f5f4"
  overlay-border: "rgba(245, 245, 244, 0.4)"
  grid-line: "rgba(128, 128, 128, 0.12)"
  shadow-stack: "#0a0a0a"
  bg-dark: "#0a0a0a"
  surface-dark: "#1c1c1c"
  text-dark: "#f3f2ee"
  text-muted-dark: "#8a8a8a"
  text-accent-dark: "#4a7dff"
  text-danger-dark: "#ea4d4f"
  border-dark: "#eae9e5"
  success-dark: "#22a06b"
typography:
  heading-1:
    fontFamily: "IBM Plex Sans"
    fontSize: 2.5rem
  heading-2:
    fontFamily: "IBM Plex Sans"
    fontSize: 1.75rem
  heading-3:
    fontFamily: "IBM Plex Sans"
    fontSize: 1.25rem
  body-md:
    fontFamily: "IBM Plex Sans"
    fontSize: 1rem
  body-sm:
    fontFamily: "IBM Plex Sans"
    fontSize: 0.875rem
  label:
    fontFamily: "IBM Plex Mono"
    fontSize: 0.75rem
    fontWeight: 400
  label-emphasis:
    fontFamily: "IBM Plex Mono"
    fontSize: 0.75rem
    fontWeight: 500
  button-sm:
    fontFamily: "IBM Plex Mono"
    fontSize: 0.75rem
  button-md:
    fontFamily: "IBM Plex Mono"
    fontSize: 0.875rem
  menu-item:
    fontFamily: "IBM Plex Mono"
    fontSize: 0.875rem
    fontWeight: 400
  prompt:
    fontFamily: "IBM Plex Mono"
    fontSize: 1rem
  readout-lg:
    fontFamily: "IBM Plex Mono"
    fontSize: 3.5rem
  readout-md:
    fontFamily: "IBM Plex Mono"
    fontSize: 2.5rem
  readout-unit:
    fontFamily: "IBM Plex Mono"
    fontSize: 1.25rem
rounded:
  none: 0px
  default: 4px
  sm: 4px
  md: 8px
  lg: 16px
  xl: 32px
  full: 999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 64px
  layout-page-x: 80px
  layout-section-y: 120px
  layout-max-width: 1440px
  layout-columns: 12
  layout-gutter: 24px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.default}"
  button-secondary:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text}"
    typography: "{typography.button-md}"
    rounded: "{rounded.default}"
  button-secondary-dark:
    backgroundColor: "{colors.bg-dark}"
    textColor: "{colors.text-dark}"
    typography: "{typography.button-md}"
    rounded: "{rounded.default}"
  button-ghost:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text}"
    typography: "{typography.button-md}"
    rounded: "{rounded.default}"
  button-ghost-dark:
    backgroundColor: "{colors.bg-dark}"
    textColor: "{colors.text-dark}"
    typography: "{typography.button-md}"
    rounded: "{rounded.default}"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.default}"
  button-disabled:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-muted}"
    typography: "{typography.button-md}"
    rounded: "{rounded.default}"
  button-disabled-dark:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-muted-dark}"
    typography: "{typography.button-md}"
    rounded: "{rounded.default}"
  button-sm:
    typography: "{typography.button-sm}"
  panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.default}"
    padding: "{spacing.md}"
  panel-dark:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-dark}"
    rounded: "{rounded.default}"
    padding: "{spacing.md}"
  panel-header:
    typography: "{typography.label}"
  panel-inverse:
    backgroundColor: "{colors.text}"
    textColor: "{colors.bg}"
    rounded: "{rounded.default}"
    padding: "{spacing.md}"
  panel-inverse-dark:
    backgroundColor: "{colors.text-dark}"
    textColor: "{colors.bg-dark}"
    rounded: "{rounded.default}"
    padding: "{spacing.md}"
  stack:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text}"
    rounded: "{rounded.default}"
  stack-dark:
    backgroundColor: "{colors.bg-dark}"
    textColor: "{colors.text-dark}"
    rounded: "{rounded.default}"
  stack-layer:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.default}"
  stack-layer-dark:
    backgroundColor: "{colors.surface-dark}"
    rounded: "{rounded.default}"
  dial:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text}"
  dial-dark:
    backgroundColor: "{colors.bg-dark}"
    textColor: "{colors.text-dark}"
  dial-solid:
    backgroundColor: "{colors.text}"
    textColor: "{colors.bg}"
  dial-solid-dark:
    backgroundColor: "{colors.text-dark}"
    textColor: "{colors.bg-dark}"
  dial-sm:
    size: 64px
  dial-md:
    size: 120px
  dial-lg:
    size: 180px
  dial-xl:
    size: 240px
  ring:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text}"
  ring-dark:
    backgroundColor: "{colors.bg-dark}"
    textColor: "{colors.text-dark}"
  ring-label:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text-muted}"
    typography: "{typography.label}"
  ring-label-dark:
    backgroundColor: "{colors.bg-dark}"
    textColor: "{colors.text-muted-dark}"
    typography: "{typography.label}"
  ring-sm:
    size: 48px
  ring-md:
    size: 72px
  toggle:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
  toggle-dark:
    backgroundColor: "{colors.bg-dark}"
    textColor: "{colors.text-dark}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
  toggle-on:
    backgroundColor: "{colors.text}"
    textColor: "{colors.bg}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
  toggle-on-dark:
    backgroundColor: "{colors.text-dark}"
    textColor: "{colors.bg-dark}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
  data-row:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text-muted}"
    typography: "{typography.label}"
  data-row-dark:
    backgroundColor: "{colors.bg-dark}"
    textColor: "{colors.text-muted-dark}"
    typography: "{typography.label}"
  data-row-active:
    textColor: "{colors.text}"
    typography: "{typography.label}"
  data-row-active-dark:
    textColor: "{colors.text-dark}"
    typography: "{typography.label}"
  tab-strip-tab:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text-muted}"
    typography: "{typography.label}"
  tab-strip-tab-dark:
    backgroundColor: "{colors.bg-dark}"
    textColor: "{colors.text-muted-dark}"
    typography: "{typography.label}"
  tab-strip-tab-active:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text}"
    typography: "{typography.label}"
  tab-strip-tab-active-dark:
    backgroundColor: "{colors.bg-dark}"
    textColor: "{colors.text-dark}"
    typography: "{typography.label}"
  meta:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text}"
    typography: "{typography.label}"
  meta-dark:
    backgroundColor: "{colors.bg-dark}"
    textColor: "{colors.text-dark}"
    typography: "{typography.label}"
  meta-neutral:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text-muted}"
    typography: "{typography.label}"
  meta-neutral-dark:
    backgroundColor: "{colors.bg-dark}"
    textColor: "{colors.text-muted-dark}"
    typography: "{typography.label}"
  meta-accent:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text-accent}"
    typography: "{typography.label-emphasis}"
  meta-accent-dark:
    backgroundColor: "{colors.bg-dark}"
    textColor: "{colors.text-accent-dark}"
    typography: "{typography.label-emphasis}"
  meta-danger:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text-danger}"
    typography: "{typography.label-emphasis}"
  meta-danger-dark:
    backgroundColor: "{colors.bg-dark}"
    textColor: "{colors.text-danger-dark}"
    typography: "{typography.label-emphasis}"
  meta-success:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.success}"
    typography: "{typography.label-emphasis}"
  meta-success-dark:
    backgroundColor: "{colors.bg-dark}"
    textColor: "{colors.success-dark}"
    typography: "{typography.label-emphasis}"
  meta-neutral-on-surface:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-muted}"
    typography: "{typography.label}"
  meta-neutral-on-surface-dark:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-muted-dark}"
    typography: "{typography.label}"
  meta-accent-on-surface:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-accent}"
    typography: "{typography.label-emphasis}"
  meta-accent-on-surface-dark:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-accent-dark}"
    typography: "{typography.label-emphasis}"
  meta-danger-on-surface:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-danger}"
    typography: "{typography.label-emphasis}"
  meta-danger-on-surface-dark:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-danger-dark}"
    typography: "{typography.label-emphasis}"
  meta-success-on-surface:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.success}"
    typography: "{typography.label-emphasis}"
  meta-success-on-surface-dark:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.success-dark}"
    typography: "{typography.label-emphasis}"
  readout-lg:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text}"
    typography: "{typography.readout-lg}"
  readout-lg-dark:
    backgroundColor: "{colors.bg-dark}"
    textColor: "{colors.text-dark}"
    typography: "{typography.readout-lg}"
  readout-md:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text}"
    typography: "{typography.readout-md}"
  readout-md-dark:
    backgroundColor: "{colors.bg-dark}"
    textColor: "{colors.text-dark}"
    typography: "{typography.readout-md}"
  readout-unit:
    typography: "{typography.readout-unit}"
  prompt:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text}"
    typography: "{typography.prompt}"
  prompt-dark:
    backgroundColor: "{colors.bg-dark}"
    textColor: "{colors.text-dark}"
    typography: "{typography.prompt}"
  prompt-prefix:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text-muted}"
    typography: "{typography.prompt}"
  prompt-prefix-dark:
    backgroundColor: "{colors.bg-dark}"
    textColor: "{colors.text-muted-dark}"
    typography: "{typography.prompt}"
  composer:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.prompt}"
    rounded: "{rounded.default}"
    padding: "{spacing.md}"
  composer-dark:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-dark}"
    typography: "{typography.prompt}"
    rounded: "{rounded.default}"
    padding: "{spacing.md}"
  composer-prefix:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-muted}"
    typography: "{typography.prompt}"
  composer-prefix-dark:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-muted-dark}"
    typography: "{typography.prompt}"
  composer-placeholder:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-muted}"
    typography: "{typography.prompt}"
  composer-placeholder-dark:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-muted-dark}"
    typography: "{typography.prompt}"
  composer-hint:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-muted}"
    typography: "{typography.label}"
  composer-hint-dark:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-muted-dark}"
    typography: "{typography.label}"
  composer-disabled:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-muted}"
    typography: "{typography.prompt}"
  composer-disabled-dark:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-muted-dark}"
    typography: "{typography.prompt}"
  composer-send:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-sm}"
    rounded: "{rounded.default}"
  composer-stop:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text}"
    typography: "{typography.button-sm}"
    rounded: "{rounded.default}"
  composer-stop-dark:
    backgroundColor: "{colors.bg-dark}"
    textColor: "{colors.text-dark}"
    typography: "{typography.button-sm}"
    rounded: "{rounded.default}"
  badge-neutral:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text-muted}"
    typography: "{typography.label}"
    rounded: "{rounded.default}"
  badge-neutral-dark:
    backgroundColor: "{colors.bg-dark}"
    textColor: "{colors.text-muted-dark}"
    typography: "{typography.label}"
    rounded: "{rounded.default}"
  badge-accent:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text-accent}"
    typography: "{typography.label}"
    rounded: "{rounded.default}"
  badge-accent-dark:
    backgroundColor: "{colors.bg-dark}"
    textColor: "{colors.text-accent-dark}"
    typography: "{typography.label}"
    rounded: "{rounded.default}"
  badge-danger:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text-danger}"
    typography: "{typography.label}"
    rounded: "{rounded.default}"
  badge-danger-dark:
    backgroundColor: "{colors.bg-dark}"
    textColor: "{colors.text-danger-dark}"
    typography: "{typography.label}"
    rounded: "{rounded.default}"
  badge-success:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.success}"
    typography: "{typography.label}"
    rounded: "{rounded.default}"
  badge-success-dark:
    backgroundColor: "{colors.bg-dark}"
    textColor: "{colors.success-dark}"
    typography: "{typography.label}"
    rounded: "{rounded.default}"
  badge-neutral-on-surface:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-muted}"
    typography: "{typography.label}"
    rounded: "{rounded.default}"
  badge-neutral-on-surface-dark:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-muted-dark}"
    typography: "{typography.label}"
    rounded: "{rounded.default}"
  badge-accent-on-surface:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-accent}"
    typography: "{typography.label}"
    rounded: "{rounded.default}"
  badge-accent-on-surface-dark:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-accent-dark}"
    typography: "{typography.label}"
    rounded: "{rounded.default}"
  badge-danger-on-surface:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-danger}"
    typography: "{typography.label}"
    rounded: "{rounded.default}"
  badge-danger-on-surface-dark:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-danger-dark}"
    typography: "{typography.label}"
    rounded: "{rounded.default}"
  badge-success-on-surface:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.success}"
    typography: "{typography.label}"
    rounded: "{rounded.default}"
  badge-success-on-surface-dark:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.success-dark}"
    typography: "{typography.label}"
    rounded: "{rounded.default}"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.body-md}"
    rounded: "{rounded.default}"
  input-dark:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-dark}"
    typography: "{typography.body-md}"
    rounded: "{rounded.default}"
  input-placeholder:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-muted}"
    typography: "{typography.body-md}"
  input-placeholder-dark:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-muted-dark}"
    typography: "{typography.body-md}"
  input-label:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text}"
    typography: "{typography.body-sm}"
  input-label-dark:
    backgroundColor: "{colors.bg-dark}"
    textColor: "{colors.text-dark}"
    typography: "{typography.body-sm}"
  input-error:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text-danger}"
  input-error-dark:
    backgroundColor: "{colors.bg-dark}"
    textColor: "{colors.text-danger-dark}"
  input-error-on-surface:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-danger}"
  input-error-on-surface-dark:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-danger-dark}"
  theme-toggle-pressed:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
  lightbox-close:
    backgroundColor: "{colors.overlay}"
    textColor: "{colors.overlay-fg}"
    typography: "{typography.button-md}"
    rounded: "{rounded.default}"
  dialog:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.body-md}"
    rounded: "{rounded.default}"
    width: 480px
  dialog-dark:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-dark}"
    typography: "{typography.body-md}"
    rounded: "{rounded.default}"
    width: 480px
  dialog-title:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.label}"
  dialog-title-dark:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-dark}"
    typography: "{typography.label}"
  dialog-description:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-muted}"
    typography: "{typography.body-md}"
  dialog-description-dark:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-muted-dark}"
    typography: "{typography.body-md}"
  dialog-close:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.button-md}"
    rounded: "{rounded.default}"
  dialog-close-dark:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-dark}"
    typography: "{typography.button-md}"
    rounded: "{rounded.default}"
  menu:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.menu-item}"
    rounded: "{rounded.default}"
  menu-dark:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-dark}"
    typography: "{typography.menu-item}"
    rounded: "{rounded.default}"
  menu-item-highlighted:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text}"
    typography: "{typography.menu-item}"
  menu-item-highlighted-dark:
    backgroundColor: "{colors.bg-dark}"
    textColor: "{colors.text-dark}"
    typography: "{typography.menu-item}"
  menu-item-disabled:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-muted}"
    typography: "{typography.menu-item}"
  menu-item-disabled-dark:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-muted-dark}"
    typography: "{typography.menu-item}"
  menu-item-danger:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-danger}"
    typography: "{typography.menu-item}"
  menu-item-danger-dark:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-danger-dark}"
    typography: "{typography.menu-item}"
  menu-item-danger-highlighted:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text-danger}"
    typography: "{typography.menu-item}"
  menu-item-danger-highlighted-dark:
    backgroundColor: "{colors.bg-dark}"
    textColor: "{colors.text-danger-dark}"
    typography: "{typography.menu-item}"
---

<!-- Generated by scripts/build-design-md.mjs from src/tokens/tokens.json, registry.json and design-md/. Do not edit by hand. Regenerate: npm run tokens:build -->

# NIL DS

## Overview

NIL DS is a brutalist CLI kit. It takes a terminal's vocabulary (bracketed key-value labels, a prompt with a blinking cursor, uppercase mono labels) and applies it to instrument-style interfaces: dials, readouts, schedules, panels. It is dense and structural. Borders do the work that shadows and gradients do elsewhere.

The kit has three layers: raw values, semantic roles, components. This file describes the semantic layer and the components built on it. If a design needs something that has no token here, add a token. Don't invent a value.

Everything in the front matter, and every table below, is generated from `src/tokens/tokens.json` and `registry.json`. This hand-written text names tokens and never states a value, because prose goes stale and generated values don't. To change the file, edit those sources or the files in `design-md/`, then run `npm run tokens:build`.

## Colors

`bg` is the canvas. `surface` is anything raised above it: panels, inputs, cards. `text` is the ink, `text-muted` is for secondary text, and `border` colours rules and outlines.

`primary` is the single accent, and it is a fill. The token file calls it `accent`; it is named `primary` here because the DESIGN.md format and its linter look for that name. Use it for the main action, focus outlines and the indicators on gauges. `on-primary` is the text colour that sits on it.

Accent as text is its own role. `text-accent` colours accent labels, badges and the cursor, and it has a dark value of its own so it stays readable on both canvases. `primary` falls short of AA as a text colour, so it never goes on text.

`danger` is the status fill and outline colour: the danger button's fill, an invalid input's border and a danger dialog's top rule. Danger as text is `text-danger`, on labels, badges and input errors, with a dark value of its own. `success` only ever appears as text, so it is its own text colour and has a separate dark value. `overlay`, `overlay-fg` and `overlay-border` belong to the lightbox. `grid-line` draws the structural hatch.

### Dark theme

The DESIGN.md format has no concept of themes, so this file adds one small convention. Light is the default. Where a token's dark value differs from its light value, there is a second token with the same name and a `-dark` suffix, for example `bg` and `bg-dark`. A token with no `-dark` twin is the same in both themes. Component variants follow the same rule: `panel-dark` is `panel` with the `-dark` tokens swapped in. In CSS, dark applies under `data-theme="dark"` on any ancestor.

The convention uses only names the format already accepts, so tools read the file as an ordinary palette. They won't know that `-dark` means dark. That is stated only here.

### Names in code

In CSS, colours are the `--nil-color-*` custom properties. Use those, not the values in the front matter. The table maps each token here to its source in the token file and to its custom property.

| Token here | Token file | CSS custom property |
| --- | --- | --- |
| `bg` | `semantic.light.color-bg` | `--nil-color-bg` |
| `surface` | `semantic.light.color-surface` | `--nil-color-surface` |
| `text` | `semantic.light.color-text` | `--nil-color-text` |
| `text-muted` | `semantic.light.color-text-muted` | `--nil-color-text-muted` |
| `text-accent` | `semantic.light.color-text-accent` | `--nil-color-text-accent` |
| `text-danger` | `semantic.light.color-text-danger` | `--nil-color-text-danger` |
| `border` | `semantic.light.color-border` | `--nil-color-border` |
| `primary` | `semantic.light.color-accent` | `--nil-color-accent` |
| `on-primary` | `semantic.light.color-accent-contrast` | `--nil-color-accent-contrast` |
| `danger` | `semantic.light.color-danger` | `--nil-color-danger` |
| `success` | `semantic.light.color-success` | `--nil-color-success` |
| `overlay` | `semantic.color-overlay` | `--nil-color-overlay` |
| `overlay-fg` | `semantic.color-overlay-fg` | `--nil-color-overlay-fg` |
| `overlay-border` | `semantic.color-overlay-border` | `--nil-color-overlay-border` |
| `grid-line` | `semantic.color-grid-line` | `--nil-color-grid-line` |
| `shadow-stack` | `semantic.color-shadow-stack` | `--nil-color-shadow-stack` |
| `bg-dark` | `semantic.dark.color-bg` | `--nil-color-bg under [data-theme='dark']` |
| `surface-dark` | `semantic.dark.color-surface` | `--nil-color-surface under [data-theme='dark']` |
| `text-dark` | `semantic.dark.color-text` | `--nil-color-text under [data-theme='dark']` |
| `text-muted-dark` | `semantic.dark.color-text-muted` | `--nil-color-text-muted under [data-theme='dark']` |
| `text-accent-dark` | `semantic.dark.color-text-accent` | `--nil-color-text-accent under [data-theme='dark']` |
| `text-danger-dark` | `semantic.dark.color-text-danger` | `--nil-color-text-danger under [data-theme='dark']` |
| `border-dark` | `semantic.dark.color-border` | `--nil-color-border under [data-theme='dark']` |
| `success-dark` | `semantic.dark.color-success` | `--nil-color-success under [data-theme='dark']` |

### Contrast

The linter checks the contrast of every component that has both a background and a text colour, and `npm run tokens:validate` fails if a pair falls below WCAG AA. A component that is transparent in code is listed against `bg`, the canvas it sits on by default. Where one is drawn inside a card or a panel it also has an entry ending in `-on-surface`, because surface is the harder background for coloured text. Only the pairs listed in this file are checked. A pair that isn't here isn't covered, and neither is anything dimmed with opacity.

## Typography

Two families do all the work. The sans family sets reading text: body copy and headings. The mono family sets everything instrument-like: labels, buttons, tabs, rows, prompts. Large numerals in readouts use the display family, which is its own token so numerals can change without touching labels.

Labels, tabs, toggles, rows and button text are uppercase with generous letter spacing. The components apply that themselves, and the token file has no tokens for either, so the front matter can't carry it. If you build a label that isn't a component, match them.

A typography level here holds one family name, because that is what the format's slot takes. The fallback stack lives in the token file and in `--nil-font-body`, `--nil-font-mono` and `--nil-font-display`. Use the custom properties when writing styles.

Weights, line heights and letter spacing appear in the front matter only where the token file defines them. For the rest, the component sets its own, so read its source before overriding.

## Layout

Content sits in a centred container with a maximum width and a horizontal page inset. Inside it is a column grid with gutters, and sections are separated by vertical section padding. These are the `layout-*` entries in the spacing group, because the format has no layout group of its own.

The grid collapses to fewer columns at each breakpoint, and the page inset shrinks with it.

| Token | Value | CSS custom property |
| --- | --- | --- |
| `breakpoint-md` | `768px` | `--nil-breakpoint-md` |
| `breakpoint-lg` | `1024px` | `--nil-breakpoint-lg` |

Every gap and padding comes from the spacing scale, which is `--nil-spacing-*` in CSS. Don't write pixel values by hand.

## Elevation & Depth

There are no blurred shadows. Depth comes from borders, from the step between `bg` and `surface`, and from offset layers. Stack shows the third: copies of the card peek out behind it, offset by geometry and not by box-shadow.

The format's component group has no border property, so borders are described here.

| Token | Value | CSS custom property |
| --- | --- | --- |
| `border-width` | `1.5px` | `--nil-border-width` |
| `border-width-thick` | `2px` | `--nil-border-width-thick` |

Use the thin width for rules and outlines, and the thick width for emphasis: primary and secondary buttons, the active tab and the lightbox.

## Shapes

Bordered components use `rounded.default`, a small radius: soft brutalist, not sharp. The one exception is Toggle, which is a pill and uses `rounded.full`. Don't hardcode a radius. In CSS the scale is `--nil-radius-*`.

## Components

One group per primitive in `registry.json`: Button, Panel, Stack, Dial, Ring, Toggle, DataRow, TabStrip, Meta, Readout, Prompt, Composer, Badge, Input, ThemeToggle, Lightbox, Dialog and Menu. Variants use the format's related-key convention (`button-primary`, `button-secondary`), and the dark twin of any variant ends in `-dark`. Dial and Ring sizes are `size` entries such as `dial-sm` and `ring-md`.

What the front matter can't say:

- Borders. See Elevation & Depth.
- Interaction states other than disabled. Primary and danger buttons darken on hover, secondary and ghost buttons fill with `surface`, and focus is an outline in `primary`.
- Dialog's scrim and danger rule. The scrim is `overlay` painted on the dialog element itself, and a danger dialog adds a top rule in `danger`. Neither is a text and background pair, so the linter doesn't check them. The danger rule is a non-text edge and needs 3:1 against what touches it.
- Menu's highlighted row. It is the canvas colour on the surface, which are close, so the row also gets a thick left rule in the text colour. The rule is a non-text edge and needs 3:1 against the surface it touches. The trigger is a Button and takes its pairs from there. Menu opens with no animation, so there is no motion to switch off under reduced motion.
- Composer's height. The text box grows with its text up to a row limit set by a prop, so it has no size entry. Its focus outline is drawn on the shell, not on the text box.
- The active data row's background. CSS mixes it from other tokens, so it has no entry of its own and the linter doesn't check it.
- Transparency. Components that are transparent in code (the ghost button, an off toggle, rows, tabs, meta labels, prompts, readouts, dials and rings) are listed on `bg`.

## Do's and Don'ts

- Do use the semantic `--nil-*` tokens. Don't reach for the raw `--nil-primitive-*` values in components or pages.
- Don't introduce pure black or pure white of your own. Use the colour tokens.
- Don't hardcode a corner radius or a pixel value. Use `rounded.default` and the spacing scale.
- Do keep product-specific colours, such as category or bucket hues, in the app's own theme. Don't add them to NIL's tokens.
- Do run `npm run tokens:validate` before pairing text with a background. A pair below WCAG AA fails it.
- Do use `text-accent` and `text-danger` for accent and danger text. Don't use `primary` or `danger` as a text colour.
- Do pick a component by its job. `AGENTS.md` has the table.

## Motion

Motion has no group in the format, so the values are listed here. Every transition takes its duration from a token, never a literal. In CSS they are `--nil-motion-*`.

| Token | Value | CSS custom property |
| --- | --- | --- |
| `motion-duration-fast` | `120ms` | `--nil-motion-duration-fast` |
| `motion-duration-base` | `200ms` | `--nil-motion-duration-base` |
| `motion-duration-slow` | `360ms` | `--nil-motion-duration-slow` |
| `motion-duration-enter` | `650ms` | `--nil-motion-duration-enter` |
| `motion-duration-blink` | `1100ms` | `--nil-motion-duration-blink` |
| `motion-easing-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | `--nil-motion-easing-standard` |
| `motion-easing-out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` | `--nil-motion-easing-out-expo` |
| `motion-easing-step` | `step-end` | `--nil-motion-easing-step` |

Fast is for colour changes such as hover and tabs. Base is for button and toggle state. Enter is for things arriving on screen, and blink is the cursor.

With reduced motion on, every duration collapses to a near-instant one, the cursor stops blinking, and entrances arrive in place with no stagger.
