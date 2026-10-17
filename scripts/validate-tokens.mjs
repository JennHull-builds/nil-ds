/**
 * Validate tokens.json ↔ tokens.css parity, and DESIGN.md.
 * Run: npm run tokens:validate (or via typecheck)
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, execSync } from 'node:child_process';

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
  const cssVar = `--nil-${key}`;
  const got = getVarFromBlock(rootBlock, cssVar);
  const expected = val.value ?? resolveRef(val.ref, tokens);
  if (got && got !== expected) {
    errors.push(`Light ${cssVar}: expected ${expected}, got ${got}`);
  }
}

for (const [key, val] of Object.entries(tokens.semantic.dark)) {
  const cssVar = `--nil-${key}`;
  const got = getVarFromBlock(darkBlock, cssVar);
  const expected = val.value ?? resolveRef(val.ref, tokens);
  if (got && got !== expected) {
    errors.push(`Dark ${cssVar}: expected ${expected}, got ${got}`);
  }
}

/**
 * Stale-hex guard.
 *
 * Added 2026-09-14 after the accent moved three times in eleven days
 * (#3b6ef5 -> #0241e3 -> #1752eb -> #3b6ef5) and eight files kept describing a
 * value that had stopped being true. The JSON/CSS parity checks above stayed
 * green throughout, correctly: they only read tokens.json and tokens.css.
 *
 * Rule: any hex literal in docs, demo scenes or components must be a value
 * tokens.json currently holds, or be allowlisted here with a reason.
 */
const SCAN_FILES = ['README.md', 'ARCHITECTURE.md', 'FIGMA.md'];
const SCAN_DIRS = ['demo', 'src'];
const SCAN_EXT = /\.(tsx|ts|md)$/;
// PLAN.md is a dated decision log. Its hexes record what was true on the day
// and must not be "corrected" into the present.
const SKIP = /(^|\/)(node_modules|dist-demo|tokens)(\/|$)|PLAN\.md$/;

const ALLOWED_HEX = new Map([
  ['#0241e3', 'TokenLab alternative accent preset, deliberately not the live token'],
  ['#2563eb', 'TokenLab alternative accent preset, deliberately not the live token'],
  ['#edece8', 'TokenLab alternative canvas preset (Mothership base)'],
  ['#e2e1dc', 'TokenLab alternative canvas preset, paired surface'],
  ['#f5f4f0', 'TokenLab alternative canvas preset'],
  ['#ecebe7', 'TokenLab alternative canvas preset, paired surface'],
  ['#c7f300', 'Mermaid diagram chrome in ARCHITECTURE.md, not a NIL value'],
  ['#111', 'Mermaid diagram chrome in ARCHITECTURE.md, not a NIL value'],
]);

const liveHex = new Set();
(function collect(node) {
  if (!node || typeof node !== 'object') return;
  if (typeof node.value === 'string' && node.value.startsWith('#')) {
    liveHex.add(node.value.toLowerCase());
  }
  Object.values(node).forEach(collect);
})(tokens);

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (SKIP.test(full)) continue;
    if (statSync(full).isDirectory()) walk(full, out);
    else if (SCAN_EXT.test(full)) out.push(full);
  }
  return out;
}

const targets = [
  ...SCAN_FILES.map((f) => join(root, f)),
  ...SCAN_DIRS.flatMap((d) => walk(join(root, d))),
];

for (const file of targets) {
  const rel = file.replace(`${root}/`, '');
  readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    for (const match of line.matchAll(/#[0-9A-Fa-f]{3,8}\b/g)) {
      const hex = match[0].toLowerCase();
      if (liveHex.has(hex) || ALLOWED_HEX.has(hex)) continue;
      errors.push(
        `${rel}:${i + 1} hex ${match[0]} is not a current tokens.json value. ` +
        `Read it from tokens.json, or allowlist it in ALLOWED_HEX with a reason.`,
      );
    }
  });
}

