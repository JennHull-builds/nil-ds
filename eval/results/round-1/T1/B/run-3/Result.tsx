import { useId, useState } from 'react';
import { Button, Heading, Input, Panel, Text, Toggle } from '../src';

const SETTINGS = [
  { key: 'product', label: 'Product updates', description: 'News about new features and releases.' },
  { key: 'security', label: 'Security alerts', description: 'Get notified about sign-ins and account changes.' },
  { key: 'digest', label: 'Weekly digest', description: 'A summary of your activity every Monday.' },
] as const;

type SettingKey = (typeof SETTINGS)[number]['key'];

export default function Result() {
  const baseId = useId();
  const [values, setValues] = useState<Record<SettingKey, boolean>>({
    product: true,
    security: true,
    digest: false,
  });

  return (
    <Panel style={{ maxWidth: 480 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--nil-spacing-md)' }}>
        <Heading level={2}>Notifications</Heading>

        {SETTINGS.map(({ key, label, description }) => {
          const labelId = `${baseId}-${key}-label`;
          const descId = `${baseId}-${key}-desc`;
          return (
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
                <Text id={labelId} style={{ margin: 0, fontWeight: 600 }}>
                  {label}
                </Text>
                <Text id={descId} size="sm" muted style={{ margin: 0 }}>
                  {description}
                </Text>
              </div>
              <Toggle
                checked={values[key]}
                onCheckedChange={(next) => setValues((v) => ({ ...v, [key]: next }))}
                aria-labelledby={labelId}
                aria-describedby={descId}
              />
            </div>
          );
        })}

        <Input
          label="Email"
          type="email"
          defaultValue="not-an-email"
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
