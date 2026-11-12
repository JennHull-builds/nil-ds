import type { InputHTMLAttributes, ReactNode } from 'react';
import { useId } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  /** A small control drawn inside the field at its end, such as an icon Button that shows or hides the value. */
  trailing?: ReactNode;
}

/**
 * New for this kit — Mothership's foundations didn't need a form input, but a
 * general-purpose primitive layer does. Follows the same token-only styling
 * rule as the extracted components.
 *
 * Shell/label/input/error styling lives in core.css (`.nil-input-group`,
 * `.nil-input-label`, `.nil-input`, `.nil-input-error`). The error border
 * colour is driven by the `aria-invalid` attribute already set below, so no
 * extra modifier class is needed.
 *
 * With `trailing`, the input and the control share one `.nil-input-field` wrapper (the positioning
 * context), the control sits in `.nil-input-trailing`, and the input takes `.nil-input--trailing` for
 * the end padding that keeps typed text clear of the control. Without it the markup is unchanged.
 */
export function Input({ label, error, trailing, id, style, className, ...rest }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = error ? `${inputId}-error` : undefined;

  const hasTrailing = Boolean(trailing);

  const input = (
    <input
      id={inputId}
      {...rest}
      aria-invalid={Boolean(error)}
      aria-describedby={errorId}
      className={['nil-input', hasTrailing ? 'nil-input--trailing' : '', className].filter(Boolean).join(' ')}
      style={style}
    />
  );

  return (
    <div className="nil-input-group">
      <label htmlFor={inputId} className="nil-input-label">
        {label}
      </label>
      {trailing ? (
        <span className="nil-input-field">
          {input}
          <span className="nil-input-trailing">{trailing}</span>
        </span>
      ) : (
        input
      )}
      {error && (
        <span id={errorId} className="nil-input-error">
          {error}
        </span>
      )}
    </div>
  );
}
