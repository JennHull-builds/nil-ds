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
export function Input({ label, error, id, style, ...rest }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--semantic-spacing-xs)' }}>
      <label
        htmlFor={inputId}
        style={{
          fontFamily: 'var(--semantic-font-body)',
          fontSize: 'var(--semantic-type-scale-sm)',
          color: 'var(--semantic-color-text)',
        }}
      >
        {label}
      </label>
      <input
        id={inputId}
        {...rest}
        aria-invalid={Boolean(error)}
        style={{
          fontFamily: 'var(--semantic-font-body)',
          fontSize: 'var(--semantic-type-scale-base)',
          padding: 'var(--semantic-spacing-sm)',
          borderRadius: 'var(--semantic-radius-none)',
          border: `var(--semantic-border-width) solid ${error ? 'var(--semantic-color-danger)' : 'var(--semantic-color-border)'}`,
          background: 'var(--semantic-color-bg)',
          color: 'var(--semantic-color-text)',
          ...style,
        }}
      />
      {error && (
        <span
          style={{
            fontFamily: 'var(--semantic-font-body)',
            fontSize: 'var(--semantic-type-scale-xs)',
            color: 'var(--semantic-color-danger)',
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
}