/**
 * DESIGN.md guards.
 *
 * DESIGN.md is generated (scripts/build-design-md.mjs), so the same two things that can
 * go wrong with tokens.css can go wrong with it: someone edits it by hand, or someone
 * changes tokens.json and forgets to rebuild. Parity catches both, the same way.
 *
 * The prose is the part that can still go stale, so it gets a guard of its own: no value
 * of any kind in the hand-written text. That is the stale-hex gotcha in CLAUDE.md, applied
 * before it can happen instead of after eight files have drifted.
 *
 * The linter runs here and in `typecheck`, never in `build:demo`. TetherLog put checks
 * into its Vercel build and broke eight deployments in a row; the lesson is that a lint
 * result must never be able to stop a deploy. Warnings are printed on every run and do not
 * fail it. Only errors do.
 */
const designPath = join(root, 'DESIGN.md');
let designBefore = null;
try {
  designBefore = readFileSync(designPath, 'utf8');
} catch {
  errors.push('DESIGN.md is missing. Run npm run tokens:build and commit it.');
}
execSync('node scripts/build-design-md.mjs', { cwd: root, stdio: 'pipe' });
if (designBefore !== null && designBefore !== readFileSync(designPath, 'utf8')) {
  errors.push('DESIGN.md was out of sync with tokens.json and design-md/ — regenerated. Commit the updated file.');
}

const PROSE_VALUES = [
  [/#[0-9A-Fa-f]{3,8}\b/, 'a hex colour'],
  [/\b\d+(\.\d+)?\s?(px|rem|em|ms|s|vh|vw)\b|\d+%/, 'a measurement'],
  [/\b(rgba?|hsla?|oklch|cubic-bezier)\(/, 'a colour or easing function'],
  [/—/, 'an em dash (voice.md: none in public copy)'],
];
const structure = JSON.parse(readFileSync(join(root, 'design-md/structure.json'), 'utf8'));
const registry = JSON.parse(readFileSync(join(root, 'registry.json'), 'utf8'));
const proseSources = [
  ['design-md/prose.md', readFileSync(join(root, 'design-md/prose.md'), 'utf8')],
  ['design-md/structure.json', JSON.stringify(structure, null, 2)],
];
for (const [rel, text] of proseSources) {
  text.split('\n').forEach((line, i) => {
    for (const [re, what] of PROSE_VALUES) {
      if (re.test(line)) {
        errors.push(`${rel}:${i + 1} contains ${what}. Name the token and let DESIGN.md's generated front matter hold the value.`);
      }
    }
  });
}

for (const { name } of registry.components) {
  if (!structure.components[name]) {
    errors.push(`registry.json has ${name} but design-md/structure.json has no group for it, so DESIGN.md would omit it.`);
  }
}

const lintPkg = JSON.parse(readFileSync(join(root, 'node_modules/@google/design.md/package.json'), 'utf8'));
let lintRaw = '';
try {
  lintRaw = execFileSync(join(root, 'node_modules/.bin/designmd'), ['lint', 'DESIGN.md', '--format', 'json'], {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
} catch (e) {
  // The linter exits non-zero when it finds errors but still prints its JSON.
  lintRaw = e.stdout?.toString() ?? '';
}
try {
  const lint = JSON.parse(lintRaw);
  const { errors: nErr, warnings: nWarn, infos: nInfo } = lint.summary;
  console.log(`DESIGN.md lint (@google/design.md ${lintPkg.version}): ${nErr} errors, ${nWarn} warnings, ${nInfo} info`);
  for (const f of lint.findings) {
    if (f.severity === 'info') continue;
    console.log(`  ${f.severity} [${f.rule}] ${f.path ?? ''}: ${f.message}`);
    if (f.severity === 'error') errors.push(`DESIGN.md lint [${f.rule}] ${f.path ?? ''}: ${f.message}`);
  }
} catch {
  errors.push(`designmd lint produced no readable result: ${lintRaw.slice(0, 200) || '(empty output)'}`);
}

if (errors.length) {
  console.error('Token validation failed:');
  errors.forEach((e) => console.error(`  - ${e}`));
  process.exit(1);
}

console.log('Token validation passed.');
