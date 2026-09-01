import { render, screen } from '@testing-library/react';
import { Grid } from './Grid';

describe('Grid', () => {
  it('renders children', () => {
    render(
      <Grid>
        <span>Cell A</span>
        <span>Cell B</span>
      </Grid>,
    );
    expect(screen.getByText('Cell A')).toBeInTheDocument();
    expect(screen.getByText('Cell B')).toBeInTheDocument();
  });

  it('defaults to 3 columns and lg gap', () => {
    const { container } = render(<Grid>content</Grid>);
    const grid = container.querySelector('.nil-component-grid') as HTMLElement;
    expect(grid).toHaveStyle({ gap: 'var(--nil-spacing-lg)' });
    expect(grid.style.getPropertyValue('--nil-grid-columns')).toBe('3');
  });

  it('accepts a custom column count and gap', () => {
    const { container } = render(
      <Grid columns={5} gap="var(--nil-spacing-sm)">
        content
      </Grid>,
    );
    const grid = container.querySelector('.nil-component-grid') as HTMLElement;
    expect(grid).toHaveStyle({ gap: 'var(--nil-spacing-sm)' });
    expect(grid.style.getPropertyValue('--nil-grid-columns')).toBe('5');
  });
});
