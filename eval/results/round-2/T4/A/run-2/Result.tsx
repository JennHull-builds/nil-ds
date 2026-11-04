import { Grid, Heading, Meta, Panel, Readout } from '../src';

const sections = [
  {
    label: 'Workspace',
    links: [
      { name: 'Overview', href: '#overview', current: true },
      { name: 'Projects', href: '#projects' },
      { name: 'Reports', href: '#reports' },
    ],
  },
  {
    label: 'Account',
    links: [
      { name: 'Team', href: '#team' },
      { name: 'Billing', href: '#billing' },
      { name: 'Settings', href: '#settings' },
    ],
  },
];

const stats = [
  { label: 'Active users', value: '12,480', sublabel: '+4.2% vs last week' },
  { label: 'Revenue', value: '48.2', unit: 'k USD', sublabel: '+1.8% vs last week' },
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
      <aside
        style={{
          width: 240,
          flexShrink: 0,
          padding: 'var(--nil-spacing-lg) var(--nil-spacing-md)',
          background: 'var(--nil-color-surface)',
          borderRight: 'var(--nil-border-width) solid var(--nil-color-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--nil-spacing-lg)',
        }}
      >
        <Heading level={3}>Console</Heading>
        <nav aria-label="Primary" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--nil-spacing-lg)' }}>
          {sections.map((section) => (
            <div key={section.label}>
              <div
                id={`nav-${section.label}`}
                style={{
                  fontFamily: 'var(--nil-font-mono)',
                  fontSize: 'var(--nil-type-scale-xs)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--nil-color-text-muted)',
                  marginBottom: 'var(--nil-spacing-sm)',
                }}
              >
                {section.label}
              </div>
              <ul
                aria-labelledby={`nav-${section.label}`}
                style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 4 }}
              >
                {section.links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      aria-current={link.current ? 'page' : undefined}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--nil-spacing-sm)',
                        padding: 'var(--nil-spacing-xs) var(--nil-spacing-sm)',
                        textDecoration: 'none',
                        fontSize: 'var(--nil-type-scale-sm)',
                        fontWeight: link.current ? 700 : 500,
                        color: link.current ? 'var(--nil-color-accent-contrast)' : 'var(--nil-color-text)',
                        background: link.current ? 'var(--nil-color-accent)' : 'transparent',
                        border: 'var(--nil-border-width) solid',
                        borderColor: link.current ? 'var(--nil-color-border)' : 'transparent',
                        borderRadius: 'var(--nil-radius-default)',
                      }}
                    >
                      <span aria-hidden style={{ width: '1ch', fontFamily: 'var(--nil-font-mono)' }}>
                        {link.current ? '>' : ''}
                      </span>
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

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
        <header style={{ display: 'flex', flexDirection: 'column', gap: 'var(--nil-spacing-sm)' }}>
          <Heading level={1}>Overview</Heading>
          <Meta label="Updated" tone="success">
            just now
          </Meta>
        </header>
        <Grid columns={3}>
          {stats.map((stat) => (
            <Panel key={stat.label}>
              <Readout label={stat.label} value={stat.value} unit={stat.unit} sublabel={stat.sublabel} />
            </Panel>
          ))}
        </Grid>
      </main>
    </div>
  );
}
