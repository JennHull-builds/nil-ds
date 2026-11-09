import type { HTMLAttributes } from 'react';
import { Button } from './Button';

export type Theme = 'light' | 'dark';

export interface ThemeToggleProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onChange'> {
  /** Active theme. Consumer owns state and applies `data-theme` on an ancestor. */
  theme: Theme;
  /** Called with the theme the user selected (not a bare toggle). */
  onThemeChange: (theme: Theme) => void;
  disabled?: boolean;
}

/**
 * Light and dark as two small icon Buttons (sun and moon). The one that is on is a pressed
 * Button, pushed in and inverted, so the state shows in more than a colour. Controlled: no
 * ThemeProvider; theme is a kit object the consumer wires to `data-theme`.
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
        pointerEvents: disabled ? 'none' : undefined,
        ...style,
      }}
    >
      <Button
        variant="secondary"
        size="sm"
        icon="sun"
        aria-label="Light mode"
        aria-pressed={theme === 'light'}
        disabled={disabled}
        onClick={() => onThemeChange('light')}
      />
      <Button
        variant="secondary"
        size="sm"
        icon="moon"
        aria-label="Dark mode"
        aria-pressed={theme === 'dark'}
        disabled={disabled}
        onClick={() => onThemeChange('dark')}
      />
    </div>
  );
}
