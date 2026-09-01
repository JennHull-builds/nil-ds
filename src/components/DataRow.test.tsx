import { render, screen } from '@testing-library/react';
import { DataRow } from './DataRow';

describe('DataRow', () => {
  it('renders the label', () => {
    render(<DataRow label="MON" />);
    expect(screen.getByText('MON')).toBeInTheDocument();
  });

  it('renders value and detail when provided', () => {
    render(<DataRow label="MON" value="09:00" detail="Open" />);
    expect(screen.getByText('09:00')).toBeInTheDocument();
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('is muted and inactive by default', () => {
    const { container } = render(<DataRow label="TUE" />);
    const row = container.querySelector('.nil-data-row');
    expect(row).not.toHaveClass('nil-data-row--active');
    expect(row).toHaveStyle({ color: 'var(--nil-color-text-muted)' });
  });

  it('applies active styling and class when active is true', () => {
    const { container } = render(<DataRow label="WED" active />);
    const row = container.querySelector('.nil-data-row');
    expect(row).toHaveClass('nil-data-row--active');
    expect(row).toHaveStyle({ color: 'var(--nil-color-text)' });
  });

  it('renders without value or detail gracefully', () => {
    const { container } = render(<DataRow label="THU" />);
    const row = container.querySelector('.nil-data-row');
    expect(row?.children).toHaveLength(3);
  });
});
