/**
 * TEST-ONLY DOM SHIM. Not part of the kit, not part of what a subject sees.
 *
 * Why it exists: jsdom 29.1.1 (probed 2 November 2026) has HTMLDialogElement but no show(),
 * showModal() or close(), no showPopover()/hidePopover()/togglePopover(), and Escape fires no
 * `cancel` event. A native <dialog> or [popover] answer is the modern correct one, so without this
 * the checker would fail the best answers for the test environment's gaps.
 *
 * What it fakes, following the HTML spec in outline:
 *  - dialog: show(), showModal(), close(returnValue), the `close` event, focus moved in on open
 *    (autofocus descendant, else first focusable), focus restored to the opener on close, and the
 *    Escape key firing a cancelable `cancel` event on the topmost modal then closing it.
 *  - popover: showPopover(), hidePopover(), togglePopover(), beforetoggle/toggle events, the
 *    popovertarget attribute on a clicked button, Escape and click-outside light dismiss for
 *    popover="auto", and focus restored to the opener. jsdom's own stylesheet hides every
 *    [popover] element, so an open one is shown with an inline display value (removed on hide).
 *
 * What it does NOT fake, so the checker does not test it: focus containment (Tab staying inside a
 * modal), inertness of the page behind a modal, the top layer, and ::backdrop.
 */
type Anyish = any;

const INSTALLED = Symbol.for('nil-eval.dom-shim');
const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"]),[contenteditable="true"]';

function focusSteps(root: HTMLElement) {
  const target =
    root.querySelector<HTMLElement>('[autofocus]') ?? root.querySelector<HTMLElement>(FOCUSABLE) ?? root;
  if (target === root && !root.hasAttribute('tabindex')) root.setAttribute('tabindex', '-1');
  target.focus();
}

export function installDomShim() {
  const g = globalThis as Anyish;
  if (g[INSTALLED]) return;
  g[INSTALLED] = true;

  const modalStack: HTMLDialogElement[] = [];
  const opener = new WeakMap<Element, Element | null>();
  const wasModal = new WeakSet<Element>();

  const dialogProto = g.HTMLDialogElement?.prototype;
  if (dialogProto && typeof dialogProto.showModal !== 'function') {
    dialogProto.show = function (this: HTMLDialogElement) {
      if (this.hasAttribute('open')) return;
      opener.set(this, document.activeElement);
      this.setAttribute('open', '');
      focusSteps(this);
    };
    dialogProto.showModal = function (this: HTMLDialogElement) {
      if (this.hasAttribute('open')) {
        throw new DOMException('The dialog is already open.', 'InvalidStateError');
      }
      opener.set(this, document.activeElement);
      this.setAttribute('open', '');
      wasModal.add(this);
      modalStack.push(this);
      focusSteps(this);
    };
    dialogProto.close = function (this: HTMLDialogElement, returnValue?: string) {
      if (!this.hasAttribute('open')) return;
      const hadFocusInside = this.contains(document.activeElement);
      this.removeAttribute('open');
      if (returnValue !== undefined) (this as Anyish).returnValue = returnValue;
      const i = modalStack.indexOf(this);
      if (i >= 0) modalStack.splice(i, 1);
      const back = opener.get(this) as HTMLElement | null | undefined;
      opener.delete(this);
      if (back && back.isConnected && (wasModal.has(this) || hadFocusInside)) back.focus();
      wasModal.delete(this);
      queueMicrotask(() => this.dispatchEvent(new Event('close')));
    };
  }

  const popoverOpen = new Set<HTMLElement>();
  const htmlProto = g.HTMLElement?.prototype;
  if (htmlProto && typeof htmlProto.showPopover !== 'function') {
    const fire = (el: HTMLElement, type: string, oldState: string, newState: string, cancelable = false) => {
      const ev = new Event(type, { cancelable }) as Anyish;
      ev.oldState = oldState;
      ev.newState = newState;
      el.dispatchEvent(ev);
      return ev;
    };
    htmlProto.showPopover = function (this: HTMLElement) {
      if (!this.hasAttribute('popover')) {
        throw new DOMException('Not a popover element.', 'NotSupportedError');
      }
      if (popoverOpen.has(this)) return;
      if (fire(this, 'beforetoggle', 'closed', 'open', true).defaultPrevented) return;
      opener.set(this, document.activeElement);
      popoverOpen.add(this);
      this.setAttribute('data-eval-popover-open', '');
      this.style.setProperty('display', 'block');
      queueMicrotask(() => fire(this, 'toggle', 'closed', 'open'));
    };
    htmlProto.hidePopover = function (this: HTMLElement) {
      if (!popoverOpen.has(this)) return;
      fire(this, 'beforetoggle', 'open', 'closed');
      const hadFocusInside = this.contains(document.activeElement);
      popoverOpen.delete(this);
      this.removeAttribute('data-eval-popover-open');
      this.style.removeProperty('display');
      const back = opener.get(this) as HTMLElement | null | undefined;
      opener.delete(this);
      if (back && back.isConnected && hadFocusInside) back.focus();
      queueMicrotask(() => fire(this, 'toggle', 'open', 'closed'));
    };
    htmlProto.togglePopover = function (this: HTMLElement, force?: boolean) {
      const open = popoverOpen.has(this);
      if (force === undefined ? open : !force) this.hidePopover();
      else this.showPopover();
      return popoverOpen.has(this);
    };

    // popovertarget / popovertargetaction on a clicked button.
    document.addEventListener('click', (e) => {
      const invoker = (e.target as Element | null)?.closest?.('[popovertarget]') as HTMLElement | null;
      if (!invoker) return;
      const target = document.getElementById(invoker.getAttribute('popovertarget') ?? '');
      const action = invoker.getAttribute('popovertargetaction') ?? 'toggle';
      if (!target?.hasAttribute('popover')) return;
      opener.set(target, invoker);
      if (action === 'show') target.showPopover();
      else if (action === 'hide') target.hidePopover();
      else target.togglePopover();
    });

    // Light dismiss happens on pointerdown, BEFORE the click that a script handler turns into
    // showPopover(). Doing it on click would close a popover the same click just opened. A press
    // on a popovertarget invoker for that popover is exempt, as in the spec.
    document.addEventListener('pointerdown', (e) => {
      const t = e.target as Element | null;
      const invoker = t?.closest?.('[popovertarget]');
      for (const p of [...popoverOpen]) {
        if (p.getAttribute('popover') === 'manual' || p.contains(t)) continue;
        if (invoker && invoker.getAttribute('popovertarget') === p.id) continue;
        p.hidePopover();
      }
    });
  }

  // Escape: topmost open auto popover first, else the topmost modal dialog.
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || e.defaultPrevented) return;
    const autos = [...popoverOpen].filter((p) => p.getAttribute('popover') !== 'manual' && p.isConnected);
    const topPopover = autos[autos.length - 1];
    if (topPopover) {
      topPopover.hidePopover();
      return;
    }
    const top = [...modalStack].reverse().find((d) => d.isConnected && d.hasAttribute('open'));
    if (top) {
      const cancel = new Event('cancel', { cancelable: true });
      top.dispatchEvent(cancel);
      if (!cancel.defaultPrevented) top.close();
    }
  });
}
