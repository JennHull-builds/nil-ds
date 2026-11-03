import { useId, useState } from 'react';
import { Button, Divider, Heading, Input, Panel, Text, Toggle } from '../src';

const SETTINGS = [
  { key: 'push', label: 'Push notifications', description: 'Get alerts on your device as they happen.' },
  { key: 'digest', label: 'Weekly digest', description: 'Receive a summary of activity every Monday.' },
  { key: 'product', label: 'Product updates', description: 'Hear about new features and improvements.' },
] as const;

type SettingKey = (typeof SETTINGS)[number]['key'];

export default function Result() {
  const baseId = useId();
  const [values, setValues] = useState<Record<SettingKey, boolean>>({
    push: true,
    digest: false,
    product: false,
  });

  return (
    <Panel style={{ maxWidth: 520 }}>
      <section aria-labelledby={`${baseId}-heading`} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--nil-spacing-lg)' }}>
        <Heading id={`${baseId}-heading`} level={2}>
          Notifications
        </Heading>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--nil-spacing-md)' }}>
          {SETTINGS.map(({ key, label, description }) => (
            <div
              key={key}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--nil-spacing-md)' }}
            >
              <div>
                <Text id={`${baseId}-${key}-label`} style={{ fontWeight: 600 }}>
                  {label}
                </Text>
                <Text id={`${baseId}-${key}-desc`} size="sm" muted>
                  {description}
                </Text>
              </div>
              <Toggle
                checked={values[key]}
                onCheckedChange={(next) => setValues((prev) => ({ ...prev, [key]: next }))}
                aria-labelledby={`${baseId}-${key}-label`}
                aria-describedby={`${baseId}-${key}-desc`}
              />
            </div>
          ))}
        </div>

        <Divider />

        <Input
          label="Email"
          type="email"
          defaultValue="not-an-email"
          error="Enter a valid email address"
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--nil-spacing-sm)' }}>
          <Button variant="ghost">Cancel</Button>
          <Button variant="primary">Save</Button>
        </div>
      </section>
    </Panel>
  );
}
