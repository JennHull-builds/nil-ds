import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../src/core/fonts.css';
import '../src/tokens/tokens.css';
import '../src/core/core.css';
import './demo.css';
import { ProofPage } from './ProofPage';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ProofPage />
  </StrictMode>,
);
