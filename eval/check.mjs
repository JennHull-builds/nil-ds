/**
 * The checker. Deterministic, no AI judge: ten rules, each one something a reader can rerun.
 *
 * R1-R7 read the code as a syntax tree with the TypeScript compiler API (literals, template
 * strings, JSX attributes, object-literal style props), never bare regex over the file, and they
 * also scan any .css file the subject wrote. R8 type-checks. R9 and R10 run in vitest + jsdom
 * (see eval/behaviour/lib.tsx).
 *
 * Every rule reports `inspected`, the number of places it looked at. A rule that inspected
 * nothing is "na", never "pass". This is the same family as the ?raw gotcha in
 * src/tokens/reduced-motion.test.ts: a check that passes against nothing.
 *
 * Scoring always runs against a FRESH copy of the archived kit plus the subject's eval-output/
 * files, so an edit the subject made to src/ during its session cannot help a run pass.
 *
 * Mutation switches, used by eval/check.test.ts and eval/mutate.mjs to prove each rule can fail:
 *   CHECKER_DISABLE=R1[,R4,...]   the detector finds nothing but still counts places, so the rule
 *                                 reports "pass" (the dangerous case: green because it stopped looking)
 *   CHECKER_DISABLE_AS=na         the disabled rule reports "na" instead
 */
