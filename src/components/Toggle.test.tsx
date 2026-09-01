import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toggle } from './Toggle';

describe('Toggle', () => {
  it('renders as a switch reflecting the checked state', () => {
    render(<Toggle checked={false} onCheckedChange={vi.fn()} />);
    const toggle = screen.getByRole('switch');
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    expect(toggle).toHaveTextContent('OFF');
    expect(toggle).toHaveClass('nil-toggle--off');
  });

  it('reflects the checked=true state with default ON label', () => {
    render(<Toggle checked onCheckedChange={vi.fn()} />);
    const toggle = screen.getByRole('switch');
    expect(toggle).toHaveAttribute('aria-checked', 'true');
    expect(toggle).toHaveTextContent('ON');
    expect(toggle).toHaveClass('nil-toggle--on');
  });

  it('supports custom on/off labels', () => {
    render(
      <Toggle checked onCheckedChange={vi.fn()} labelOn="ACTIVE" labelOff="INACTIVE" />,
    );
    expect(screen.getByRole('switch')).toHaveTextContent('ACTIVE');
  });

  it('calls onCheckedChange with the inverted value when clicked', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Toggle checked={false} onCheckedChange={onCheckedChange} />);
    await user.click(screen.getByRole('switch'));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('toggles from checked to unchecked on click', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Toggle checked onCheckedChange={onCheckedChange} />);
    await user.click(screen.getByRole('switch'));
    expect(onCheckedChange).toHaveBeenCalledWith(false);
  });

  it('forwards extra button props and merges className', () => {
    render(
      <Toggle checked={false} onCheckedChange={vi.fn()} className="extra" disabled />,
    );
    const toggle = screen.getByRole('switch');
    expect(toggle).toHaveClass('nil-toggle', 'nil-toggle--off', 'extra');
    expect(toggle).toBeDisabled();
  });
});
