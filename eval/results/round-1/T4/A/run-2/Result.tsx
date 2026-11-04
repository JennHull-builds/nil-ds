import { Card, Grid, Heading, Readout, Text } from '../src';

type NavItem = { label: string; href: string; current?: boolean };
type NavSection = { title: string; items: NavItem[] };

const sections: NavSection[] = [
  {
    title: 'Workspace',
    items: [
      { label: 'Overview', href: '#overview', current: true },
      { label: 'Projects', href: '#projects' },
      { label: 'Reports', href: '#reports' },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Team', href: '#team' },
      { label: 'Billing', href: '#billing' },
      { label: 'Settings', href: '#settings' },
    ],
  },
];

const stats = [
  { label: 'Active users', value: '12,480', sublabel: '+4.2% from last week' },
  { label: 'Revenue', value: '48.2', unit: 'k', sublabel: 'USD, this month' },
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
          padding: 'var(--nil-spacing-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--nil-spacing-lg)',
          background: 'var(--nil-color-surface)',
          borderRight: 'var(--nil-border-width) solid var(--nil-color-border)',
        }}
      >
        <Heading level={3}>Acme</Heading>
        {sections.map((section) => (
          <div key={section.title}>
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
            <ul
              aria-labelledby={`nav-${section.title}`}
              style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--nil-spacing-xs)',
              }}
            >
              {section.items.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    aria-current={item.current ? 'page' : undefined}
                    style={{
                      display: 'block',
                      padding: 'var(--nil-spacing-sm) var(--nil-spacing-md)',
                      borderRadius: 'var(--nil-radius-default)',
                      textDecoration: 'none',
                      fontWeight: item.current ? 700 : 400,
                      background: item.current ? 'var(--nil-color-accent)' : 'transparent',
                      color: item.current
                        ? 'var(--nil-color-accent-contrast)'
                        : 'var(--nil-color-text)',
                    }}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
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
        <header>
          <Heading level={1}>Overview</Heading>
          <Text>A snapshot of how things are going.</Text>
        </header>
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
