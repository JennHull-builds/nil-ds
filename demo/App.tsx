import { useState } from 'react';
import { Badge, Button, Card, Divider, Grid, Heading, Input, Text } from '../src';

/**
 * Not a Storybook install — a single page that renders every primitive so
 * they're visible without opening each component file. Storybook itself
 * stays a later plumbing step (see PLAN.md).
 */
export function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  return (
    <div
      data-theme={theme}
      style={{
        minHeight: '100vh',
        background: 'var(--semantic-color-bg)',
        color: 'var(--semantic-color-text)',
        padding: 'var(--semantic-spacing-2xl) var(--semantic-spacing-lg)',
      }}
    >
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 'var(--semantic-spacing-md)',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <Heading level={1}>NIL DS</Heading>
            <Text muted>
              Token + primitive kit, extracted from mothership-stable. Brutalist CLI lineage — see README.
            </Text>
          </div>
          <Button
            variant="secondary"
            onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
          >
            Switch to {theme === 'light' ? 'dark' : 'light'}
          </Button>
        </div>

        <Divider spacing="var(--semantic-spacing-2xl)" />

        <Heading level={2}>Buttons</Heading>
        <Text muted size="sm">Variants and sizes, all reading semantic tokens only.</Text>
        <div style={{ display: 'flex', gap: 'var(--semantic-spacing-sm)', flexWrap: 'wrap', marginTop: 'var(--semantic-spacing-md)' }}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="primary" size="sm">Primary sm</Button>
          <Button variant="primary" disabled>Disabled</Button>
        </div>

        <Divider />

        <Heading level={2}>Badges</Heading>
        <div style={{ display: 'flex', gap: 'var(--semantic-spacing-sm)', flexWrap: 'wrap', marginTop: 'var(--semantic-spacing-md)' }}>
          <Badge tone="neutral">Neutral</Badge>
          <Badge tone="accent">Accent</Badge>
          <Badge tone="danger">Danger</Badge>
          <Badge tone="success">Success</Badge>
        </div>

        <Divider />

        <Heading level={2}>Cards + Grid</Heading>
        <div style={{ marginTop: 'var(--semantic-spacing-md)' }}>
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

        <Heading level={2}>Input</Heading>
        <div style={{ maxWidth: 320, marginTop: 'var(--semantic-spacing-md)', display: 'flex', flexDirection: 'column', gap: 'var(--semantic-spacing-md)' }}>
          <Input label="Name" placeholder="Sid Vicious" />
          <Input label="Email" type="email" error="This field is required" />
        </div>

        <Divider spacing="var(--semantic-spacing-2xl)" />

        <Text size="sm" muted>
          Toggle the button above to check both themes — every colour here comes from
          <code style={{ margin: '0 4px' }}>src/tokens/tokens.css</code>, nothing hardcoded in this page.
        </Text>
      </div>
    </div>
  );
}
