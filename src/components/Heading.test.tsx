import { render, screen } from '@testing-library/react';
import { Heading } from './Heading';

describe('Heading', () => {
  it('defaults to an h2', () => {
    render(<Heading>Default level</Heading>);
    expect(screen.getByRole('heading', { level: 2, name: 'Default level' })).toBeInTheDocument();
  });

  it.each([1, 2, 3] as const)('renders an h%s for level %s', (level) => {
    render(<Heading level={level}>Heading {level}</Heading>);
    expect(
      screen.getByRole('heading', { level, name: `Heading ${level}` }),
    ).toBeInTheDocument();
  });
});
