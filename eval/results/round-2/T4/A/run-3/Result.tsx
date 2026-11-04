import { Badge, Card, Grid, Heading, Readout, Text } from '../src';

const sections = [
  {
    title: 'Workspace',
    links: [
      { label: 'Overview', href: '#overview' },
      { label: 'Projects', href: '#projects' },
      { label: 'Activity', href: '#activity' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Team', href: '#team' },
      { label: 'Billing', href: '#billing' },
      { label: 'Settings', href: '#settings' },
    ],
  },
];

const currentHref = '#overview';

const stats = [
  { label: 'Active users', value: '12,480', sublabel: '+4.2% vs last week' },
  { label: 'Uptime', value: '99.98', unit: '%', sublabel: 'Last 30 days' },
  { label: 'Avg. response', value: 182, unit: 'ms', sublabel: 'p50 across regions' },
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
          boxSizing: 'border-box',
          padding: 'var(--nil-spacing-lg)',
          background: 'var(--nil-color-surface)',
          borderRight: 'var(--nil-border-width) solid var(--nil-color-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--nil-spacing-lg)',
        }}
      >
        {sections.map((section) => (
          <section key={section.title} aria-labelledby={`nav-${section.title}`}>
            <div
              id={`nav-${section.title}`}
              style={{
                fontFamily: 'var(--nil-font-mono)',
                fontSize: 'var(--nil-type-scale-xs)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--nil-color-text-muted)',
                marginBottom: 'var(--nil-spacing-sm)',
              }}
            >
              {section.title}
            </div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {section.links.map((link) => {
                const current = link.href === currentHref;
                return (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      aria-current={current ? 'page' : undefined}
                      style={{
                        display: 'block',
                        padding: 'var(--nil-spacing-sm) var(--nil-spacing-md)',
                        textDecoration: 'none',
                        fontSize: 'var(--nil-type-scale-sm)',
                        fontWeight: current ? 700 : 400,
                        color: current ? 'var(--nil-color-accent)' : 'var(--nil-color-text)',
                        background: current ? 'var(--nil-color-bg)' : 'transparent',
                        border: `var(--nil-border-width) solid ${current ? 'var(--nil-color-accent)' : 'transparent'}`,
                        borderRadius: 'var(--nil-radius-default)',
                      }}
                    >
                      {current ? '> ' : ''}
                      {link.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </nav>

      <main style={{ flex: 1, minWidth: 0, padding: 'var(--nil-spacing-xl)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--nil-spacing-md)', marginBottom: 'var(--nil-spacing-xs)' }}>
          <Heading level={1}>Overview</Heading>
          <Badge>Live</Badge>
        </div>
        <Text muted style={{ marginBottom: 'var(--nil-spacing-lg)' }}>
          A snapshot of how things are going.
        </Text>
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
