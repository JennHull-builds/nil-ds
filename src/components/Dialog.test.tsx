import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Button } from './Button';
import { Dialog, type DialogProps } from './Dialog';

/**
 * jsdom has no <dialog> behaviour of its own: src/test/setup.ts fakes showModal() and close()
 * (the open attribute and the close event) and nothing else. So these tests prove this
 * component's wiring: names, focus moves in code, handlers, scroll lock. They cannot prove that
 * the page behind goes inert, that Tab stays inside, or that Escape produces a cancel event.
 * Those are proved in a real browser, and the walk is recorded in the PR report.
 */

type HarnessProps = Partial<Omit<DialogProps, 'open'>> & { startOpen?: boolean; children?: ReactNode };

/** An opener button and a Dialog, so focus has somewhere to come back to. */
function Harness({ startOpen = false, onClose, children, ...rest }: HarnessProps) {
  const [open, setOpen] = useState(startOpen);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open dialog
      </button>
      <Dialog
        title="Delete project"
        description="This removes the project and every token in it."
        {...rest}
        open={open}
        onClose={() => {
          onClose?.();
          setOpen(false);
        }}
      >
        {children ?? <input aria-label="Project name" />}
      </Dialog>
    </>
  );
}

/** Escape in a browser arrives as a cancelable `cancel` event on the dialog. Returns false if it was prevented. */
const pressEscape = (dialog: HTMLElement) =>
  fireEvent(dialog, new Event('cancel', { bubbles: false, cancelable: true }));

const dialogEl = () => screen.getByRole('dialog');

