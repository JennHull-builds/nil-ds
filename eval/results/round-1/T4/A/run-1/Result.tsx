import { Card, Grid, Heading, Readout } from '../src';

interface NavItem {
  label: string;
  href: string;
  current?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

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
  { label: 'Active users', value: '12,480', sublabel: '+4.2% vs last week' },
  { label: 'Revenue', value: '$48.2', unit: 'k', sublabel: '+1.8% vs last week' },
  { label: 'Uptime', value: '99.98', unit: '%', sublabel: 'Last 30 days' },
];

function NavLink({ label, href, current }: NavItem) {
  return (
    <a
      href={href}
      aria-current={current ? 'page' : undefined}
      style={{
        display: 'block',
        padding: 'var(--nil-spacing-sm) var(--nil-spacing-md)',
        fontFamily: 'var(--nil-font-body)',
        fontSize: 'var(--nil-type-scale-sm)',
        fontWeight: current ? 700 : 400,
        textDecoration: 'none',
        borderRadius: 'var(--nil-radius-default)',
        border: 'var(--nil-border-width) solid',
        borderColor: current ? 'var(--nil-color-border)' : 'transparent',
        borderLeft: current
          ? '4px solid var(--nil-color-accent)'
          : '4px solid transparent',
        background: current ? 'var(--nil-color-bg)' : 'transparent',
        color: current ? 'var(--nil-color-text)' : 'var(--nil-color-text-muted)',
      }}
    >
      {label}
    </a>
  );
}

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
                  <NavLink {...item} />
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
        <Heading level={1}>Overview</Heading>
        <Grid columns={3}>
          {stats.map((s) => (
            <Card key={s.label}>
              <Readout
                label={s.label}
                value={s.value}
                unit={s.unit}
                sublabel={s.sublabel}
              />
            </Card>
          ))}
        </Grid>
      </main>
    </div>
  );
}
