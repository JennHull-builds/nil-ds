import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

describe('Input', () => {
  it('renders a labelled textbox associated via htmlFor/id', () => {
    render(<Input label="Email" />);
    const input = screen.getByLabelText('Email');
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe('INPUT');
  });

  it('generates a stable id when none is provided', () => {
    render(<Input label="Auto id" />);
    const input = screen.getByLabelText('Auto id');
    expect(input.id).toBeTruthy();
  });

  it('respects an explicit id', () => {
    render(<Input label="Explicit id" id="custom-id" />);
    const input = screen.getByLabelText('Explicit id');
    expect(input.id).toBe('custom-id');
  });

  it('has aria-invalid false and no description when there is no error', () => {
    render(<Input label="Clean" />);
    const input = screen.getByLabelText('Clean');
    expect(input).toHaveAttribute('aria-invalid', 'false');
    expect(input).not.toHaveAttribute('aria-describedby');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('surfaces an error message and wires aria-invalid/aria-describedby', () => {
    render(<Input label="Password" error="Too short" />);
    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    const errorEl = screen.getByText('Too short');
    expect(input.getAttribute('aria-describedby')).toBe(errorEl.id);
  });

  it('accepts user input and forwards standard input props', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Input label="Name" placeholder="Jane" onChange={onChange} />);
    const input = screen.getByLabelText('Name');
    expect(input).toHaveAttribute('placeholder', 'Jane');
    await user.type(input, 'Alex');
    expect(input).toHaveValue('Alex');
    expect(onChange).toHaveBeenCalled();
  });
});
