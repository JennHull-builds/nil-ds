import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Demo-only config. The kit itself ships no build step (see README) — this
 * exists purely to preview primitives in a browser during development.
 */
export default defineConfig({
  root: 'demo',
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: '../dist-demo',
    emptyOutDir: true,
  },
});
