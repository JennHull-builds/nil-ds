import type { CSSProperties } from 'react';
import { Card, Grid, Heading, Readout, Text } from '../src';

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
      { label: 'Reports', href: '#reports' },
      { label: 'Schedules', href: '#schedules' },
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
  { label: 'Active devices', value: 128, sublabel: '+6 this week' },
  { label: 'Uptime', value: 99.9, unit: '%', sublabel: 'Last 30 days' },
  { label: 'Open alerts', value: 3, sublabel: '1 critical' },
];

const linkStyle = (current: boolean): CSSProperties => ({
  display: 'block',
  padding: 'var(--nil-spacing-sm) var(--nil-spacing-md)',
  fontFamily: 'var(--nil-font-mono)',
  fontSize: 'var(--nil-type-scale-sm)',
  textDecoration: 'none',
  color: current ? 'var(--nil-color-accent-contrast)' : 'var(--nil-color-text)',
  backgroundColor: current ? 'var(--nil-color-accent)' : 'transparent',
  fontWeight: current ? 700 : 400,
  borderRadius: 'var(--nil-radius-default)',
});

export default function Result() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'max-content 1fr',
        minHeight: '100vh',
        backgroundColor: 'var(--nil-color-bg)',
        color: 'var(--nil-color-text)',
        fontFamily: 'var(--nil-font-body)',
      }}
    >
      <nav
        aria-label="Primary"
        style={{
          padding: 'var(--nil-spacing-lg)',
          paddingRight: 'var(--nil-spacing-2xl)',
          borderRight: 'var(--nil-border-width) solid var(--nil-color-border)',
          backgroundColor: 'var(--nil-color-surface)',
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
                paddingLeft: 'var(--nil-spacing-md)',
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
                    style={linkStyle(Boolean(item.current))}
                  >
                    {item.current ? '> ' : ''}
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <main style={{ padding: 'var(--nil-spacing-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--nil-spacing-lg)' }}>
        <header>
          <Heading level={1}>Overview</Heading>
          <Text muted>A snapshot of your workspace.</Text>
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
