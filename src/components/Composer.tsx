import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import type { CSSProperties, KeyboardEvent, ReactNode, TextareaHTMLAttributes } from 'react';
import { Button } from './Button';

export type ComposerStatus = 'idle' | 'sending' | 'streaming';

export interface ComposerProps
  extends Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    'value' | 'defaultValue' | 'onChange' | 'prefix' | 'rows' | 'className' | 'style'
  > {
  /** Accessible name of the text box. Visually hidden unless `showLabel` is set. */
  label: string;
  showLabel?: boolean;
  /** Called with the trimmed text. */
  onSend: (text: string) => void;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** `sending` disables Send. `streaming` turns Send into Stop. Enter sends only when idle. */
  status?: ComposerStatus;
  onStop?: () => void;
  /** Lines the box grows to before it scrolls. */
  maxRows?: number;
  prefix?: string;
  /** Text under the box. `false` hides it, a string replaces the default. */
  hint?: string | false;
  /** The Send button's label, and its accessible name. Stop stays "Stop". */
  sendLabel?: string;
  /**
   * Shown in the button slot instead of Send while the box has no characters and status is idle.
   * A swap, not a stack: only one of the two is ever in the footer. The first character swaps it for
   * Send, and clearing the draft swaps it back. Whitespace counts as a character, so a whitespace-only
   * draft shows a disabled Send. Streaming always shows Stop. A focus that was in the footer moves to
   * the text box when its button leaves.
   */
  emptyAction?: ReactNode;
  /** Classes and style go to the bordered shell. Everything else goes to the textarea. */
  className?: string;
  style?: CSSProperties;
}

const DEFAULT_HINT = 'Enter to send, Shift+Enter for a new line';

const STATUS_TEXT: Record<Exclude<ComposerStatus, 'idle'>, string> = {
  sending: 'Sending',
  streaming: 'Reply streaming. Press Stop to send a new message.',
};

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/** `field-sizing: content` lets CSS grow the box. Where it is missing, we measure instead. */
function supportsFieldSizing(): boolean {
  return (
    typeof CSS !== 'undefined' &&
    typeof CSS.supports === 'function' &&
    CSS.supports('field-sizing', 'content')
  );
}

/**
 * Chat and command input, the input twin of Prompt.
 *
 * One textarea in a bordered shell, a hint line and a Send button that becomes Stop
 * while a reply streams. Enter sends, Shift+Enter breaks the line, and the Enter that
 * confirms an IME composition (Japanese, Chinese, Korean) never sends.
 *
 * Styling lives in core.css under `.nil-composer*`. Sizing is CSS-first: the box grows
 * with `field-sizing: content` and stops at `maxRows` lines. A measured fallback covers
 * engines without `field-sizing`.
 */
