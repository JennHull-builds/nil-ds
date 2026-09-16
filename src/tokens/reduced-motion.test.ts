import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import tokensJson from './tokens.json';

/**
 * jsdom does not evaluate media queries, so a rendered component cannot prove reduced
 * motion works. Assert on the built artefacts instead, the way the portfolio repo tests
 * source it cannot execute.
 *
 * The rule these guard: a duration is not a kill switch. Collapsing every duration to 1ms
 * fixes transitions and turns a looping animation into a strobe, which is worse for exactly
 * the people the media query protects. So the tokens handle transitions, and anything
 * looping or delayed is switched off explicitly.
 *
 * GOTCHA, cost an hour: do NOT load the CSS with Vite's `?raw`. `vitest.config.ts` sets
 * `css: false`, and under that flag a `?raw` CSS import resolves to an **empty string**
 * rather than failing. Two assertions here pass trivially against empty content, so the
 * suite would have gone green while checking nothing at all. Hence `readFileSync`, and
 * hence the non-empty guard below, which exists so that can never happen quietly again.
 */

const REDUCE = '@media (prefers-reduced-motion: reduce)';
const root = join(__dirname, '..', '..');
const tokensCss = readFileSync(join(root, 'src/tokens/tokens.css'), 'utf8');
const coreCss = readFileSync(join(root, 'src/core/core.css'), 'utf8');

function blockAfter(css: string, marker: string): string {
  const start = css.indexOf(marker);
  if (start === -1) return '';
  let depth = 0;
  for (let i = css.indexOf('{', start); i < css.length; i++) {
    if (css[i] === '{') depth++;
    if (css[i] === '}') {
      depth--;
      if (depth === 0) return css.slice(start, i + 1);
    }
  }
  return '';
}

describe('reduced motion', () => {
  it('actually read both stylesheets', () => {
    // The guard. Every other assertion below is a substring check, and several of them
    // pass against an empty string. If a loader change ever hands these tests nothing,
    // this fails first and loudly instead of the suite going quietly green.
    expect(tokensCss.length).toBeGreaterThan(500);
    expect(coreCss.length).toBeGreaterThan(500);
  });

  it('tokens.css carries a reduced-motion block', () => {
    expect(tokensCss).toContain(REDUCE);
  });

  it('every motion duration token is collapsed, with none missed', () => {
    const durations = Object.keys(tokensJson.semantic).filter((k) =>
      k.startsWith('motion-duration-'),
    );
    expect(durations.length).toBeGreaterThan(0);

    const block = blockAfter(tokensCss, REDUCE);
    for (const token of durations) {
      expect(block).toContain(`--nil-${token}: var(--nil-primitive-motion-duration-instant)`);
    }
  });

  it('the substitute duration is non-zero', () => {
    // 0s can skip transitionend handlers, which silently breaks anything waiting on one.
    expect(tokensJson.primitive.motion['duration-instant'].value).toBe('1ms');
  });

  it('easings are left alone', () => {
    const block = blockAfter(tokensCss, REDUCE);
    expect(block).not.toContain('--nil-motion-easing');
  });

  it('the looping cursor blink is switched OFF, not merely shortened', () => {
    const block = blockAfter(coreCss, REDUCE);
    expect(block).toContain('.nil-cursor-blink');
    // The whole point: at 1ms an infinite animation strobes ~1000 times a second.
    expect(block).toMatch(/\.nil-cursor-blink\s*\{[^}]*animation:\s*none/);
  });

  it('no infinite animation survives reduced motion', () => {
    const block = blockAfter(coreCss, REDUCE);
    const looping = [...coreCss.matchAll(/\.([\w-]+)\s*\{[^}]*animation:[^;]*infinite/g)].map(
      (m) => m[1],
    );
    expect(looping.length).toBeGreaterThan(0);
    for (const cls of looping) {
      expect(block).toMatch(new RegExp(`\\.${cls}\\s*\\{[^}]*animation:\\s*none`));
    }
  });

  it('the stagger delay is zeroed, because the stagger is the motion', () => {
    const block = blockAfter(coreCss, REDUCE);
    expect(block).toMatch(/--nil-anim-delay:\s*0ms/);
  });
});
