import type { CSSProperties } from 'react';
import { Card, Heading, Readout, Text } from '../src';

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
      { label: 'Schedules', href: '#schedules' },
      { label: 'Devices', href: '#devices' },
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
  { label: 'Active devices', value: 128, sublabel: '12 added this week' },
  { label: 'Uptime', value: 99.9, unit: '%', sublabel: 'Last 30 days' },
  { label: 'Alerts', value: 3, sublabel: 'Awaiting review' },
];

const linkStyle = (current: boolean): CSSProperties => ({
  display: 'block',
  padding: 'var(--nil-spacing-sm) var(--nil-spacing-md)',
  fontFamily: 'var(--nil-font-mono)',
  fontSize: 'var(--nil-type-scale-sm)',
  textDecoration: 'none',
  borderRadius: 'var(--nil-radius-default)',
  border: 'var(--nil-border-width) solid',
  borderColor: current ? 'var(--nil-color-accent)' : 'transparent',
  backgroundColor: current ? 'var(--nil-color-accent)' : 'transparent',
  color: current ? 'var(--nil-color-accent-contrast)' : 'var(--nil-color-text)',
  fontWeight: current ? 700 : 400,
});

export default function Result() {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'var(--nil-color-bg)',
        color: 'var(--nil-color-text)',
        fontFamily: 'var(--nil-font-body)',
      }}
    >
      <aside
        style={{
          width: 'calc(var(--nil-spacing-2xl) * 5)',
          flexShrink: 0,
          backgroundColor: 'var(--nil-color-surface)',
          borderRight: 'var(--nil-border-width) solid var(--nil-color-border)',
          padding: 'var(--nil-spacing-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--nil-spacing-xl)',
        }}
      >
        <Heading level={3}>NIL Console</Heading>
        <nav
          aria-label="Primary"
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--nil-spacing-lg)' }}
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
          <Text muted>Fleet health at a glance.</Text>
        </header>
        <section
          aria-label="Key stats"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(calc(var(--nil-spacing-2xl) * 4), 1fr))',
            gap: 'var(--nil-spacing-md)',
          }}
        >
          {stats.map((s) => (
            <Card key={s.label} padding="var(--nil-spacing-lg)">
              <Readout label={s.label} value={s.value} unit={s.unit} sublabel={s.sublabel} />
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
}
