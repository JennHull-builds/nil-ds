import { Badge, Card, Divider, Grid, Heading, Readout, Text } from '../src';

const sections = [
  {
    title: 'Workspace',
    links: ['Overview', 'Projects', 'Reports'],
  },
  {
    title: 'Account',
    links: ['Team', 'Billing', 'Settings'],
  },
];

const current = 'Overview';

const stats = [
  { label: 'Active users', value: '12,480', sublabel: '+4.2% vs last week' },
  { label: 'Revenue', value: '48.2', unit: 'k USD', sublabel: '+1.8% vs last week' },
  { label: 'Error rate', value: '0.12', unit: '%', sublabel: '-0.03% vs last week' },
];

export default function Result() {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: 'var(--nil-color-bg)',
        color: 'var(--nil-color-text)',
        fontFamily: 'var(--nil-font-body)',
      }}
    >
      <nav
        aria-label="Primary"
        style={{
          width: 240,
          flexShrink: 0,
          padding: 'var(--nil-spacing-lg)',
          background: 'var(--nil-color-surface)',
          borderRight: 'var(--nil-border-width) solid var(--nil-color-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--nil-spacing-lg)',
        }}
      >
        <Heading level={3}>Console</Heading>
        {sections.map((section, i) => (
          <div key={section.title}>
            {i > 0 ? <Divider /> : null}
            <div style={{ margin: 'var(--nil-spacing-sm) 0' }}>
              <span
                style={{
                  fontFamily: 'var(--nil-font-mono)',
                  fontSize: 'var(--nil-type-scale-xs)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--nil-color-text-muted)',
                }}
              >
                {section.title}
              </span>
            </div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {section.links.map((link) => {
                const active = link === current;
                return (
                  <li key={link}>
                    <a
                      href={`#${link.toLowerCase()}`}
                      aria-current={active ? 'page' : undefined}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 'var(--nil-spacing-xs) var(--nil-spacing-sm)',
                        borderRadius: 'var(--nil-radius-default)',
                        border: 'var(--nil-border-width) solid',
                        borderColor: active ? 'var(--nil-color-border)' : 'transparent',
                        background: active ? 'var(--nil-color-accent)' : 'transparent',
                        color: active ? 'var(--nil-color-accent-contrast)' : 'var(--nil-color-text)',
                        fontWeight: active ? 700 : 400,
                        textDecoration: 'none',
                      }}
                    >
                      {link}
                      {active ? <span aria-hidden>●</span> : null}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <main style={{ flex: 1, padding: 'var(--nil-spacing-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--nil-spacing-lg)' }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 'var(--nil-spacing-sm)' }}>
          <Heading level={1}>Overview</Heading>
          <Badge tone="success">Live</Badge>
        </header>
        <Text muted>A snapshot of how things are going this week.</Text>
        <Grid columns={3}>
          {stats.map((s) => (
            <Card key={s.label}>
              <Readout label={s.label} value={s.value} unit={s.unit} sublabel={s.sublabel} />
            </Card>
          ))}
        </Grid>
      </main>
    </div>
  );
}
