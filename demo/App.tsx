import { useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Divider,
  Grid,
  Heading,
  Input,
  Lightbox,
  Meta,
  Text,
  ThemeToggle,
  type LightboxImage,
  type Theme,
} from '../src';

/** Tiny diagram-like SVG so Lightbox has something to enlarge without assets. */
const DEMO_LIGHTBOX: LightboxImage = {
  src:
    'data:image/svg+xml,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
        <rect width="800" height="500" fill="#0a0a0a"/>
        <rect x="40" y="40" width="720" height="420" fill="none" stroke="#f5f5f4" stroke-width="2"/>
        <text x="60" y="100" fill="#f5f5f4" font-family="monospace" font-size="28">NIL DS / SPEC</text>
        <line x1="60" y1="140" x2="740" y2="140" stroke="#3b6ef5" stroke-width="2"/>
        <text x="60" y="200" fill="#8a8a8a" font-family="monospace" font-size="16">grid · tokens · lightbox</text>
        <rect x="60" y="240" width="200" height="160" fill="none" stroke="#d4d4d4" stroke-width="1"/>
        <rect x="300" y="240" width="200" height="160" fill="none" stroke="#d4d4d4" stroke-width="1"/>
        <rect x="540" y="240" width="200" height="160" fill="none" stroke="#d4d4d4" stroke-width="1"/>
      </svg>`,
    ),
  alt: 'Sample technical drawing for Lightbox demo',
};

const DEMO_SECTIONS = [
  { id: 'layout', label: 'Layout' },
  { id: 'motion', label: 'Motion' },
  { id: 'lightbox', label: 'Lightbox' },
  { id: 'buttons', label: 'Buttons' },
  { id: 'badges', label: 'Badges' },
  { id: 'cards', label: 'Cards' },
  { id: 'meta', label: 'Meta' },
  { id: 'input', label: 'Input' },
] as const;

function DemoSection({
  id,
  title,
  lede,
  children,
}: {
  id: string;
  title: string;
  lede?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <>
      <Divider spacing={id === 'layout' ? 'var(--nil-spacing-2xl)' : undefined} />
      <section id={id} style={{ scrollMarginTop: '4rem' }}>
        <Heading level={2}>{title}</Heading>
        {lede ? (
          <Text muted size="sm">
            {lede}
          </Text>
        ) : null}
        {children}
      </section>
    </>
  );
}

/**
 * Not a Storybook install — a single page that renders every primitive so
 * they're visible without opening each component file. Storybook itself
 * stays a later plumbing step (see PLAN.md).
 */
export function App() {
  const [theme, setTheme] = useState<Theme>('light');
  const [lightbox, setLightbox] = useState<LightboxImage | null>(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div data-theme={theme} style={{ minHeight: '100vh' }}>
      <div className="nil-container nil-section-y">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 'var(--nil-spacing-md)',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <Heading level={1}>
              NIL DS
              <span className="nil-cursor-blink" aria-hidden>
                _
              </span>
            </Heading>
            <Text muted>
              Machine-readable token primitives for agent-ready UI — brutalist CLI lineage, every
              value wired to <code>--nil-*</code> tokens.
            </Text>
          </div>
          <ThemeToggle theme={theme} onThemeChange={setTheme} />
        </div>

        <nav className="nil-demo-nav" aria-label="Demo sections">
          {DEMO_SECTIONS.map((section) => (
            <a key={section.id} href={`#${section.id}`}>
              {section.label}
            </a>
          ))}
        </nav>

        <DemoSection
          id="layout"
          title="Layout (core)"
          lede={
            <>
              <code>.nil-container</code> + <code>.nil-grid</code> — 12-col / gutters / responsive
              collapse. Future <code>@nilds/core</code>.
            </>
          }
        >
          <div className="nil-grid" style={{ marginTop: 'var(--nil-spacing-md)' }}>
            <Card style={{ gridColumn: 'span 4' }}>
              <Text size="sm" muted>
                span 4
              </Text>
            </Card>
            <Card style={{ gridColumn: 'span 4' }}>
              <Text size="sm" muted>
                span 4
              </Text>
            </Card>
            <Card style={{ gridColumn: 'span 4' }}>
              <Text size="sm" muted>
                span 4
              </Text>
            </Card>
          </div>
        </DemoSection>

        <DemoSection
          id="motion"
          title="Motion"
          lede={
            <>
              <code>.nil-grid-bg</code>, <code>.nil-cursor-blink</code>, <code>.nil-enter</code> —
              CLI extras in core.
            </>
          }
        >
          <div
            className={`nil-enter${entered ? ' is-visible' : ''}`}
            style={{ marginTop: 'var(--nil-spacing-md)', maxWidth: 420 }}
          >
            <Card className="nil-grid-bg">
              <Text size="sm">
                Hatch surface + enter fade
                <span className="nil-cursor-blink" aria-hidden>
                  ▌
                </span>
              </Text>
            </Card>
          </div>
        </DemoSection>

        <DemoSection
          id="lightbox"
          title="Lightbox"
          lede="Controlled full-screen image viewer — Esc / backdrop / Close."
        >
          <div style={{ marginTop: 'var(--nil-spacing-md)' }}>
            <Button variant="secondary" onClick={() => setLightbox(DEMO_LIGHTBOX)}>
              Open sample drawing
            </Button>
          </div>
          <Lightbox image={lightbox} onClose={() => setLightbox(null)} />
        </DemoSection>

        <DemoSection
          id="buttons"
          title="Buttons"
          lede="Variants and sizes, all reading --nil-* tokens only."
        >
          <div
            style={{
              display: 'flex',
              gap: 'var(--nil-spacing-sm)',
              flexWrap: 'wrap',
              marginTop: 'var(--nil-spacing-md)',
            }}
          >
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="primary" size="sm">
              Primary sm
            </Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
          </div>
        </DemoSection>

        <DemoSection id="badges" title="Badges">
          <div
            style={{
              display: 'flex',
              gap: 'var(--nil-spacing-sm)',
              flexWrap: 'wrap',
              marginTop: 'var(--nil-spacing-md)',
            }}
          >
            <Badge tone="neutral">Neutral</Badge>
            <Badge tone="accent">Accent</Badge>
            <Badge tone="danger">Danger</Badge>
            <Badge tone="success">Success</Badge>
          </div>
        </DemoSection>

        <DemoSection id="cards" title="Cards + Grid">
          <div style={{ marginTop: 'var(--nil-spacing-md)' }}>
            <Grid columns={3}>
              <Card>
                <Heading level={3}>Token-backed cell</Heading>
                <Text size="sm" muted>
                  Every value traces back to a token — no magic numbers in consumer code.
                </Text>
              </Card>
              <Card>
                <Heading level={3}>Equal-width grid</Heading>
                <Text size="sm" muted>
                  Responsive column layout — collapses to a single stack on narrow viewports.
                </Text>
              </Card>
              <Card>
                <Heading level={3}>Composable primitive</Heading>
                <Badge tone="accent">extracted</Badge>
              </Card>
            </Grid>
          </div>
        </DemoSection>

        <DemoSection
          id="meta"
          title="Meta"
          lede="Bracket key-value tokens — CLI vocab Badge left behind. Compose for a strip."
        >
          <div
            style={{
              display: 'flex',
              gap: 'var(--nil-spacing-md)',
              flexWrap: 'wrap',
              marginTop: 'var(--nil-spacing-md)',
              alignItems: 'center',
            }}
          >
            <Meta label="Role">Design Engineer</Meta>
            <Meta label="Year">2024</Meta>
            <Meta label="Stack">React / Tokens</Meta>
            <Meta label="Status" tone="accent">
              Active
            </Meta>
          </div>
        </DemoSection>

        <DemoSection id="input" title="Input">
          <div
            style={{
              maxWidth: 320,
              marginTop: 'var(--nil-spacing-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--nil-spacing-md)',
            }}
          >
            <Input label="Name" placeholder="Your name" />
            <Input label="Email" type="email" error="This field is required" />
          </div>
        </DemoSection>

        <Divider spacing="var(--nil-spacing-2xl)" />

        <Text size="sm" muted>
          Use the theme toggle above to check both themes — colours from <code>tokens.css</code>,
          layout + motion from <code>core.css</code>.
        </Text>
      </div>
    </div>
  );
}
