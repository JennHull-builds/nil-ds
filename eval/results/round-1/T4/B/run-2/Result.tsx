import type { CSSProperties } from 'react';
import { Grid, Heading, Panel, Readout, Text } from '../src';

interface NavItem {
  label: string;
  href: string;
}

const sections: { title: string; items: NavItem[] }[] = [
  {
    title: 'Workspace',
    items: [
      { label: 'Overview', href: '#overview' },
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

const CURRENT = '#overview';

const stats = [
  { label: 'Active users', value: '1,284', sublabel: '+4.2% this week' },
  { label: 'Uptime', value: '99.97', unit: '%', sublabel: 'Last 30 days' },
  { label: 'Avg response', value: 142, unit: 'ms', sublabel: 'p50, last 24h' },
];

const linkStyle = (current: boolean): CSSProperties => ({
  display: 'block',
  padding: 'var(--nil-spacing-sm) var(--nil-spacing-md)',
  fontFamily: 'var(--nil-font-mono)',
  fontSize: 'var(--nil-type-scale-sm)',
  textDecoration: 'none',
  borderRadius: 'var(--nil-radius-default)',
  border: 'var(--nil-border-width) solid',
  borderColor: current ? 'var(--nil-color-border)' : 'transparent',
  borderLeft: current
    ? 'var(--nil-spacing-xs) solid var(--nil-color-accent)'
    : 'var(--nil-spacing-xs) solid transparent',
  background: current ? 'var(--nil-color-surface)' : 'transparent',
  color: current ? 'var(--nil-color-text)' : 'var(--nil-color-text-muted)',
  fontWeight: current ? 700 : 400,
});

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
          width: '16rem',
          flexShrink: 0,
          padding: 'var(--nil-spacing-lg)',
          borderRight: 'var(--nil-border-width) solid var(--nil-color-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--nil-spacing-lg)',
        }}
      >
        <Heading level={3}>NIL Console</Heading>
        <nav aria-label="Primary" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--nil-spacing-lg)' }}>
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
                {section.items.map((item) => {
                  const current = item.href === CURRENT;
                  return (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        aria-current={current ? 'page' : undefined}
                        style={linkStyle(current)}
                      >
                        {item.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <main
        style={{
          flex: 1,
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
            <Panel key={s.label}>
              <Readout label={s.label} value={s.value} unit={s.unit} sublabel={s.sublabel} />
            </Panel>
          ))}
        </Grid>
      </main>
    </div>
  );
}
