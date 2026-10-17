/**
 * Generate DESIGN.md from src/tokens/tokens.json, registry.json and design-md/*.
 * Run: npm run tokens:build
 *
 * DESIGN.md is Google Labs' open format for describing a design system to coding
 * agents (https://github.com/google-labs-code/design.md, spec version "alpha").
 *
 * Every value in the front matter and in the generated tables comes from tokens.json.
 * design-md/structure.json says which tokens each component uses and never holds a
 * value. design-md/prose.md is the hand-written rationale and never states a value; it
 * carries {{placeholders}} where a generated table goes. This script stitches the three.
 *
 * Only the semantic layer is exposed, on purpose. AGENTS.md forbids components from
 * reading --nil-primitive-*, so a file for generating UI must not offer them.
 *
 * This runs inside `build:demo` (via tokens:build), so it only reads files and throws
 * on an authoring error. The linter lives in validate-tokens.mjs and never runs here.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outPath = join(root, 'DESIGN.md');

const tokens = JSON.parse(readFileSync(join(root, 'src/tokens/tokens.json'), 'utf8'));
const registry = JSON.parse(readFileSync(join(root, 'registry.json'), 'utf8'));
const structure = JSON.parse(readFileSync(join(root, 'design-md/structure.json'), 'utf8'));
const prose = readFileSync(join(root, 'design-md/prose.md'), 'utf8');

const { semantic } = tokens;

function getPath(obj, path) {
  let cur = obj;
  for (const p of path.split('.')) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = cur[p];
  }
  return cur;
}

function resolveRef(ref) {
  const node = getPath(tokens, ref);
  if (!node) throw new Error(`Unresolved ref: ${ref}`);
  if (node.value !== undefined) return node.value;
  if (node.ref) return resolveRef(node.ref);
  throw new Error(`Invalid ref node: ${ref}`);
}

/** Resolve a semantic node ({ ref } or { value }) to its literal value. */
function literal(node, label) {
  if (!node) throw new Error(`Unknown semantic token: ${label}`);
  return node.value !== undefined ? node.value : resolveRef(node.ref);
}

const THEMES = ['light', 'dark'];

/**
 * DESIGN.md colour names. The token file says `accent`; the format and its linter look for
 * `primary` (a missing one is a lint warning and tells Stitch to invent its own key
 * colours), so the accent role takes that name here. Everything else keeps its tokens.json
 * name minus the `color-` prefix, so the two files stay easy to compare.
 */
const COLOR_RENAMES = { accent: 'primary', 'accent-contrast': 'on-primary' };

const colorName = (key) => {
  const bare = key.replace(/^color-/, '');
  return COLOR_RENAMES[bare] ?? bare;
};

/** Colour tokens that are not themed: top-level `color-*` aliases in semantic. */
const unthemedColorKeys = Object.keys(semantic).filter(
  (k) => k.startsWith('color-') && !THEMES.includes(k),
);

// colors: light first (the default), unthemed aliases, then a `-dark` twin only where the
// resolved dark value differs from light. Themes are a naming convention here, because the
// format has no theme concept; it is recorded in PLAN.md and explained in prose.md.
const colors = []; // { name, value, source, css, dark }
for (const key of Object.keys(semantic.light)) {
  colors.push({
    name: colorName(key),
    value: literal(semantic.light[key], `light.${key}`),
    source: `semantic.light.${key}`,
    css: `--nil-${key}`,
    dark: false,
  });
}
for (const key of unthemedColorKeys) {
  colors.push({
    name: colorName(key),
    value: literal(semantic[key], key),
    source: `semantic.${key}`,
    css: `--nil-${key}`,
    dark: false,
  });
}
for (const key of Object.keys(semantic.dark)) {
  const light = colors.find((c) => c.source === `semantic.light.${key}`);
  const value = literal(semantic.dark[key], `dark.${key}`);
  if (light && light.value === value) continue;
  colors.push({
    name: `${colorName(key)}-dark`,
    value,
    source: `semantic.dark.${key}`,
    css: `--nil-${key}`,
    dark: true,
  });
}
const colorByName = new Map(colors.map((c) => [c.name, c]));

// Semantic key -> DESIGN.md colour name, for component references.
function colorRef(key) {
  const name = colorName(key);
  if (!colorByName.has(name)) throw new Error(`Component uses a colour DESIGN.md does not have: ${key}`);
  return name;
}

