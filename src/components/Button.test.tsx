import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Button } from './Button';

describe('Button', () => {
  it('renders its label and bracket frame', () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('[');
    expect(button).toHaveTextContent(']');
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
      // The bracket glyphs dim with it.
      expect(css).toMatch(
        /\.nil-btn:disabled \.nil-btn__bracket,\s*\.nil-btn\[aria-disabled='true'\] \.nil-btn__bracket/,
      );
    });

    it('lets no hover or pressed rule apply to an aria-disabled button', () => {
      const selectors = [...css.matchAll(/([^{}]*\.nil-btn--[a-z]+[^{}]*:(?:hover|active)[^{}]*)\{/g)].map((m) => m[1].trim());
      // primary and danger hover (light and dark), secondary hover, pressed and its bracket, ghost the same
      expect(selectors.length).toBeGreaterThanOrEqual(10);
      for (const selector of selectors) expect(selector).toContain(":not([aria-disabled='true'])");
    });
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
