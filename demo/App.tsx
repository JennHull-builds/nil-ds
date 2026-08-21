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
              Token + primitive kit, extracted from mothership-stable. Brutalist CLI lineage — see README.
            </Text>
          </div>
          <ThemeToggle theme={theme} onThemeChange={setTheme} />
        </div>

        <Divider spacing="var(--nil-spacing-2xl)" />

        <Heading level={2}>Layout (core)</Heading>
        <Text muted size="sm">
          <code>.nil-container</code> + <code>.nil-grid</code> — 12-col / gutters / responsive collapse. Future{' '}
          <code>@nilds/core</code>.
        </Text>
        <div className="nil-grid" style={{ marginTop: 'var(--nil-spacing-md)' }}>
          <Card style={{ gridColumn: 'span 4' }}>
            <Text size="sm" muted>span 4</Text>
          </Card>
          <Card style={{ gridColumn: 'span 4' }}>
            <Text size="sm" muted>span 4</Text>
          </Card>
          <Card style={{ gridColumn: 'span 4' }}>
            <Text size="sm" muted>span 4</Text>
          </Card>
        </div>

        <Divider />

        <Heading level={2}>Motion</Heading>
        <Text muted size="sm">
          <code>.nil-grid-bg</code>, <code>.nil-cursor-blink</code>, <code>.nil-enter</code> — CLI extras in core.
        </Text>
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

        <Divider />

        <Heading level={2}>Lightbox</Heading>
        <Text muted size="sm">Controlled full-screen image viewer — Esc / backdrop / Close.</Text>
        <div style={{ marginTop: 'var(--nil-spacing-md)' }}>
          <Button variant="secondary" onClick={() => setLightbox(DEMO_LIGHTBOX)}>
            Open sample drawing
          </Button>
        </div>
        <Lightbox image={lightbox} onClose={() => setLightbox(null)} />

        <Divider />

        <Heading level={2}>Buttons</Heading>
        <Text muted size="sm">Variants and sizes, all reading --nil-* tokens only.</Text>
        <div style={{ display: 'flex', gap: 'var(--nil-spacing-sm)', flexWrap: 'wrap', marginTop: 'var(--nil-spacing-md)' }}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="primary" size="sm">Primary sm</Button>
          <Button variant="primary" disabled>Disabled</Button>
        </div>

        <Divider />

        <Heading level={2}>Badges</Heading>
        <div style={{ display: 'flex', gap: 'var(--nil-spacing-sm)', flexWrap: 'wrap', marginTop: 'var(--nil-spacing-md)' }}>
          <Badge tone="neutral">Neutral</Badge>
          <Badge tone="accent">Accent</Badge>
          <Badge tone="danger">Danger</Badge>
          <Badge tone="success">Success</Badge>
        </div>

        <Divider />

        <Heading level={2}>Cards + Grid</Heading>
        <div style={{ marginTop: 'var(--nil-spacing-md)' }}>
          <Grid columns={3}>
            <Card>
              <Heading level={3}>Real usage</Heading>
              <Text size="sm" muted>Every value here traces back to a token, not a magic number.</Text>
            </Card>
            <Card>
              <Heading level={3}>Second cell</Heading>
              <Text size="sm" muted>Grid is an equal-width column layout, extracted from BentoGrid.</Text>
            </Card>
            <Card>
              <Heading level={3}>Third cell</Heading>
              <Badge tone="accent">extracted</Badge>
            </Card>
          </Grid>
        </div>

        <Divider />

        <Heading level={2}>Meta</Heading>
        <Text muted size="sm">Bracket key-value tokens — CLI vocab Badge left behind. Compose for a strip.</Text>
        <div style={{ display: 'flex', gap: 'var(--nil-spacing-md)', flexWrap: 'wrap', marginTop: 'var(--nil-spacing-md)', alignItems: 'center' }}>
          <Meta label="Role">Design Engineer</Meta>
          <Meta label="Year">2024</Meta>
          <Meta label="Stack">React / Tokens</Meta>
          <Meta label="Status" tone="accent">Active</Meta>
        </div>

        <Divider />

        <Heading level={2}>Input</Heading>
        <div style={{ maxWidth: 320, marginTop: 'var(--nil-spacing-md)', display: 'flex', flexDirection: 'column', gap: 'var(--nil-spacing-md)' }}>
          <Input label="Name" placeholder="Sid Vicious" />
          <Input label="Email" type="email" error="This field is required" />
        </div>

        <Divider spacing="var(--nil-spacing-2xl)" />

        <Text size="sm" muted>
          Use the theme toggle above to check both themes — colours from{' '}
          <code>tokens.css</code>, layout + motion from <code>core.css</code>.
        </Text>
      </div>
    </div>
  );
}
