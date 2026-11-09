import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Icon } from './Icon';
import { ICONS, ICON_NAMES } from './icons';
import type { IconDef, IconShape } from './icons';

const css = readFileSync(join(__dirname, '..', '..', 'src/core/core.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

/** Every shape an icon can draw, including its 16 px form. */
function shapesOf(def: IconDef): IconShape[] {
  return [def, ...(def.small ? [def.small] : [])];
}

/** Walk a path made only of M L H V Z (either case) and return its absolute points. */
function points(d: string): [number, number][] {
  const out: [number, number][] = [];
  let x = 0;
  let y = 0;
  for (const [, cmd, args] of d.matchAll(/([MLHVZmlhvz])([^MLHVZmlhvz]*)/g)) {
    const n = (args.match(/-?\d*\.?\d+/g) ?? []).map(Number);
    const rel = cmd === cmd.toLowerCase();
    const c = cmd.toUpperCase();
    if (c === 'M' || c === 'L') {
      for (let i = 0; i < n.length; i += 2) {
        x = rel ? x + n[i] : n[i];
        y = rel ? y + n[i + 1] : n[i + 1];
        out.push([x, y]);
      }
    } else if (c === 'H') {
      for (const v of n) {
        x = rel ? x + v : v;
        out.push([x, y]);
      }
    } else if (c === 'V') {
      for (const v of n) {
        y = rel ? y + v : v;
        out.push([x, y]);
      }
    }
  }
  return out;
}

describe('Icon', () => {
  it('has the whole set: 36 names, none repeated', () => {
    expect(ICON_NAMES).toHaveLength(36);
    expect(new Set(ICON_NAMES).size).toBe(36);
  });

  it.each(ICON_NAMES)('renders %s as an SVG with at least one shape', (name) => {
    const { container } = render(<Icon name={name} />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg!.querySelectorAll('path').length).toBeGreaterThan(0);
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
  });

  it('is decorative by default: aria-hidden, no role, no name', () => {
    const { container } = render(<Icon name="mic" />);
    const svg = container.querySelector('svg')!;
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).not.toHaveAttribute('role');
    expect(svg).not.toHaveAttribute('aria-label');
    expect(svg).toHaveAttribute('focusable', 'false');
  });

  it('becomes an image with a name when given a label', () => {
    render(<Icon name="warning" label="Warning" />);
    const img = screen.getByRole('img', { name: 'Warning' });
    expect(img).not.toHaveAttribute('aria-hidden');
  });

  it.each([
    ['sm', 'nil-icon--sm'],
    ['md', 'nil-icon--md'],
    ['lg', 'nil-icon--lg'],
  ] as const)('applies the %s size class, and md is the default', (size, cls) => {
    const { container } = render(<Icon name="plus" size={size} />);
    expect(container.querySelector('svg')).toHaveClass('nil-icon', cls);
    const { container: def } = render(<Icon name="plus" />);
    expect(def.querySelector('svg')).toHaveClass('nil-icon--md');
  });

  it('merges a className and forwards other attributes', () => {
    const { container } = render(<Icon name="plus" className="extra" data-testid="i" />);
    expect(container.querySelector('svg')).toHaveClass('nil-icon', 'extra');
    expect(screen.getByTestId('i')).toBeInTheDocument();
  });

  describe('the drawings', () => {
    it.each(ICON_NAMES)('%s uses only straight lines and stays inside the 24 unit grid', (name) => {
      for (const shape of shapesOf(ICONS[name])) {
        for (const d of [...shape.lines, ...(shape.solid ?? []), ...(shape.slash ? [shape.slash] : [])]) {
          // M L H V Z only. A, C, S, Q, T would be a curve, and the set has none: curves are cut into facets.
          expect(d, `${name}: ${d}`).toMatch(/^[MLHVZmlhvz0-9.\-\s]+$/);
          for (const [px, py] of points(d)) {
            expect(px, `${name}: ${d}`).toBeGreaterThanOrEqual(0);
            expect(px, `${name}: ${d}`).toBeLessThanOrEqual(24);
            expect(py, `${name}: ${d}`).toBeGreaterThanOrEqual(0);
            expect(py, `${name}: ${d}`).toBeLessThanOrEqual(24);
          }
        }
      }
    });

    it('draws the 16 px form at the small size only', () => {
      const withSmall = ICON_NAMES.filter((n) => (ICONS[n] as IconDef).small);
      expect(withSmall.length).toBeGreaterThan(0);
      for (const name of withSmall) {
        const full = render(<Icon name={name} size="md" />).container.querySelector('svg')!.innerHTML;
        const small = render(<Icon name={name} size="sm" />).container.querySelector('svg')!.innerHTML;
        expect(small, name).not.toBe(full);
      }
    });
  });

  describe('eye-off', () => {
    it('cuts the slash out with a mask, and the mask id is unique per icon on a page', () => {
      const { container } = render(
        <>
          <Icon name="eye-off" />
          <Icon name="eye-off" />
        </>,
      );
      const masks = Array.from(container.querySelectorAll("mask"));
      expect(masks).toHaveLength(2);
      expect(masks[0].id).not.toBe(masks[1].id);
      for (const mask of masks) {
        expect(mask.id).not.toMatch(/:/);
        expect(container.querySelector(`g[mask="url(#${mask.id})"]`)).not.toBeNull();
      }
    });
  });

  it('has no axe violations, decorative or labelled', async () => {
    const { container } = render(
      <>
        <Icon name="check" />
        <Icon name="warning" label="Warning" size="lg" />
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  describe('stroke (core.css)', () => {
    // jsdom computes no styles, so these read the stylesheet.
    it('read the stylesheet at all', () => {
      expect(css.length).toBeGreaterThan(500);
    });

    it('takes its stroke from the border tokens: border width at sm, the thick border width at md and lg', () => {
      expect(css).toMatch(/\.nil-icon \{[^}]*--nil-icon-stroke: var\(--nil-border-width-thick\)/);
      expect(css).toMatch(/\.nil-icon--sm \{[^}]*--nil-icon-stroke: var\(--nil-border-width\);/);
      expect(css).not.toMatch(/\.nil-icon--(md|lg) \{[^}]*--nil-icon-stroke/);
    });

    it('sizes from the icon size tokens', () => {
      for (const size of ['sm', 'md', 'lg']) {
        expect(css).toMatch(new RegExp(`\\.nil-icon--${size} \\{[^}]*width: var\\(--nil-size-icon-${size}\\)`));
      }
    });

    it('draws square ends and mitre joins, and keeps the stroke the same screen width at every size', () => {
      const rule = css.match(/\.nil-icon \{([^}]*)\}/)![1];
      expect(rule).toContain('stroke-linecap: square');
      expect(rule).toContain('stroke-linejoin: miter');
      expect(css).toMatch(/\.nil-icon \* \{[^}]*vector-effect: non-scaling-stroke/);
    });
  });
});
