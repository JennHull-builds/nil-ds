import type { CSSProperties } from 'react';
import { Heading, Text } from '../../src';
import { useReveal } from '../hooks/useReveal';
import { DemoScene } from '../DemoScene';
import tokensJson from '../../src/tokens/tokens.json';

type Theme = 'light' | 'dark';
type TokenNode = { value?: string; ref?: string };

/** Walk a ref in tokens.json down to its value. Values are read here, never typed, so this page cannot go stale. */
function resolve(node: TokenNode): string {
  if (node.value !== undefined) return node.value;
  const target = node.ref!.split('.').reduce<unknown>((cur, key) => (cur as Record<string, unknown>)[key], tokensJson) as TokenNode;
  return resolve(target);
}
const themed = (theme: Theme, key: string) => resolve((tokensJson.semantic[theme] as Record<string, TokenNode>)[key]);

const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const lum = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => lin(parseInt(hex.slice(i, i + 2), 16) / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a: string, b: string) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const CATEGORIES = [
  { key: 'blue', name: 'Blue' },
  { key: 'blue-pale', name: 'Pale blue' },
  { key: 'orange', name: 'Orange' },
  { key: 'orange-pale', name: 'Pale orange' },
] as const;
const RAMP = [1, 2, 3, 4, 5] as const;

/** Every chart mark carries this outline. The outline, not the fill, is what clears 3:1 against the page. */
const mark = (fillVar: string): CSSProperties => ({
  fill: `var(${fillVar})`,
  stroke: 'var(--nil-color-border)',
  strokeWidth: 'var(--nil-border-width)',
});

const GROUPS = [
  ['This week', [14, 9, 6, 11]],
  ['Last week', [10, 12, 5, 8]],
] as const;
const HOURS = [2, 3, 6, 9, 14, 11, 8, 12, 7, 5, 3, 1];

function GroupedBars() {
  const W = 420;
  const H = 150;
  const pad = 28;
  const bw = 26;
  const gap = 6;
  const max = 15;
  const gw = (W - pad) / GROUPS.length;
  return (
    <svg viewBox={`0 0 ${W} ${H + 24}`} width="100%" role="img" aria-label="Example grouped bar chart: four categories over two weeks" className="nil-demo-chart">
      {[0, 5, 10, 15].map((t) => {
        const y = H - (t / max) * (H - 10);
        return (
          <g key={t}>
            <line x1={pad} x2={W} y1={y} y2={y} className="nil-demo-chart__grid" />
            <text x={pad - 6} y={y + 3} textAnchor="end">{t}</text>
          </g>
        );
      })}
      {GROUPS.map(([label, values], gi) => {
        const x0 = pad + gi * gw + (gw - (bw * 4 + gap * 3)) / 2;
        return (
          <g key={label}>
            {values.map((v, i) => {
              const h = (v / max) * (H - 10);
              return (
                <rect key={CATEGORIES[i].key} x={x0 + i * (bw + gap)} y={H - h} width={bw} height={h} style={mark(`--nil-color-chart-${CATEGORIES[i].key}`)}>
                  <title>{`${CATEGORIES[i].name}: ${v}`}</title>
                </rect>
              );
            })}
            <text x={pad + gi * gw + gw / 2} y={H + 16} textAnchor="middle" className="nil-demo-chart__label">{label}</text>
          </g>
        );
      })}
      <line x1={pad} x2={W} y1={H} y2={H} className="nil-demo-chart__axis" />
    </svg>
  );
}

function RampBars() {
  const W = 420;
  const H = 110;
  const bw = 28;
  const max = 14;
  return (
    <svg viewBox={`0 0 ${W} ${H + 22}`} width="100%" role="img" aria-label="Example captures by hour, the busiest hour at full strength" className="nil-demo-chart">
      {HOURS.map((v, i) => {
        const step = Math.min(4, Math.floor((v / max) * 5 - 0.0001));
        const h = (v / max) * (H - 8);
        const x = i * (bw + 6) + 4;
        return (
          <g key={i}>
            <rect x={x} y={H - h} width={bw} height={h} style={mark(`--nil-color-chart-ramp-${step + 1}`)}>
              <title>{`${6 + i}:00, ${v} captures`}</title>
            </rect>
            {i % 2 === 0 ? <text x={x + bw / 2} y={H + 15} textAnchor="middle">{6 + i}</text> : null}
          </g>
        );
      })}
    </svg>
  );
}

