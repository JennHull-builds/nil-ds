import { useState } from 'react';
import {
  DataRow,
  Heading,
  Panel,
  Readout,
  Ring,
  Text,
  Toggle,
} from '../../src';
import { useReveal } from '../hooks/useReveal';
import { DemoScene } from '../DemoScene';

function CircuitIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect x="6" y="8" width="4" height="16" stroke="currentColor" strokeWidth="2" />
      <rect x="14" y="8" width="4" height="16" stroke="currentColor" strokeWidth="2" />
      <rect x="22" y="8" width="4" height="16" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function ArrayIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect x="4" y="12" width="24" height="14" stroke="currentColor" strokeWidth="2" />
      <line x1="8" y1="12" x2="8" y2="8" stroke="currentColor" strokeWidth="2" />
      <line x1="16" y1="12" x2="16" y2="6" stroke="currentColor" strokeWidth="2" />
      <line x1="24" y1="12" x2="24" y2="8" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function InstrumentScene({ band }: { band?: boolean }) {
  const { ref, visible } = useReveal();
  const [holdOn, setHoldOn] = useState(true);

  return (
    <DemoScene id="instrument" band={band} ref={ref}>
      <div className={`nil-enter${visible ? ' is-visible' : ''}`}>
        <Heading level={2}>Instrument panel</Heading>
        <p className="nil-label" style={{ marginTop: 'var(--nil-spacing-xs)' }}>Mobile-density readouts</p>
      </div>

      <div className={`nil-demo-instrument nil-enter${visible ? ' is-visible' : ''}`} style={{ marginTop: 'var(--nil-spacing-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span className="nil-label">Site 07</span>
          <Ring value={73} label="Capacity" size="sm" />
        </div>

        <Panel style={{ marginTop: 'var(--nil-spacing-md)' }}>
          <Readout label="Studio" value="21.4" unit="°C" sublabel="Holding setpoint" />
        </Panel>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--nil-spacing-md)', marginTop: 'var(--nil-spacing-md)' }}>
          <Panel title="Circuit">
            <CircuitIcon />
            <div style={{ marginTop: 'var(--nil-spacing-sm)' }}>
              <Text size="sm" muted>2.3 bar</Text>
            </div>
          </Panel>
          <Panel title="Array">
            <ArrayIcon />
            <div style={{ marginTop: 'var(--nil-spacing-sm)' }}>
              <Text size="sm" muted>6.8 kWh</Text>
            </div>
          </Panel>
        </div>

        <Panel title="Hold" style={{ marginTop: 'var(--nil-spacing-md)' }}>
          <DataRow label="Open" value="21°C" detail="08:30 – 18:00" />
          <DataRow label="Overnight" value="16°C" detail="22:00 – 06:30" />
          <div style={{ marginTop: 'var(--nil-spacing-md)' }}>
            <Toggle checked={holdOn} onCheckedChange={setHoldOn} labelOn="HOLD ON" labelOff="HOLD OFF" />
          </div>
        </Panel>
      </div>
    </DemoScene>
  );
}
