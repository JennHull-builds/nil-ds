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
  const [weekdayOn, setWeekdayOn] = useState(true);
  const [dayOffOn, setDayOffOn] = useState(false);

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
        <Panel title="Rooms">
          <DataRow label="Living room" detail="19.0°C" />
          <DataRow label="Bedroom" detail="18.2°C" />
          <DataRow label="Kitchen" detail="18.5°C" active />
          <DataRow label="Bathroom" detail="17.8°C" />
        </Panel>

        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--nil-spacing-md)' }}>
          <Dial value="18.5" unit="°C" sublabel="Target" progress={62} size="xl" label="Kitchen" />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--nil-spacing-md)' }}>
          <Dial value="19.0" unit="°C" sublabel="Target" progress={75} size="xl" label="Living Room" variant="solid" />
        </div>

        <div className="nil-demo-scene-grid--rings">
          <Ring value={68} label="Humidity" />
          <Ring value={26} label="CO₂" />
          <Ring value={57} label="Load" />
        </div>
      </div>

      <div
        className={`nil-demo-scene-grid nil-demo-scene-grid--schedule nil-enter${visible ? ' is-visible' : ''}`}
        style={{ marginTop: 'var(--nil-spacing-lg)', ['--nil-anim-delay' as string]: '160ms' }}
      >
        <Panel title="Schedule">
          <DataRow label="Weekdays" value="20°C" detail="06:00 – 22:00" />
          <DataRow label="Day off" value="19°C" detail="08:00 – 20:00" />
          <DataRow label="Sunday" value="18°C" detail="10:00 – 18:00" />
          <div style={{ display: 'flex', gap: 'var(--nil-spacing-lg)', marginTop: 'var(--nil-spacing-md)', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--nil-spacing-sm)' }}>
              <span className="nil-label">Weekdays:</span>
              <Toggle checked={weekdayOn} onCheckedChange={setWeekdayOn} labelOn="ON" labelOff="OFF" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--nil-spacing-sm)' }}>
              <span className="nil-label">Day off:</span>
              <Toggle checked={dayOffOn} onCheckedChange={setDayOffOn} labelOn="ON" labelOff="OFF" />
            </div>
          </div>
        </Panel>

        <Panel variant="inverse" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <Readout label="Outside" value="14" unit="°C" size="md" />
        </Panel>
      </div>
    </DemoScene>
  );
}
