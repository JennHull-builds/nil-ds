import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Message } from './Message';

describe('Message', () => {
  it('renders the words in one paragraph', () => {
    const { container } = render(<Message>Saved on this device.</Message>);
    expect(screen.getByText('Saved on this device.')).toBeInTheDocument();
    expect(container.children).toHaveLength(1);
    expect(container.firstElementChild!.tagName).toBe('P');
  });

  it('defaults to the neutral tone class', () => {
    const { container } = render(<Message>Plain</Message>);
    expect(container.firstElementChild).toHaveClass('nil-message', 'nil-message--neutral');
  });

  it.each(['success', 'danger'] as const)('applies the %s tone class', (tone) => {
    const { container } = render(<Message tone={tone}>Words</Message>);
    expect(container.firstElementChild).toHaveClass('nil-message', `nil-message--${tone}`);
  });

  it('passes className, style and other attributes through', () => {
    const { container } = render(
      <Message className="extra" style={{ gridColumn: '1 / -1' }} id="save-state" data-x="1">
        Words
      </Message>,
    );
    const p = container.firstElementChild!;
    expect(p).toHaveClass('nil-message', 'extra');
    expect(p).toHaveStyle({ gridColumn: '1 / -1' });
    expect(p).toHaveAttribute('id', 'save-state');
    expect(p).toHaveAttribute('data-x', '1');
  });

  describe('live region', () => {
    it('is role=status for neutral and success', () => {
      render(
        <>
          <Message>Neutral words</Message>
          <Message tone="success">Success words</Message>
        </>,
      );
      expect(screen.getAllByRole('status')).toHaveLength(2);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('is role=alert for danger', () => {
      render(<Message tone="danger">That file is not a backup.</Message>);
      expect(screen.getByRole('alert')).toHaveTextContent('That file is not a backup.');
    });

    it('lets a caller-supplied role win', () => {
      render(
        <>
          <Message tone="danger" role="status">
            Quiet danger
          </Message>
          <Message role="alert">Loud neutral</Message>
        </>,
      );
      expect(screen.getByRole('status')).toHaveTextContent('Quiet danger');
      expect(screen.getByRole('alert')).toHaveTextContent('Loud neutral');
    });
  });

  describe('nothing to say', () => {
    it.each([
      ['undefined', undefined],
      ['null', null],
      ['false', false],
      ['an empty string', ''],
    ])('renders the empty live region for %s, with no icon and no cursor', (_label, children) => {
      const { container } = render(
        <Message tone="danger" busy>
          {children}
        </Message>,
      );
      const region = screen.getByRole('alert');
      expect(region).toBeInTheDocument();
      expect(region).toBeEmptyDOMElement();
      expect(container.querySelector('svg')).toBeNull();
      expect(container.querySelector('.nil-cursor-blink')).toBeNull();
    });

    it('renders the region with no children prop at all', () => {
      render(<Message />);
      expect(screen.getByRole('status')).toBeEmptyDOMElement();
    });

    it('announces words that arrive later in the same element', () => {
      const { rerender } = render(<Message tone="danger" />);
      const before = screen.getByRole('alert');
      rerender(<Message tone="danger">It failed.</Message>);
      expect(screen.getByRole('alert')).toBe(before);
      expect(before).toHaveTextContent('It failed.');
    });
  });

  describe('icons', () => {
    it('shows the error icon before the words for danger, decorative', () => {
      const { container } = render(<Message tone="danger">Nothing was changed.</Message>);
      const svg = container.querySelector('svg')!;
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('aria-hidden', 'true');
      expect(svg).toHaveClass('nil-icon--sm', 'nil-message__icon');
      expect(svg).not.toHaveAttribute('aria-label');
      expect(svg.compareDocumentPosition(screen.getByText('Nothing was changed.')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('shows a different icon for success, also decorative', () => {
      const danger = render(<Message tone="danger">x</Message>).container.querySelector('svg')!.innerHTML;
      const { container } = render(<Message tone="success">Saved</Message>);
      const svg = container.querySelector('svg')!;
      expect(svg).toHaveAttribute('aria-hidden', 'true');
      expect(svg.innerHTML).not.toBe(danger);
    });

    it('shows no icon for neutral', () => {
      const { container } = render(<Message>Plain</Message>);
      expect(container.querySelector('svg')).toBeNull();
    });
  });

  describe('busy', () => {
    it('follows the words with the kit cursor, hidden from assistive tech', () => {
      const { container } = render(<Message busy>Sorting. This can take up to 20 seconds.</Message>);
      const cursor = container.querySelector('.nil-cursor-blink')!;
      expect(cursor).toBeInTheDocument();
      expect(cursor).toHaveAttribute('aria-hidden', 'true');
      expect(cursor.textContent).toBe('▌');
      expect(container.querySelector('.nil-message__text')!.lastElementChild).toBe(cursor);
      expect(screen.getByRole('status')).toHaveTextContent('Sorting. This can take up to 20 seconds.');
    });

    it('has no cursor when not busy', () => {
      const { container } = render(<Message>Done</Message>);
      expect(container.querySelector('.nil-cursor-blink')).toBeNull();
    });
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <>
        <Message>Neutral</Message>
        <Message tone="success">Saved on this device.</Message>
        <Message tone="danger">That file is not a backup. Nothing was changed.</Message>
        <Message busy>Sorting. This can take up to 20 seconds.</Message>
        <Message tone="danger" />
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  describe('look (core.css)', () => {
    // jsdom computes no styles, so these read the stylesheet.
    const raw = readFileSync(join(__dirname, '..', '..', 'src/core/core.css'), 'utf8');
    const start = raw.indexOf('/* ─── Message ─');
    const section = raw.slice(start, raw.indexOf('/* ─── Composer ─'));
    const css = section.replace(/\/\*[\s\S]*?\*\//g, '');

    it('found the Message section', () => {
      expect(start).toBeGreaterThan(-1);
      expect(css).toContain('.nil-message {');
      expect(css).toContain('.nil-message__cursor');
    });

    it('holds no hex, literal pixel value or primitive token', () => {
      expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
      expect(css).not.toMatch(/\d(\.\d+)?px/);
      expect(css).not.toContain('--nil-primitive-');
    });

    it('sets danger text with the text role, never the danger fill', () => {
      expect(css).toMatch(/\.nil-message--danger \{[^}]*color: var\(--nil-color-text-danger\)/);
      expect(css).not.toMatch(/color: var\(--nil-color-danger\)/);
    });

    it('writes no second blink: the cursor is .nil-cursor-blink with a gap and a colour', () => {
      expect(css).not.toContain('@keyframes');
      expect(css).not.toContain('animation');
      expect(css).toMatch(/\.nil-message__cursor \{[^}]*margin-left: var\(--nil-spacing-xs\)[^}]*color: var\(--nil-color-text-accent\)/);
    });

    it('takes its icon size from the token and sets no outer margin of its own', () => {
      expect(css).toMatch(/\.nil-message__icon \{[^}]*var\(--nil-size-icon-sm\)/);
      expect(css).toMatch(/\.nil-message \{[^}]*margin: 0;/);
    });
  });
});
