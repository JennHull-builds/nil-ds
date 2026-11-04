import { useState } from 'react';
import { Button, Heading, Input, Panel, Text, Toggle } from '../src';

const SETTINGS = [
  { key: 'product', label: 'Product updates', description: 'News about new features and improvements.' },
  { key: 'security', label: 'Security alerts', description: 'Get notified about sign-ins and account changes.' },
  { key: 'digest', label: 'Weekly digest', description: 'A summary of your activity every Monday.' },
] as const;

type SettingKey = (typeof SETTINGS)[number]['key'];

export default function Result() {
  const [enabled, setEnabled] = useState<Record<SettingKey, boolean>>({
    product: true,
    security: true,
    digest: false,
  });
  const [email, setEmail] = useState('jenn@');

  return (
    <Panel style={{ maxWidth: 520 }}>
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
                <div id={`setting-${key}-label`} style={{ fontWeight: 600, color: 'var(--nil-color-text)' }}>
                  {label}
                </div>
                <Text size="sm" muted id={`setting-${key}-desc`}>
                  {description}
                </Text>
              </div>
              <Toggle
                checked={enabled[key]}
                onCheckedChange={(v) => setEnabled((prev) => ({ ...prev, [key]: v }))}
                aria-labelledby={`setting-${key}-label`}
                aria-describedby={`setting-${key}-desc`}
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
