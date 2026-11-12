import type { HTMLAttributes, ReactNode } from 'react';
import { Icon } from './Icon';

export interface MessageProps extends Omit<HTMLAttributes<HTMLParagraphElement>, 'children'> {
  /** What kind of line this is. Default 'neutral'. */
  tone?: 'neutral' | 'success' | 'danger';
  /** The system is working: the kit's blinking cursor follows the words. */
  busy?: boolean;
  /** The words. Empty, null or undefined renders the empty live region, so a later message is announced. */
  children?: ReactNode;
}

/** Nothing to say: null, undefined, a boolean or an empty string. */
function isEmpty(children: ReactNode): boolean {
  return children === null || children === undefined || typeof children === 'boolean' || children === '';
}

/**
 * The system saying what it is doing, what it has done, or what went wrong, in a line beside a control.
 *
 * It is a live region, so it is always rendered, even with nothing to say: a live region has to be in
 * the page before its text arrives, or the text is not announced. Danger is `role="alert"` and the
 * other tones are `role="status"`; a caller's own `role` wins. Danger shows the error icon and success
 * the check icon, so the state is not carried by colour alone. `busy` follows the words with the
 * kit's blinking cursor, which holds still under reduced motion.
 *
 * Styling lives in `.nil-message*` (core.css).
 */
export function Message({ tone = 'neutral', busy = false, children, className, role, ...rest }: MessageProps) {
  const words = !isEmpty(children);
  const icon = tone === 'danger' ? 'error' : tone === 'success' ? 'check' : null;

  return (
    <p
      {...rest}
      role={role ?? (tone === 'danger' ? 'alert' : 'status')}
      className={['nil-message', `nil-message--${tone}`, className].filter(Boolean).join(' ')}
    >
      {words ? (
        <>
          {icon ? <Icon name={icon} size="sm" className="nil-message__icon" /> : null}
          <span className="nil-message__text">
            {children}
            {busy ? (
              <span className="nil-cursor-blink nil-message__cursor" aria-hidden="true">
                ▌
              </span>
            ) : null}
          </span>
        </>
      ) : null}
    </p>
  );
}
