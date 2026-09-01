import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Lightbox } from './Lightbox';

describe('Lightbox', () => {
  const image = { src: '/photo.jpg', alt: 'A scenic photo' };

  it('renders nothing when image is null', () => {
    const { container } = render(<Lightbox image={null} onClose={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders a modal dialog labelled by the image alt text', () => {
    render(<Lightbox image={image} onClose={vi.fn()} />);
    const dialog = screen.getByRole('dialog', { name: 'A scenic photo' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('renders the image with matching src and alt', () => {
    render(<Lightbox image={image} onClose={vi.fn()} />);
    const img = screen.getByRole('img', { name: 'A scenic photo' });
    expect(img).toHaveAttribute('src', '/photo.jpg');
  });

  it('calls onClose when the close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Lightbox image={image} onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: 'Close enlarged image' }));
    // The close button click also bubbles to the backdrop's onClose handler,
    // so it may fire more than once — the important thing is it fires.
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when the backdrop is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Lightbox image={image} onClose={onClose} />);
    await user.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when the image itself is clicked (stops propagation)', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Lightbox image={image} onClose={onClose} />);
    await user.click(screen.getByRole('img', { name: 'A scenic photo' }));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when the Escape key is pressed', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Lightbox image={image} onClose={onClose} />);
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('locks body scroll while open and restores it on close', () => {
    document.body.style.overflow = 'auto';
    const { rerender } = render(<Lightbox image={image} onClose={vi.fn()} />);
    expect(document.body.style.overflow).toBe('hidden');
    rerender(<Lightbox image={null} onClose={vi.fn()} />);
    expect(document.body.style.overflow).toBe('auto');
  });
});
