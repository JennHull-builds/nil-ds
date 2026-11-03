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

/**
 * TEST-ONLY SHIM for <dialog>.
 *
 * jsdom 29 has the HTMLDialogElement interface but no showModal(), show(), close() or
 * requestClose(): calling showModal() throws "showModal is not a function". Probed 2026-11-03.
 *
 * What this fakes: the `open` attribute, the `close` event and `returnValue`.
 * What it does NOT fake, and so what jsdom cannot prove: the top layer, the page behind going
 * inert, Escape producing a `cancel` event, Tab staying inside, and ::backdrop. Tests that
 * need those are proved in a real browser (Playwright). A jsdom test of a dialog proves the
 * component's wiring and nothing more.
 *
 * Guarded, so it steps aside if a later jsdom implements the real methods.
 */
if (typeof HTMLDialogElement !== 'undefined' && typeof HTMLDialogElement.prototype.showModal !== 'function') {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    // The real method throws on a dialog that is already open.
    if (this.hasAttribute('open')) throw new DOMException('The dialog is already open.', 'InvalidStateError');
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.show = function show(this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement, returnValue?: string) {
    if (!this.hasAttribute('open')) return;
    this.removeAttribute('open');
    if (returnValue !== undefined) this.returnValue = returnValue;
    this.dispatchEvent(new Event('close'));
  };
}

declare module 'vitest' {
  interface Assertion extends AxeMatchers {}
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}
