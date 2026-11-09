import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Icon } from './Icon';
import type { IconName } from './icons';

interface ButtonBaseProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** `danger` is for destructive actions: a danger fill with the accent's contrast text. */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  /** `md` is 44 px tall. `sm` is `--nil-size-button-sm` tall, with its tap area extended to 44 px. */
  size?: 'sm' | 'md';
}

/** A button with a visible label. An icon is optional and sits before it, decorative. */
export interface TextButtonProps extends ButtonBaseProps {
  children: ReactNode;
  icon?: IconName;
}

/**
 * A button that is only an icon. It has no visible text, so it must be given an accessible name,
 * and the type enforces that: leave out both `aria-label` and `aria-labelledby` and it does not compile.
 */
export type IconButtonProps = ButtonBaseProps & {
  children?: never;
  icon: IconName;
} & ({ 'aria-label': string } | { 'aria-labelledby': string });

export type ButtonProps = TextButtonProps | IconButtonProps;

/**
 * Offset button: a thick frame with a hard shadow in the border colour, the Stack idea on a button.
 * Hover lifts it a pixel, pressing pushes it into its shadow, and a toggle that is on (`aria-pressed`)
 * stays pushed in and inverted. Keyboard focus turns the shadow to the accent. All of it is in core.css.
 *
 * The ref reaches the underlying `<button>`, so a parent can move focus to it
 * (Dialog's `initialFocusRef` is the first user).
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { children, icon, variant = 'secondary', size = 'md', style, disabled, className, ...rest },
  ref,
) {
  const iconOnly = children === undefined;
  return (
    <button
      {...rest}
      ref={ref}
      disabled={disabled}
      className={['nil-btn', `nil-btn--${variant}`, `nil-btn--${size}`, iconOnly ? 'nil-btn--icon' : '', className]
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      {icon ? <Icon name={icon} size={iconOnly && size === 'md' ? 'md' : 'sm'} /> : null}
      {iconOnly ? null : <span className="nil-btn__label">{children}</span>}
    </button>
  );
});
