import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md';
}

/** Terminal `[ ACTION ]` shell — every variant shares the bracket frame. */
export function Button({ children, variant = 'secondary', size = 'md', style, disabled, className, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
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
}
