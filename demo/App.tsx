import { useState } from 'react';
import type { Theme } from '../src';
import './demo.css';
import { AnalyticsScene } from './scenes/AnalyticsScene';
import { ClimateScene } from './scenes/ClimateScene';
import { GalleryScene } from './scenes/GalleryScene';
import { InstrumentScene } from './scenes/InstrumentScene';
import { IntroScene } from './scenes/IntroScene';
import { TokenLabScene } from './scenes/TokenLabScene';

const SCENES = [
  { id: 'intro', label: 'Intro' },
  { id: 'climate', label: 'Climate' },
  { id: 'instrument', label: 'Instrument' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'token-lab', label: 'Token Lab' },
  { id: 'gallery', label: 'Gallery' },
] as const;

export function App() {
  const [theme, setTheme] = useState<Theme>('light');

  return (
    <div data-theme={theme} className="nil-demo-canvas">
      <IntroScene band theme={theme} onThemeChange={setTheme} scenes={SCENES} />
      <ClimateScene />
      <InstrumentScene band />
      <AnalyticsScene />
      <TokenLabScene band />
      <GalleryScene />
    </div>
  );
}
