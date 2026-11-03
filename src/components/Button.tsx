import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  /** `danger` is for destructive actions: a danger fill with the accent's contrast text. */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
}

/**
 * Terminal `[ ACTION ]` shell, every variant shares the bracket frame.
 *
 * The ref reaches the underlying `<button>`, so a parent can move focus to it
 * (Dialog's `initialFocusRef` is the first user).
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { children, variant = 'secondary', size = 'md', style, disabled, className, ...rest },
  ref,
) {
  return (
    <button
      {...rest}
      ref={ref}
      disabled={disabled}
      className={['nil-btn', `nil-btn--${variant}`, `nil-btn--${size}`, className].filter(Boolean).join(' ')}
      style={style}
    >
      <span aria-hidden className="nil-btn__bracket">
        [
      </span>
      <span className="nil-btn__label">{children}</span>
      <span aria-hidden className="nil-btn__bracket">
        ]
      </span>
    </button>
  );
});
