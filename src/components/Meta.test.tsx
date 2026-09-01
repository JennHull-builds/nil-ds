import { render, screen } from '@testing-library/react';
import { Meta } from './Meta';

describe('Meta', () => {
  it('renders the label and value wrapped in brackets', () => {
    render(<Meta label="ROLE">Design Engineer</Meta>);
    expect(screen.getByText('ROLE:')).toBeInTheDocument();
    expect(screen.getByText('Design Engineer')).toBeInTheDocument();
    expect(screen.getByText('[')).toBeInTheDocument();
    expect(screen.getByText(']')).toBeInTheDocument();
  });

  it('marks the decorative brackets as aria-hidden', () => {
    render(<Meta label="ROLE">Design Engineer</Meta>);
    expect(screen.getByText('[')).toHaveAttribute('aria-hidden');
    expect(screen.getByText(']')).toHaveAttribute('aria-hidden');
  });

  it('defaults to the neutral tone for both label and brackets', () => {
    render(<Meta label="STATUS">Idle</Meta>);
    expect(screen.getByText('STATUS:')).toHaveStyle({ color: 'var(--nil-color-text-muted)' });
    expect(screen.getByText('[')).toHaveStyle({ color: 'var(--nil-color-border)' });
  });

  it.each([
    ['accent', 'var(--nil-color-accent)'],
    ['danger', 'var(--nil-color-danger)'],
    ['success', 'var(--nil-color-success)'],
  ] as const)('applies the %s tone to brackets and label', (tone, expected) => {
    render(
      <Meta label="TONE" tone={tone}>
        value
      </Meta>,
    );
    expect(screen.getByText('TONE:')).toHaveStyle({ color: expected });
    expect(screen.getByText('[')).toHaveStyle({ color: expected });
  });
});
