import { useId, useState } from 'react';
import { Button, Heading, Input, Panel, Text, Toggle } from '../src';

const SETTINGS = [
  { key: 'product', label: 'Product updates', description: 'New features and improvements to the app.' },
  { key: 'activity', label: 'Account activity', description: 'Sign-ins, password changes and security alerts.' },
  { key: 'digest', label: 'Weekly digest', description: 'A summary of what happened in your workspace.' },
] as const;

type SettingKey = (typeof SETTINGS)[number]['key'];

export default function Result() {
  const baseId = useId();
  const [enabled, setEnabled] = useState<Record<SettingKey, boolean>>({
    product: true,
    activity: true,
    digest: false,
  });

  return (
    <Panel title="Settings" aria-labelledby={`${baseId}-heading`} role="region">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--nil-spacing-md)' }}>
        <Heading level={2} id={`${baseId}-heading`}>
          Notifications
        </Heading>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--nil-spacing-md)' }}>
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
                  checked={enabled[key]}
                  onCheckedChange={(next) => setEnabled((prev) => ({ ...prev, [key]: next }))}
                  aria-labelledby={labelId}
                  aria-describedby={descId}
                />
              </div>
            );
          })}
        </div>

        <Input
          label="Email"
          type="email"
          name="email"
          defaultValue="not-an-email"
          error="Enter a valid email address"
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--nil-spacing-sm)' }}>
          <Button type="button" variant="secondary">
            Cancel
          </Button>
          <Button type="button" variant="primary">
            Save
          </Button>
        </div>
      </div>
    </Panel>
  );
}
