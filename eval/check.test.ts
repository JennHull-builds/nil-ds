// @vitest-environment node
/**
 * Proves the checker can fail before anyone believes it can pass.
 *
 *  - every GOOD fixture passes all ten rules (so a pass is a real pass, with places inspected),
 *  - every BAD fixture has exactly its own rule equal to "fail" (not merely "not pass", so a rule
 *    that has been switched off and reports "na" cannot slip through) and no other rule failing,
 *  - detectors are exercised on small snippets for the edges the fixtures do not reach.
 *
 * Mutation: run with CHECKER_DISABLE=R1 (or any rule). The matching bad-fixture test must then
 * fail. `npm run eval:mutate` does that for all ten and prints one line each.
 */
import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';
import { analyseTs, classifyImport, scoreBatch, staticRules } from './check.mjs';
import { RULES } from './config.mjs';

const FIX = new URL('./fixtures/', import.meta.url).pathname;

// [id, folder, task]
const GOOD: [string, string, string][] = [
  ['good-T1', 'good/T1', 'T1'],
  ['good-T2', 'good/T2', 'T2'],
  ['good-T2-native', 'good/T2-native', 'T2'],
  ['good-T3', 'good/T3', 'T3'],
  ['good-T4', 'good/T4', 'T4'],
  ['good-T5', 'good/T5', 'T5'],
  ['good-T5-popover', 'good/T5-popover', 'T5'],
];

// [id, folder, task, the one rule it breaks]
const BAD: [string, string, string, string][] = [
  ['bad-R1', 'bad/R1', 'T3', 'R1'],
  ['bad-R1-css', 'bad/R1-css', 'T3', 'R1'],
  ['bad-R2', 'bad/R2', 'T3', 'R2'],
  ['bad-R3', 'bad/R3', 'T3', 'R3'],
  ['bad-R4', 'bad/R4', 'T3', 'R4'],
  ['bad-R5-css', 'bad/R5', 'T3', 'R5'],
  ['bad-R6', 'bad/R6', 'T3', 'R6'],
  ['bad-R7', 'bad/R7', 'T3', 'R7'],
  ['bad-R8', 'bad/R8', 'T3', 'R8'],
  ['bad-R9', 'bad/R9', 'T3', 'R9'],
  ['bad-R10-T1', 'bad/R10-T1', 'T1', 'R10'],
  ['bad-R10-T2', 'bad/R10-T2', 'T2', 'R10'],
  ['bad-R10-T2-focus', 'bad/R10-T2-focus', 'T2', 'R10'],
  ['bad-R10-T3', 'bad/R10-T3', 'T3', 'R10'],
  ['bad-R10-T3-empty', 'bad/R10-T3-empty', 'T3', 'R10'],
  ['bad-R10-T4', 'bad/R10-T4', 'T4', 'R10'],
  ['bad-R10-T5', 'bad/R10-T5', 'T5', 'R10'],
  ['bad-R10-T5-arrows', 'bad/R10-T5-arrows', 'T5', 'R10'],
];

const targets = [
  ...GOOD.map(([id, dir, task]) => ({ id, task, dir: FIX + dir })),
  ...BAD.map(([id, dir, task]) => ({ id, task, dir: FIX + dir })),
  { id: 'edge-na', task: 'T3', dir: FIX + 'edge/na' },
  { id: 'bad-missing', task: 'T3', dir: FIX + 'bad/missing' },
  { id: 'bad-empty', task: 'T3', dir: FIX + 'bad/empty' },
];

let scored: Awaited<ReturnType<typeof scoreBatch>>;
beforeAll(async () => {
  scored = await scoreBatch(targets);
}, 300_000);

describe('good fixtures pass every rule, with places inspected', () => {
  for (const [id] of GOOD) {
    for (const rule of RULES) {
      it(`${id}: ${rule} is pass`, () => {
        expect(scored[id].rules[rule].status).toBe('pass');
        expect(scored[id].rules[rule].inspected).toBeGreaterThan(0);
      });
    }
  }
});

describe('each bad fixture fails exactly its own rule', () => {
  for (const [id, , , own] of BAD) {
    it(`${id}: ${own} is fail`, () => {
      expect(scored[id].rules[own].status).toBe('fail');
    });
    it(`${id}: no other rule fails`, () => {
      const others = RULES.filter((r) => r !== own && scored[id].rules[r].status === 'fail');
      expect(others, JSON.stringify(others.map((r) => scored[id].rules[r].violations))).toEqual([]);
    });
  }
});

