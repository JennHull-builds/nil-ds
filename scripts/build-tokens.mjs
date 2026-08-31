/**
 * Generate src/tokens/tokens.css from src/tokens/tokens.json.
 * Run: npm run tokens:build
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const jsonPath = join(root, 'src/tokens/tokens.json');
const cssPath = join(root, 'src/tokens/tokens.css');

const tokens = JSON.parse(readFileSync(jsonPath, 'utf8'));

function getPath(obj, path) {
  const parts = path.split('.');
  let cur = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = cur[p];
  }
  return cur;
}

function resolveRef(ref, data) {
  const node = getPath(data, ref);
  if (!node) throw new Error(`Unresolved ref: ${ref}`);
  if (node.value !== undefined) return node.value;
  if (node.ref) return resolveRef(node.ref, data);
  throw new Error(`Invalid ref node: ${ref}`);
}

function flattenPrimitive(primitive, prefix = 'primitive') {
  const vars = [];
  for (const [key, val] of Object.entries(primitive)) {
    if (val && typeof val === 'object' && 'value' in val) {
      const cssKey = `--nil-primitive-${key.replace(/\./g, '-')}`;
      vars.push({ key: cssKey, value: val.value });
    } else if (val && typeof val === 'object') {
      for (const [subKey, subVal] of Object.entries(val)) {
        if (subVal && typeof subVal === 'object' && 'value' in subVal) {
          const cssKey = `--nil-primitive-${key}-${subKey}`;
          vars.push({ key: cssKey, value: subVal.value });
        }
      }
    }
  }
  return vars;
}

function semanticAliasVars(semantic) {
  const vars = [];
  const skip = new Set(['light', 'dark']);
  for (const [key, val] of Object.entries(semantic)) {
    if (skip.has(key)) continue;
    if (val && val.ref) {
      vars.push({
        key: `--nil-${key}`,
        value: `var(--nil-primitive-${val.ref.replace(/^primitive\./, '').replace(/\./g, '-')})`,
      });
    }
  }
  return vars;
}

function themeColorVars(themeName, themeObj, data) {
  const vars = [];
  for (const [key, val] of Object.entries(themeObj)) {
    if (val.ref) {
      const resolved = resolveRef(val.ref, data);
      vars.push({ key: `--nil-${key}`, value: resolved });
    }
  }
  return vars;
}

const primitiveVars = flattenPrimitive(tokens.primitive);
const semanticVars = semanticAliasVars(tokens.semantic);
const lightVars = themeColorVars('light', tokens.semantic.light, tokens);
const darkVars = themeColorVars('dark', tokens.semantic.dark, tokens);

function emitBlock(selector, vars, indent = '  ') {
  return `${selector} {\n${vars.map((v) => `${indent}${v.key}: ${v.value};`).join('\n')}\n}`;
}

const header = `/**
 * Generated from tokens.json — DO NOT EDIT BY HAND.
 * Regenerate: npm run tokens:build
 *
 * Namespace: --nil-* (consumer) and --nil-primitive-* (raw).
 * Components only read --nil-*.
 */`;

const primitiveSection = emitBlock(':root', primitiveVars);
const semanticSection = emitBlock(':root', semanticVars);
const lightSection = emitBlock(':root', lightVars);
const darkSection = emitBlock("[data-theme='dark']", darkVars);

const css = [header, '', primitiveSection, '', semanticSection, '', lightSection, '', darkSection, ''].join('\n');

writeFileSync(cssPath, css);
console.log(`Built ${cssPath} (${primitiveVars.length} primitive + ${semanticVars.length} semantic aliases)`);
