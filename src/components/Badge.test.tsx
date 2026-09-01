import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders children content', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('defaults to the neutral tone class', () => {
    render(<Badge>Neutral</Badge>);
    expect(screen.getByText('Neutral')).toHaveClass('nil-badge', 'nil-badge--neutral');
  });

  it.each(['accent', 'danger', 'success'] as const)('applies the %s tone class', (tone) => {
    render(<Badge tone={tone}>{tone}</Badge>);
    expect(screen.getByText(tone)).toHaveClass(`nil-badge--${tone}`);
  });

  it('renders as an inline span', () => {
    render(<Badge>Span check</Badge>);
    expect(screen.getByText('Span check').tagName).toBe('SPAN');
  });
});
