/**
 * Reads the token source for the build scripts.
 *
 * src/tokens/tokens.json is Design Tokens (DTCG) 2025.10, the open standard (https://www.designtokens.org/tr/2025.10/format/):
 * a token is { $type, $value }, a colour is an object, a dimension is { value, unit }, an alias is "{group.token}".
 * The build scripts were written for the earlier shape, { primitive: { color: { key: { value } } }, semantic: { key: { ref } } },
 * with every value as the CSS text the stylesheet needs. This turns the standard back into that shape, so each script changes by one
 * line and the CSS it writes does not change by one byte.
 *
 * Values the standard has no type for (the CSS keyword step-end) are in src/tokens/css-only.json and are put back in order after.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ALIAS = /^\{([^{}]+)\}$/;
const hex2 = (n) => n.toString(16).padStart(2, '0');

/** The CSS text of one DTCG value. */
export function cssValue(type, value) {
  switch (type) {
    case 'color': {
      const [r, g, b] = value.components.map((c) => Math.round(c * 255));
      const alpha = value.alpha ?? 1;
      if (alpha !== 1) return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      return value.hex ?? `#${hex2(r)}${hex2(g)}${hex2(b)}`;
    }
    case 'dimension':
    case 'duration':
      return `${value.value}${value.unit}`;
    case 'cubicBezier':
      return `cubic-bezier(${value.join(', ')})`;
    case 'fontFamily':
      return (Array.isArray(value) ? value : [value]).map((n) => (/\s/.test(n) ? `'${n}'` : n)).join(', ');
    case 'fontWeight':
    case 'number':
      return String(value);
    default:
      throw new Error(`No CSS form for the token type "${type}"`);
  }
}

function toLegacy(group, inherited, path) {
  const out = {};
  const type = group.$type ?? inherited;
  for (const [key, node] of Object.entries(group)) {
    if (key.startsWith('$')) continue;
    const here = path ? `${path}.${key}` : key;
    if (node && typeof node === 'object' && '$value' in node) {
      const t = node.$type ?? type;
      const alias = typeof node.$value === 'string' ? ALIAS.exec(node.$value) : null;
      const token = alias ? { ref: alias[1] } : { value: cssValue(t, node.$value) };
      if (node.$description) token.note = node.$description;
      out[key] = token;
    } else if (node && typeof node === 'object') {
      out[key] = toLegacy(node, type, here);
    }
  }
  return out;
}

function insertAfter(parent, afterKey, key, node, label) {
  if (!(afterKey in parent)) throw new Error(`css-only.json: ${label} follows "${afterKey}", which is not in tokens.json`);
  const entries = Object.entries(parent);
  for (const k of Object.keys(parent)) delete parent[k];
  for (const [k, v] of entries) {
    parent[k] = v;
    if (k === afterKey) parent[key] = node;
  }
}

/** The token source in the shape the build scripts read. `root` is the repository root. */
export function loadTokens(root) {
  const doc = JSON.parse(readFileSync(join(root, 'src/tokens/tokens.json'), 'utf8'));
  const tokens = toLegacy(doc, null, '');
  const extra = JSON.parse(readFileSync(join(root, 'src/tokens/css-only.json'), 'utf8'));
  for (const entry of extra.tokens) {
    const parts = entry.path.split('.');
    const parent = parts.slice(0, -1).reduce((cur, p) => cur?.[p], tokens);
    if (!parent) throw new Error(`css-only.json: no group for ${entry.path}`);
    const afterParts = entry.after.split('.');
    if (afterParts.slice(0, -1).join('.') !== parts.slice(0, -1).join('.')) throw new Error(`css-only.json: ${entry.path} must follow a token in its own group`);
    const node = entry.ref ? { ref: entry.ref } : { value: entry.value };
    insertAfter(parent, afterParts[afterParts.length - 1], parts[parts.length - 1], node, entry.path);
  }
  return doc.$description ? { _readme: doc.$description, ...tokens } : tokens;
}
