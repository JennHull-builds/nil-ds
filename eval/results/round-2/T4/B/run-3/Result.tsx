import type { CSSProperties } from 'react';
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
      { label: 'Activity', href: '#activity' },
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

const linkBase: CSSProperties = {
  display: 'block',
  padding: 'var(--nil-spacing-sm) var(--nil-spacing-md)',
  borderRadius: 'var(--nil-radius-default)',
  border: 'var(--nil-border-width) solid transparent',
  fontFamily: 'var(--nil-font-body)',
  fontSize: 'var(--nil-type-scale-base)',
  textDecoration: 'none',
  color: 'var(--nil-color-text)',
};

const linkCurrent: CSSProperties = {
  ...linkBase,
  backgroundColor: 'var(--nil-color-accent)',
  borderColor: 'var(--nil-color-accent)',
  color: 'var(--nil-color-accent-contrast)',
  fontWeight: 700,
};

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
      <nav
        aria-label="Primary"
        style={{
          flex: '0 0 16em',
          boxSizing: 'border-box',
          padding: 'var(--nil-spacing-lg)',
          backgroundColor: 'var(--nil-color-surface)',
          borderRight: 'var(--nil-border-width) solid var(--nil-color-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--nil-spacing-xl)',
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
            <ul
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
                    style={item.current ? linkCurrent : linkBase}
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
          <Card>
            <Readout label="Active projects" value={24} sublabel="3 added this week" />
          </Card>
          <Card>
            <Readout label="Uptime" value="99.98" unit="%" sublabel="Last 30 days" />
          </Card>
          <Card>
            <Readout label="Avg. response" value={182} unit="ms" sublabel="Down 12 ms" />
          </Card>
        </Grid>
      </main>
    </div>
  );
}
