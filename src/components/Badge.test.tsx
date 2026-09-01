import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders children content', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('defaults to the neutral tone colour', () => {
    render(<Badge>Neutral</Badge>);
    expect(screen.getByText('Neutral')).toHaveStyle({
      color: 'var(--nil-color-text-muted)',
    });
  });

  it.each([
    ['accent', 'var(--nil-color-accent)'],
    ['danger', 'var(--nil-color-danger)'],
    ['success', 'var(--nil-color-success)'],
  ] as const)('applies the %s tone colour', (tone, expected) => {
    render(<Badge tone={tone}>{tone}</Badge>);
    expect(screen.getByText(tone)).toHaveStyle({ color: expected });
  });

  it('renders as an inline span', () => {
    render(<Badge>Span check</Badge>);
    expect(screen.getByText('Span check').tagName).toBe('SPAN');
  });
});
