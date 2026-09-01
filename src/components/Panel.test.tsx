import { render, screen } from '@testing-library/react';
import { Panel } from './Panel';

describe('Panel', () => {
  it('renders children in the body', () => {
    render(<Panel>Body content</Panel>);
    expect(screen.getByText('Body content')).toBeInTheDocument();
  });

  it('omits the header row when no title or headerRight is given', () => {
    const { container } = render(<Panel>No header</Panel>);
    expect(container.querySelector('.nil-panel__header')).not.toBeInTheDocument();
  });

  it('renders the header row with a title', () => {
    const { container } = render(<Panel title="STATUS">Body</Panel>);
    expect(screen.getByText('STATUS')).toBeInTheDocument();
    expect(container.querySelector('.nil-panel__header')).toBeInTheDocument();
  });

  it('renders headerRight content even without a title', () => {
    render(<Panel headerRight={<span>Right slot</span>}>Body</Panel>);
    expect(screen.getByText('Right slot')).toBeInTheDocument();
  });

  it('defaults to the default (non-inverse) variant styling', () => {
    const { container } = render(<Panel title="Default variant">Body</Panel>);
    const panel = container.querySelector('.nil-panel');
    expect(panel).toHaveClass('nil-panel');
    expect(panel).not.toHaveClass('nil-panel--inverse');
    expect(panel).toHaveStyle({ background: 'var(--nil-color-surface)' });
  });

  it('applies inverse styling when variant is inverse', () => {
    const { container } = render(
      <Panel title="Inverse" variant="inverse">
        Body
      </Panel>,
    );
    const panel = container.querySelector('.nil-panel');
    expect(panel).toHaveClass('nil-panel--inverse');
    expect(panel).toHaveStyle({
      background: 'var(--nil-color-text)',
      color: 'var(--nil-color-bg)',
    });
  });
});
