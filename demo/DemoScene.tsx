import { forwardRef, type ReactNode, type RefObject } from 'react';

export const DemoScene = forwardRef<
  HTMLElement,
  {
    id: string;
    band?: boolean;
    children: ReactNode;
  }
>(function DemoScene({ id, band, children }, ref) {
  return (
    <section
      id={id}
      ref={ref}
      className={[
        'nil-demo-scene',
        band ? 'nil-demo-scene--band nil-grid-bg' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="nil-container">{children}</div>
    </section>
  );
});

export type DemoSceneRef = RefObject<HTMLElement>;
