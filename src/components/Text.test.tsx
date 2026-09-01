import { render, screen } from '@testing-library/react';
import { Text } from './Text';

describe('Text', () => {
  it('renders children inside a paragraph', () => {
    render(<Text>Body copy</Text>);
    const el = screen.getByText('Body copy');
    expect(el.tagName).toBe('P');
  });

  it('defaults to base size and non-muted colour', () => {
    render(<Text>Default</Text>);
    expect(screen.getByText('Default')).toHaveStyle({
      fontSize: 'var(--nil-type-scale-base)',
      color: 'var(--nil-color-text)',
    });
  });

  it('applies the sm size scale', () => {
    render(<Text size="sm">Small</Text>);
    expect(screen.getByText('Small')).toHaveStyle({
      fontSize: 'var(--nil-type-scale-sm)',
    });
  });

  it('applies muted colour when muted is true', () => {
    render(<Text muted>Muted</Text>);
    expect(screen.getByText('Muted')).toHaveStyle({
      color: 'var(--nil-color-text-muted)',
    });
  });

  it('forwards className', () => {
    render(<Text className="custom-text">Classy</Text>);
    expect(screen.getByText('Classy')).toHaveClass('custom-text');
  });

  it('merges a style override on top of the base styles', () => {
    render(<Text style={{ marginTop: 'var(--nil-spacing-xs)' }}>Styled</Text>);
    const el = screen.getByText('Styled');
    expect(el.style.marginTop).toBe('var(--nil-spacing-xs)');
    expect(el).toHaveStyle({ fontFamily: 'var(--nil-font-body)' });
  });
});
