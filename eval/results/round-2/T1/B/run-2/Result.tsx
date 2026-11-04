import { useId, useState } from 'react';
import { Button, Divider, Heading, Input, Panel, Text, Toggle } from '../src';

const SETTINGS = [
  { key: 'product', label: 'Product updates', description: 'News about new features and improvements.' },
  { key: 'activity', label: 'Account activity', description: 'Alerts about sign-ins and changes to your account.' },
  { key: 'digest', label: 'Weekly digest', description: 'A summary of your activity every Monday.' },
] as const;

type SettingKey = (typeof SETTINGS)[number]['key'];

export default function Result() {
  const baseId = useId();
  const [values, setValues] = useState<Record<SettingKey, boolean>>({
    product: true,
    activity: true,
    digest: false,
  });

  return (
    <Panel>
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
                <Text id={labelId} style={{ fontWeight: 600, margin: 0 }}>
                  {label}
                </Text>
                <Text id={descId} size="sm" muted style={{ margin: 0 }}>
                  {description}
                </Text>
              </div>
              <Toggle
                checked={values[key]}
                onCheckedChange={(next) => setValues((prev) => ({ ...prev, [key]: next }))}
                aria-labelledby={labelId}
                aria-describedby={descId}
              />
            </div>
          );
        })}

        <Divider />

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