export const Composer = forwardRef<HTMLTextAreaElement, ComposerProps>(function Composer(
  {
    label,
    showLabel = false,
    onSend,
    value,
    defaultValue,
    onValueChange,
    status = 'idle',
    onStop,
    maxRows = 6,
    prefix = '>',
    hint,
    sendLabel = 'Send',
    emptyAction,
    disabled = false,
    id,
    className,
    style,
    onKeyDown,
    'aria-describedby': describedByProp,
    ...rest
  },
  forwardedRef,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = `${inputId}-hint`;

  const isControlled = value !== undefined;
  const [innerValue, setInnerValue] = useState(defaultValue ?? '');
  const text = isControlled ? value : innerValue;
  const trimmed = text.trim();

  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const setRefs = useCallback(
    (node: HTMLTextAreaElement | null) => {
      inputRef.current = node;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef],
  );

  const isStreaming = status === 'streaming';
  const canSend = !disabled && status === 'idle' && trimmed.length > 0;
  const rows = Math.max(1, Math.floor(maxRows));
  const buttonDisabled = disabled || (isStreaming ? !onStop : !canSend);
  const footerRef = useRef<HTMLDivElement | null>(null);
  const showEmptyAction = emptyAction != null && status === 'idle' && text.length === 0;

  // Whether focus was in the footer before this render commits. Read here, while the DOM is still the
  // old one: once a swap removes the focused button, focus has already fallen to the page.
  const footerHeldFocus = useRef(false);
  footerHeldFocus.current =
    typeof document !== 'undefined' && !!footerRef.current?.contains(document.activeElement);

  function send() {
    if (!canSend) return;
    onSend(trimmed);
    if (!isControlled) {
      setInnerValue('');
      onValueChange?.('');
    }
    // Focus moves before the button can be disabled by the clear, so it never falls to the page.
    inputRef.current?.focus();
  }

  function stop() {
    onStop?.();
    // Stop can turn into a disabled Send (empty draft). Park focus in the text box first.
    inputRef.current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key !== 'Enter' || event.shiftKey) return;
    // Enter that confirms an IME composition must never send. keyCode 229 covers Safari,
    // which fires the keydown after compositionend with isComposing already false.
    if (event.nativeEvent.isComposing || event.keyCode === 229) return;
    event.preventDefault();
    send();
  }

  // Measured fallback for engines without `field-sizing: content`.
  useIsomorphicLayoutEffect(() => {
    const el = inputRef.current;
    if (!el || supportsFieldSizing()) return;

    const fit = () => {
      el.style.height = 'auto';
      // A hidden or unrendered box measures 0. Leave the height alone rather than collapse it.
      el.style.height = el.scrollHeight > 0 ? `${el.scrollHeight}px` : '';
    };
    fit();

    if (typeof ResizeObserver === 'undefined') return;
    let lastWidth = el.clientWidth;
    const observer = new ResizeObserver(() => {
      if (el.clientWidth === lastWidth) return;
      lastWidth = el.clientWidth;
      fit();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [text]);

  // A focused button that becomes disabled sends focus to the page body, and the next Tab starts
  // from the top. Send and Stop move focus themselves when pressed; this covers every other way
  // the button can go disabled (a reply finishing while Stop has focus, a draft being cleared).
  // Button has no ref yet, so look at where focus is rather than at the button.
  useIsomorphicLayoutEffect(() => {
    if (!buttonDisabled || disabled) return;
    const footer = footerRef.current;
    if (footer && footer.contains(document.activeElement)) inputRef.current?.focus();
  }, [buttonDisabled, disabled]);

  // A swap removes a button. If focus was on it, park focus in the text box, so it never falls to the page.
  useIsomorphicLayoutEffect(() => {
    if (footerHeldFocus.current && !footerRef.current?.contains(document.activeElement)) {
      inputRef.current?.focus();
    }
  }, [showEmptyAction]);

  const showStatus = status !== 'idle';
  const statusText = status !== 'idle' ? STATUS_TEXT[status] : '';
  const hintText = hint === false ? null : (hint ?? DEFAULT_HINT);
  const hasSlot = showStatus || hintText !== null;
  const describedBy =
    [hintText !== null && !showStatus ? hintId : undefined, describedByProp]
      .filter(Boolean)
      .join(' ') || undefined;

  const shellStyle = { '--nil-composer-rows': rows, ...style } as CSSProperties;

  return (
    <div className="nil-composer-group">
      <label htmlFor={inputId} className={showLabel ? 'nil-label' : 'nil-sr-only'}>
        {label}
      </label>
      <div
        className={['nil-composer', disabled ? 'nil-composer--disabled' : '', className]
          .filter(Boolean)
          .join(' ')}
        style={shellStyle}
        data-status={status}
      >
        <div className="nil-composer__row">
          <span className="nil-composer__prefix" aria-hidden>
            {prefix}
          </span>
          <textarea
            {...rest}
            ref={setRefs}
            id={inputId}
            rows={1}
            disabled={disabled}
            value={text}
            onChange={(event) => {
              if (!isControlled) setInnerValue(event.target.value);
              onValueChange?.(event.target.value);
            }}
            onKeyDown={handleKeyDown}
            aria-describedby={describedBy}
            className="nil-composer__input"
          />
        </div>
        <div className="nil-composer__footer" ref={footerRef}>
          {hasSlot ? (
            <span
              id={hintId}
              className="nil-composer__hint"
              aria-hidden={showStatus ? true : undefined}
            >
              {showStatus ? statusText : hintText}
              {showStatus ? (
                // The kit's own blinking cursor, as in Prompt. Decoration: the status region announces the state.
                <span className="nil-cursor-blink nil-composer__activity" aria-hidden>
                  ▌
                </span>
              ) : null}
            </span>
          ) : null}
          {showEmptyAction ? (
            <span className="nil-composer__empty-action">{emptyAction}</span>
          ) : (
            // One button element for Send and Stop, so keyboard focus survives that swap.
            <Button
              type="button"
              variant={isStreaming ? 'secondary' : 'primary'}
              size="sm"
              icon={isStreaming ? 'stop' : 'arrow-up'}
              disabled={buttonDisabled}
              onClick={isStreaming ? stop : send}
            >
              {isStreaming ? 'Stop' : sendLabel}
            </Button>
          )}
        </div>
      </div>
      {/* Always mounted: a live region has to exist before its text changes to be announced. */}
      <span role="status" className="nil-sr-only">
        {statusText}
      </span>
    </div>
  );
});
