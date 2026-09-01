import { render } from '@testing-library/react';
import { Divider } from './Divider';

describe('Divider', () => {
  it('renders an hr element', () => {
    const { container } = render(<Divider />);
    expect(container.querySelector('hr')).toBeInTheDocument();
  });

  it('defaults to md spacing on both margins', () => {
    const { container } = render(<Divider />);
    // jsdom's getComputedStyle resolves the margin shorthand to a length,
    // so assert against the inline style declaration instead of toHaveStyle.
    const hr = container.querySelector('hr') as HTMLHRElement;
    expect(hr.style.margin).toBe('var(--nil-spacing-md) 0');
  });

  it('accepts a custom spacing value', () => {
    const { container } = render(<Divider spacing="var(--nil-spacing-2xl)" />);
    const hr = container.querySelector('hr') as HTMLHRElement;
    expect(hr.style.margin).toBe('var(--nil-spacing-2xl) 0');
  });
});
