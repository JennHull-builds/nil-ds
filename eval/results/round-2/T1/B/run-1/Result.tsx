import { useState } from 'react';
import { Button, Divider, Heading, Input, Panel, Text, Toggle } from '../src';

const SETTINGS = [
  { key: 'product', label: 'Product updates', description: 'News about new features and improvements.' },
  { key: 'security', label: 'Security alerts', description: 'Get notified about sign-ins and password changes.' },
  { key: 'digest', label: 'Weekly digest', description: 'A summary of your activity every Monday.' },
] as const;

type SettingKey = (typeof SETTINGS)[number]['key'];

export default function Result() {
  const [values, setValues] = useState<Record<SettingKey, boolean>>({
    product: true,
    security: true,
    digest: false,
  });
  const [email, setEmail] = useState('');

  return (
    <Panel style={{ maxWidth: 480 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--nil-spacing-md)' }}>
        <Heading level={2}>Notifications</Heading>

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
              <Text id={`setting-${key}-label`} style={{ fontWeight: 600, margin: 0 }}>
                {label}
              </Text>
              <Text size="sm" muted style={{ margin: 0 }}>
                {description}
              </Text>
            </div>
            <Toggle
              aria-labelledby={`setting-${key}-label`}
              checked={values[key]}
              onCheckedChange={(checked) => setValues((v) => ({ ...v, [key]: checked }))}
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
          <Button variant="secondary">Cancel</Button>
          <Button variant="primary">Save</Button>
        </div>
      </div>
    </Panel>
  );
}
