import { useState } from 'react';
import { Button, Heading, Input, Text, Toggle } from '../src';

/** Fixture: a clean T1 (settings panel). Toggles are named and described, the email Input shows its error. */
const SETTINGS = [
  { id: 'mentions', label: 'Mentions', hint: 'Tell me when someone mentions me.' },
  { id: 'digest', label: 'Weekly digest', hint: 'Send a summary every Monday.' },
  { id: 'security', label: 'Security alerts', hint: 'Warn me about new sign-ins.' },
] as const;

export default function Result() {
  const [on, setOn] = useState<Record<string, boolean>>({ mentions: true, digest: false, security: true });

  return (
    <section
      aria-labelledby="notifications-title"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--nil-spacing-md)',
        padding: 'var(--nil-spacing-lg)',
        background: 'var(--nil-color-surface)',
        color: 'var(--nil-color-text)',
        border: 'var(--nil-border-width) solid var(--nil-color-border)',
        borderRadius: 'var(--nil-radius-default)',
      }}
    >
      <Heading level={2} id="notifications-title">
        Notifications
      </Heading>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--nil-spacing-sm)' }}>
        {SETTINGS.map((s) => (
          <li key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--nil-spacing-md)' }}>
            <div>
              <span id={`${s.id}-label`}>{s.label}</span>
              <Text size="sm" muted id={`${s.id}-hint`}>
                {s.hint}
              </Text>
            </div>
            <Toggle
              checked={on[s.id]}
              onCheckedChange={(next) => setOn((prev) => ({ ...prev, [s.id]: next }))}
              aria-labelledby={`${s.id}-label`}
              aria-describedby={`${s.id}-hint`}
            />
          </li>
        ))}
      </ul>
      <Input label="Email address" type="email" defaultValue="jen@" error="Enter a valid email address" />
      <div style={{ display: 'flex', gap: 'var(--nil-spacing-sm)' }}>
        <Button variant="primary">Save</Button>
        <Button variant="ghost">Cancel</Button>
      </div>
    </section>
  );
}
