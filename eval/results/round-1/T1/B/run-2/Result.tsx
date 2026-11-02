import { useState } from 'react';
import { Button, Divider, Heading, Input, Panel, Text, Toggle } from '../src';

const SETTINGS = [
  { id: 'product-updates', label: 'Product updates', description: 'News about new features and releases.' },
  { id: 'security-alerts', label: 'Security alerts', description: 'Get notified about sign-ins and account changes.' },
  { id: 'weekly-digest', label: 'Weekly digest', description: 'A summary of your activity every Monday.' },
] as const;

export default function Result() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    'product-updates': true,
    'security-alerts': true,
    'weekly-digest': false,
  });
  const [email, setEmail] = useState('not-an-email');

  return (
    <Panel style={{ maxWidth: '32rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--nil-spacing-md)' }}>
        <Heading level={2}>Notifications</Heading>

        {SETTINGS.map((s) => (
          <div
            key={s.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 'var(--nil-spacing-md)',
            }}
          >
            <div>
              <div id={`${s.id}-label`} style={{ color: 'var(--nil-color-text)', fontWeight: 600 }}>
                {s.label}
              </div>
              <Text size="sm" muted id={`${s.id}-desc`}>
                {s.description}
              </Text>
            </div>
            <Toggle
              checked={enabled[s.id]}
              onCheckedChange={(v) => setEnabled((prev) => ({ ...prev, [s.id]: v }))}
              aria-labelledby={`${s.id}-label`}
              aria-describedby={`${s.id}-desc`}
            />
          </div>
        ))}

        <Divider />

        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error="Enter a valid email address"
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--nil-spacing-sm)' }}>
          <Button variant="secondary" type="button">
            Cancel
          </Button>
          <Button variant="primary" type="button">
            Save
          </Button>
        </div>
      </div>
    </Panel>
  );
}
