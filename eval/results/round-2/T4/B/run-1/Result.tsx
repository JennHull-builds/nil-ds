import type { CSSProperties } from 'react';
import { Card, Grid, Heading, Readout, Text } from '../src';

const sections = [
  {
    title: 'Workspace',
    links: [
      { label: 'Overview', href: '#overview', current: true },
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

const stats = [
  { label: 'Active projects', value: 24, sublabel: '3 added this week' },
  { label: 'Uptime', value: '99.9', unit: '%', sublabel: 'Last 30 days' },
  { label: 'Open issues', value: 12, sublabel: '2 need review' },
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
  backgroundColor: current ? 'var(--nil-color-text)' : 'transparent',
  color: current ? 'var(--nil-color-bg)' : 'var(--nil-color-text)',
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
      <nav
        aria-label="Main"
        style={{
          flex: '0 0 auto',
          width: 'calc(var(--nil-spacing-2xl) * 5)',
          boxSizing: 'border-box',
          padding: 'var(--nil-spacing-lg)',
          backgroundColor: 'var(--nil-color-surface)',
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
              {section.links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    aria-current={link.current ? 'page' : undefined}
                    style={linkStyle(!!link.current)}
                  >
                    {link.label}
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
          <Text muted>A snapshot of your workspace.</Text>
        </header>
        <Grid>
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
