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

function RadiatorIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect x="6" y="8" width="4" height="16" stroke="currentColor" strokeWidth="2" />
      <rect x="14" y="8" width="4" height="16" stroke="currentColor" strokeWidth="2" />
      <rect x="22" y="8" width="4" height="16" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function SolarIcon() {
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
  const [heatOn, setHeatOn] = useState(true);

  return (
    <DemoScene id="instrument" band={band} ref={ref}>
      <div className={`nil-enter${visible ? ' is-visible' : ''}`}>
        <Heading level={2}>Instrument panel</Heading>
        <p className="nil-label" style={{ marginTop: 'var(--nil-spacing-xs)' }}>Mobile-density readouts</p>
      </div>

      <div className={`nil-demo-instrument nil-enter${visible ? ' is-visible' : ''}`} style={{ marginTop: 'var(--nil-spacing-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span className="nil-label">Aeonik Fono</span>
          <Ring value={68} label="Capacity" size="sm" />
        </div>

        <Panel style={{ marginTop: 'var(--nil-spacing-md)' }}>
          <Readout label="Indoor" value="19.0" unit="°C" sublabel="Heating to desired temperature…" />
        </Panel>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--nil-spacing-md)', marginTop: 'var(--nil-spacing-md)' }}>
          <Panel title="Radiators">
            <RadiatorIcon />
            <div style={{ marginTop: 'var(--nil-spacing-sm)' }}>
              <Text size="sm" muted>1.7 bar</Text>
            </div>
          </Panel>
          <Panel title="Solar">
            <SolarIcon />
            <div style={{ marginTop: 'var(--nil-spacing-sm)' }}>
              <Text size="sm" muted>4.2 kWh</Text>
            </div>
          </Panel>
        </div>

        <Panel title="Weekly" style={{ marginTop: 'var(--nil-spacing-md)' }}>
          <DataRow label="Weekdays" value="20°C" detail="06:00 – 22:00" />
          <DataRow label="Sunday" value="18°C" detail="10:00 – 18:00" />
          <div style={{ marginTop: 'var(--nil-spacing-md)' }}>
            <Toggle checked={heatOn} onCheckedChange={setHeatOn} labelOn="HEAT ON" labelOff="HEAT OFF" />
          </div>
        </Panel>
      </div>
    </DemoScene>
  );
}