describe('Dialog', () => {
  describe('rendering and names', () => {
    it('renders nothing while closed', () => {
      const { container } = render(<Dialog open={false} onClose={() => {}} title="Closed" />);
      expect(container).toBeEmptyDOMElement();
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('is a dialog named by its title', () => {
      render(<Dialog open onClose={() => {}} title="Delete project" />);
      expect(screen.getByRole('dialog', { name: 'Delete project' })).toBeInTheDocument();
    });

    it('renders the title as a level-2 heading', () => {
      render(<Dialog open onClose={() => {}} title="Delete project" />);
      expect(screen.getByRole('heading', { level: 2, name: 'Delete project' })).toBeInTheDocument();
    });

    it('describes the dialog with its description', () => {
      render(<Dialog open onClose={() => {}} title="Delete project" description="It cannot be undone." />);
      expect(dialogEl()).toHaveAccessibleDescription('It cannot be undone.');
    });

    it('has no description wiring when there is no description', () => {
      render(<Dialog open onClose={() => {}} title="Delete project" />);
      expect(dialogEl()).not.toHaveAttribute('aria-describedby');
    });

    it('renders the body and the actions, and no footer when there are no actions', () => {
      const { rerender, container } = render(
        <Dialog open onClose={() => {}} title="T" actions={<button type="button">Go</button>}>
          <p>Body text</p>
        </Dialog>,
      );
      expect(screen.getByText('Body text')).toBeInTheDocument();
      expect(container.querySelector('.nil-dialog__actions')).toContainElement(
        screen.getByRole('button', { name: 'Go' }),
      );
      rerender(
        <Dialog open onClose={() => {}} title="T">
          <p>Body text</p>
        </Dialog>,
      );
      expect(container.querySelector('.nil-dialog__actions')).toBeNull();
    });

    it('marks the danger variant, and the default one is unmarked', () => {
      const { rerender } = render(<Dialog open onClose={() => {}} title="T" variant="danger" />);
      expect(dialogEl()).toHaveClass('nil-dialog', 'nil-dialog--danger');
      rerender(<Dialog open onClose={() => {}} title="T" />);
      expect(dialogEl()).not.toHaveClass('nil-dialog--danger');
    });

    it('names its Close control "Close", without the [Esc] hint', () => {
      render(<Dialog open onClose={() => {}} title="T" />);
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    });
  });

  describe('focus moves in', () => {
    it('goes to the first control in the body, never the Close control', () => {
      render(<Harness startOpen />);
      expect(screen.getByRole('textbox', { name: 'Project name' })).toHaveFocus();
      expect(screen.getByRole('button', { name: 'Close' })).not.toHaveFocus();
    });

    it('goes to the first control in the actions when the body has none', () => {
      render(
        <Dialog
          open
          onClose={() => {}}
          title="T"
          actions={
            <>
              <button type="button">First</button>
              <button type="button">Second</button>
            </>
          }
        />,
      );
      expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();
    });

    it('goes to the Close control only when nothing else can take it', () => {
      render(<Dialog open onClose={() => {}} title="Heads up" description="Nothing to press." />);
      expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
    });

    it('goes to initialFocusRef when one is given, ahead of the first control', () => {
      function WithRef() {
        const cancel = useRef<HTMLButtonElement>(null);
        return (
          <Dialog
            open
            onClose={() => {}}
            title="Delete project"
            variant="danger"
            initialFocusRef={cancel}
            actions={
              <>
                <Button variant="danger">Delete</Button>
                <Button ref={cancel}>Cancel</Button>
              </>
            }
          />
        );
      }
      render(<WithRef />);
      // Delete is first in the DOM, so only the ref can put focus on Cancel.
      expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    });

    it('still honours initialFocusRef when that control is aria-disabled', () => {
      function WithBusyRef() {
        const cancel = useRef<HTMLButtonElement>(null);
        return (
          <Dialog
            open
            onClose={() => {}}
            title="T"
            initialFocusRef={cancel}
            actions={<Button ref={cancel} aria-disabled="true">Cancel</Button>}
          />
        );
      }
      render(<WithBusyRef />);
      expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    });
  });

  describe('Tab stays inside', () => {
    // The page behind going inert is the browser's job (proved in Playwright). Wrapping the ends of
    // the Tab order is this component's job, because Chromium otherwise gives its own UI a stop there.
    const withThree = (
      <Dialog
        open
        onClose={() => {}}
        title="T"
        actions={
          <>
            <button type="button">First</button>
            <button type="button">Second</button>
            <button type="button">Last</button>
          </>
        }
      />
    );

    it('wraps Tab from the last control to the first', () => {
      render(withThree);
      const close = screen.getByRole('button', { name: 'Close' });
      screen.getByRole('button', { name: 'Last' }).focus();
      const notPrevented = fireEvent.keyDown(screen.getByRole('button', { name: 'Last' }), { key: 'Tab' });
      expect(notPrevented).toBe(false);
      expect(close).toHaveFocus(); // Close is first in DOM order, so Tab order matches the visual order
    });

    it('wraps Shift+Tab from the first control to the last', () => {
      render(withThree);
      const close = screen.getByRole('button', { name: 'Close' });
      close.focus();
      const notPrevented = fireEvent.keyDown(close, { key: 'Tab', shiftKey: true });
      expect(notPrevented).toBe(false);
      expect(screen.getByRole('button', { name: 'Last' })).toHaveFocus();
    });

    it('leaves Tab alone in the middle, so the browser moves focus as usual', () => {
      render(withThree);
      const second = screen.getByRole('button', { name: 'Second' });
      second.focus();
      expect(fireEvent.keyDown(second, { key: 'Tab' })).toBe(true); // not prevented
      expect(fireEvent.keyDown(second, { key: 'Tab', shiftKey: true })).toBe(true);
    });

    it('takes no part in other keys', () => {
      render(withThree);
      const last = screen.getByRole('button', { name: 'Last' });
      last.focus();
      expect(fireEvent.keyDown(last, { key: 'ArrowDown' })).toBe(true);
      expect(last).toHaveFocus();
    });
  });

  describe('closing', () => {
    it('treats Escape as a cancel event: it stops the browser closing the element and calls onClose', () => {
      const onClose = vi.fn();
      render(<Dialog open onClose={onClose} title="T" />);
      const notPrevented = pressEscape(dialogEl());
      expect(notPrevented).toBe(false); // defaultPrevented: `open` is controlled, the parent decides
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(dialogEl()).toHaveAttribute('open'); // still open until the parent says otherwise
    });

    it('calls onClose from the Close control', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<Dialog open onClose={onClose} title="T" />);
      await user.click(screen.getByRole('button', { name: 'Close' }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('leaves the backdrop alone by default', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<Dialog open onClose={onClose} title="T" />);
      await user.click(dialogEl()); // a click whose target is the dialog element itself is the scrim
      expect(onClose).not.toHaveBeenCalled();
    });

    it('closes on a backdrop click when dismissOnBackdrop is set', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<Dialog open onClose={onClose} title="T" dismissOnBackdrop />);
      await user.click(dialogEl());
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not close on a click inside the panel, even with dismissOnBackdrop', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(
        <Dialog open onClose={onClose} title="T" dismissOnBackdrop>
          <p>Inside</p>
        </Dialog>,
      );
      await user.click(screen.getByText('Inside'));
      expect(onClose).not.toHaveBeenCalled();
    });

    it('does not close when a press starts inside the panel and ends on the scrim', () => {
      // Selecting text and letting go outside the panel lands the click on the dialog element.
      const onClose = vi.fn();
      render(
        <Dialog open onClose={onClose} title="T" dismissOnBackdrop>
          <p>Inside</p>
        </Dialog>,
      );
      fireEvent.mouseDown(screen.getByText('Inside'));
      fireEvent.click(dialogEl());
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('focus comes back', () => {
    it('returns to the element that opened it when closed with the Close control', async () => {
      const user = userEvent.setup();
      render(<Harness />);
      const opener = screen.getByRole('button', { name: 'Open dialog' });
      await user.click(opener);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(opener).not.toHaveFocus();
      await user.click(screen.getByRole('button', { name: 'Close' }));
      expect(screen.queryByRole('dialog')).toBeNull();
      expect(opener).toHaveFocus();
    });

    it('returns to the opener when closed with Escape', async () => {
      const user = userEvent.setup();
      render(<Harness />);
      const opener = screen.getByRole('button', { name: 'Open dialog' });
      await user.click(opener);
      act(() => {
        pressEscape(dialogEl());
      });
      expect(screen.queryByRole('dialog')).toBeNull();
      expect(opener).toHaveFocus();
    });

    it('returns to the opener when the parent closes it from outside, with no click on the dialog', () => {
      const tree = (open: boolean) => (
        <>
          <button type="button">Open dialog</button>
          <Dialog open={open} onClose={() => {}} title="T" />
        </>
      );
      const { rerender } = render(tree(false));
      const opener = screen.getByRole('button', { name: 'Open dialog' });
      opener.focus();
      rerender(tree(true));
      expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus(); // moved in
      rerender(tree(false));
      expect(opener).toHaveFocus();
    });

    it('does not throw if the opener has left the page by the time it closes', () => {
      const tree = (openerShown: boolean, open: boolean) => (
        <>
          {openerShown ? <button type="button">Open dialog</button> : null}
          <Dialog open={open} onClose={() => {}} title="T" />
        </>
      );
      const { rerender } = render(tree(true, false));
      screen.getByRole('button', { name: 'Open dialog' }).focus();
      rerender(tree(true, true));
      // The page removes the opener and the dialog in one go: nowhere to return focus to.
      expect(() => rerender(tree(false, false))).not.toThrow();
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  describe('scroll lock', () => {
    it('locks body scroll while open and restores the previous value on close', () => {
      document.body.style.overflow = 'auto';
      const { rerender } = render(<Dialog open onClose={() => {}} title="T" />);
      expect(document.body.style.overflow).toBe('hidden');
      rerender(<Dialog open={false} onClose={() => {}} title="T" />);
      expect(document.body.style.overflow).toBe('auto');
    });

    it('restores it if the dialog is unmounted while open', () => {
      document.body.style.overflow = 'scroll';
      const { unmount } = render(<Dialog open onClose={() => {}} title="T" />);
      expect(document.body.style.overflow).toBe('hidden');
      unmount();
      expect(document.body.style.overflow).toBe('scroll');
    });
  });

  describe('busy', () => {
    // A delete in progress cannot be backed out of. The dialog says so (aria-busy, a dimmed Close)
    // and ignores every way of closing, without calling onClose and without moving focus.
    const busyDialog = (props: Partial<DialogProps> = {}) => (
      <Dialog
        open
        busy
        onClose={props.onClose ?? (() => {})}
        title="Delete project"
        actions={<button type="button">Delete</button>}
        {...props}
      />
    );

    it('marks the dialog aria-busy only while busy', () => {
      const { rerender } = render(busyDialog());
      expect(dialogEl()).toHaveAttribute('aria-busy', 'true');
      rerender(busyDialog({ busy: false }));
      expect(dialogEl()).not.toHaveAttribute('aria-busy');
    });

    it('marks Close aria-disabled, not disabled, while busy, so it keeps its place in the Tab order', () => {
      render(busyDialog());
      const close = screen.getByRole('button', { name: 'Close' });
      expect(close).toHaveAttribute('aria-disabled', 'true');
      expect(close).not.toBeDisabled();
      close.focus();
      expect(close).toHaveFocus();
    });

    it('leaves Close alone when not busy', () => {
      render(<Dialog open onClose={() => {}} title="T" />);
      expect(screen.getByRole('button', { name: 'Close' })).not.toHaveAttribute('aria-disabled');
    });

    it('ignores Escape while busy: the browser is still stopped, and onClose is not called', () => {
      const onClose = vi.fn();
      render(busyDialog({ onClose }));
      const notPrevented = pressEscape(dialogEl());
      expect(notPrevented).toBe(false); // still prevented, so the element is not closed behind our back
      expect(onClose).not.toHaveBeenCalled();
      expect(dialogEl()).toHaveAttribute('open');
    });

    it('ignores a click on Close while busy', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(busyDialog({ onClose }));
      await user.click(screen.getByRole('button', { name: 'Close' }));
      expect(onClose).not.toHaveBeenCalled();
    });

    it('ignores a backdrop click while busy, even with dismissOnBackdrop', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(busyDialog({ onClose, dismissOnBackdrop: true }));
      await user.click(dialogEl());
      expect(onClose).not.toHaveBeenCalled();
    });

    it('keeps focus where it is when busy starts, and the dialog stays open', () => {
      const tree = (busy: boolean) => (
        <Dialog open busy={busy} onClose={() => {}} title="T" actions={<button type="button">Delete</button>} />
      );
      const { rerender } = render(tree(false));
      const del = screen.getByRole('button', { name: 'Delete' });
      expect(del).toHaveFocus();
      rerender(tree(true));
      expect(del).toHaveFocus();
      expect(dialogEl()).toBeInTheDocument();
    });

    it('closes normally again once it is no longer busy', () => {
      const onClose = vi.fn();
      const tree = (busy: boolean) => <Dialog open busy={busy} onClose={onClose} title="T" />;
      const { rerender } = render(tree(true));
      pressEscape(dialogEl());
      expect(onClose).not.toHaveBeenCalled();
      rerender(tree(false));
      pressEscape(dialogEl());
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('a confirmation that is busy keeps focus', () => {
    // The pattern the showroom's Delete example uses. A focused button that becomes natively
    // disabled sends focus to the page, so the buttons are aria-disabled and their clicks ignored.
    function DeleteHarness() {
      const [open, setOpen] = useState(false);
      const [busy, setBusy] = useState(false);
      const cancel = useRef<HTMLButtonElement>(null);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Open delete
          </button>
          <Dialog
            open={open}
            onClose={() => setOpen(false)}
            busy={busy}
            title="Delete project"
            variant="danger"
            initialFocusRef={cancel}
            actions={
              <>
                <Button
                  ref={cancel}
                  aria-disabled={busy || undefined}
                  onClick={() => {
                    if (!busy) setOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  aria-busy={busy || undefined}
                  onClick={() => {
                    if (busy) return;
                    setBusy(true);
                    window.setTimeout(() => {
                      setBusy(false);
                      setOpen(false);
                    }, 1000);
                  }}
                >
                  {busy ? 'Deleting' : 'Delete'}
                </Button>
              </>
            }
          />
        </>
      );
    }

    beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
    afterEach(() => vi.useRealTimers());

    it('keeps focus on Delete while it runs, ignores Escape and Cancel, then returns focus to the trigger', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<DeleteHarness />);
      const trigger = screen.getByRole('button', { name: 'Open delete' });
      await user.click(trigger);

      // Opens on the safe choice.
      expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
      await user.tab();
      const del = screen.getByRole('button', { name: 'Delete' });
      expect(del).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(screen.getByRole('button', { name: 'Deleting' })).toHaveFocus(); // the same button, still focused
      expect(del).toHaveAttribute('aria-busy', 'true'); // the working button keeps its look
      expect(del).not.toHaveAttribute('aria-disabled');
      expect(del).not.toBeDisabled();

      act(() => {
        pressEscape(screen.getByRole('dialog'));
      });
      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(screen.getByRole('dialog')).toBeInTheDocument(); // neither got out of a delete in progress

      await act(async () => {
        vi.advanceTimersByTime(1100);
      });
      expect(screen.queryByRole('dialog')).toBeNull();
      expect(trigger).toHaveFocus();
    });
  });

  describe('Close while busy (core.css)', () => {
    const css = readFileSync(join(__dirname, '..', '..', 'src/core/core.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

    it('read the stylesheet at all', () => {
      expect(css.length).toBeGreaterThan(500);
    });

    it('dims Close and shows it unavailable when aria-disabled', () => {
      const rule = css.match(/\.nil-dialog__close\[aria-disabled='true'\]\s*\{([^}]*)\}/);
      expect(rule).not.toBeNull();
      expect(rule![1]).toMatch(/opacity:\s*0\.55/);
      expect(rule![1]).toMatch(/cursor:\s*not-allowed/);
    });

    it('lights Close up on hover only when it is available', () => {
      expect(css).toMatch(/\.nil-dialog__close:not\(\[aria-disabled='true'\]\):hover\s*\{/);
      expect(css).not.toMatch(/\.nil-dialog__close:hover\s*\{/);
    });
  });

  describe('accessibility', () => {
    /**
     * GOTCHA: in jsdom, axe cannot see inside a native <dialog>. Every rule comes back "incomplete"
     * (a nameless button inside <dialog open> is not a violation; the same button in a <div> is),
     * and `toHaveNoViolations` only fails on violations. So axe(container) on the real component
     * would pass whatever the markup. Probed 2026-11-03 against axe-core 4.13.
     *
     * So this runs axe on the same rendered markup with the dialog element swapped for
     * <div role="dialog">, where axe does evaluate, including aria-dialog-name. The role and the
     * attributes carry over; what is lost is only the native element.
     */
    const OPEN_DIALOG = (
      <Dialog
        open
        onClose={() => {}}
        title="Delete project"
        description="This removes the project and every token in it."
        variant="danger"
        actions={
          <>
            <Button>Cancel</Button>
            <Button variant="danger">Delete project</Button>
          </>
        }
      >
        <label>
          Project name <input />
        </label>
      </Dialog>
    );

    /** Render, take the markup, then unmount so ids are unique, and return axe's results on the swapped markup. */
    async function axeOnSwappedMarkup(transform: (html: string) => string = (h) => h) {
      const { container, unmount } = render(OPEN_DIALOG);
      const html = container.innerHTML.replace(/<dialog\b/, '<div role="dialog"').replace('</dialog>', '</div>');
      unmount();
      const host = document.createElement('div');
      host.innerHTML = transform(html);
      document.body.appendChild(host);
      try {
        return await axe(host);
      } finally {
        host.remove();
      }
    }

    it('has no axe violations open, with a description, body and actions', async () => {
      expect(await axeOnSwappedMarkup()).toHaveNoViolations();
    });

    it('guards the check above: the same axe run does fail when the dialog has no name', async () => {
      // If this ever passes with the name removed, the axe test above has gone vacuous.
      const results = await axeOnSwappedMarkup((html) => html.replace(/ aria-labelledby="[^"]*"/, ''));
      expect(results.violations.map((v) => v.id)).toContain('aria-dialog-name');
    });

    it('guards the check above: it also fails on a nameless button inside the dialog', async () => {
      const results = await axeOnSwappedMarkup((html) => html.replace('>Close <span aria-hidden="true">[Esc]</span><', '><'));
      expect(results.violations.map((v) => v.id)).toContain('button-name');
    });
  });
});
