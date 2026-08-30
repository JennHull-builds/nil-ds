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
 */
export function Input({ label, error, id, style, className, ...rest }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--nil-spacing-xs)' }}>
      <label
        htmlFor={inputId}
        style={{
          fontFamily: 'var(--nil-font-body)',
          fontSize: 'var(--nil-type-scale-sm)',
          color: 'var(--nil-color-text)',
        }}
      >
        {label}
      </label>
      <input
        id={inputId}
        {...rest}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        className={['nil-input', className].filter(Boolean).join(' ')}
        style={{
          fontFamily: 'var(--nil-font-body)',
          fontSize: 'var(--nil-type-scale-base)',
          padding: 'var(--nil-spacing-sm)',
          borderRadius: 'var(--nil-radius-none)',
          border: `var(--nil-border-width) solid ${error ? 'var(--nil-color-danger)' : 'var(--nil-color-border)'}`,
          background: 'var(--nil-color-bg)',
          color: 'var(--nil-color-text)',
          ...style,
        }}
      />
      {error && (
        <span
          id={errorId}
          style={{
            fontFamily: 'var(--nil-font-body)',
            fontSize: 'var(--nil-type-scale-xs)',
            color: 'var(--nil-color-danger)',
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
}
