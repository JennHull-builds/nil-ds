import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../src/core/fonts.css';
import '../src/tokens/tokens.css';
import '../src/core/core.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
