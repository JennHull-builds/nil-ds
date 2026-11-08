import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from './ThemeToggle';
import { axe } from 'vitest-axe';

describe('ThemeToggle', () => {
  it('renders a labelled group with light and dark segments', () => {
    render(<ThemeToggle theme="light" onThemeChange={vi.fn()} />);
    expect(screen.getByRole('group', { name: 'Theme' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Light mode' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Dark mode' })).toBeInTheDocument();
  });

  it('marks the light segment as pressed when theme is light', () => {
    render(<ThemeToggle theme="light" onThemeChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Light mode' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Dark mode' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('marks the dark segment as pressed when theme is dark', () => {
    render(<ThemeToggle theme="dark" onThemeChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Dark mode' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Light mode' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('calls onThemeChange with "dark" when the dark segment is clicked', async () => {
    const user = userEvent.setup();
    const onThemeChange = vi.fn();
    render(<ThemeToggle theme="light" onThemeChange={onThemeChange} />);
    await user.click(screen.getByRole('button', { name: 'Dark mode' }));
    expect(onThemeChange).toHaveBeenCalledWith('dark');
  });

  it('calls onThemeChange with "light" when the light segment is clicked', async () => {
    const user = userEvent.setup();
    const onThemeChange = vi.fn();
    render(<ThemeToggle theme="dark" onThemeChange={onThemeChange} />);
    await user.click(screen.getByRole('button', { name: 'Light mode' }));
    expect(onThemeChange).toHaveBeenCalledWith('light');
  });

  it('still fires onThemeChange when clicking the already-active segment', async () => {
    const user = userEvent.setup();
    const onThemeChange = vi.fn();
    render(<ThemeToggle theme="light" onThemeChange={onThemeChange} />);
    await user.click(screen.getByRole('button', { name: 'Light mode' }));
    expect(onThemeChange).toHaveBeenCalledWith('light');
  });

  it('disables both segments when disabled, and does not dim twice', () => {
    render(<ThemeToggle theme="light" onThemeChange={vi.fn()} disabled />);
    expect(screen.getByRole('button', { name: 'Light mode' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Dark mode' })).toBeDisabled();
    // Each segment is a Button, which dims itself. A dimmed wrapper on top would square the dimming.
    expect(screen.getByRole('group', { name: 'Theme' }).style.opacity).toBe('');
  });

  it('uses a sun and a moon icon in place of text characters, decorative, on small icon Buttons', () => {
    render(<ThemeToggle theme="light" onThemeChange={vi.fn()} />);
    const light = screen.getByRole('button', { name: 'Light mode' });
    const dark = screen.getByRole('button', { name: 'Dark mode' });
    for (const button of [light, dark]) {
      expect(button).toHaveClass('nil-btn', 'nil-btn--icon', 'nil-btn--sm');
      expect(button.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
      expect(button.textContent).toBe('');
    }
    expect(light.querySelector('svg')!.innerHTML).toContain('M11 9.5h2'); // the sun's centre, in its 16 px form
  });

  it('does not call onThemeChange when disabled and a segment is clicked', () => {
    const onThemeChange = vi.fn();
    render(<ThemeToggle theme="light" onThemeChange={onThemeChange} disabled />);
    // The wrapper is styled with pointer-events: none while disabled, which
    // userEvent correctly refuses to click through — use fireEvent to mirror
    // how a disabled <button> simply never dispatches a click.
    fireEvent.click(screen.getByRole('button', { name: 'Dark mode' }));
    expect(onThemeChange).not.toHaveBeenCalled();
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <ThemeToggle theme="light" onThemeChange={() => {}} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
