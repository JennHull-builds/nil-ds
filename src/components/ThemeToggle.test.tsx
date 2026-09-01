import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from './ThemeToggle';

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

  it('disables both segments and dims the control when disabled', () => {
    render(<ThemeToggle theme="light" onThemeChange={vi.fn()} disabled />);
    expect(screen.getByRole('button', { name: 'Light mode' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Dark mode' })).toBeDisabled();
    expect(screen.getByRole('group', { name: 'Theme' })).toHaveStyle({ opacity: '0.55' });
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
});
