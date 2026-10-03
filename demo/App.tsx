import { useEffect, useState } from 'react';
import type { Theme } from '../src';
import './demo.css';
import { AnalyticsScene } from './scenes/AnalyticsScene';
import { ClimateScene } from './scenes/ClimateScene';
import { GalleryScene } from './scenes/GalleryScene';
import { InstrumentScene } from './scenes/InstrumentScene';
import { IntroScene } from './scenes/IntroScene';
import { TokenLabScene } from './scenes/TokenLabScene';
import { Analytics } from '@vercel/analytics/react';

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

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    // Theme owns canvas roles; drop Token Lab inline overrides so tokens apply.
    root.style.removeProperty('--nil-color-bg');
    root.style.removeProperty('--nil-color-surface');
  }, [theme]);

  return (
    <div data-theme={theme} className="nil-demo-canvas">
      <IntroScene band theme={theme} onThemeChange={setTheme} scenes={SCENES} />
      <ClimateScene />
      <InstrumentScene band />
      <AnalyticsScene />
      <TokenLabScene band />
      <GalleryScene />
      <footer className="nil-demo-footer">
        <div className="nil-container">
          <nav className="nil-demo-nav" aria-label="About this kit">
            {/* No noreferrer, so the portfolio's analytics can see the visit came from here. */}
            <a href="https://jenniferhull.co.za" rel="noopener">
              By Jennifer Hull
            </a>
            <a href="https://github.com/JennHull-builds/nil-ds" rel="noopener noreferrer">
              GitHub
            </a>
          </nav>
        </div>
      </footer>
      <Analytics />
    </div>
  );
}
