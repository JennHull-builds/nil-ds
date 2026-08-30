import type { HTMLAttributes } from 'react';

export type Theme = 'light' | 'dark';

export interface ThemeToggleProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onChange'> {
  /** Active theme. Consumer owns state and applies `data-theme` on an ancestor. */
  theme: Theme;
  /** Called with the theme the user selected (not a bare toggle). */
  onThemeChange: (theme: Theme) => void;
  disabled?: boolean;
}

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
  className,
  ...rest
}: ThemeToggleProps) {
  return (
    <div
      {...rest}
      role="group"
      aria-label="Theme"
      className={['nil-theme-toggle', className].filter(Boolean).join(' ')}
      style={{
        opacity: disabled ? 0.55 : 1,
        pointerEvents: disabled ? 'none' : undefined,
        ...style,
      }}
    >
      <button
        type="button"
        className="nil-theme-segment"
        aria-pressed={theme === 'light'}
        aria-label="Light mode"
        disabled={disabled}
        onClick={() => onThemeChange('light')}
      >
        ☀
      </button>
      <span aria-hidden className="nil-theme-divider" />
      <button
        type="button"
        className="nil-theme-segment"
        aria-pressed={theme === 'dark'}
        aria-label="Dark mode"
        disabled={disabled}
        onClick={() => onThemeChange('dark')}
      >
        ☾
      </button>
    </div>
  );
}
