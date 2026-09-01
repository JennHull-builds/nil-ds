import { render, screen } from '@testing-library/react';
import { Stack } from './Stack';

describe('Stack', () => {
  it('renders children in the top layer', () => {
    render(<Stack>Top content</Stack>);
    expect(screen.getByText('Top content')).toBeInTheDocument();
  });

  it('defaults to 2 back layers', () => {
    const { container } = render(<Stack>content</Stack>);
    expect(container.querySelectorAll('.nil-stack__layer')).toHaveLength(2);
  });

  it.each([1, 2, 3] as const)('renders %s back layer(s) for depth %s', (depth) => {
    const { container } = render(<Stack depth={depth}>content</Stack>);
    expect(container.querySelectorAll('.nil-stack__layer')).toHaveLength(depth);
  });

  it('clamps depth above 3 down to 3 layers', () => {
    const { container } = render(<Stack depth={10}>content</Stack>);
    expect(container.querySelectorAll('.nil-stack__layer')).toHaveLength(3);
  });

  it('clamps depth below 1 up to 1 layer', () => {
    const { container } = render(<Stack depth={0}>content</Stack>);
    expect(container.querySelectorAll('.nil-stack__layer')).toHaveLength(1);
  });

  it('marks back layers as decorative via aria-hidden', () => {
    const { container } = render(<Stack depth={2}>content</Stack>);
    container.querySelectorAll('.nil-stack__layer').forEach((layer) => {
      expect(layer).toHaveAttribute('aria-hidden');
    });
  });

  it('paints the top layer with semantic text colour', () => {
    const { container } = render(<Stack>content</Stack>);
    expect(container.querySelector('.nil-stack__top')).toHaveStyle({
      color: 'var(--nil-color-text)',
    });
  });
});
