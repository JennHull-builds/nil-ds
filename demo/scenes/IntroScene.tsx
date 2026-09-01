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
import { DemoScene } from '../DemoScene';

export function IntroScene({
  theme,
  onThemeChange,
  band,
  scenes,
}: {
  theme: Theme;
  onThemeChange: (t: Theme) => void;
  band?: boolean;
  scenes: readonly { id: string; label: string }[];
}) {
  const { ref, visible } = useReveal();

  return (
    <DemoScene
      id="intro"
      band={band}
      gridBg={false}
      ref={ref}
      afterContainer={
        <>
          <div className="nil-demo-nav-bar">
            <div className="nil-container">
              <nav className="nil-demo-nav" aria-label="Showroom scenes">
                {scenes.map((scene) => (
                  <a key={scene.id} href={`#${scene.id}`}>
                    {scene.label}
                  </a>
                ))}
              </nav>
            </div>
          </div>

          <div className="nil-demo-intro-hero nil-grid-bg">
            <div className="nil-container">
              <div
                className={`nil-enter${visible ? ' is-visible' : ''}`}
                style={{ ['--nil-anim-delay' as string]: '120ms' }}
              >
                <Stack depth={3}>
                  <div className="nil-demo-hero-inner">
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
                      <a href="#climate" className="nil-label nil-label--accent" style={{ textDecoration: 'none' }}>
                        Next →
                      </a>
                    </div>
                  </div>
                </Stack>
              </div>
            </div>
          </div>
        </>
      }
    >
      <div className="nil-demo-intro-head">
        <div
          className={`nil-enter${visible ? ' is-visible' : ''}`}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--nil-spacing-md)', flexWrap: 'wrap' }}
        >
          <div>
            <Heading level={1}>
              NIL DS
              <span className="nil-cursor-blink" aria-hidden>_</span>
            </Heading>
            <Text muted>Machine-readable token primitives. Agent-ready UI infrastructure.</Text>
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
      </div>
    </DemoScene>
  );
}
