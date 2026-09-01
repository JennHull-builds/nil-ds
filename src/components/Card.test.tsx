import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Cell content</Card>);
    expect(screen.getByText('Cell content')).toBeInTheDocument();
  });

  it('defaults to md spacing padding', () => {
    render(<Card>Default padding</Card>);
    // jsdom's getComputedStyle resolves the padding shorthand to a length,
    // so assert against the inline style declaration instead of toHaveStyle.
    expect(screen.getByText('Default padding').style.padding).toBe('var(--nil-spacing-md)');
  });

  it('accepts a custom padding override', () => {
    render(<Card padding="var(--nil-spacing-xl)">Custom padding</Card>);
    expect(screen.getByText('Custom padding').style.padding).toBe('var(--nil-spacing-xl)');
  });

  it('merges a style override on top of the base styles', () => {
    render(<Card style={{ marginTop: '12px' }}>Styled</Card>);
    expect(screen.getByText('Styled')).toHaveStyle({
      marginTop: '12px',
      borderRadius: 'var(--nil-radius-default)',
      color: 'var(--nil-color-text)',
    });
  });

  it('forwards className', () => {
    render(<Card className="custom-card">Classy</Card>);
    expect(screen.getByText('Classy')).toHaveClass('custom-card');
  });
});
