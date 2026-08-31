import type { ButtonHTMLAttributes } from 'react';

export interface ToggleProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  labelOn?: string;
  labelOff?: string;
}

/**
 * Industrial ON/OFF pill — filled active, outline inactive. Not ThemeToggle.
 */
export function Toggle({
  checked,
  onCheckedChange,
  labelOn = 'ON',
  labelOff = 'OFF',
  className,
  ...rest
}: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={['nil-toggle', checked ? 'nil-toggle--on' : 'nil-toggle--off', className]
        .filter(Boolean)
        .join(' ')}
      onClick={() => onCheckedChange(!checked)}
      {...rest}
      style={{
        fontFamily: 'var(--nil-font-mono)',
        fontSize: 'var(--nil-type-scale-xs)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        padding: 'var(--nil-spacing-xs) var(--nil-spacing-md)',
        borderRadius: 'var(--nil-radius-full)',
        border: 'var(--nil-border-width) solid var(--nil-color-border)',
        cursor: 'pointer',
        background: checked ? 'var(--nil-color-text)' : 'transparent',
        color: checked ? 'var(--nil-color-bg)' : 'var(--nil-color-text)',
        transition: `background var(--nil-motion-duration-base) var(--nil-motion-easing-standard), color var(--nil-motion-duration-base) var(--nil-motion-easing-standard)`,
      }}
    >
      {checked ? labelOn : labelOff}
    </button>
  );
}
