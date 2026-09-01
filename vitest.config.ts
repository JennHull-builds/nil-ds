import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

/**
 * Standalone Vitest config — kept separate from vite.config.ts, which is
 * scoped to the demo app (root: 'demo'). Tests live alongside source in
 * src/components/**.
 */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
