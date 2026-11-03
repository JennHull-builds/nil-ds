import { createRef, useState } from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Composer, type ComposerStatus } from './Composer';
import registry from '../../registry.json';

const root = join(__dirname, '..', '..');
const coreCss = readFileSync(join(root, 'src/core/core.css'), 'utf8');

const STREAMING_TEXT = 'Reply streaming. Press Stop to send a new message.';

const box = () => screen.getByRole('textbox', { name: 'Message' });
const sendButton = () => screen.getByRole('button', { name: 'Send' });

describe('Composer', () => {
  describe('label and structure', () => {
    it('names the text box with its label, visually hidden by default', () => {
      render(<Composer label="Message" onSend={() => {}} />);
      expect(box().tagName).toBe('TEXTAREA');
      expect(screen.getByText('Message', { selector: 'label' })).toHaveClass('nil-sr-only');
    });

    it('shows the label when showLabel is set', () => {
      render(<Composer label="Message" showLabel onSend={() => {}} />);
      const label = screen.getByText('Message', { selector: 'label' });
      expect(label).toHaveClass('nil-label');
      expect(label).not.toHaveClass('nil-sr-only');
    });

    it('shows the default ">" prefix and accepts a custom one', () => {
      const { rerender, container } = render(<Composer label="Message" onSend={() => {}} />);
      expect(container.querySelector('.nil-composer__prefix')).toHaveTextContent('>');
      rerender(<Composer label="Message" prefix="$" onSend={() => {}} />);
      expect(container.querySelector('.nil-composer__prefix')).toHaveTextContent('$');
    });

    it('puts className and style on the shell, and the rest on the textarea', () => {
      const { container } = render(
        <Composer
          label="Message"
          className="extra"
          style={{ marginTop: 'var(--nil-spacing-md)' }}
          placeholder="Ask what a token does"
          name="msg"
          onSend={() => {}}
        />,
      );
      const shell = container.querySelector('.nil-composer');
      expect(shell).toHaveClass('nil-composer', 'extra');
      expect(shell).toHaveStyle({ marginTop: 'var(--nil-spacing-md)' });
      expect(box()).toHaveAttribute('placeholder', 'Ask what a token does');
      expect(box()).toHaveAttribute('name', 'msg');
    });

    it('forwards a ref to the textarea', () => {
      const ref = createRef<HTMLTextAreaElement>();
      render(<Composer ref={ref} label="Message" onSend={() => {}} />);
      expect(ref.current).toBe(box());
      ref.current?.focus();
      expect(box()).toHaveFocus();
    });

    it('sets the row limit as a custom property on the shell', () => {
      const { container } = render(<Composer label="Message" maxRows={4} onSend={() => {}} />);
      expect(container.querySelector('.nil-composer')).toHaveStyle({ '--nil-composer-rows': '4' });
    });
  });

  describe('Enter, Shift+Enter and empty input', () => {
    it('sends trimmed text on Enter, clears an uncontrolled box and keeps focus', async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      render(<Composer label="Message" onSend={onSend} />);
      await user.type(box(), '  hello world  ');
      await user.keyboard('{Enter}');
      expect(onSend).toHaveBeenCalledTimes(1);
      expect(onSend).toHaveBeenCalledWith('hello world');
      expect(box()).toHaveValue('');
      expect(box()).toHaveFocus();
    });

    it('inserts a newline on Shift+Enter and does not send', async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      render(<Composer label="Message" onSend={onSend} />);
      await user.type(box(), 'line one');
      await user.keyboard('{Shift>}{Enter}{/Shift}');
      await user.type(box(), 'line two');
      expect(onSend).not.toHaveBeenCalled();
      expect(box()).toHaveValue('line one\nline two');
    });

    it('sends a multi-line message with its inner newline intact', async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      render(<Composer label="Message" onSend={onSend} />);
      await user.type(box(), 'a');
      await user.keyboard('{Shift>}{Enter}{/Shift}');
      await user.type(box(), 'b');
      await user.keyboard('{Enter}');
      expect(onSend).toHaveBeenCalledWith('a\nb');
    });

    it('does not send on Enter when the box is empty, and adds no newline', async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      render(<Composer label="Message" onSend={onSend} />);
      await user.click(box());
      await user.keyboard('{Enter}');
      expect(onSend).not.toHaveBeenCalled();
      expect(box()).toHaveValue('');
    });

    it('does not send whitespace-only text, and leaves it in place', async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      render(<Composer label="Message" onSend={onSend} />);
      await user.type(box(), '   ');
      expect(sendButton()).toBeDisabled();
      await user.keyboard('{Enter}');
      expect(onSend).not.toHaveBeenCalled();
      expect(box()).toHaveValue('   ');
    });

    it('lets a consumer onKeyDown call preventDefault to stop a send', async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      render(
        <Composer label="Message" onSend={onSend} onKeyDown={(event) => event.preventDefault()} />,
      );
      await user.type(box(), 'hello');
      await user.keyboard('{Enter}');
      expect(onSend).not.toHaveBeenCalled();
    });
  });

  describe('IME composition', () => {
    it('does not send on the Enter that confirms a composition (isComposing)', async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      render(<Composer label="Message" onSend={onSend} />);
      await user.type(box(), 'こんにちは');
      fireEvent.keyDown(box(), { key: 'Enter', isComposing: true });
      expect(onSend).not.toHaveBeenCalled();
      expect(box()).toHaveValue('こんにちは');
    });

    it('does not send on keyCode 229, which Safari reports after the composition ends', async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      render(<Composer label="Message" onSend={onSend} />);
      await user.type(box(), '你好');
      fireEvent.keyDown(box(), { key: 'Enter', keyCode: 229 });
      expect(onSend).not.toHaveBeenCalled();
    });

    it('sends on the next Enter once the composition is over', async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      render(<Composer label="Message" onSend={onSend} />);
      await user.type(box(), '한국어');
      fireEvent.keyDown(box(), { key: 'Enter', isComposing: true });
      expect(onSend).not.toHaveBeenCalled();
      await user.keyboard('{Enter}');
      expect(onSend).toHaveBeenCalledWith('한국어');
    });
  });

  describe('Send button and focus', () => {
    it('is disabled while the box is empty and enabled once there is text', async () => {
      const user = userEvent.setup();
      render(<Composer label="Message" onSend={() => {}} />);
      expect(sendButton()).toBeDisabled();
      await user.type(box(), 'x');
      expect(sendButton()).toBeEnabled();
    });

    it('sends when clicked and moves focus to the text box', async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      render(<Composer label="Message" onSend={onSend} />);
      await user.type(box(), 'via button');
      await user.click(sendButton());
      expect(onSend).toHaveBeenCalledWith('via button');
      expect(box()).toHaveFocus();
    });

    it('keeps focus in the text box after Tab to Send and Space', async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      render(<Composer label="Message" onSend={onSend} />);
      await user.type(box(), 'keyboard only');
      await user.tab();
      expect(sendButton()).toHaveFocus();
      await user.keyboard(' ');
      expect(onSend).toHaveBeenCalledWith('keyboard only');
      expect(box()).toHaveFocus();
      expect(document.body).not.toHaveFocus();
    });
  });

  describe('controlled and uncontrolled', () => {
    it('reports every change through onValueChange when uncontrolled', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<Composer label="Message" defaultValue="hi" onValueChange={onValueChange} onSend={() => {}} />);
      expect(box()).toHaveValue('hi');
      await user.type(box(), '!');
      expect(onValueChange).toHaveBeenLastCalledWith('hi!');
    });

    it('tells onValueChange when an uncontrolled send clears the box', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<Composer label="Message" onValueChange={onValueChange} onSend={() => {}} />);
      await user.type(box(), 'x');
      await user.keyboard('{Enter}');
      expect(onValueChange).toHaveBeenLastCalledWith('');
    });

    it('shows the value it is given and leaves clearing to the parent', async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      function Parent() {
        const [value, setValue] = useState('draft');
        return (
          <Composer
            label="Message"
            value={value}
            onValueChange={setValue}
            onSend={(text) => {
              onSend(text);
            }}
          />
        );
      }
      render(<Parent />);
      expect(box()).toHaveValue('draft');
      await user.click(box());
      await user.keyboard('{Enter}');
      expect(onSend).toHaveBeenCalledWith('draft');
      expect(box()).toHaveValue('draft');
      expect(box()).toHaveFocus();
    });
  });

  describe('sending', () => {
    it('disables Send, keeps the text editable, and ignores Enter', async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      render(<Composer label="Message" status="sending" defaultValue="queued" onSend={onSend} />);
      expect(sendButton()).toBeDisabled();
      expect(box()).toBeEnabled();
      await user.click(box());
      await user.keyboard('{Enter}');
      expect(onSend).not.toHaveBeenCalled();
      expect(box()).toHaveValue('queued');
      await user.type(box(), ' more');
      expect(box()).toHaveValue('queued more');
    });
  });

  describe('streaming', () => {
    it('turns Send into a Stop button that calls onStop', async () => {
      const user = userEvent.setup();
      const onStop = vi.fn();
      render(<Composer label="Message" status="streaming" onStop={onStop} onSend={() => {}} />);
      expect(screen.queryByRole('button', { name: 'Send' })).not.toBeInTheDocument();
      const stop = screen.getByRole('button', { name: 'Stop' });
      expect(stop).toBeEnabled();
      await user.click(stop);
      expect(onStop).toHaveBeenCalledTimes(1);
    });

    it('does not send on Enter while streaming', async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      render(<Composer label="Message" status="streaming" defaultValue="next" onStop={() => {}} onSend={onSend} />);
      await user.click(box());
      await user.keyboard('{Enter}');
      expect(onSend).not.toHaveBeenCalled();
    });

    it('keeps one button element across Send, Stop and back, so focus survives the swap', () => {
      const props = { label: 'Message', onSend: () => {}, onStop: () => {}, defaultValue: 'x' };
      const { rerender } = render(<Composer {...props} status="idle" />);
      const before = sendButton();
      rerender(<Composer {...props} status="streaming" />);
      expect(screen.getByRole('button', { name: 'Stop' })).toBe(before);
      rerender(<Composer {...props} status="idle" />);
      expect(sendButton()).toBe(before);
    });

    it('disables Stop when there is no onStop to call', () => {
      render(<Composer label="Message" status="streaming" onSend={() => {}} />);
      expect(screen.getByRole('button', { name: 'Stop' })).toBeDisabled();
    });

    it('keeps focus in the text box after Tab to Stop and Space, even when Stop becomes a disabled Send', async () => {
      const user = userEvent.setup();
      function Parent() {
        const [status, setStatus] = useState<ComposerStatus>('streaming');
        return <Composer label="Message" status={status} onStop={() => setStatus('idle')} onSend={() => {}} />;
      }
      render(<Parent />);
      await user.tab(); // text box
      await user.tab(); // Stop
      expect(screen.getByRole('button', { name: 'Stop' })).toHaveFocus();
      await user.keyboard(' ');
      expect(sendButton()).toBeDisabled();
      expect(box()).toHaveFocus();
      expect(document.body).not.toHaveFocus();
    });
  });

  describe('focus when the button goes disabled by itself', () => {
    const props = { label: 'Message', onSend: () => {}, onStop: () => {} };

    it('moves focus to the text box when a reply finishes while Stop has focus and the draft is empty', () => {
      const { rerender } = render(<Composer {...props} status="streaming" />);
      const stop = screen.getByRole('button', { name: 'Stop' });
      stop.focus();
      expect(stop).toHaveFocus();
      rerender(<Composer {...props} status="idle" />);
      expect(sendButton()).toBeDisabled();
      expect(box()).toHaveFocus();
      expect(document.body).not.toHaveFocus();
    });

    it('moves focus when status goes to sending while Send has focus', () => {
      const { rerender } = render(<Composer {...props} defaultValue="hello" status="idle" />);
      sendButton().focus();
      rerender(<Composer {...props} defaultValue="hello" status="sending" />);
      expect(sendButton()).toBeDisabled();
      expect(box()).toHaveFocus();
    });

    it('leaves focus on the button when it stays enabled (a reply finishes, a draft is waiting)', () => {
      const { rerender } = render(<Composer {...props} defaultValue="next" status="streaming" />);
      const button = screen.getByRole('button', { name: 'Stop' });
      button.focus();
      rerender(<Composer {...props} defaultValue="next" status="idle" />);
      expect(sendButton()).toBeEnabled();
      expect(sendButton()).toHaveFocus();
    });

    it('does not take focus from somewhere else on the page', () => {
      const { rerender } = render(
        <>
          <input aria-label="Elsewhere" />
          <Composer {...props} status="streaming" />
        </>,
      );
      screen.getByLabelText('Elsewhere').focus();
      rerender(
        <>
          <input aria-label="Elsewhere" />
          <Composer {...props} status="idle" />
        </>,
      );
      expect(screen.getByLabelText('Elsewhere')).toHaveFocus();
    });
  });

  describe('activity indicator', () => {
    const noop = () => {};
    const indicator = (container: HTMLElement) => container.querySelector('.nil-composer__activity');

    it.each(['sending', 'streaming'] as const)(
      'shows the kit\'s blinking cursor while %s, hidden from assistive tech',
      (status) => {
        const { container } = render(<Composer label="Message" status={status} onStop={noop} onSend={noop} />);
        const el = indicator(container);
        expect(el).toBeInTheDocument();
        expect(el).toHaveClass('nil-cursor-blink');
        expect(el).toHaveAttribute('aria-hidden', 'true');
      },
    );

    it('is absent while idle', () => {
      const { container } = render(<Composer label="Message" onSend={noop} />);
      expect(indicator(container)).not.toBeInTheDocument();
    });

    it('stays out of what the status region announces', () => {
      render(<Composer label="Message" status="streaming" onStop={noop} onSend={noop} />);
      expect(screen.getByRole('status').textContent).toBe(STREAMING_TEXT);
    });

    it('shows beside the status text even when the hint is hidden', () => {
      const { container } = render(<Composer label="Message" hint={false} status="sending" onSend={noop} />);
      expect(indicator(container)).toBeInTheDocument();
      expect(container.querySelector('.nil-composer__hint')).toHaveTextContent('Sending');
    });
  });

  describe('disabled', () => {
    it('disables the text box and the button, and does nothing on Enter', () => {
      const onSend = vi.fn();
      const { container } = render(<Composer label="Message" disabled defaultValue="x" onSend={onSend} />);
      expect(box()).toBeDisabled();
      expect(sendButton()).toBeDisabled();
      fireEvent.keyDown(box(), { key: 'Enter' });
      expect(onSend).not.toHaveBeenCalled();
      expect(container.querySelector('.nil-composer')).toHaveClass('nil-composer--disabled');
    });
  });

  describe('hint and status', () => {
    it('shows the default hint and links it to the text box', () => {
      render(<Composer label="Message" onSend={() => {}} />);
      const hint = screen.getByText('Enter to send, Shift+Enter for a new line');
      expect(box().getAttribute('aria-describedby')).toBe(hint.id);
    });

    it('hides the hint with hint={false}, and accepts a custom string', () => {
      const { rerender } = render(<Composer label="Message" hint={false} onSend={() => {}} />);
      expect(screen.queryByText('Enter to send, Shift+Enter for a new line')).not.toBeInTheDocument();
      expect(box()).not.toHaveAttribute('aria-describedby');
      rerender(<Composer label="Message" hint="Ctrl+K opens commands" onSend={() => {}} />);
      expect(screen.getByText('Ctrl+K opens commands')).toBeInTheDocument();
    });

    it('keeps a consumer aria-describedby alongside the hint', () => {
      render(<Composer label="Message" aria-describedby="elsewhere" onSend={() => {}} />);
      expect(box().getAttribute('aria-describedby')).toMatch(/ elsewhere$/);
    });

    it('swaps the hint for the status text, and announces it in a status region', () => {
      const { rerender } = render(<Composer label="Message" onSend={() => {}} />);
      expect(screen.getByRole('status')).toHaveTextContent('');
      rerender(<Composer label="Message" status="sending" onSend={() => {}} />);
      expect(screen.getByRole('status')).toHaveTextContent('Sending');
      expect(screen.queryByText('Enter to send, Shift+Enter for a new line')).not.toBeInTheDocument();
      rerender(<Composer label="Message" status="streaming" onStop={() => {}} onSend={() => {}} />);
      expect(screen.getByRole('status').textContent).toBe(STREAMING_TEXT);
      expect(screen.getByText(STREAMING_TEXT, { selector: '.nil-composer__hint' })).toBeInTheDocument();
    });

    it('still announces status when the hint is hidden', () => {
      render(<Composer label="Message" hint={false} status="streaming" onStop={() => {}} onSend={() => {}} />);
      expect(screen.getByRole('status').textContent).toBe(STREAMING_TEXT);
    });
  });

  describe('sizing', () => {
    afterEach(() => {
      vi.unstubAllGlobals();
      delete (HTMLTextAreaElement.prototype as { scrollHeight?: number }).scrollHeight;
    });

    function stubScrollHeight(px: number) {
      Object.defineProperty(HTMLTextAreaElement.prototype, 'scrollHeight', {
        configurable: true,
        get: () => px,
      });
    }

    it('measures the content height where field-sizing is not supported', async () => {
      vi.stubGlobal('CSS', { supports: () => false });
      stubScrollHeight(96);
      const user = userEvent.setup();
      render(<Composer label="Message" onSend={() => {}} />);
      expect(box().style.height).toBe('96px');
      stubScrollHeight(144);
      await user.type(box(), 'x');
      expect(box().style.height).toBe('144px');
    });

    it('leaves the height to CSS where field-sizing is supported', () => {
      vi.stubGlobal('CSS', { supports: (prop: string) => prop === 'field-sizing' });
      stubScrollHeight(96);
      render(<Composer label="Message" onSend={() => {}} />);
      expect(box().style.height).toBe('');
    });

    it('does not collapse a box that cannot be measured', () => {
      vi.stubGlobal('CSS', { supports: () => false });
      stubScrollHeight(0);
      render(<Composer label="Message" onSend={() => {}} />);
      expect(box().style.height).toBe('');
    });
  });

  describe('registration and styles', () => {
    /** Every `--nil-*` token read by a `.nil-composer*` rule, minus Composer's own local variables. */
    function tokensReadByComposerCss(): string[] {
      const css = coreCss.replace(/\/\*[\s\S]*?\*\//g, '');
      const found = new Set<string>();
      for (const [, selector, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
        if (!selector.includes('nil-composer')) continue;
        for (const [, name] of body.matchAll(/var\((--nil-[a-z0-9-]+)/g)) {
          if (!name.startsWith('--nil-composer-')) found.add(name);
        }
      }
      return [...found].sort();
    }

    it('registry.json lists exactly the tokens the Composer styles read', () => {
      const entry = registry.components.find((c) => c.name === 'Composer');
      expect(entry).toBeDefined();
      expect([...entry!.tokens].sort()).toEqual(tokensReadByComposerCss());
    });

    it('read the stylesheet at all', () => {
      // Guards the check above against passing on an empty read.
      expect(coreCss.length).toBeGreaterThan(500);
      expect(tokensReadByComposerCss().length).toBeGreaterThan(5);
    });

    it('uses no literal duration, and any animation takes its duration from a motion token', () => {
      const blocks = coreCss
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .match(/[^{}]*nil-composer[^{}]*\{[^{}]*\}/g);
      expect(blocks?.length).toBeGreaterThan(5);
      for (const block of blocks ?? []) {
        expect(block).not.toMatch(/\d(ms|s)\b/);
        for (const [declaration] of block.matchAll(/animation\s*:[^;]*/g)) {
          expect(declaration).toContain('var(--nil-motion-duration-');
        }
      }
    });

    it('keeps :has() out of the shared focus list, and its outline removal behind @supports', () => {
      const sharedFocus = coreCss.match(/\.nil-btn:focus-visible,[^{]*\{/)?.[0] ?? '';
      expect(sharedFocus.length).toBeGreaterThan(0);
      expect(sharedFocus).not.toContain('nil-composer');

      const supports = coreCss.match(/@supports selector\(:has\(\*\)\)\s*\{[\s\S]*?\n\}/)?.[0] ?? '';
      expect(supports).toContain('.nil-composer__input:focus-visible');
      expect(supports).toMatch(/outline:\s*none/);
      // The outline removal appears nowhere else.
      const outside = coreCss.replace(supports, '');
      expect(outside).not.toMatch(/\.nil-composer__input:focus-visible/);
    });

    it('declares both the lh and the em form of the height limits', () => {
      expect(coreCss).toMatch(/max-height:\s*calc\(var\(--nil-composer-rows\)\s*\*\s*1lh\)/);
      expect(coreCss).toMatch(
        /max-height:\s*calc\(var\(--nil-composer-rows\)\s*\*\s*var\(--nil-composer-leading\)\s*\*\s*1em\)/,
      );
    });
  });

  describe('accessibility', () => {
    it('has no axe violations in any state', async () => {
      const noop = () => {};
      const { container } = render(
        <>
          <Composer label="Idle, empty" onSend={noop} />
          <Composer label="Idle, with text" defaultValue="Which token sets the accent?" onSend={noop} />
          <Composer label="Visible label" showLabel onSend={noop} />
          <Composer label="No hint" hint={false} onSend={noop} />
          <Composer label="Sending" status="sending" defaultValue="queued" onSend={noop} />
          <Composer label="Streaming" status="streaming" onStop={noop} onSend={noop} />
          <Composer label="Disabled" disabled onSend={noop} />
        </>,
      );
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
