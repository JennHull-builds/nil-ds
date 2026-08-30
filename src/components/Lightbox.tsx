import { useEffect, type MouseEvent } from 'react';

export interface LightboxImage {
  src: string;
  alt: string;
}

export interface LightboxProps {
  /** Currently open image, or null when closed. Fully controlled by the caller. */
  image: LightboxImage | null;
  onClose: () => void;
}

/**
 * Extracted from mothership-stable's Lightbox. Full-screen image viewer for
 * content that needs to be read at full resolution. Controlled — caller owns
 * which image (if any) is open. Plain <img>; --nil-* only.
 */
export function Lightbox({ image, onClose }: LightboxProps) {
  useEffect(() => {
    if (!image) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [image, onClose]);

  if (!image) return null;

  const stopClose = (e: MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={image.alt}
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
      <button
        type="button"
        onClick={onClose}
        aria-label="Close enlarged image"
        className="nil-lightbox-close"
        style={{
          position: 'absolute',
          top: 'var(--nil-spacing-lg)',
          right: 'var(--nil-spacing-lg)',
          fontFamily: 'var(--nil-font-mono)',
          fontSize: 'var(--nil-type-scale-sm)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: 'var(--nil-color-overlay-fg)',
          background: 'transparent',
          border: 'var(--nil-border-width-thick) solid var(--nil-color-overlay-border)',
          borderRadius: 'var(--nil-radius-none)',
          padding: 'var(--nil-spacing-xs) var(--nil-spacing-md)',
          cursor: 'pointer',
        }}
      >
        Close [Esc]
      </button>

      <img
        src={image.src}
        alt={image.alt}
        onClick={stopClose}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
          border: 'var(--nil-border-width-thick) solid var(--nil-color-overlay-border)',
          borderRadius: 'var(--nil-radius-none)',
        }}
      />
    </div>
  );
}
