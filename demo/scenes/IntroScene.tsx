import {
  Heading,
  Meta,
  Prompt,
  Stack,
  Text,
  ThemeToggle,
  type Theme,
} from '../../src';
import { useReveal } from '../hooks/useReveal';

export function IntroScene({
  theme,
  onThemeChange,
}: {
  theme: Theme;
  onThemeChange: (t: Theme) => void;
}) {
  const { ref, visible } = useReveal();

  return (
    <section id="intro" className="nil-demo-scene" ref={ref as React.RefObject<HTMLElement>}>
      <div
        className={`nil-enter${visible ? ' is-visible' : ''}`}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--nil-spacing-md)', flexWrap: 'wrap' }}
      >
        <div>
          <Heading level={1}>
            NIL DS
            <span className="nil-cursor-blink" aria-hidden>_</span>
          </Heading>
          <Text muted>Machine-readable token primitives — agent-ready UI infrastructure.</Text>
        </div>
        <ThemeToggle theme={theme} onThemeChange={onThemeChange} />
      </div>

      <div className="nil-demo-layer-strip">
        <span><strong>1 · Primitive</strong> — <code>tokens.json</code></span>
        <span aria-hidden>→</span>
        <span><strong>2 · Semantic</strong> — <code>--nil-*</code> roles</span>
        <span aria-hidden>→</span>
        <span><strong>3 · Component</strong> — React primitives</span>
      </div>

      <div
        className={`nil-enter${visible ? ' is-visible' : ''}`}
        style={{ marginTop: 'var(--nil-spacing-xl)', ['--nil-anim-delay' as string]: '120ms' }}
      >
        <Stack depth={3}>
          <div className="nil-demo-hero-inner nil-grid-bg">
            <div className="nil-demo-brand">Designer Soul. Developer Brain.</div>
            <Prompt>READY TO EXECUTE</Prompt>
            <div style={{ display: 'flex', gap: 'var(--nil-spacing-md)', flexWrap: 'wrap', marginTop: 'var(--nil-spacing-md)' }}>
              <Meta label="Kit">NIL DS</Meta>
              <Meta label="Version">0.1</Meta>
              <Meta label="Accent" tone="accent">#1752eb</Meta>
              <Meta label="Status" tone="success">Active</Meta>
            </div>
            <div className="nil-demo-pagination">
              <span>1 / 4</span>
              <div className="nil-demo-pagination-dots" aria-hidden>
                <span className="nil-demo-pagination-dot is-active" />
                <span className="nil-demo-pagination-dot" />
                <span className="nil-demo-pagination-dot" />
                <span className="nil-demo-pagination-dot" />
              </div>
              <a href="#climate" className="nil-label" style={{ textDecoration: 'none', color: 'var(--nil-color-accent)' }}>
                Next →
              </a>
            </div>
          </div>
        </Stack>
      </div>
    </section>
  );
}
