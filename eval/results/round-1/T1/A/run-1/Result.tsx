import { useState } from 'react';
import { Button, Heading, Input, Panel, Text, Toggle } from '../src';

const SETTINGS = [
  { key: 'push', label: 'Push notifications', description: 'Get alerts on your device as they happen.' },
  { key: 'digest', label: 'Weekly digest', description: 'A summary of activity sent every Monday.' },
  { key: 'product', label: 'Product updates', description: 'News about new features and improvements.' },
] as const;

type SettingKey = (typeof SETTINGS)[number]['key'];

export default function Result() {
  const [enabled, setEnabled] = useState<Record<SettingKey, boolean>>({
    push: true,
    digest: false,
    product: false,
  });
  const [email, setEmail] = useState('jenn@example');

  return (
    <Panel style={{ maxWidth: 520 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--nil-spacing-md)' }}>
        <Heading level={2}>Notifications</Heading>

        {SETTINGS.map(({ key, label, description }) => (
          <div
            key={key}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--nil-spacing-md)',
            }}
          >
            <div>
              <div id={`setting-${key}-label`} style={{ fontWeight: 600 }}>
                {label}
              </div>
              <Text size="sm" muted style={{ margin: 0 }}>
                {description}
              </Text>
            </div>
            <Toggle
              checked={enabled[key]}
              onCheckedChange={(v) => setEnabled((prev) => ({ ...prev, [key]: v }))}
              aria-labelledby={`setting-${key}-label`}
            />
          </div>
        ))}

        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error="Enter a valid email address"
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--nil-spacing-sm)' }}>
          <Button variant="ghost">Cancel</Button>
          <Button variant="primary">Save</Button>
        </div>
      </div>
    </Panel>
  );
}
