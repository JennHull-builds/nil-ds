import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders its label and bracket frame', () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('[');
    expect(button).toHaveTextContent(']');
  });

  it('defaults to the secondary/md variant classes', () => {
    render(<Button>Default</Button>);
    const button = screen.getByRole('button', { name: 'Default' });
    expect(button).toHaveClass('nil-btn', 'nil-btn--secondary', 'nil-btn--md');
  });

  it.each(['primary', 'secondary', 'ghost'] as const)(
    'applies the %s variant class',
    (variant) => {
      render(<Button variant={variant}>{variant}</Button>);
      expect(screen.getByRole('button', { name: variant })).toHaveClass(`nil-btn--${variant}`);
    },
  );

  it.each(['sm', 'md'] as const)('applies the %s size class', (size) => {
    render(<Button size={size}>{size}</Button>);
    expect(screen.getByRole('button', { name: size })).toHaveClass(`nil-btn--${size}`);
  });

  it('fires onClick when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    await user.click(screen.getByRole('button', { name: 'Click me' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled and does not fire onClick when disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Disabled
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Disabled' });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('forwards native button attributes and merges className', () => {
    render(
      <Button type="submit" className="extra-class" aria-label="Submit form">
        Submit
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Submit form' });
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveClass('extra-class');
  });
});