describe('missing and empty output', () => {
  for (const id of ['bad-missing', 'bad-empty']) {
    it(`${id}: fails all ten rules and scores 0, still counted as a run`, () => {
      for (const rule of RULES) expect(scored[id].rules[rule].status).toBe('fail');
      expect(scored[id].applicable).toBe(10);
      expect(scored[id].score).toBe(0);
    });
  }
});

describe('a rule that inspected nothing says na, never pass', () => {
  for (const rule of ['R1', 'R2', 'R3', 'R4', 'R5']) {
    it(`edge-na: ${rule} is na`, () => {
      expect(scored['edge-na'].rules[rule].status).toBe('na');
      expect(scored['edge-na'].rules[rule].inspected).toBe(0);
    });
  }
  it('edge-na: n/a rules are left out of the score', () => {
    expect(scored['edge-na'].applicable).toBe(5);
    expect(scored['edge-na'].score).toBe(1);
  });
});

describe('what the report says about contrast', () => {
  it('axe leaves color-contrast incomplete under css: false, and the report records that', () => {
    expect((scored['good-T3'].rules.R9 as { incomplete: string[] }).incomplete).toContain('color-contrast');
    expect(scored['good-T3'].notes.join(' ')).toMatch(/contrast is not covered/i);
  });
});

// ---------------------------------------------------------------- detector snippets

const TOKENS = new Set(
  [...readFileSync(new URL('../src/tokens/tokens.css', import.meta.url), 'utf8').matchAll(/(--nil-[a-z0-9-]+)\s*:/g)].map((m) => m[1]),
);
const KIT = "import { Button } from '../src';\n";
function rule(rid: string, body: string) {
  const facts = analyseTs('eval-output/Result.tsx', `${KIT}export default function R() { return (${body}); }`, 'eval-output');
  return staticRules([facts], TOKENS)[rid] as { status: string; invented?: string[]; dynamicRefsSkipped?: number };
}

describe('R1 raw colour: detector edges', () => {
  const cases: [string, string, string][] = [
    ['named colour in a colour property', `<div style={{ color: 'red' }} />`, 'fail'],
    ['rgb() inside a shadow', `<div style={{ boxShadow: '0 0 0 2px rgb(0 0 0)' }} />`, 'fail'],
    ['oklch()', `<div style={{ background: 'oklch(0.5 0.1 200)' }} />`, 'fail'],
    ['hsl() in a CSS string in a style block', '<style>{`a { color: hsl(10 20% 30%); }`}</style>', 'fail'],
    ['a hex held in a constant and used later', `<div style={{ color: ((c) => c)('#fff') }} />`, 'fail'],
    ['a token is fine', `<div style={{ background: 'var(--nil-color-surface)' }} />`, 'pass'],
    ['a token whose name contains a colour word is not read as that colour', `<div style={{ color: 'var(--nil-color-red)' }} />`, 'pass'],
    ['a colour in a var() fallback is still raw', `<div style={{ color: 'var(--nil-color-text, red)' }} />`, 'fail'],
    ['transparent, currentColor and inherit are allowed', `<div style={{ background: 'transparent', color: 'currentColor', borderColor: 'inherit' }} />`, 'pass'],
    ['the word red in text is not a colour', `<p aria-label="red alert">red alert</p>`, 'na'],
    ['#hash in an href is not a colour', `<a href="#fff">x</a>`, 'na'],
    ['a named colour outside a colour property is not read as a colour', `<div style={{ fontFamily: 'tan' }} />`, 'na'],
  ];
  for (const [name, jsx, expected] of cases) it(name, () => expect(rule('R1', jsx).status).toBe(expected));
});

describe('R4 raw px and rem: detector edges', () => {
  const cases: [string, string, string][] = [
    ['a bare number is px in React', `<div style={{ padding: 12 }} />`, 'fail'],
    ['px string', `<div style={{ margin: '4px 0' }} />`, 'fail'],
    ['rem font size', `<div style={{ fontSize: '1rem' }} />`, 'fail'],
    ['a raw px inside calc() fails', `<div style={{ gap: 'calc(var(--nil-spacing-md) + 4px)' }} />`, 'fail'],
    ['a raw px in a var() fallback fails', `<div style={{ gap: 'var(--nil-spacing-md, 8px)' }} />`, 'fail'],
    ['border shorthand width fails', `<div style={{ border: '2px solid var(--nil-color-border)' }} />`, 'fail'],
    ['kebab-case in a CSS string', '<style>{`a { padding-left: 10px; }`}</style>', 'fail'],
    ['zero is allowed', `<div style={{ padding: 0, margin: '0' }} />`, 'pass'],
    ['a percentage is allowed', `<div style={{ left: '50%' }} />`, 'pass'],
    ['calc() built only from tokens is allowed', `<div style={{ gap: 'calc(var(--nil-spacing-md) * 2)' }} />`, 'pass'],
    ['element width is outside this rule on purpose', `<div style={{ width: '240px' }} />`, 'na'],
  ];
  for (const [name, jsx, expected] of cases) it(name, () => expect(rule('R4', jsx).status).toBe(expected));
});