import { execFile } from 'node:child_process';
import {
  cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, symlinkSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, posix, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { EVAL_DIR, REPO_ROOT, RULES } from './config.mjs';
import { extractKit } from './lib/kit.mjs';

const K = ts.SyntaxKind;
const off = (rule) => (process.env.CHECKER_DISABLE ?? '').split(',').map((s) => s.trim()).includes(rule);

// ---------------------------------------------------------------- CSS knowledge

const NAMED_COLOURS = new Set(
  ('aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood ' +
    'cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray ' +
    'darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen ' +
    'darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue ' +
    'firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew ' +
    'hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan ' +
    'lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray ' +
    'lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue ' +
    'mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred ' +
    'midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid ' +
    'palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple ' +
    'rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue ' +
    'slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white ' +
    'whitesmoke yellow yellowgreen').split(' '),
);
// Allowed on purpose: transparent, currentColor and the CSS-wide keywords are not colours we can
// drift, so they are never in NAMED_COLOURS and never flagged.

const isColourProp = (p) =>
  /(^|-)color$/.test(p) ||
  /^(background|background-image|border(-(top|right|bottom|left|block|inline)(-(start|end))?)?|outline|fill|stroke|box-shadow|text-shadow|text-decoration|column-rule)$/.test(p);
const isSpacingProp = (p) =>
  /^(padding|margin)(-(top|right|bottom|left|block|inline)(-(start|end))?)?$/.test(p) ||
  /^(gap|row-gap|column-gap|grid-gap|top|right|bottom|left|font-size)$/.test(p) ||
  /^inset(-(block|inline))?(-(start|end))?$/.test(p) ||
  /^border(-(top|right|bottom|left|block|inline)(-(start|end))?)?(-width)?$/.test(p);
const isRadiusProp = (p) => /^border(-(top|bottom|start|end)(-(left|right|start|end))?)?-radius$/.test(p);
const isKnownProp = (p) => isColourProp(p) || isSpacingProp(p) || isRadiusProp(p);

const camelToKebab = (s) => s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

/** Colour literals in one declaration value. Token names are blanked first so var(--nil-color-red) never reads as red. */
function colourViolations(prop, value) {
  const v = value.replace(/var\(\s*--[a-zA-Z0-9_-]+/g, 'var(');
  const found = [];
  for (const m of v.matchAll(/#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})(?![0-9a-zA-Z])/g)) found.push(m[0]);
  for (const m of v.matchAll(/\b(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix)\s*\(/gi)) found.push(`${m[1]}()`);
  if (isColourProp(prop)) for (const w of v.toLowerCase().match(/[a-z]+/g) ?? []) if (NAMED_COLOURS.has(w)) found.push(w);
  return found;
}

/** Raw non-zero px or rem lengths. A bare number is px in React. 0 is allowed, so are % and token-only calc(). */
function rawLengths(value, kind) {
  if (kind === 'number') return Number(value) !== 0 ? [String(value)] : [];
  const out = [];
  for (const m of value.matchAll(/(?<![\w.-])(-?\d*\.?\d+)(px|rem)\b/gi)) if (parseFloat(m[1]) !== 0) out.push(m[0]);
  return out;
}

/** border-radius must be built only from var(--nil-radius-*), with 0 and CSS-wide keywords allowed. */
function radiusViolation(value, kind) {
  if (kind === 'number') return Number(value) === 0 ? null : value;
  const rest = value.replace(/var\(\s*--nil-radius-[a-z0-9-]+\s*\)/g, ' ');
  const bad = rest.split(/[\s/]+/).filter(Boolean).filter((t) => !/^(0|0px|0rem|0%|inherit|initial|unset|revert)$/i.test(t));
  return bad.length ? value : null;
}

// ---------------------------------------------------------------- imports (R6)

const NAMED_LIBS = [
  [/^@radix-ui\//, 'Radix'], [/^radix-ui$/, 'Radix'], [/^@mui\//, 'MUI'], [/^@material-ui\//, 'MUI'],
  [/^@chakra-ui\//, 'Chakra'], [/^@headlessui\//, 'Headless UI'], [/^@ariakit\//, 'Ariakit'],
  [/^ariakit($|\/)/, 'Ariakit'], [/^react-aria($|-|\/)/, 'React Aria'], [/^@react-aria\//, 'React Aria'],
  [/^react-stately($|\/)/, 'React Aria'], [/^@react-stately\//, 'React Aria'], [/^@shadcn\//, 'shadcn'],
  [/^@\/components\/ui\//, 'shadcn'], [/^shadcn/, 'shadcn'],
];

/**
 * R6. Allowed: react, react-dom (and their subpaths), the kit (anything that resolves into src/),
 * and files inside eval-output/. Everything else fails. `fromDir` is the importing file's
 * directory relative to the kit root, e.g. "eval-output".
 */
export function classifyImport(spec, fromDir = 'eval-output') {
  if (spec === 'react' || spec.startsWith('react/') || spec === 'react-dom' || spec.startsWith('react-dom/')) {
    return { ok: true };
  }
  if (spec.startsWith('.')) {
    const target = posix.normalize(posix.join(fromDir, spec));
    if (target === 'src' || target.startsWith('src/')) return { ok: true, kit: true };
    if (target === 'eval-output' || target.startsWith('eval-output/')) return { ok: true, local: true };
    return { ok: false, why: `relative import "${spec}" leaves the kit and eval-output/` };
  }
  const named = NAMED_LIBS.find(([re]) => re.test(spec));
  return { ok: false, why: named ? `${named[1]} ("${spec}") is on the Never list` : `"${spec}" is not react or the kit` };
}

// ---------------------------------------------------------------- source analysis

function newFacts(file) {
  return { file, decls: [], texts: [], freeColours: [], imports: [], rawButtons: [], rawCheckboxes: [], roleSwitch: [], jsxCandidates: 0, refOnKit: [], hasDefaultExport: false };
}

function templateText(node) {
  return node.head.text + node.templateSpans.map((s) => `\u0000${s.literal.text}`).join('');
}

function propName(n) {
  if (ts.isIdentifier(n) || ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) return n.text;
  if (ts.isComputedPropertyName(n) && ts.isStringLiteral(n.expression)) return n.expression.text;
  return undefined;
}

/** Every literal value an expression can take, following ternaries, ||, ??, && and + concatenation. */
function literalValues(expr) {
  const out = [];
  const go = (e) => {
    if (!e) return;
    switch (e.kind) {
      case K.StringLiteral: case K.NoSubstitutionTemplateLiteral: out.push({ text: e.text, kind: 'string', node: e }); break;
      case K.TemplateExpression: out.push({ text: templateText(e), kind: 'string', node: e }); break;
      case K.NumericLiteral: out.push({ text: e.text, kind: 'number', node: e }); break;
      case K.PrefixUnaryExpression:
        if (e.operator === K.MinusToken && e.operand.kind === K.NumericLiteral) out.push({ text: `-${e.operand.text}`, kind: 'number', node: e });
        break;
      case K.ParenthesizedExpression: case K.AsExpression: case K.SatisfiesExpression: case K.NonNullExpression: go(e.expression); break;
      case K.ConditionalExpression: go(e.whenTrue); go(e.whenFalse); break;
      case K.BinaryExpression:
        if ([K.BarBarToken, K.QuestionQuestionToken, K.AmpersandAmpersandToken, K.PlusToken].includes(e.operatorToken.kind)) { go(e.left); go(e.right); }
        break;
      default: break;
    }
  };
  go(expr);
  return out;
}

const LOOSE_STRING_OK_ATTRS = /^(href|id|htmlFor|name|to|key|src|role|type|className|aria-.*|data-.*)$/;

function freeColourIn(text, attr) {
  if (attr && LOOSE_STRING_OK_ATTRS.test(attr)) return [];
  const out = [];
  if (/^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(text.trim())) out.push(text.trim());
  for (const m of text.matchAll(/\b(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color-mix)\s*\(/gi)) out.push(`${m[1]}()`);
  return out;
}

/** Declarations written as CSS text (a <style> block, a css`` template, a .css file body). */
function cssDeclsFromText(text, lineOf) {
  const out = [];
  for (const m of text.matchAll(/([a-zA-Z-]+)\s*:\s*([^;{}]+?)\s*(?=[;}]|$)/g)) {
    const prop = m[1].toLowerCase();
    if (isKnownProp(prop)) out.push({ prop, value: m[2].trim(), kind: 'string', line: lineOf(m.index) });
  }
  return out;
}

export function analyseTs(file, text, relDir) {
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const facts = newFacts(file);
  const lineOfNode = (n) => sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1;
  const consumed = new Set();
  const strings = [];
  const kitNames = new Set();

  const addImport = (spec, node, names = []) => {
    const cls = classifyImport(spec, relDir);
    facts.imports.push({ spec, line: lineOfNode(node), cls });
    if (cls.kit) names.forEach((n) => kitNames.add(n));
  };

  const isModuleSpecifier = (n) => {
    const p = n.parent;
    if (!p) return false;
    if (ts.isImportDeclaration(p) || ts.isExportDeclaration(p) || ts.isExternalModuleReference(p)) return p.moduleSpecifier === n || ts.isExternalModuleReference(p);
    if (ts.isLiteralTypeNode(p) || ts.isImportTypeNode(p)) return true;
    if (ts.isCallExpression(p) && p.arguments[0] === n) {
      return p.expression.kind === K.ImportKeyword || (ts.isIdentifier(p.expression) && p.expression.text === 'require');
    }
    return false;
  };

  function visit(node) {
    switch (node.kind) {
      case K.ImportDeclaration: {
        const names = [];
        const c = node.importClause;
        if (c?.name) names.push(c.name.text);
        if (c?.namedBindings) {
          if (ts.isNamedImports(c.namedBindings)) c.namedBindings.elements.forEach((e) => names.push(e.name.text));
          else names.push(c.namedBindings.name.text);
        }
        if (ts.isStringLiteral(node.moduleSpecifier)) addImport(node.moduleSpecifier.text, node, names);
        break;
      }
      case K.ExportDeclaration:
        if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) addImport(node.moduleSpecifier.text, node);
        break;
      case K.ImportEqualsDeclaration:
        if (ts.isExternalModuleReference(node.moduleReference) && ts.isStringLiteral(node.moduleReference.expression)) addImport(node.moduleReference.expression.text, node, [node.name.text]);
        break;
      case K.CallExpression: {
        const first = node.arguments[0];
        const callee = node.expression;
        if (first && ts.isStringLiteral(first) && (callee.kind === K.ImportKeyword || (ts.isIdentifier(callee) && callee.text === 'require'))) addImport(first.text, node);
        break;
      }
      case K.ExportAssignment: facts.hasDefaultExport = true; break;
      case K.FunctionDeclaration: case K.ClassDeclaration:
        if (node.modifiers?.some((m) => m.kind === K.DefaultKeyword)) facts.hasDefaultExport = true;
        break;
      case K.JsxOpeningElement: case K.JsxSelfClosingElement: {
        const tag = node.tagName.getText(sf);
        const attrs = new Map();
        for (const a of node.attributes.properties) {
          if (!ts.isJsxAttribute(a)) continue;
          let value = null;
          const init = a.initializer;
          if (init && ts.isStringLiteral(init)) value = init.text;
          else if (init && ts.isJsxExpression(init) && init.expression && (ts.isStringLiteral(init.expression) || ts.isNoSubstitutionTemplateLiteral(init.expression))) value = init.expression.text;
          attrs.set(a.name.getText(sf), value);
        }
        const line = lineOfNode(node);
        if (tag === 'button' || tag === 'input' || attrs.has('role')) facts.jsxCandidates += 1;
        if (tag === 'button') facts.rawButtons.push({ line });
        if (tag === 'input' && attrs.get('type') === 'checkbox') facts.rawCheckboxes.push({ line });
        if (attrs.get('role') === 'switch' && /^[a-z]/.test(tag)) facts.roleSwitch.push({ tag, line });
        if (kitNames.has(tag) && attrs.has('ref')) facts.refOnKit.push({ tag, line });
        break;
      }
      case K.ObjectLiteralExpression:
        for (const p of node.properties) {
          if (!ts.isPropertyAssignment(p)) continue;
          const raw = propName(p.name);
          if (!raw) continue;
          const prop = raw.startsWith('--') ? raw : camelToKebab(raw);
          if (!isKnownProp(prop)) continue;
          for (const v of literalValues(p.initializer)) {
            facts.decls.push({ prop, value: v.text, kind: v.kind, line: lineOfNode(p) });
            consumed.add(v.node);
          }
        }
        break;
      case K.StringLiteral: case K.NoSubstitutionTemplateLiteral:
        if (!isModuleSpecifier(node)) strings.push({ text: node.text, node, attr: ts.isJsxAttribute(node.parent) ? node.parent.name.getText(sf) : undefined });
        break;
      case K.TemplateExpression:
        strings.push({ text: templateText(node), node });
        break;
      default: break;
    }
    ts.forEachChild(node, visit);
  }
  visit(sf);

  for (const s of strings) {
    const line = lineOfNode(s.node);
    facts.texts.push({ text: s.text, line });
    if (!consumed.has(s.node)) {
      for (const c of freeColourIn(s.text, s.attr)) facts.freeColours.push({ value: c, line });
      if (s.text.length > 3 && s.text.includes(':')) facts.decls.push(...cssDeclsFromText(s.text, () => line));
    }
  }
  return facts;
}

export function analyseCss(file, text) {
  const stripped = text.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
  const lineOf = (i) => stripped.slice(0, i).split('\n').length;
  const facts = newFacts(file);
  facts.decls = cssDeclsFromText(stripped, lineOf);
  facts.texts = [{ text: stripped, line: 1 }];
  return facts;
}

// ---------------------------------------------------------------- rules R1-R7

const verdict = (inspected, violations) => ({
  status: violations.length ? 'fail' : inspected > 0 ? 'pass' : 'na',
  inspected: Math.max(inspected, violations.length),
  violations: violations.slice(0, 10),
  count: violations.length,
});

export function staticRules(all, tokenNames) {
  const rules = {};
  const decls = all.flatMap((f) => f.decls.map((d) => ({ ...d, file: f.file })));
  const where = (d) => `${d.file}:${d.line}`;
  const quiet = (rule, list) => (off(rule) ? [] : list);

  // R1 no raw colour
  const v1 = new Set();
  for (const d of decls) for (const c of colourViolations(d.prop, d.value)) v1.add(`${where(d)} ${d.prop}: ${c}`);
  const free = all.flatMap((f) => f.freeColours.map((c) => ({ ...c, file: f.file })));
  for (const c of free) v1.add(`${c.file}:${c.line} loose string: ${c.value}`);
  rules.R1 = verdict(decls.filter((d) => isColourProp(d.prop)).length + free.length, quiet('R1', [...v1]));

  // R2 / R3 read every var(--nil-*) reference
  const refs = [];
  let dynamic = 0;
  for (const f of all) {
    for (const t of f.texts) {
      for (const m of t.text.matchAll(/var\(\s*(--nil-[a-z0-9-]*)(\u0000)?/g)) {
        if (m[2]) dynamic += 1;
        else refs.push({ name: m[1], where: `${f.file}:${t.line}` });
      }
    }
  }
  rules.R2 = verdict(refs.length, quiet('R2', refs.filter((r) => r.name.startsWith('--nil-primitive-')).map((r) => `${r.where} ${r.name}`)));
  const invented = [...new Set(refs.filter((r) => !tokenNames.has(r.name)).map((r) => r.name))];
  rules.R3 = { ...verdict(refs.length, quiet('R3', refs.filter((r) => !tokenNames.has(r.name)).map((r) => `${r.where} ${r.name}`))), invented: off('R3') ? [] : invented, dynamicRefsSkipped: dynamic };

  // R4 no raw px or rem for spacing, inset, border widths, font size
  const spacing = decls.filter((d) => isSpacingProp(d.prop));
  rules.R4 = verdict(spacing.length, quiet('R4', spacing.flatMap((d) => rawLengths(d.value, d.kind).map((l) => `${where(d)} ${d.prop}: ${l}`))));

  // R5 border-radius only from --nil-radius-*
  const radii = decls.filter((d) => isRadiusProp(d.prop));
  rules.R5 = verdict(radii.length, quiet('R5', radii.flatMap((d) => { const v = radiusViolation(d.value, d.kind); return v ? [`${where(d)} ${d.prop}: ${v}`] : []; })));

  // R6 imports
  const imports = all.flatMap((f) => f.imports.map((i) => ({ ...i, file: f.file })));
  rules.R6 = verdict(imports.length, quiet('R6', imports.filter((i) => !i.cls.ok).map((i) => `${i.file}:${i.line} ${i.cls.why}`)));

  // R7 uses the kit where one exists: at least one kit import, no hand-rolled button/checkbox/switch
  const v7 = [];
  if (!imports.some((i) => i.cls.kit)) v7.push("no import from the kit ('../src')");
  for (const f of all) {
    f.rawButtons.forEach((b) => v7.push(`${f.file}:${b.line} raw <button>: the kit has Button`));
    f.rawCheckboxes.forEach((b) => v7.push(`${f.file}:${b.line} raw <input type="checkbox">: the kit has Toggle`));
    f.roleSwitch.forEach((b) => v7.push(`${f.file}:${b.line} <${b.tag} role="switch">: the kit has Toggle`));
  }
  rules.R7 = verdict(1 + all.reduce((n, f) => n + f.jsxCandidates, 0), quiet('R7', v7));
  return rules;
}

// ---------------------------------------------------------------- batch scoring

const allFail = (reason) => Object.fromEntries(RULES.map((r) => [r, { status: 'fail', inspected: 0, violations: [reason], count: 1 }]));

function tally(rules) {
  const vals = Object.values(rules);
  const passed = vals.filter((r) => r.status === 'pass').length;
  const applicable = vals.filter((r) => r.status !== 'na').length;
  return { passed, applicable, score: applicable ? passed / applicable : 0 };
}

function listFiles(dir, ext) {
  const out = [];
  if (!existsSync(dir)) return out;
  (function walk(d) {
    for (const name of readdirSync(d)) {
      const full = join(d, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (ext.some((e) => name.endsWith(e))) out.push(full);
    }
  })(dir);
  return out;
}

function runNode(args, { cwd, env, timeoutMs }) {
  return new Promise((resolve) => {
    execFile(process.execPath, args, { cwd, env, timeout: timeoutMs, maxBuffer: 64 * 1024 * 1024 }, (err, stdout, stderr) => {
      resolve({ code: err ? (err.code ?? 1) : 0, killed: Boolean(err?.killed), stdout, stderr });
    });
  });
}

/**
 * Score a batch of results. Each target is { id, task, dir } where `dir` holds Result.tsx (and
 * any other file the subject wrote). One tsc program and one vitest run cover the whole batch.
 * Returns { [id]: { id, task, rules, passed, applicable, score, facts, notes } }.
 */
export async function scoreBatch(targets, { keep = false, timeoutMs = 300_000 } = {}) {
  const work = mkdtempSync(join(tmpdir(), 'nil-score-'));
  try {
    const kit = join(work, 'kit');
    extractKit(kit);
    symlinkSync(join(REPO_ROOT, 'node_modules'), join(work, 'node_modules'));
    const tokenNames = new Set([...readFileSync(join(kit, 'src/tokens/tokens.css'), 'utf8').matchAll(/(--nil-[a-z0-9-]+)\s*:/g)].map((m) => m[1]));

    const results = {};
    const live = [];
    for (const t of targets) {
      const tdir = join(work, 't', t.id);
      mkdirSync(join(tdir, 'eval-output'), { recursive: true });
      symlinkSync('../../kit/src', join(tdir, 'src'));
      if (existsSync(t.dir)) cpSync(t.dir, join(tdir, 'eval-output'), { recursive: true });
      const resultPath = join(tdir, 'eval-output', 'Result.tsx');
      const text = existsSync(resultPath) ? readFileSync(resultPath, 'utf8') : '';
      if (!text.trim()) {
        const rules = allFail(existsSync(resultPath) ? 'Result.tsx is empty' : 'no Result.tsx was written');
        results[t.id] = { id: t.id, task: t.task, rules, ...tally(rules), facts: {}, notes: ['A missing or empty Result.tsx fails every rule and still counts as a run.'] };
      } else live.push({ ...t, tdir });
    }

    // R1-R7: the syntax tree
    for (const t of live) {
      const outDir = join(t.tdir, 'eval-output');
      const all = [
        ...listFiles(outDir, ['.ts', '.tsx']).map((f) => analyseTs(relative(t.tdir, f), readFileSync(f, 'utf8'), posix.dirname(relative(t.tdir, f).split('\\').join('/')))),
        ...listFiles(outDir, ['.css']).map((f) => analyseCss(relative(t.tdir, f), readFileSync(f, 'utf8'))),
      ];
      const rules = staticRules(all, tokenNames);
      t.all = all;
      t.rules = rules;
    }

    // R8: tsc, in process, one program for the whole batch
    if (live.length) {
      const kitCfg = JSON.parse(readFileSync(join(kit, 'tsconfig.json'), 'utf8'));
      const cfg = { compilerOptions: { ...kitCfg.compilerOptions, noEmit: true, declaration: false }, include: ['t/*/eval-output/**/*.ts', 't/*/eval-output/**/*.tsx'] };
      delete cfg.compilerOptions.outDir;
      const parsed = ts.parseJsonConfigFileContent(cfg, ts.sys, work);
      const program = ts.createProgram(parsed.fileNames, parsed.options);
      const diags = ts.getPreEmitDiagnostics(program).filter((d) => d.category === ts.DiagnosticCategory.Error);
      const envBroken = diags.find((d) => !d.file && /Cannot find (type definition|global type)/.test(ts.flattenDiagnosticMessageText(d.messageText, ' ')));
      if (envBroken) throw new Error(`infrastructure: tsc environment is broken: ${ts.flattenDiagnosticMessageText(envBroken.messageText, ' ')}`);
      for (const t of live) {
        const marker = `/t/${t.id}/eval-output/`;
        const mine = diags.filter((d) => d.file && d.file.fileName.includes(marker));
        const fileCount = parsed.fileNames.filter((f) => f.includes(marker)).length;
        const lines = mine.map((d) => {
          const { line, character } = d.file.getLineAndCharacterOfPosition(d.start ?? 0);
          return `${relative(join(t.tdir, 'eval-output'), d.file.fileName)}(${line + 1},${character + 1}) TS${d.code}: ${ts.flattenDiagnosticMessageText(d.messageText, ' ')}`;
        });
        t.rules.R8 = verdict(fileCount, off('R8') ? [] : lines);
      }
    }

    // R9 + R10: vitest + jsdom, one run for the whole batch
    if (live.length) {
      const bdir = join(work, 'behaviour');
      mkdirSync(bdir);
      for (const f of ['lib.tsx', 'shim.ts']) cpSync(join(EVAL_DIR, 'behaviour', f), join(bdir, f));
      for (const t of live) {
        writeFileSync(join(bdir, `run-${t.id}.test.tsx`), `import { runBehaviour } from './lib';\nrunBehaviour({ id: ${JSON.stringify(t.id)}, task: ${JSON.stringify(t.task)}, load: () => import('../t/${t.id}/eval-output/Result') });\n`);
      }
      const reportFile = join(work, 'vitest-report.json');
      const reportDir = join(work, 'report');
      writeFileSync(join(work, 'vitest.config.mjs'), `import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
export default defineConfig({
  root: ${JSON.stringify(work)},
  plugins: [react()],
  test: {
    environment: 'jsdom', globals: true, css: false,
    setupFiles: [${JSON.stringify(join(kit, 'src/test/setup.ts'))}],
    include: ['behaviour/run-*.test.tsx'],
    testTimeout: 30000, hookTimeout: 30000,
    reporters: ['json'], outputFile: ${JSON.stringify(reportFile)},
  },
});
`);
      const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('VITEST')));
      Object.assign(env, { EVAL_REPORT_DIR: reportDir, CI: '1', FORCE_COLOR: '0' });
      const run = await runNode([join(REPO_ROOT, 'node_modules/vitest/vitest.mjs'), 'run', '--config', join(work, 'vitest.config.mjs')], { cwd: work, env, timeoutMs });
      if (!existsSync(reportFile)) {
        throw new Error(`infrastructure: vitest wrote no report (${run.killed ? 'timed out' : `exit ${run.code}`}): ${(run.stderr || run.stdout).slice(-400)}`);
      }
      const report = JSON.parse(readFileSync(reportFile, 'utf8'));
      for (const t of live) {
        const suite = report.testResults.find((s) => s.name.endsWith(`run-${t.id}.test.tsx`));
        const jsonl = join(reportDir, `${t.id}.jsonl`);
        const recorded = existsSync(jsonl) ? readFileSync(jsonl, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l)) : [];
        const axeRec = recorded.find((r) => r.rule === 'R9');
        const tests = suite?.assertionResults ?? [];
        const loadFailure = !tests.length ? [`could not run: ${(suite?.message || 'no tests were collected').slice(0, 300)}`] : null;
        const r9 = tests.find((a) => a.title.startsWith('R9'));
        const r10 = tests.filter((a) => a.title.startsWith('R10'));
        const msg = (a) => `${a.title.replace(/^R\d+ /, '')}: ${(a.failureMessages?.[0] ?? '').split('\n')[0].slice(0, 220)}`;

        t.rules.R9 = loadFailure || !r9
          ? { status: 'fail', inspected: 0, violations: loadFailure ?? ['no axe test ran'], count: 1 }
          : { ...verdict(axeRec?.inspected ?? (r9.status === 'passed' ? 1 : 0), r9.status === 'passed' ? [] : [msg(r9)]), axeViolations: axeRec?.violations ?? [], axeDetail: (axeRec?.detail ?? []).slice(0, 4), incomplete: axeRec?.incomplete ?? [] };
        const ran = r10.filter((a) => a.status !== 'skipped' && a.status !== 'pending');
        const bad = ran.filter((a) => a.status === 'failed');
        t.rules.R10 = loadFailure
          ? { status: 'fail', inspected: 0, violations: loadFailure, count: 1 }
          : { ...verdict(ran.length, bad.map(msg)), skipped: r10.length - ran.length };
      }
    }

    for (const t of live) {
      for (const r of RULES) if (off(r) && process.env.CHECKER_DISABLE_AS === 'na') t.rules[r] = { status: 'na', inspected: 0, violations: [], count: 0 };
      const facts = {
        refOnKitComponent: t.all.flatMap((f) => f.refOnKit.map((r) => `${r.tag}@${f.file}:${r.line}`)),
        kitImports: [...new Set(t.all.flatMap((f) => f.imports.filter((i) => i.cls.kit).map((i) => i.spec)))],
        files: t.all.map((f) => f.file),
        hasDefaultExport: t.all.some((f) => f.hasDefaultExport),
        inventedTokens: t.rules.R3.invented ?? [],
      };
      const notes = ['R9 asserts semantics and ARIA only (axe). Contrast is not covered: color-contrast comes back incomplete under css: false.'];
      if (!facts.hasDefaultExport) notes.push('Result.tsx has no default export.');
      results[t.id] = { id: t.id, task: t.task, rules: t.rules, ...tally(t.rules), facts, notes };
    }
    return results;
  } finally {
    if (!keep) rmSync(work, { recursive: true, force: true });
  }
}

// ---------------------------------------------------------------- CLI: node eval/check.mjs <dir> --task T3

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dir = process.argv[2];
  const task = process.argv[process.argv.indexOf('--task') + 1];
  if (!dir || !task) {
    console.error('usage: node eval/check.mjs <dir containing Result.tsx> --task T1..T5');
    process.exit(2);
  }
  const res = await scoreBatch([{ id: 'cli', task, dir: join(process.cwd(), dir) }]);
  console.log(JSON.stringify(res.cli, null, 2));
}
