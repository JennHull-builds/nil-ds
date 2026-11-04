import { Grid, Heading, Readout, Text } from '../src';

/** Fixture: a clean T4 (app shell). One navigation landmark, the current page marked with aria-current. */
const SECTIONS = [
  { title: 'Workspace', links: ['Overview', 'Projects', 'Team'] },
  { title: 'Account', links: ['Billing', 'Settings'] },
];

export default function Result() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 4fr)',
        gap: 'var(--nil-spacing-lg)',
        color: 'var(--nil-color-text)',
        background: 'var(--nil-color-bg)',
      }}
    >
      <nav
        aria-label="Primary"
        style={{
          padding: 'var(--nil-spacing-md)',
          background: 'var(--nil-color-surface)',
          borderRight: 'var(--nil-border-width) solid var(--nil-color-border)',
          borderRadius: 'var(--nil-radius-default)',
        }}
      >
        {SECTIONS.map((section) => (
          <div key={section.title} style={{ marginBottom: 'var(--nil-spacing-md)' }}>
            <Text size="sm" muted id={`${section.title}-label`}>
              {section.title}
            </Text>
            <ul aria-labelledby={`${section.title}-label`} style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {section.links.map((link) => (
                <li key={link}>
                  <a
                    href={`#${link.toLowerCase()}`}
                    aria-current={link === 'Projects' ? 'page' : undefined}
                    style={{
                      display: 'block',
                      padding: 'var(--nil-spacing-xs) var(--nil-spacing-sm)',
                      color: 'var(--nil-color-text)',
                      borderLeft: link === 'Projects' ? 'var(--nil-border-width-thick) solid var(--nil-color-accent)' : 'var(--nil-border-width) solid transparent',
                    }}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <main style={{ padding: 'var(--nil-spacing-md)' }}>
        <Heading level={1}>Projects</Heading>
        <Grid columns={3}>
          <Readout label="Open" value={12} />
          <Readout label="Shipped" value={48} />
          <Readout label="Uptime" value={99} unit="%" />
        </Grid>
      </main>
    </div>
  );
}
