import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Button } from './Button';

describe('Button', () => {
  it('renders its label, and no bracket frame (the brackets are retired)', () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Save');
    expect(button.textContent).not.toMatch(/[[\]]/);
    expect(button.querySelector('.nil-btn__bracket')).toBeNull();
  });

  describe('icons', () => {
    it('puts a decorative icon beside the label and keeps the name to the label alone', () => {
      render(
        <Button icon="arrow-up" variant="primary">
          Send
        </Button>,
      );
      const button = screen.getByRole('button', { name: 'Send' });
      const svg = button.querySelector('svg');
      expect(svg).not.toBeNull();
      expect(svg).toHaveAttribute('aria-hidden', 'true');
      expect(button).not.toHaveClass('nil-btn--icon');
    });

    it('renders an icon-only button named by aria-label, with the icon aria-hidden', () => {
      render(<Button icon="close" aria-label="Close dialog" />);
      const button = screen.getByRole('button', { name: 'Close dialog' });
      expect(button).toHaveClass('nil-btn--icon');
      expect(button.querySelector('.nil-btn__label')).toBeNull();
      expect(button.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    });

    it('accepts aria-labelledby as the name of an icon-only button', () => {
      render(
        <>
          <span id="why">Delete note</span>
          <Button icon="trash" aria-labelledby="why" />
        </>,
      );
      expect(screen.getByRole('button', { name: 'Delete note' })).toBeInTheDocument();
    });

    it('does not compile an icon-only button with no accessible name', () => {
      // The type is the proof: `tsc` (npm run typecheck) fails on an unused @ts-expect-error, so if the
      // type ever stopped requiring a name, this line would turn into a type error. At run time it only
      // has to render, so the second assertion shows what the type is guarding against: no name at all.
      // @ts-expect-error an icon-only Button needs aria-label or aria-labelledby
      render(<Button icon="close" />);
      expect(screen.getByRole('button').getAttribute('aria-label')).toBeNull();
      expect(screen.queryByRole('button', { name: /./ })).toBeNull();
    });

    it('lets a text button carry an icon without a name prop', () => {
      // A text button may carry an icon without a name prop, because its label names it.
      render(<Button icon="check">Done</Button>);
      expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument();
    });
  });

  it('defaults to the secondary/md variant classes', () => {
    render(<Button>Default</Button>);
    const button = screen.getByRole('button', { name: 'Default' });
    expect(button).toHaveClass('nil-btn', 'nil-btn--secondary', 'nil-btn--md');
  });

  it.each(['primary', 'secondary', 'ghost', 'danger'] as const)(
    'applies the %s variant class',
    (variant) => {
      render(<Button variant={variant}>{variant}</Button>);
      expect(screen.getByRole('button', { name: variant })).toHaveClass(`nil-btn--${variant}`);
    },
  );

  it.each(['sm', 'md'] as const)('applies the %s size class', (size) => {
    render(<Button size={size}>{size}</Button>);
    expect(screen.getByRole('button', { name: size })).toHaveClass(`nil-btn--${size}`);
  });

  it('fires onClick when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    await user.click(screen.getByRole('button', { name: 'Click me' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled and does not fire onClick when disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Disabled
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Disabled' });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('forwards native button attributes and merges className', () => {
    render(
      <Button type="submit" className="extra-class" aria-label="Submit form">
        Submit
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Submit form' });
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveClass('extra-class');
  });

  it('forwards a ref to the underlying <button>', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Focus me</Button>);
    const button = screen.getByRole('button', { name: 'Focus me' });
    expect(ref.current).toBe(button);
    expect(ref.current?.tagName).toBe('BUTTON');
    ref.current?.focus();
    expect(button).toHaveFocus();
  });

  it('keeps a button focusable when it is aria-disabled, which disabled would not', async () => {
    // The busy-confirmation pattern in Dialog depends on this: a natively disabled button
    // loses focus, an aria-disabled one keeps it. The click is ignored by the caller.
    const user = userEvent.setup();
    render(<Button aria-disabled="true">Busy</Button>);
    await user.tab();
    expect(screen.getByRole('button', { name: 'Busy' })).toHaveFocus();
  });

  describe('aria-disabled look (core.css)', () => {
    // jsdom computes no styles, so these read the stylesheet. A busy button is aria-disabled and not
    // disabled, so it keeps focus; the CSS has to make it look unavailable and keep it from lighting up.
    // (`?raw` would hand back an empty string under `css: false`, hence readFileSync and the guard.)
    const css = readFileSync(join(__dirname, '..', '..', 'src/core/core.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

    it('read the stylesheet at all', () => {
      expect(css.length).toBeGreaterThan(500);
    });

    it("gives aria-disabled the same look as :disabled, for every variant", () => {
      const look = css.match(/\.nil-btn:disabled,\s*\.nil-btn\[aria-disabled='true'\]\s*\{([^}]*)\}/);
      expect(look).not.toBeNull();
      expect(look![1]).toMatch(/opacity:\s*0\.55/);
      expect(look![1]).toMatch(/cursor:\s*not-allowed/);
      expect(look![1]).toContain('background: var(--nil-color-surface)');
      expect(look![1]).toContain('color: var(--nil-color-text-muted)');
      // No shadow while unavailable, and the frame goes muted.
      expect(look![1]).toContain('box-shadow: none');
      expect(look![1]).toContain('border-color: var(--nil-color-text-muted)');
    });

    it('lets no hover or pressed rule apply to an aria-disabled button', () => {
      const selectors = [...css.matchAll(/([^{}]*\.nil-btn--[a-z]+[^{}]*:(?:hover|active)[^{}]*)\{/g)].map((m) => m[1].trim());
      // hover and press, for the three filled-or-framed variants as one rule each, and for ghost
      expect(selectors.length).toBeGreaterThanOrEqual(4);
      for (const selector of selectors) expect(selector).toContain(":not([aria-disabled='true'])");
    });
  });

  describe('Offset look (core.css)', () => {
    const raw = readFileSync(join(__dirname, '..', '..', 'src/core/core.css'), 'utf8');
    const section = raw.slice(raw.indexOf('/* ─── Button ─'), raw.indexOf('.nil-input:focus-visible'));
    const css = section.replace(/\/\*[\s\S]*?\*\//g, '');

    it('found the Button section', () => {
      expect(css.length).toBeGreaterThan(1500);
    });

    it('holds no literal pixel, hex or time value: every distance, colour and duration is a token', () => {
      expect(css).not.toMatch(/\d(\.\d+)?px/);
      expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
      expect(css).not.toMatch(/\d(\.\d+)?m?s\b/);
      // every transition duration is a motion token, so reduced motion (which collapses them) covers it
      const transition = css.match(/transition:([^;]*);/)![1];
      expect(transition.match(/var\(--nil-motion-duration-[a-z]+\)/g)!.length).toBe(5);
    });

    it('is 44 px (the tap size) at md, and extends a sm tap area to the tap size', () => {
      expect(css).toMatch(/\.nil-btn \{[^}]*min-height: var\(--nil-size-tap\)/);
      expect(css).toMatch(/\.nil-btn--sm::after \{[^}]*height: var\(--nil-size-tap\)/);
    });

    it('focus turns the shadow to the accent and draws no outline ring', () => {
      const focus = css.match(/\.nil-btn:focus-visible \{([^}]*)\}/)![1];
      expect(focus).toContain('outline: none');
      expect(focus).toMatch(/box-shadow: var\(--nil-size-offset-focus\) var\(--nil-size-offset-focus\) 0 0 var\(--nil-color-accent\)/);
      // unfilled buttons turn their frame to the accent too
      expect(css).toMatch(/\.nil-btn--secondary:focus-visible,\s*\.nil-btn--ghost:focus-visible \{[^}]*border-color: var\(--nil-color-accent\)/);
    });

    it('falls back to a system outline in forced-colours mode, where shadows are not drawn', () => {
      expect(css).toMatch(/@media \(forced-colors: active\) \{\s*\.nil-btn:focus-visible \{[^}]*outline: var\(--nil-border-width-thick\) solid Highlight/);
    });

    it('keeps a toggle that is on pushed in and inverted', () => {
      const on = css.match(/\.nil-btn\[aria-pressed='true'\] \{([^}]*)\}/)![1];
      expect(on).toContain('box-shadow: none');
      expect(on).toContain('background: var(--nil-color-text)');
      expect(on).toContain('color: var(--nil-color-bg)');
    });
  });

  describe('aria-busy look (core.css)', () => {
    // A working button keeps its look at full strength, so the thing that is working stays visible.
    const css = readFileSync(join(__dirname, '..', '..', 'src/core/core.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

    it('gets a progress cursor and is not dimmed', () => {
      const rule = css.match(/\.nil-btn\[aria-busy='true'\]\s*\{([^}]*)\}/);
      expect(rule).not.toBeNull();
      expect(rule![1]).toMatch(/cursor:\s*progress/);
      expect(rule![1]).not.toMatch(/opacity|background|color:/); // nothing that would change how it looks
    });

    it('lets no hover or pressed rule apply to an aria-busy button', () => {
      const selectors = [...css.matchAll(/([^{}]*\.nil-btn--[a-z]+[^{}]*:(?:hover|active)[^{}]*)\{/g)].map((m) => m[1].trim());
      expect(selectors.length).toBeGreaterThanOrEqual(4);
      for (const selector of selectors) expect(selector).toContain(":not([aria-busy='true'])");
    });
  });

  it('keeps a button that is aria-busy focusable, enabled and clickable, since the caller ignores the click', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button aria-busy="true" onClick={onClick}>Working</Button>);
    const button = screen.getByRole('button', { name: 'Working' });
    await user.tab();
    expect(button).toHaveFocus();
    expect(button).not.toBeDisabled();
    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(1); // the kit does not swallow it; the caller's handler decides
  });

  it('has no axe violations in any variant', async () => {
    const { container } = render(
      <>
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
        <Button disabled>Disabled</Button>
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