describe('R5 radius: detector edges', () => {
  const cases: [string, string, string][] = [
    ['a percentage fails', `<div style={{ borderRadius: '50%' }} />`, 'fail'],
    ['a px value fails', `<div style={{ borderTopLeftRadius: '8px' }} />`, 'fail'],
    ['a non-radius token fails', `<div style={{ borderRadius: 'var(--nil-spacing-md)' }} />`, 'fail'],
    ['a radius token with a raw fallback fails', `<div style={{ borderRadius: 'var(--nil-radius-default, 4px)' }} />`, 'fail'],
    ['a radius token is fine', `<div style={{ borderRadius: 'var(--nil-radius-full)' }} />`, 'pass'],
    ['zero is allowed', `<div style={{ borderRadius: 0 }} />`, 'pass'],
    ['inherit is allowed', `<div style={{ borderRadius: 'inherit' }} />`, 'pass'],
  ];
  for (const [name, jsx, expected] of cases) it(name, () => expect(rule('R5', jsx).status).toBe(expected));
});

describe('R2 and R3 token references', () => {
  it('a primitive token fails R2 but exists, so R3 passes', () => {
    const jsx = `<div style={{ color: 'var(--nil-primitive-color-accent)' }} />`;
    expect(rule('R2', jsx).status).toBe('fail');
    expect(rule('R3', jsx).status).toBe('pass');
  });
  it('an invented token fails R3 and is listed by name', () => {
    const r = rule('R3', `<div style={{ color: 'var(--nil-color-made-up)' }} />`);
    expect(r.status).toBe('fail');
    expect(r.invented).toEqual(['--nil-color-made-up']);
  });
  it('a dynamic name cannot be resolved, so it is skipped and counted, not guessed', () => {
    const r = rule('R3', '<div style={{ gap: `var(--nil-spacing-${"md"})` }} />');
    expect(r.status).toBe('na');
    expect(r.dynamicRefsSkipped).toBe(1);
  });
});

describe('R6 imports: the Never list', () => {
  const bad = [
    '@radix-ui/react-dialog', '@mui/material', '@chakra-ui/react', '@headlessui/react', '@ariakit/react',
    'react-aria-components', '@react-aria/focus', 'react-stately', '@/components/ui/button', 'lodash', 'clsx', 'node:fs',
  ];
  for (const spec of bad) it(`${spec} is not allowed`, () => expect(classifyImport(spec).ok).toBe(false));
  for (const spec of ['react', 'react/jsx-runtime', 'react-dom', 'react-dom/client']) {
    it(`${spec} is allowed`, () => expect(classifyImport(spec).ok).toBe(true));
  }
  it('the kit and local files are allowed, anything else relative is not', () => {
    expect(classifyImport('../src')).toMatchObject({ ok: true, kit: true });
    expect(classifyImport('../src/components/Button')).toMatchObject({ ok: true, kit: true });
    expect(classifyImport('./styles.css')).toMatchObject({ ok: true, local: true });
    expect(classifyImport('../demo/App').ok).toBe(false);
  });
  it('require() and dynamic import() count, not only import statements', () => {
    expect(rule('R6', `<div>{String(require('lodash'))}</div>`).status).toBe('fail');
    expect(rule('R6', `<div>{String(import('@mui/material'))}</div>`).status).toBe('fail');
  });
});

describe('R7 kit components', () => {
  it('a raw checkbox fails', () => expect(rule('R7', `<input type="checkbox" />`).status).toBe('fail'));
  it('a raw role="switch" fails', () => expect(rule('R7', `<div role="switch" aria-checked="false" />`).status).toBe('fail'));
  it('the kit component with role="switch" is fine', () => expect(rule('R7', `<Button role="switch" aria-checked="false">x</Button>`).status).toBe('pass'));
  it('no kit import at all fails', () => {
    const facts = analyseTs('eval-output/Result.tsx', `export default function R() { return <p>hi</p>; }`, 'eval-output');
    expect(staticRules([facts], TOKENS).R7.status).toBe('fail');
  });
});

describe('facts recorded for the summary', () => {
  it('a ref on a kit component is recorded (the kit Button does not forward refs)', () => {
    const facts = analyseTs('eval-output/Result.tsx', `${KIT}export default function R() { return <Button ref={null}>x</Button>; }`, 'eval-output');
    expect(facts.refOnKit).toHaveLength(1);
  });
});
