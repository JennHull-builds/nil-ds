import type { InputHTMLAttributes } from 'react';
import { useId } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
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
 */
export function Input({ label, error, id, style, className, ...rest }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="nil-input-group">
      <label htmlFor={inputId} className="nil-input-label">
        {label}
      </label>
      <input
        id={inputId}
        {...rest}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        className={['nil-input', className].filter(Boolean).join(' ')}
        style={style}
      />
      {error && (
        <span id={errorId} className="nil-input-error">
          {error}
        </span>
      )}
    </div>
  );
}
