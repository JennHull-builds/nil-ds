import { useEffect, useId, useRef } from 'react';
import type { ReactNode, RefObject } from 'react';
import { Button } from './Button';
import { Text } from './Text';

export interface DialogProps {
  /** Controlled. The dialog renders nothing while this is false, so a form inside it resets on each open. */
  open: boolean;
  /**
   * Called for Escape, the Close control and, when `dismissOnBackdrop` is set, a click on the scrim.
   * Never called while `busy`.
   */
  onClose: () => void;
  /** Rendered as the heading, and the dialog's accessible name. */
  title: string;
  /** Announced after the title when the dialog opens. */
  description?: string;
  /** The body, under the description. */
  children?: ReactNode;
  /** The footer row, right-aligned. Put the safest action first. */
  actions?: ReactNode;
  /** `danger` adds a danger top rule. The text stays in the normal colour. */
  variant?: 'default' | 'danger';
  /**
   * Close on a click outside the panel. Off by default for both variants: a destructive
   * confirmation should be answered with an explicit choice, and a stray click would throw
   * away what someone typed into a form. Escape and Close work unless the dialog is `busy`.
   */
  dismissOnBackdrop?: boolean;
  /**
   * Something is running that must finish before the dialog can close, such as a delete in
   * progress. The dialog sets aria-busy, Close becomes aria-disabled and looks unavailable, and
   * Escape, Close and a backdrop click are ignored, so `onClose` is not called. Focus stays where
   * it is. Mark the caller's own buttons aria-disabled too, never `disabled`: a focused button
   * that turns natively disabled sends focus to the page.
   */
  busy?: boolean;
  /**
   * Where focus goes on open. Without it, focus goes to the first focusable thing in the body or
   * the actions, never the Close control, and to Close only if there is nothing else.
   * For a destructive confirmation, point it at Cancel: the safe choice should be the one that
   * Enter or Space would press.
   */
  initialFocusRef?: RefObject<HTMLElement>;
}

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/** The element that should take focus when the dialog opens. */
function initialFocusTarget(
  dialog: HTMLDialogElement,
  header: HTMLElement | null,
  close: HTMLElement | null,
  explicit: HTMLElement | null,
): HTMLElement {
  if (explicit && explicit.isConnected) return explicit;
  const inContent = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).find(
    (el) => !header?.contains(el),
  );
  return inContent ?? close ?? dialog;
}

/**
 * The kit's base modal: one decision or a short form, on the native <dialog>.
 *
 * `showModal()` makes the page behind it inert and keeps Tab inside. Focus is moved in code,
 * never left to the browser: on open it goes to `initialFocusRef` or the first control in the
 * content, and on close it goes back to whatever had focus when the dialog opened. Scroll on
 * the page is locked while it is open, the way Lightbox does it.
 *
 * Styling is in core.css under `.nil-dialog*`. The dialog element is the scrim and the panel
 * inside it is the visible box, so a click whose target is the dialog element is a backdrop click.
 *
 * Leave `<form method="dialog">` out of the content: it closes the element behind this
 * component's back. Handle the form's onSubmit and call `onClose` instead.
 */
export function Dialog(props: DialogProps) {
  return props.open ? <OpenDialog {...props} /> : null;
}

function OpenDialog({
  onClose,
  title,
  description,
  children,
  actions,
  variant = 'default',
  dismissOnBackdrop = false,
  busy = false,
  initialFocusRef,
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const pressStartedOnScrim = useRef(false);
  const titleId = useId();
  const descriptionId = useId();

  // Mounting this component is opening the dialog, and unmounting it is closing it.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    // What had focus when the dialog opened. A button click does not focus the button in Safari
    // or in Firefox on macOS, so there may be nothing to return to there.
    const active = document.activeElement;
    const opener = active instanceof HTMLElement && active !== document.body ? active : null;
    const previousOverflow = document.body.style.overflow;

    if (!dialog.open) dialog.showModal();
    document.body.style.overflow = 'hidden';
    initialFocusTarget(dialog, headerRef.current, closeRef.current, initialFocusRef?.current ?? null).focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      if (dialog.open) dialog.close();
      // Returned in code. The browser would do it for a dialog it closed itself, not for one removed from the page.
      if (opener && opener.isConnected) opener.focus();
    };
    // Read once, at open. Later changes to the ref object do not move focus.
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className={['nil-dialog', variant === 'danger' ? 'nil-dialog--danger' : ''].filter(Boolean).join(' ')}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      aria-busy={busy || undefined}
      tabIndex={-1}
      // Escape arrives as a cancel event. Stop the browser closing the element itself: `open` is
      // controlled, so the parent decides, and closing happens when this component unmounts.
      // While busy the answer is no, and the parent is not asked.
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
      // showModal() makes the page behind inert, but Chromium still gives the browser's own UI a Tab
      // stop at each end, so focus left the controls for one press (measured 2026-11-03). Wrap it here.
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return;
        const dialog = event.currentTarget;
        const items = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (items.length === 0) {
          event.preventDefault();
          dialog.focus();
          return;
        }
        const first = items[0];
        const last = items[items.length - 1];
        const active = document.activeElement;
        if (event.shiftKey && (active === first || active === dialog)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        }
      }}
      // A press that starts inside the panel and ends on the scrim (selecting text, say) is not a backdrop click.
      onMouseDown={(event) => {
        pressStartedOnScrim.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        if (!busy && dismissOnBackdrop && event.target === event.currentTarget && pressStartedOnScrim.current) onClose();
      }}
    >
      <div className="nil-dialog__panel">
        <div className="nil-dialog__header" ref={headerRef}>
          <h2 id={titleId} className="nil-dialog__title">
            {title}
          </h2>
          {/* aria-disabled, not disabled, so Close keeps focus and the Tab order while busy. */}
          <Button
            type="button"
            ref={closeRef}
            size="sm"
            icon="close"
            aria-label="Close"
            className="nil-dialog__close"
            aria-disabled={busy || undefined}
            onClick={() => {
              if (!busy) onClose();
            }}
          />
        </div>
        {description || children ? (
          <div className="nil-dialog__body">
            {description ? (
              <Text id={descriptionId} muted>
                {description}
              </Text>
            ) : null}
            {children}
          </div>
        ) : null}
        {actions ? <div className="nil-dialog__actions">{actions}</div> : null}
      </div>
    </dialog>
  );
}
