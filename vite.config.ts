import { resolve } from 'node:path';
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
    // Two pages: the showroom (index.html) and the proof page (proof.html, served at /proof).
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'demo/index.html'),
        proof: resolve(__dirname, 'demo/proof.html'),
      },
    },
  },
});
