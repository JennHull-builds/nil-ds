import '@testing-library/jest-dom/vitest';
import { expect } from 'vitest';
import * as axeMatchers from 'vitest-axe/matchers';
import type { AxeMatchers } from 'vitest-axe';

/**
 * axe assertions run with `css: false` (see vitest.config.ts), so jsdom has no
 * computed styles. axe reports `color-contrast` as INCOMPLETE, and
 * `toHaveNoViolations` only fails on `violations` — never on `incomplete`.
 *
 * So `toHaveNoViolations` here means: roles, ARIA, labelling and semantic
 * structure are correct. It does NOT mean contrast passes. Contrast is a
 * token-level property and belongs in `tokens:validate`, not here.
 */
expect.extend(axeMatchers);

declare module 'vitest' {
  interface Assertion extends AxeMatchers {}
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}
