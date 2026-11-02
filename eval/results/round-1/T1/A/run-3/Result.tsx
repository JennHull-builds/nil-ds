import { useId, useState } from 'react';
import { Button, Divider, Heading, Input, Panel, Text, Toggle } from '../src';

const SETTINGS = [
  { key: 'push', label: 'Push notifications', description: 'Get alerts on your device as they happen.' },
  { key: 'digest', label: 'Weekly digest', description: 'A summary of activity sent once a week.' },
  { key: 'product', label: 'Product updates', description: 'News about new features and improvements.' },
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
    <Panel style={{ maxWidth: 480 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--nil-spacing-md)' }}>
        <Heading level={2}>Notifications</Heading>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--nil-spacing-md)' }}>
          {SETTINGS.map(({ key, label, description }) => {
            const labelId = `${baseId}-${key}-label`;
            const descId = `${baseId}-${key}-desc`;
            return (
              <div
                key={key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 'var(--nil-spacing-md)',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <span id={labelId} style={{ fontWeight: 600, color: 'var(--nil-color-text)' }}>
                    {label}
                  </span>
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
        </div>

        <Divider />

        <Input
          label="Email"
          type="email"
          defaultValue="not-an-email"
          error="Enter a valid email address"
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--nil-spacing-sm)' }}>
          <Button variant="ghost" type="button">
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
