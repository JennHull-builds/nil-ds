import { useState } from 'react';
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
  type LightboxImage,
} from '../../src';
import { useReveal } from '../hooks/useReveal';
import { DemoScene } from '../DemoScene';

const DEMO_LIGHTBOX: LightboxImage = {
  src:
    'data:image/svg+xml,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
        <rect width="800" height="500" fill="#0a0a0a"/>
        <rect x="40" y="40" width="720" height="420" fill="none" stroke="#f5f5f4" stroke-width="2"/>
        <text x="60" y="100" fill="#f5f5f4" font-family="monospace" font-size="28">NIL DS / SPEC</text>
        <line x1="60" y1="140" x2="740" y2="140" stroke="#1752eb" stroke-width="2"/>
      </svg>`,
    ),
  alt: 'Sample technical drawing',
};

export function GalleryScene() {
  const { ref, visible } = useReveal();
  const [lightbox, setLightbox] = useState<LightboxImage | null>(null);

  return (
    <DemoScene id="gallery" ref={ref}>
      <div className={`nil-enter${visible ? ' is-visible' : ''}`}>
        <Heading level={2}>Gallery</Heading>
        <Text muted>Every primitive state — appendix for auditors.</Text>
      </div>

      <div className={`nil-demo-gallery-grid nil-enter${visible ? ' is-visible' : ''}`} style={{ marginTop: 'var(--nil-spacing-lg)' }}>
        <Card>
          <Heading level={3}>Buttons</Heading>
          <div style={{ display: 'flex', gap: 'var(--nil-spacing-sm)', flexWrap: 'wrap', marginTop: 'var(--nil-spacing-sm)' }}>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="bracket">Run query</Button>
            <Button variant="primary" disabled>Disabled</Button>
          </div>
        </Card>

        <Card>
          <Heading level={3}>Badges</Heading>
          <div style={{ display: 'flex', gap: 'var(--nil-spacing-sm)', flexWrap: 'wrap', marginTop: 'var(--nil-spacing-sm)' }}>
            <Badge tone="neutral">Neutral</Badge>
            <Badge tone="accent">Accent</Badge>
            <Badge tone="danger">Danger</Badge>
            <Badge tone="success">Success</Badge>
          </div>
        </Card>

        <Card>
          <Heading level={3}>Meta</Heading>
          <div style={{ display: 'flex', gap: 'var(--nil-spacing-md)', flexWrap: 'wrap', marginTop: 'var(--nil-spacing-sm)' }}>
            <Meta label="Role">Design Engineer</Meta>
            <Meta label="Status" tone="accent">Active</Meta>
          </div>
        </Card>

        <Card>
          <Heading level={3}>Input</Heading>
          <div style={{ marginTop: 'var(--nil-spacing-sm)' }}>
            <Input label="Name" placeholder="Your name" />
          </div>
        </Card>

        <Card>
          <Heading level={3}>Grid</Heading>
          <div style={{ marginTop: 'var(--nil-spacing-sm)' }}>
            <Grid columns={2}>
              <Text size="sm" muted>Cell A</Text>
              <Text size="sm" muted>Cell B</Text>
            </Grid>
          </div>
        </Card>

        <Card>
          <Heading level={3}>Lightbox</Heading>
          <Button variant="secondary" style={{ marginTop: 'var(--nil-spacing-sm)' }} onClick={() => setLightbox(DEMO_LIGHTBOX)}>
            Open sample
          </Button>
        </Card>
      </div>

      <Divider spacing="var(--nil-spacing-xl)" />
      <Text size="sm" muted>
        Motion: <code>.nil-grid-bg</code>, <code>.nil-cursor-blink</code>, <code>.nil-enter</code> — see scenes above.
      </Text>

      <Lightbox image={lightbox} onClose={() => setLightbox(null)} />
    </DemoScene>
  );
}
