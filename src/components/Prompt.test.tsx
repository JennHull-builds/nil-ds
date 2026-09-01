import { render, screen } from '@testing-library/react';
import { Prompt } from './Prompt';

describe('Prompt', () => {
  it('renders the text content with the default ">" prefix', () => {
    const { container } = render(<Prompt>ls -la</Prompt>);
    expect(container.textContent).toContain('> ls -la');
  });

  it('accepts a custom prefix', () => {
    const { container } = render(<Prompt prefix="$">pwd</Prompt>);
    expect(container.textContent).toContain('$ pwd');
  });

  it('shows the blinking cursor by default', () => {
    const { container } = render(<Prompt>with cursor</Prompt>);
    expect(container.querySelector('.nil-cursor-blink')).toBeInTheDocument();
  });

  it('hides the cursor when showCursor is false', () => {
    const { container } = render(<Prompt showCursor={false}>no cursor</Prompt>);
    expect(container.querySelector('.nil-cursor-blink')).not.toBeInTheDocument();
  });

  it('renders as a paragraph and forwards className', () => {
    const { container } = render(<Prompt className="extra">text</Prompt>);
    const p = container.querySelector('p');
    expect(p).toBeInTheDocument();
    expect(p).toHaveClass('nil-prompt', 'extra');
  });
});
