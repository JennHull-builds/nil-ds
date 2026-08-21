import type { ButtonHTMLAttributes } from 'react';

export type Theme = 'light' | 'dark';

export interface ThemeToggleProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'onChange'> {
  /** Active theme. Consumer owns state and applies `data-theme` on an ancestor. */
  theme: Theme;
  /** Called with the theme the user selected (not a bare toggle). */
  onThemeChange: (theme: Theme) => void;
}

const segmentTransition = `background var(--nil-motion-duration-base) var(--nil-motion-easing-standard), color var(--nil-motion-duration-base) var(--nil-motion-easing-standard), opacity var(--nil-motion-duration-base) var(--nil-motion-easing-standard)`;

/**
 * Extracted from mothership-stable's ThemeToggle. Sharp segmented light/dark
 * control — 0 radius, hard border. Controlled: no ThemeProvider; theme is a
 * kit object the consumer wires to `data-theme`.
 */
export function ThemeToggle({
  theme,
  onThemeChange,
  style,
  disabled,
  ...rest
}: ThemeToggleProps) {
  const isDark = theme === 'dark';
  const next: Theme = isDark ? 'light' : 'dark';

  return (
    <button
      {...rest}
      type="button"
      disabled={disabled}
      aria-label={`Switch to ${next} mode`}
      aria-pressed={isDark}
      onClick={(e) => {
        rest.onClick?.(e);
        if (!e.defaultPrevented && !disabled) onThemeChange(next);
      }}
      style={{
        display: 'flex',
        alignItems: 'stretch',
        height: 28,
        padding: 0,
        overflow: 'hidden',
        flexShrink: 0,
        background: 'transparent',
        border: 'var(--nil-border-width) solid var(--nil-color-border)',
        borderRadius: 'var(--nil-radius-none)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        ...style,
      }}
    >
      <span
        aria-hidden
        style={{
          padding: '0 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 'var(--nil-type-scale-xs)',
          lineHeight: 1,
          background: !isDark ? 'var(--nil-color-accent)' : 'transparent',
          color: !isDark ? 'var(--nil-color-accent-contrast)' : 'var(--nil-color-text)',
          opacity: !isDark ? 1 : 0.3,
          transition: segmentTransition,
          userSelect: 'none',
        }}
      >
        ☀
      </span>

      <span
        aria-hidden
        style={{
          width: 'var(--nil-border-width)',
          display: 'block',
          background: 'var(--nil-color-border)',
          flexShrink: 0,
        }}
      />

      <span
        aria-hidden
        style={{
          padding: '0 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 'var(--nil-type-scale-xs)',
          lineHeight: 1,
          background: isDark ? 'var(--nil-color-accent)' : 'transparent',
          color: isDark ? 'var(--nil-color-accent-contrast)' : 'var(--nil-color-text)',
          opacity: isDark ? 1 : 0.3,
          transition: segmentTransition,
          userSelect: 'none',
        }}
      >
        ☾
      </span>
    </button>
  );
}
