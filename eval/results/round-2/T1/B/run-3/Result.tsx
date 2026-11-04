import { useState } from 'react';
import { Button, Divider, Heading, Input, Panel, Text, Toggle } from '../src';

const SETTINGS = [
  { key: 'product', label: 'Product updates', description: 'News about new features and improvements.' },
  { key: 'security', label: 'Security alerts', description: 'Get notified about sign-ins from new devices.' },
  { key: 'digest', label: 'Weekly digest', description: 'A summary of your activity every Monday.' },
] as const;

type SettingKey = (typeof SETTINGS)[number]['key'];

export default function Result() {
  const [enabled, setEnabled] = useState<Record<SettingKey, boolean>>({
    product: true,
    security: true,
    digest: false,
  });

  return (
    <Panel>
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
                <Text id={`setting-${key}-label`} style={{ margin: 0 }}>
                  {label}
                </Text>
                <Text size="sm" muted style={{ margin: 0 }}>
                  {description}
                </Text>
              </div>
              <Toggle
                checked={enabled[key]}
                onCheckedChange={(checked) => setEnabled((prev) => ({ ...prev, [key]: checked }))}
                aria-labelledby={`setting-${key}-label`}
              />
            </div>
          ))}
        </div>

        <Divider />

        <Input label="Email" type="email" defaultValue="not-an-email" error="Enter a valid email address" />

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
