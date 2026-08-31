import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Dial,
  Heading,
  Meta,
  Text,
} from '../../src';
import tokensJson from '../../src/tokens/tokens.json';
import { useReveal } from '../hooks/useReveal';
import { DemoScene } from '../DemoScene';

const ACCENT_PRESETS = [
  { label: '#1752eb', value: '#1752eb' },
  { label: '#0241e3', value: '#0241e3' },
  { label: '#2563eb', value: '#2563eb' },
];

const CANVAS_PRESETS = [
  { label: '#F3F2EE', bg: '#f3f2ee', surface: '#eae9e5' },
  { label: '#EDECE8', bg: '#edece8', surface: '#e2e1dc' },
  { label: '#F5F4F0', bg: '#f5f4f0', surface: '#ecebe7' },
];

const SEMANTIC_COLORS = [
  'color-bg',
  'color-surface',
  'color-text',
  'color-text-muted',
  'color-border',
  'color-accent',
  'color-accent-contrast',
  'color-danger',
  'color-success',
] as const;

export function TokenLabScene({ band }: { band?: boolean }) {
  const { ref, visible } = useReveal();
  const [swatches, setSwatches] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const next: Record<string, string> = {};
    for (const key of SEMANTIC_COLORS) {
      next[key] = getComputedStyle(root).getPropertyValue(`--nil-${key}`).trim();
    }
    setSwatches(next);
  }, []);

  const applyAccent = (hex: string) => {
    document.documentElement.style.setProperty('--nil-color-accent', hex);
    setSwatches((s) => ({ ...s, 'color-accent': hex }));
  };

  const applyCanvas = (bg: string, surface: string) => {
    document.documentElement.style.setProperty('--nil-color-bg', bg);
    document.documentElement.style.setProperty('--nil-color-surface', surface);
    setSwatches((s) => ({ ...s, 'color-bg': bg, 'color-surface': surface }));
  };

  const copyPrimitives = useCallback(() => {
    const slice = JSON.stringify({ primitive: tokensJson.primitive }, null, 2);
    navigator.clipboard.writeText(slice).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  return (
    <DemoScene id="token-lab" band={band} ref={ref}>
      <div className={`nil-enter${visible ? ' is-visible' : ''}`}>
        <Heading level={2}>Token Lab</Heading>
        <Text muted>Swap primitive. Semantic follows. Components unchanged.</Text>
      </div>

      <div
        className={`nil-enter${visible ? ' is-visible' : ''}`}
        style={{ marginTop: 'var(--nil-spacing-lg)', ['--nil-anim-delay' as string]: '80ms' }}
      >
        <p className="nil-label">Semantic swatches (live)</p>
        <div className="nil-demo-swatch-grid" style={{ marginTop: 'var(--nil-spacing-sm)' }}>
          {SEMANTIC_COLORS.map((key) => (
            <div key={key} className="nil-demo-swatch">
              <div
                className="nil-demo-swatch-chip"
                style={{
                  background: swatches[key] ?? 'transparent',
                  color: key.includes('accent') ? swatches['color-accent-contrast'] : undefined,
                }}
              />
              <div>--nil-{key}</div>
              <div style={{ color: 'var(--nil-color-text-muted)' }}>{swatches[key] ?? '—'}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={`nil-enter${visible ? ' is-visible' : ''}`} style={{ marginTop: 'var(--nil-spacing-lg)' }}>
        <p className="nil-label">Accent swap</p>
        <div className="nil-demo-preset-row">
          {ACCENT_PRESETS.map((p) => (
            <Button key={p.value} variant="secondary" size="sm" onClick={() => applyAccent(p.value)}>
              {p.label}
            </Button>
          ))}
        </div>
        <p className="nil-label" style={{ marginTop: 'var(--nil-spacing-md)' }}>Canvas swap</p>
        <div className="nil-demo-preset-row">
          {CANVAS_PRESETS.map((p) => (
            <Button
              key={p.label}
              variant="secondary"
              size="sm"
              onClick={() => applyCanvas(p.bg, p.surface)}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="nil-demo-mini-preview nil-enter is-visible">
        <Button variant="primary">Primary</Button>
        <Dial value="68" unit="%" progress={68} size="sm" />
        <Meta label="Accent" tone="accent">Live</Meta>
      </div>

      <div style={{ marginTop: 'var(--nil-spacing-lg)' }}>
        <Button variant="secondary" onClick={copyPrimitives}>
          {copied ? 'Copied!' : 'Copy tokens.json primitive block'}
        </Button>
      </div>
    </DemoScene>
  );
}
