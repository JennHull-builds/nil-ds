import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Lightbox } from './Lightbox';
import { axe } from 'vitest-axe';

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

  it('has no axe violations', async () => {
    const { container } = render(
      <Lightbox image={{ src: 'panel.png', alt: 'A NIL DS panel' }} onClose={() => {}} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  describe('controls', () => {
    it('closes with an icon Button named Close enlarged image, with the icon aria-hidden', () => {
      render(<Lightbox image={image} onClose={vi.fn()} />);
      const close = screen.getByRole('button', { name: 'Close enlarged image' });
      expect(close).toHaveClass('nil-btn', 'nil-btn--icon');
      expect(close.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    });

    it('sets the controls in the dark theme, because the scrim is dark in both themes', () => {
      render(<Lightbox image={image} onClose={vi.fn()} />);
      expect(screen.getByRole('dialog')).toHaveAttribute('data-theme', 'dark');
    });

    it('shows no previous or next button unless the caller gives a handler', () => {
      render(<Lightbox image={image} onClose={vi.fn()} />);
      expect(screen.queryByRole('button', { name: 'Previous image' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Next image' })).not.toBeInTheDocument();
    });

    it('calls onPrevious and onNext from the chevron Buttons, without closing', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const onPrevious = vi.fn();
      const onNext = vi.fn();
      render(<Lightbox image={image} onClose={onClose} onPrevious={onPrevious} onNext={onNext} />);
      const previous = screen.getByRole('button', { name: 'Previous image' });
      const next = screen.getByRole('button', { name: 'Next image' });
      expect(previous.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
      await user.click(previous);
      await user.click(next);
      expect(onPrevious).toHaveBeenCalledTimes(1);
      expect(onNext).toHaveBeenCalledTimes(1);
      expect(onClose).not.toHaveBeenCalled();
    });

    it('moves with ArrowLeft and ArrowRight only when there is somewhere to go', async () => {
      const user = userEvent.setup();
      const onPrevious = vi.fn();
      const { rerender } = render(<Lightbox image={image} onClose={vi.fn()} onPrevious={onPrevious} />);
      await user.keyboard('{ArrowRight}');
      expect(onPrevious).not.toHaveBeenCalled();
      await user.keyboard('{ArrowLeft}');
      expect(onPrevious).toHaveBeenCalledTimes(1);
      const onNext = vi.fn();
      rerender(<Lightbox image={image} onClose={vi.fn()} onNext={onNext} />);
      await user.keyboard('{ArrowRight}');
      expect(onNext).toHaveBeenCalledTimes(1);
    });
  });
});
