import { render, screen } from '@testing-library/react';
import { Ring } from './Ring';

describe('Ring', () => {
  it('exposes an img role with a percentage aria-label', () => {
    render(<Ring value={65} />);
    expect(screen.getByRole('img', { name: '65%' })).toBeInTheDocument();
  });

  it('includes the label in the aria-label when provided', () => {
    render(<Ring value={30} label="Battery" />);
    expect(screen.getByRole('img', { name: 'Battery: 30%' })).toBeInTheDocument();
    expect(screen.getByText('Battery')).toBeInTheDocument();
  });

  it('clamps values above 100 to 100%', () => {
    render(<Ring value={150} />);
    expect(screen.getByRole('img', { name: '100%' })).toBeInTheDocument();
  });

  it('clamps negative values to 0%', () => {
    render(<Ring value={-20} />);
    expect(screen.getByRole('img', { name: '0%' })).toBeInTheDocument();
  });

  it('renders the visible percentage text', () => {
    render(<Ring value={42} />);
    expect(screen.getByText('42%')).toBeInTheDocument();
  });

  it('uses the semantic text token for the percentage colour', () => {
    render(<Ring value={42} />);
    expect(screen.getByText('42%')).toHaveStyle({ color: 'var(--nil-color-text)' });
  });
});
