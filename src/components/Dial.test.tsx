import { render, screen } from '@testing-library/react';
import { Dial } from './Dial';

describe('Dial', () => {
  it('exposes an img role with value and unit in the aria-label', () => {
    render(<Dial value={72} unit="°" />);
    expect(screen.getByRole('img', { name: '72°' })).toBeInTheDocument();
  });

  it('prefixes the aria-label with the label when provided', () => {
    render(<Dial value={72} unit="°" label="Indoor" />);
    expect(screen.getByRole('img', { name: 'Indoor: 72°' })).toBeInTheDocument();
    expect(screen.getByText('Indoor')).toBeInTheDocument();
  });

  it('renders the value and unit and optional sublabel', () => {
    render(<Dial value={72} unit="°" sublabel="Rising" />);
    expect(screen.getByText('72')).toBeInTheDocument();
    expect(screen.getByText('°')).toBeInTheDocument();
    expect(screen.getByText('Rising')).toBeInTheDocument();
  });

  it('defaults progress to 50 when not provided (no crash, dot rendered)', () => {
    const { container } = render(<Dial value={1} />);
    expect(container.querySelectorAll('svg circle').length).toBeGreaterThan(0);
  });

  it.each(['sm', 'md', 'lg', 'xl'] as const)('renders without error at size %s', (size) => {
    render(<Dial value={5} size={size} label={`size-${size}`} />);
    expect(screen.getByText(`size-${size}`)).toBeInTheDocument();
  });

  it('renders a solid fill circle when variant is solid', () => {
    const { container } = render(<Dial value={5} variant="solid" />);
    const filledCircle = container.querySelector('circle[fill="var(--nil-color-text)"]');
    expect(filledCircle).toBeInTheDocument();
  });

  it('does not render a solid fill circle by default', () => {
    const { container } = render(<Dial value={5} />);
    const filledCircle = container.querySelector('circle[fill="var(--nil-color-text)"]');
    expect(filledCircle).not.toBeInTheDocument();
  });

  it('uses the semantic text token for the default value colour', () => {
    const { container } = render(<Dial value={21.4} unit="°C" />);
    expect(container.querySelector('.nil-dial')).toHaveStyle({ color: 'var(--nil-color-text)' });
  });
});