/** First family in a CSS stack, unquoted. The format's `fontFamily` takes one family. */
function firstFamily(stack) {
  return stack.split(',')[0].trim().replace(/^['"]|['"]$/g, '');
}

const scale = (prefix) =>
  Object.keys(semantic)
    .filter((k) => k.startsWith(prefix))
    .map((k) => ({ name: k.slice(prefix.length), value: literal(semantic[k], k), key: k }));

const rounded = scale('radius-');
const spacing = [
  ...scale('spacing-'),
  ...scale('layout-').map((e) => ({ ...e, name: `layout-${e.name}` })),
];

const typography = Object.entries(structure.typography).map(([name, t]) => ({
  name,
  fontFamily: firstFamily(literal(semantic[t.font], t.font)),
  fontSize: literal(semantic[t.size], t.size),
  fontWeight: t.weight ? Number(literal(semantic[t.weight], t.weight)) : undefined,
}));
const typographyNames = new Set(typography.map((t) => t.name));

// components, in registry order. `-dark` twin appears right after its light variant, and
// only where swapping in the dark colours actually changes the entry.
const registryNames = registry.components.map((c) => c.name);
const strayGroups = Object.keys(structure.components).filter((g) => !registryNames.includes(g));
if (strayGroups.length) throw new Error(`structure.json has groups not in registry.json: ${strayGroups.join(', ')}`);

function componentProps(spec) {
  const out = {};
  for (const [prop, key] of Object.entries(spec)) {
    if (prop === 'backgroundColor' || prop === 'textColor') {
      out[prop] = { color: colorRef(key) };
    } else if (prop === 'typography') {
      if (!typographyNames.has(key)) throw new Error(`Unknown typography level: ${key}`);
      out[prop] = `{typography.${key}}`;
    } else if (prop === 'rounded' || prop === 'padding') {
      const group = prop === 'rounded' ? 'radius-' : 'spacing-';
      if (!(key in semantic) || !key.startsWith(group)) throw new Error(`Bad ${prop} token: ${key}`);
      out[prop] = `{${prop === 'rounded' ? 'rounded' : 'spacing'}.${key.slice(group.length)}}`;
    } else if (['size', 'width', 'height'].includes(prop)) {
      out[prop] = literal(semantic[key], key);
    } else {
      throw new Error(`Unsupported component property: ${prop}`);
    }
  }
  return out;
}

const colorRefStr = (name) => `{colors.${name}}`;
const components = [];
for (const group of registryNames) {
  for (const [name, spec] of Object.entries(structure.components[group] ?? {})) {
    const props = componentProps(spec);
    const light = {};
    const dark = {};
    for (const [prop, v] of Object.entries(props)) {
      if (v?.color) {
        light[prop] = colorRefStr(v.color);
        dark[prop] = colorRefStr(colorByName.has(`${v.color}-dark`) ? `${v.color}-dark` : v.color);
      } else {
        light[prop] = v;
        dark[prop] = v;
      }
    }
    components.push({ name, props: light });
    if (JSON.stringify(light) !== JSON.stringify(dark)) components.push({ name: `${name}-dark`, props: dark });
  }
}

// ── YAML ────────────────────────────────────────────────────────────────────────────
const DIMENSION = /^-?\d+(\.\d+)?(px|rem|em)$/;
function scalar(v) {
  if (typeof v === 'number') return String(v);
  if (typeof v === 'string' && /^\d+$/.test(v)) return v; // a bare count, e.g. columns
  if (typeof v === 'string' && DIMENSION.test(v)) return v;
  return JSON.stringify(v);
}

const yaml = [];
yaml.push('version: alpha');
yaml.push(`name: ${JSON.stringify(structure.meta.name)}`);
yaml.push(`description: ${JSON.stringify(structure.meta.description)}`);
yaml.push('colors:');
colors.forEach((c) => yaml.push(`  ${c.name}: ${JSON.stringify(c.value)}`));
yaml.push('typography:');
typography.forEach((t) => {
  yaml.push(`  ${t.name}:`);
  yaml.push(`    fontFamily: ${JSON.stringify(t.fontFamily)}`);
  yaml.push(`    fontSize: ${scalar(t.fontSize)}`);
  if (t.fontWeight !== undefined) yaml.push(`    fontWeight: ${t.fontWeight}`);
});
yaml.push('rounded:');
rounded.forEach((r) => yaml.push(`  ${r.name}: ${scalar(r.value)}`));
yaml.push('spacing:');
spacing.forEach((s) => yaml.push(`  ${s.name}: ${scalar(s.value)}`));
yaml.push('components:');
components.forEach((c) => {
  yaml.push(`  ${c.name}:`);
  Object.entries(c.props).forEach(([k, v]) => yaml.push(`    ${k}: ${scalar(v)}`));
});

// ── Generated tables for what the format has no slot for ────────────────────────────
const code = (s) => `\`${s}\``;
function table(head, rows) {
  const line = (cells) => `| ${cells.join(' | ')} |`;
  return [line(head), line(head.map(() => '---')), ...rows.map(line)].join('\n');
}
const valueTable = (prefix) =>
  table(
    ['Token', 'Value', 'CSS custom property'],
    scale(prefix).map((e) => [code(e.key), code(e.value), code(`--nil-${e.key}`)]),
  );

const tables = {
  'colour-names': table(
    ['Token here', 'Token file', 'CSS custom property'],
    colors.map((c) => [
      code(c.name),
      code(c.source),
      code(c.dark ? `${c.css} under [data-theme='dark']` : c.css),
    ]),
  ),
  motion: valueTable('motion-'),
  borders: valueTable('border-'),
  breakpoints: valueTable('breakpoint-'),
};

const used = new Set();
const body = prose.replace(/\{\{([a-z-]+)\}\}/g, (_, name) => {
  if (!(name in tables)) throw new Error(`design-md/prose.md uses an unknown placeholder: {{${name}}}`);
  used.add(name);
  return tables[name];
});
const missing = Object.keys(tables).filter((n) => !used.has(n));
if (missing.length) {
  throw new Error(`design-md/prose.md is missing placeholders, so their values would vanish: ${missing.join(', ')}`);
}

const banner =
  '<!-- Generated by scripts/build-design-md.mjs from src/tokens/tokens.json, registry.json and design-md/. ' +
  'Do not edit by hand. Regenerate: npm run tokens:build -->';

const out = `---\n${yaml.join('\n')}\n---\n\n${banner}\n\n${body.trimEnd()}\n`;
writeFileSync(outPath, out);
console.log(
  `Built ${outPath} (${colors.length} colors, ${typography.length} typography levels, ${components.length} components)`,
);
