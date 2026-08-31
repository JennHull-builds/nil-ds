import { forwardRef, type ReactNode, type RefObject } from 'react';

export const DemoScene = forwardRef<
  HTMLElement,
  {
    id: string;
    band?: boolean;
    /** Grid hatch — defaults to band; set false when grid is scoped to a child (e.g. intro hero). */
    gridBg?: boolean;
    children: ReactNode;
  }
>(function DemoScene({ id, band, gridBg, children }, ref) {
  const showGrid = gridBg ?? band;

  return (
    <section
      id={id}
      ref={ref}
      className={[
        'nil-demo-scene',
        band ? 'nil-demo-scene--band' : '',
        showGrid ? 'nil-grid-bg' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="nil-container">{children}</div>
    </section>
  );
});

export type DemoSceneRef = RefObject<HTMLElement>;
