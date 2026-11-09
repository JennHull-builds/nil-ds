import { useEffect, type MouseEvent } from 'react';
import { Button } from './Button';

export interface LightboxImage {
  src: string;
  alt: string;
}

export interface LightboxProps {
  /** Currently open image, or null when closed. Fully controlled by the caller. */
  image: LightboxImage | null;
  onClose: () => void;
  /**
   * Optional. When given, a previous or next button appears at that side, and ArrowLeft or ArrowRight
   * calls it. The caller owns which image is open, so it decides what "previous" means and where the
   * list ends (leave the prop out at the ends and the button goes with it).
   */
  onPrevious?: () => void;
  onNext?: () => void;
}

/**
 * Extracted from mothership-stable's Lightbox. Full-screen image viewer for
 * content that needs to be read at full resolution. Controlled — caller owns
 * which image (if any) is open. Plain <img>; --nil-* only.
 */
export function Lightbox({ image, onClose, onPrevious, onNext }: LightboxProps) {
  useEffect(() => {
    if (!image) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft' && onPrevious) onPrevious();
      else if (e.key === 'ArrowRight' && onNext) onNext();
    };
    document.addEventListener('keydown', handleKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [image, onClose, onPrevious, onNext]);

  if (!image) return null;

  const stopClose = (e: MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={image.alt}
      // The scrim is always dark, so the controls on it take the dark theme's colours in either theme.
      data-theme="dark"
      onClick={onClose}
      className="nil-lightbox-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'var(--nil-color-overlay)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--nil-spacing-2xl) var(--nil-spacing-xl)',
      }}
    >
      <Button
        type="button"
        variant="secondary"
        icon="close"
        aria-label="Close enlarged image"
        className="nil-lightbox-close"
        onClick={onClose}
      />
      {onPrevious ? (
        <Button
          type="button"
          variant="secondary"
          icon="chevron-left"
          aria-label="Previous image"
          className="nil-lightbox-step nil-lightbox-step--previous"
          onClick={(e) => {
            e.stopPropagation();
            onPrevious();
          }}
        />
      ) : null}
      {onNext ? (
        <Button
          type="button"
          variant="secondary"
          icon="chevron-right"
          aria-label="Next image"
          className="nil-lightbox-step nil-lightbox-step--next"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
        />
      ) : null}

      <img
        src={image.src}
        alt={image.alt}
        onClick={stopClose}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
          border: 'var(--nil-border-width-thick) solid var(--nil-color-overlay-border)',
          borderRadius: 'var(--nil-radius-default)',
        }}
      />
    </div>
  );
}
