import { useEffect, useRef, useState } from 'react';

/** IntersectionObserver reveal — adds .is-visible to .nil-enter children */
export function useReveal() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reveal = () => setVisible(true);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          reveal();
          observer.disconnect();
        }
      },
      { threshold: 0.08 },
    );

    observer.observe(el);

    // Above-the-fold: IO can miss on first paint after HMR — check once layout settles.
    const raf = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        reveal();
        observer.disconnect();
      }
    });

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  return { ref, visible };
}
