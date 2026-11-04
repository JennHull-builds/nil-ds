import { useState } from 'react';
import { Button, Heading, Input, Panel, Text, Toggle } from '../src';

const SETTINGS = [
  { key: 'push', label: 'Push notifications', description: 'Get alerts on your device as they happen.' },
  { key: 'digest', label: 'Weekly digest', description: 'Receive a summary of activity every Monday.' },
  { key: 'product', label: 'Product updates', description: 'Hear about new features and improvements.' },
] as const;

type SettingKey = (typeof SETTINGS)[number]['key'];

export default function Result() {
  const [enabled, setEnabled] = useState<Record<SettingKey, boolean>>({
    push: true,
    digest: false,
    product: false,
  });
  const [email, setEmail] = useState('jenn@');

  return (
    <Panel style={{ maxWidth: 480 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--nil-spacing-md)' }}>
        <Heading level={2}>Notifications</Heading>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--nil-spacing-md)' }}>
          {SETTINGS.map(({ key, label, description }) => (
            <div
              key={key}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 'var(--nil-spacing-md)',
              }}
            >
              <div>
                <Text id={`${key}-label`} style={{ fontWeight: 600, margin: 0 }}>
                  {label}
                </Text>
                <Text id={`${key}-desc`} size="sm" muted style={{ margin: 0 }}>
                  {description}
                </Text>
              </div>
              <Toggle
                checked={enabled[key]}
                onCheckedChange={(checked) => setEnabled((prev) => ({ ...prev, [key]: checked }))}
                aria-labelledby={`${key}-label`}
                aria-describedby={`${key}-desc`}
              />
            </div>
          ))}
        </div>

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