function Swatch({ theme, token, name, text }: { theme: Theme; token: string; name: string; text: string }) {
  const fill = themed(theme, token);
  const ink = themed(theme, text);
  const page = themed(theme, 'color-bg');
  const outline = themed(theme, 'color-border');
  return (
    <div className="nil-demo-swatch">
      <div className="nil-demo-swatch__fill" style={{ background: `var(--nil-${token})`, color: `var(--nil-${text})` }}>{name}</div>
      <div className="nil-demo-swatch__meta">
        <span>--nil-{token}</span>
        <span>{fill}</span>
        <span>fill vs page {ratio(fill, page).toFixed(2)}</span>
        <span>outline vs page {ratio(outline, page).toFixed(2)}</span>
        <span>text on fill {ratio(ink, fill).toFixed(2)}</span>
      </div>
    </div>
  );
}

function ChartPane({ theme }: { theme: Theme }) {
  return (
    <div data-theme={theme} className="nil-demo-pane">
      <span className="nil-demo-pane__label">{theme}</span>
      <div className="nil-demo-swatches">
        {CATEGORIES.map((c) => (
          <Swatch key={c.key} theme={theme} token={`color-chart-${c.key}`} name={c.name} text={`color-chart-${c.key}-text`} />
        ))}
      </div>
      <span className="nil-demo-pane__label">Grouped bars, example data</span>
      <GroupedBars />
      <div className="nil-demo-legend">
        {CATEGORIES.map((c) => (
          <span key={c.key}>
            <svg viewBox="0 0 14 14" aria-hidden="true"><rect x="1" y="1" width="12" height="12" style={mark(`--nil-color-chart-${c.key}`)} /></svg>
            {c.name}
          </span>
        ))}
      </div>
      <span className="nil-demo-pane__label">Sequential ramp: pale to full, outlined</span>
      <div className="nil-demo-swatches nil-demo-swatches--five">
        {RAMP.map((n) => (
          <Swatch key={n} theme={theme} token={`color-chart-ramp-${n}`} name={`Step ${n}`} text={`color-chart-ramp-${n}-text`} />
        ))}
      </div>
      <RampBars />
    </div>
  );
}

const MAPPING = [
  ['Do', 'Full blue', '--nil-color-chart-blue'],
  ['Wonder', 'Pale blue', '--nil-color-chart-blue-pale'],
  ['Drop', 'Full orange', '--nil-color-chart-orange'],
  ['Later', 'Pale orange', '--nil-color-chart-orange-pale'],
  ['Wins', 'Kit success green', '--nil-color-success'],
  ['Hour chart', 'The ramp, with the busiest hour at full strength', '--nil-color-chart-ramp-1 to 5'],
] as const;

/** The chart palette: four categorical colours and a five step ramp, every mark outlined. */
export function ChartScene() {
  const { ref, visible } = useReveal();
  return (
    <DemoScene id="chart-colour" ref={ref}>
      <div className={`nil-enter${visible ? ' is-visible' : ''}`}>
        <Heading level={2}>Chart colour</Heading>
        <Text muted style={{ marginTop: 'var(--nil-spacing-xs)', maxWidth: '72ch' }}>
          Two-colour print: blue and orange, each at two strengths, so four categories. Every mark carries an outline in the border colour,
          and the outline is what clears 3:1 against the page, so the pale fills are allowed to sit below it. Past four categories, group
          the rest into Other or label them. Do not add colours. The kit success green stays for wins.
        </Text>
      </div>
      <div className="nil-demo-panes" style={{ marginTop: 'var(--nil-spacing-lg)' }}>
        <ChartPane theme="light" />
        <ChartPane theme="dark" />
      </div>
      <div style={{ marginTop: 'var(--nil-spacing-xl)' }}>
        <Heading level={3}>Suggested TetherLog mapping</Heading>
        <Text size="sm" muted style={{ marginTop: 'var(--nil-spacing-xs)' }}>A table only. Nothing here is applied in TetherLog.</Text>
        <table className="nil-demo-table">
          <thead>
            <tr>
              <th scope="col">Bucket</th>
              <th scope="col">Colour</th>
              <th scope="col">Token</th>
            </tr>
          </thead>
          <tbody>
            {MAPPING.map(([bucket, colour, token]) => (
              <tr key={bucket}>
                <th scope="row">{bucket}</th>
                <td>{colour}</td>
                <td><code>{token}</code></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DemoScene>
  );
}
