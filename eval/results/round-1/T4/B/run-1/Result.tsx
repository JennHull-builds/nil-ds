import type { CSSProperties } from 'react';
import { Card, Grid, Heading, Text, Readout } from '../src';

interface NavItem {
  label: string;
  href: string;
  current?: boolean;
}

const sections: { title: string; items: NavItem[] }[] = [
  {
    title: 'Workspace',
    items: [
      { label: 'Overview', href: '#overview', current: true },
      { label: 'Activity', href: '#activity' },
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
  { label: 'Active users', value: '1,284', sublabel: '+12% this week' },
  { label: 'Uptime', value: '99.9', unit: '%', sublabel: 'Last 30 days' },
  { label: 'Avg response', value: '182', unit: 'ms', sublabel: 'p50, all regions' },
];

const sectionTitle: CSSProperties = {
  fontFamily: 'var(--nil-font-mono)',
  fontSize: 'var(--nil-type-scale-xs)',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--nil-color-text-muted)',
  margin: 0,
  marginBottom: 'var(--nil-spacing-sm)',
};

function linkStyle(current: boolean): CSSProperties {
  return {
    display: 'block',
    padding: 'var(--nil-spacing-sm) var(--nil-spacing-md)',
    fontFamily: 'var(--nil-font-mono)',
    fontSize: 'var(--nil-type-scale-sm)',
    textDecoration: 'none',
    color: 'var(--nil-color-text)',
    fontWeight: current ? 700 : 400,
    backgroundColor: current ? 'var(--nil-color-bg)' : 'transparent',
    borderLeft: `var(--nil-border-width-thick) solid ${
      current ? 'var(--nil-color-accent)' : 'transparent'
    }`,
  };
}

export default function Result() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'calc(var(--nil-spacing-xl) * 5) 1fr',
        minHeight: '100vh',
        backgroundColor: 'var(--nil-color-bg)',
        color: 'var(--nil-color-text)',
        fontFamily: 'var(--nil-font-body)',
      }}
    >
      <nav
        aria-label="Primary"
        style={{
          backgroundColor: 'var(--nil-color-surface)',
          borderRight: 'var(--nil-border-width) solid var(--nil-color-border)',
          padding: 'var(--nil-spacing-lg) var(--nil-spacing-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--nil-spacing-lg)',
        }}
      >
        {sections.map((section) => (
          <section key={section.title} aria-labelledby={`nav-${section.title}`}>
            <h2 id={`nav-${section.title}`} style={sectionTitle}>
              {section.title}
            </h2>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {section.items.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    aria-current={item.current ? 'page' : undefined}
                    style={linkStyle(Boolean(item.current))}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </nav>

      <main
        style={{
          padding: 'var(--nil-spacing-xl)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--nil-spacing-lg)',
        }}
      >
        <header>
          <Heading level={1}>Overview</Heading>
          <Text muted>Key numbers at a glance.</Text>
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
