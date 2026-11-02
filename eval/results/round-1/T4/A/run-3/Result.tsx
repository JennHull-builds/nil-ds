import { Card, Grid, Heading, Readout, Divider, Meta } from '../src';

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
      { label: 'Billing', href: '#billing' },
      { label: 'Team', href: '#team' },
      { label: 'Settings', href: '#settings' },
    ],
  },
];

const currentHref = '#overview';

const stats = [
  { label: 'Active users', value: '12,480', sublabel: '+4.2% vs last week' },
  { label: 'Revenue', value: '48.2', unit: 'k', sublabel: 'Month to date' },
  { label: 'Uptime', value: '99.98', unit: '%', sublabel: 'Last 30 days' },
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
          padding: 'var(--nil-spacing-lg) var(--nil-spacing-md)',
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
            {i > 0 && <Divider />}
            <div
              style={{
                fontFamily: 'var(--nil-font-mono)',
                fontSize: 'var(--nil-type-scale-xs)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--nil-color-text-muted)',
                margin: 'var(--nil-spacing-sm) 0',
              }}
            >
              {section.title}
            </div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 2 }}>
              {section.links.map((link) => {
                const current = link.href === currentHref;
                return (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      aria-current={current ? 'page' : undefined}
                      style={{
                        display: 'block',
                        padding: 'var(--nil-spacing-xs) var(--nil-spacing-sm)',
                        borderRadius: 'var(--nil-radius-default)',
                        textDecoration: 'none',
                        fontSize: 'var(--nil-type-scale-sm)',
                        fontWeight: current ? 700 : 400,
                        background: current ? 'var(--nil-color-text)' : 'transparent',
                        color: current ? 'var(--nil-color-bg)' : 'var(--nil-color-text)',
                        borderLeft: `4px solid ${current ? 'var(--nil-color-accent)' : 'transparent'}`,
                      }}
                    >
                      {link.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <main
        style={{
          flex: 1,
          minWidth: 0,
          padding: 'var(--nil-spacing-xl)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--nil-spacing-lg)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--nil-spacing-md)', flexWrap: 'wrap' }}>
          <Heading level={1}>Overview</Heading>
          <Meta label="Status" tone="success">Live</Meta>
        </div>
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
