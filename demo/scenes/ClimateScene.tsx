import { useState } from 'react';
import {
  DataRow,
  Dial,
  Heading,
  Panel,
  Readout,
  Ring,
  Toggle,
} from '../../src';
import { useReveal } from '../hooks/useReveal';
import { DemoScene } from '../DemoScene';

export function ClimateScene() {
  const { ref, visible } = useReveal();
  const [openOn, setOpenOn] = useState(true);
  const [overnightOn, setOvernightOn] = useState(false);

  return (
    <DemoScene id="climate" ref={ref}>
      <div className={`nil-enter${visible ? ' is-visible' : ''}`}>
        <Heading level={2}>Climate console</Heading>
        <p className="nil-label" style={{ marginTop: 'var(--nil-spacing-xs)' }}>
          Dial · Rings · Schedule density
        </p>
      </div>

      <div
        className={`nil-demo-scene-grid nil-demo-scene-grid--climate nil-enter${visible ? ' is-visible' : ''}`}
        style={{ marginTop: 'var(--nil-spacing-lg)', ['--nil-anim-delay' as string]: '80ms' }}
      >
        <Panel title="Zones">
          <DataRow label="Studio" detail="21.4°C" active />
          <DataRow label="Darkroom" detail="17.6°C" />
          <DataRow label="Archive" detail="20.2°C" />
          <DataRow label="Dock" detail="15.3°C" />
        </Panel>

        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--nil-spacing-md)' }}>
          <Dial value="21.4" unit="°C" sublabel="Setpoint" progress={71} size="xl" label="Studio" />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--nil-spacing-md)' }}>
          <Dial value="17.6" unit="°C" sublabel="Setpoint" progress={44} size="xl" label="Darkroom" variant="solid" />
        </div>

        <div className="nil-demo-scene-grid--rings">
          <Ring value={42} label="RH" />
          <Ring value={81} label="VOC" />
          <Ring value={33} label="Draw" />
        </div>
      </div>

      <div
        className={`nil-demo-scene-grid nil-demo-scene-grid--schedule nil-enter${visible ? ' is-visible' : ''}`}
        style={{ marginTop: 'var(--nil-spacing-lg)', ['--nil-anim-delay' as string]: '160ms' }}
      >
        <Panel title="Shift plan">
          <DataRow label="Open" value="21°C" detail="08:30 – 18:00" />
          <DataRow label="Closed" value="17°C" detail="18:00 – 08:30" />
          <DataRow label="Overnight" value="16°C" detail="22:00 – 06:30" />
          <div style={{ display: 'flex', gap: 'var(--nil-spacing-lg)', marginTop: 'var(--nil-spacing-md)', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--nil-spacing-sm)' }}>
              <span className="nil-label">Open:</span>
              <Toggle checked={openOn} onCheckedChange={setOpenOn} labelOn="ON" labelOff="OFF" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--nil-spacing-sm)' }}>
              <span className="nil-label">Overnight:</span>
              <Toggle checked={overnightOn} onCheckedChange={setOvernightOn} labelOn="ON" labelOff="OFF" />
            </div>
          </div>
        </Panel>

        <Panel variant="inverse" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <Readout label="Yard" value="8" unit="°C" size="md" />
        </Panel>
      </div>
    </DemoScene>
  );
}
