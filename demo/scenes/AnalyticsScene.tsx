import { useState } from 'react';
import {
  DataRow,
  Dial,
  Heading,
  Panel,
  TabStrip,
  Text,
} from '../../src';
import { useReveal } from '../hooks/useReveal';

const ROOMS = ['Living room', 'Bedroom', 'Bathroom', 'Kitchen'];
const BAR_HEIGHTS = [40, 55, 35, 70, 48, 62, 38];
const STEP_HEIGHTS = [12, 28, 20, 36, 24, 40, 16, 32];

export function AnalyticsScene() {
  const { ref, visible } = useReveal();
  const [tab, setTab] = useState(2);

  return (
    <section id="analytics" className="nil-demo-scene" ref={ref as React.RefObject<HTMLElement>}>
      <div className={`nil-enter${visible ? ' is-visible' : ''}`}>
        <Heading level={2}>Lighting</Heading>
        <TabStrip tabs={ROOMS} activeIndex={tab} onTabChange={setTab} style={{ marginTop: 'var(--nil-spacing-md)' }} />
      </div>

      <div
        className={`nil-demo-scene-grid nil-demo-scene-grid--analytics nil-enter${visible ? ' is-visible' : ''}`}
        style={{ marginTop: 'var(--nil-spacing-lg)', ['--nil-anim-delay' as string]: '100ms' }}
      >
        <Panel title="Control">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden style={{ marginBottom: 'var(--nil-spacing-md)' }}>
            <line x1="24" y1="4" x2="24" y2="16" stroke="currentColor" strokeWidth="2" />
            <path d="M12 28 Q24 20 36 28 L36 40 L12 40 Z" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
          <DataRow label="Living room" value="ON" />
          <DataRow label="Bedroom" value="ON" />
          <DataRow label="Kitchen" value="OFF" />
          <div style={{ marginTop: 'var(--nil-spacing-lg)' }}>
            <Dial value="75.4" unit="%" sublabel="Warm 2400k" progress={75} size="md" />
          </div>
        </Panel>

        <Panel title="Analytics" headerRight={<span className="nil-label">Solar panels ▾</span>}>
          <div className="nil-demo-chart-bars" aria-hidden>
            {BAR_HEIGHTS.map((h, i) => (
              <div
                key={i}
                className={`nil-demo-chart-bar${i === 3 ? ' is-accent' : ''}`}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <div style={{ marginTop: 'var(--nil-spacing-sm)' }}>
            <Text size="sm" muted>Weekly kWh — Mon – Sun</Text>
          </div>
          <div className="nil-demo-step-chart" aria-hidden>
            {STEP_HEIGHTS.map((h, i) => (
              <div key={i} className="nil-demo-step-bar" style={{ height: `${h}px` }} />
            ))}
          </div>
          <DataRow label="Live" value="2.4 kW" detail="14:41" />
        </Panel>
      </div>
    </section>
  );
}
