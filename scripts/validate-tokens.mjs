/**
 * Validate tokens.json ↔ tokens.css parity.
 * Run: npm run tokens:validate (or via typecheck)
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const jsonPath = join(root, 'src/tokens/tokens.json');
const cssPath = join(root, 'src/tokens/tokens.css');

// Regenerate and compare
const before = readFileSync(cssPath, 'utf8');
execSync('node scripts/build-tokens.mjs', { cwd: root, stdio: 'pipe' });
const after = readFileSync(cssPath, 'utf8');

if (before !== after) {
  console.error('tokens.css was out of sync with tokens.json — regenerated. Commit the updated CSS.');
  process.exit(1);
}

const tokens = JSON.parse(readFileSync(jsonPath, 'utf8'));
const css = after;

function getPath(obj, path) {
  const parts = path.split('.');
  let cur = obj;
  for (const p of parts) {
    cur = cur?.[p];
  }
  return cur;
}

function resolveRef(ref, data) {
  const node = getPath(data, ref);
  if (!node) throw new Error(`Unresolved ref: ${ref}`);
  if (node.value !== undefined) return node.value;
  if (node.ref) return resolveRef(node.ref, data);
  throw new Error(`Invalid ref: ${ref}`);
}

const errors = [];

for (const [catKey, cat] of Object.entries(tokens.primitive)) {
  if (typeof cat !== 'object') continue;
  for (const [key, val] of Object.entries(cat)) {
    if (!val?.value) continue;
    const cssVar = `--nil-primitive-${catKey}-${key}`;
    const regex = new RegExp(`${cssVar.replace(/-/g, '\\-')}:\\s*([^;]+);`);
    const match = css.match(regex);
    if (!match) {
      errors.push(`Missing CSS var ${cssVar}`);
    } else if (match[1].trim() !== val.value) {
      errors.push(`${cssVar}: JSON=${val.value} CSS=${match[1].trim()}`);
    }
  }
}

const rootBlock = css.match(/:root\s*\{([^}]+)\}/s)?.[1] ?? '';
const darkBlock = css.match(/\[data-theme='dark'\]\s*\{([^}]+)\}/s)?.[1] ?? '';

function getVarFromBlock(block, cssVar) {
  const regex = new RegExp(`${cssVar.replace(/-/g, '\\-')}:\\s*([^;]+);`);
  const match = block.match(regex);
  return match?.[1]?.trim();
}

for (const [key, val] of Object.entries(tokens.semantic.light)) {
  const resolved = resolveRef(val.ref, tokens);
  const cssVar = `--nil-${key}`;
  const got = getVarFromBlock(rootBlock, cssVar);
  if (got && got !== resolved) {
    errors.push(`Light ${cssVar}: expected ${resolved}, got ${got}`);
  }
}

for (const [key, val] of Object.entries(tokens.semantic.dark)) {
  const resolved = resolveRef(val.ref, tokens);
  const cssVar = `--nil-${key}`;
  const got = getVarFromBlock(darkBlock, cssVar);
  if (got && got !== resolved) {
    errors.push(`Dark ${cssVar}: expected ${resolved}, got ${got}`);
  }
}

if (errors.length) {
  console.error('Token validation failed:');
  errors.forEach((e) => console.error(`  - ${e}`));
  process.exit(1);
}

console.log('Token validation passed.');
