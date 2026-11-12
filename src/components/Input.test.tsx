import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';
import { Input } from './Input';
import { axe } from 'vitest-axe';

describe('Input', () => {
  it('renders a labelled textbox associated via htmlFor/id', () => {
    render(<Input label="Email" />);
    const input = screen.getByLabelText('Email');
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe('INPUT');
  });

  it('generates a stable id when none is provided', () => {
    render(<Input label="Auto id" />);
    const input = screen.getByLabelText('Auto id');
    expect(input.id).toBeTruthy();
  });

  it('respects an explicit id', () => {
    render(<Input label="Explicit id" id="custom-id" />);
    const input = screen.getByLabelText('Explicit id');
    expect(input.id).toBe('custom-id');
  });

  it('has aria-invalid false and no description when there is no error', () => {
    render(<Input label="Clean" />);
    const input = screen.getByLabelText('Clean');
    expect(input).toHaveAttribute('aria-invalid', 'false');
    expect(input).not.toHaveAttribute('aria-describedby');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('surfaces an error message and wires aria-invalid/aria-describedby', () => {
    render(<Input label="Password" error="Too short" />);
    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    const errorEl = screen.getByText('Too short');
    expect(input.getAttribute('aria-describedby')).toBe(errorEl.id);
  });

  it('accepts user input and forwards standard input props', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Input label="Name" placeholder="Jane" onChange={onChange} />);
    const input = screen.getByLabelText('Name');
    expect(input).toHaveAttribute('placeholder', 'Jane');
    await user.type(input, 'Alex');
    expect(input).toHaveValue('Alex');
    expect(onChange).toHaveBeenCalled();
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <>
        <Input label="Email address" />
        <Input label="Display name" error="This field is required" />
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  describe('trailing control', () => {
    const eye = <Button type="button" size="sm" variant="ghost" icon="eye" aria-label="Show key" />;

    it('renders exactly today\'s markup when there is no trailing control', () => {
      const plain = render(<Input label="Email" id="e" />).container;
      expect(plain.innerHTML).toBe(
        '<div class="nil-input-group"><label for="e" class="nil-input-label">Email</label><input id="e" aria-invalid="false" class="nil-input"></div>',
      );
      const withError = render(<Input label="Email" id="e2" error="Bad" className="x" />).container;
      expect(withError.innerHTML).toBe(
        '<div class="nil-input-group"><label for="e2" class="nil-input-label">Email</label><input id="e2" aria-invalid="true" aria-describedby="e2-error" class="nil-input x"><span id="e2-error" class="nil-input-error">Bad</span></div>',
      );
      expect(plain.querySelector('.nil-input-field')).toBeNull();
      expect(plain.querySelector('.nil-input-trailing')).toBeNull();
    });

    it('wraps the input and the control in one field, and the control in its slot', () => {
      const { container } = render(<Input label="API key" trailing={eye} />);
      const field = container.querySelector('.nil-input-field')!;
      expect(field.tagName).toBe('SPAN');
      const input = screen.getByLabelText('API key');
      expect(input).toHaveClass('nil-input', 'nil-input--trailing');
      expect(input.parentElement).toBe(field);
      const slot = container.querySelector('.nil-input-trailing')!;
      expect(slot.parentElement).toBe(field);
      expect(slot).toContainElement(screen.getByRole('button', { name: 'Show key' }));
    });

    it('puts the control after the input in the DOM and in the Tab order', async () => {
      const user = userEvent.setup();
      render(<Input label="API key" trailing={eye} />);
      const input = screen.getByLabelText('API key');
      const button = screen.getByRole('button', { name: 'Show key' });
      expect(input.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      await user.tab();
      expect(input).toHaveFocus();
      await user.tab();
      expect(button).toHaveFocus();
    });

    it('leaves the label, error, aria-invalid and aria-describedby as they are, with the error outside the field', () => {
      const { container } = render(<Input label="API key" error="Too short" trailing={eye} />);
      const input = screen.getByLabelText('API key');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      const errorEl = screen.getByText('Too short');
      expect(input.getAttribute('aria-describedby')).toBe(errorEl.id);
      expect(container.querySelector('.nil-input-field')).not.toContainElement(errorEl);
    });

    it('does not pass trailing on to the input element', () => {
      render(<Input label="API key" trailing={eye} />);
      expect(screen.getByLabelText('API key')).not.toHaveAttribute('trailing');
    });

    it('has no axe violations with an icon Button as the trailing control', async () => {
      const { container } = render(<Input label="API key" type="password" trailing={eye} />);
      expect(await axe(container)).toHaveNoViolations();
    });

    describe('look (core.css)', () => {
      const css = readFileSync(join(__dirname, '..', '..', 'src/core/core.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
      const rules = ['.nil-input-field', '.nil-input--trailing', '.nil-input-trailing'].map((selector) => {
        const match = css.match(new RegExp(selector.replace(/[.]/g, '\\.') + ' \\{([^}]*)\\}'));
        return { selector, body: match ? match[1] : null };
      });

      it('finds all three rules', () => {
        for (const rule of rules) expect(rule.body, rule.selector).not.toBeNull();
      });

      it('holds no hex, literal pixel value, transform or primitive token', () => {
        for (const { selector, body } of rules) {
          expect(body, selector).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
          expect(body, selector).not.toMatch(/\d(\.\d+)?px/);
          expect(body, selector).not.toContain('transform');
          expect(body, selector).not.toContain('--nil-primitive-');
        }
      });

      it('pads the end of the input by the small button, the inset (spacing and offset) and a gap, all tokens', () => {
        expect(rules[1].body).toMatch(/padding-right: calc\(var\(--nil-size-button-sm\) \+ var\(--nil-spacing-xs\) \+ var\(--nil-size-offset\) \+ var\(--nil-spacing-sm\)\)/);
      });

      it('insets the slot from the end by a spacing token plus the Button offset and centres it without a transform', () => {
        expect(rules[2].body).toMatch(/right: calc\(var\(--nil-spacing-xs\) \+ var\(--nil-size-offset\)\)/);
        expect(rules[2].body).toMatch(/top: 0/);
        expect(rules[2].body).toMatch(/bottom: 0/);
        expect(rules[2].body).toMatch(/align-items: center/);
      });
    });
  });
});
