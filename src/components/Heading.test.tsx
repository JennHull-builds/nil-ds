import { render, screen } from '@testing-library/react';
import { Heading } from './Heading';
import { axe } from 'vitest-axe';

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

  it('has no axe violations', async () => {
    const { container } = render(
      <>
        <Heading level={1}>Level one</Heading>
        <Heading level={2}>Level two</Heading>
        <Heading level={3}>Level three</Heading>
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
