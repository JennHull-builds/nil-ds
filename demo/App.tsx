import { useState } from 'react';
import { ThemeToggle, type Theme } from '../src';
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
    <div data-theme={theme} className="nil-demo-canvas nil-grid-bg">
      <div className="nil-container nil-section-y">
        <nav className="nil-demo-nav" aria-label="Showroom scenes">
          {SCENES.map((scene) => (
            <a key={scene.id} href={`#${scene.id}`}>
              {scene.label}
            </a>
          ))}
        </nav>

        <IntroScene theme={theme} onThemeChange={setTheme} />
        <ClimateScene />
        <InstrumentScene />
        <AnalyticsScene />
        <TokenLabScene />
        <GalleryScene />
      </div>
    </div>
  );
}
