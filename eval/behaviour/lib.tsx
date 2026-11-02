/**
 * R9 (axe) and R10 (task behaviour) for one scored Result.tsx. Runs inside vitest + jsdom, using
 * the kit's own setup file (vitest-axe matchers, jest-dom, css: false).
 *
 * R9 asserts semantics and ARIA only. With css: false jsdom computes no styles, so axe reports
 * `color-contrast` as INCOMPLETE and toHaveNoViolations never looks at incomplete results.
 * Contrast is not covered, and every report says so (src/test/setup.ts explains the same gap).
 *
 * CHECKER_DISABLE=R9 or R10 turns the assertions off while still rendering and counting, which is
 * the failure we are guarding against: a check that goes on passing after it stopped checking.
 */
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { appendFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { installDomShim } from './shim';

installDomShim();

const DISABLED = new Set(
  (process.env.CHECKER_DISABLE ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
);
const off = (rule: string) => DISABLED.has(rule);

function record(id: string, entry: Record<string, unknown>) {
  const dir = process.env.EVAL_REPORT_DIR;
  if (!dir) return;
  mkdirSync(dir, { recursive: true });
  appendFileSync(join(dir, `${id}.jsonl`), JSON.stringify(entry) + '\n');
}

type Loader = () => Promise<{ default?: unknown }>;

async function component(load: Loader): Promise<any> {
  const mod = await load();
  if (!mod.default) throw new Error('Result.tsx has no default export');
  return mod.default;
}

const fail = (msg: string): never => {
  throw new Error(msg);
};

/** Press Tab until `el` has focus. Proves the control is reachable with a keyboard alone. */
async function tabTo(user: ReturnType<typeof userEvent.setup>, el: HTMLElement, max = 10) {
  for (let i = 0; i < max && document.activeElement !== el; i++) await user.tab();
  if (document.activeElement !== el) fail('the control cannot be reached with the Tab key');
}

/** The element that "has focus" for a user: the active element, or its aria-activedescendant. */
function focused(): HTMLElement {
  const active = document.activeElement as HTMLElement | null;
  const id = active?.getAttribute('aria-activedescendant');
  return ((id && document.getElementById(id)) || active || document.body) as HTMLElement;
}

const label = (el: Element) => `${el.getAttribute('aria-label') ?? ''} ${el.textContent ?? ''}`;

const PROPS: Record<string, () => Record<string, unknown>> = {
  T1: () => ({}),
  T2: () => ({ onConfirm: vi.fn() }),
  T3: () => ({ onSend: vi.fn() }),
  T4: () => ({}),
  T5: () => ({ onSelect: vi.fn() }),
};

type Ctx = { C: any; user: ReturnType<typeof userEvent.setup>; skip: () => void };
type Check = { name: string; run: (ctx: Ctx) => Promise<void> };

async function findDialog() {
  return waitFor(() => {
    const found = [...screen.queryAllByRole('dialog'), ...screen.queryAllByRole('alertdialog')];
    return found[0] ?? fail('no dialog appeared after activating the trigger with the keyboard');
  });
}

async function openDelete({ C, user }: Ctx) {
  const onConfirm = vi.fn();
  render(<C onConfirm={onConfirm} />);
  const trigger = screen.queryAllByRole('button', { name: /delete project/i })[0] ?? fail('no button named "Delete project"');
  await tabTo(user, trigger);
  await user.keyboard('{Enter}');
  return { onConfirm, trigger, dialog: await findDialog() };
}

const ACTIONS = ['rename', 'duplicate', 'delete'] as const;

function actionItem(name: string, trigger: HTMLElement): HTMLElement | undefined {
  for (const role of ['menuitem', 'button', 'option', 'link', 'menuitemradio']) {
    const hit = screen.queryAllByRole(role, { name: new RegExp(name, 'i') }).find((e) => e !== trigger);
    if (hit) return hit as HTMLElement;
  }
  return undefined;
}

async function openActions({ C, user }: Ctx) {
  const onSelect = vi.fn();
  render(<C onSelect={onSelect} />);
  const trigger = screen.queryAllByRole('button', { name: /project actions/i })[0] ?? fail('no button named "Project actions"');
  await tabTo(user, trigger);
  return { onSelect, trigger, open: () => user.keyboard('{Enter}') };
}

const CHECKS: Record<string, Check[]> = {
  T1: [
    {
      name: 'the email field is aria-invalid and its error text is linked',
      run: async ({ C }) => {
        render(<C />);
        const input = screen.queryAllByRole('textbox', { name: /e-?mail/i })[0] ?? fail('no text field named like "email"');
        if (input.getAttribute('aria-invalid') !== 'true') fail('the email field is not aria-invalid="true"');
        const ids = `${input.getAttribute('aria-describedby') ?? ''} ${input.getAttribute('aria-errormessage') ?? ''}`
          .split(/\s+/)
          .filter(Boolean);
        const linked = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
        if (!linked.some((el) => /enter a valid email address/i.test(el.textContent ?? ''))) {
          fail('the message "Enter a valid email address" is not linked by aria-describedby or aria-errormessage');
        }
      },
    },
  ],
  T2: [
    {
      name: 'the trigger opens a dialog that has an accessible name',
      run: async (ctx) => {
        await openDelete(ctx);
        const named = [...screen.queryAllByRole('dialog', { name: /\S/ }), ...screen.queryAllByRole('alertdialog', { name: /\S/ })];
        if (!named.length) fail('the dialog has no accessible name');
      },
    },
    {
      name: 'focus is inside the dialog once it is open',
      run: async (ctx) => {
        const { dialog } = await openDelete(ctx);
        await waitFor(() => {
          if (!dialog.contains(document.activeElement)) fail('focus is not inside the dialog');
        });
      },
    },
    {
      name: 'Escape closes the dialog and focus returns to the trigger',
      run: async (ctx) => {
        const { trigger } = await openDelete(ctx);
        await ctx.user.keyboard('{Escape}');
        await waitFor(() => {
          if (screen.queryAllByRole('dialog').length || screen.queryAllByRole('alertdialog').length) fail('Escape did not close the dialog');
        });
        await waitFor(() => {
          if (document.activeElement !== trigger) fail('focus did not return to the trigger');
        });
      },
    },
    {
      name: 'the confirm button calls onConfirm',
      run: async (ctx) => {
        const { dialog, onConfirm } = await openDelete(ctx);
        const confirm =
          within(dialog).queryAllByRole('button', { name: /^(?!.*(cancel|keep|close|go back)).*(delete|confirm|remove|yes).*$/i })[0] ??
          fail('no confirm button inside the dialog');
        await ctx.user.click(confirm);
        expect(onConfirm).toHaveBeenCalledTimes(1);
      },
    },
  ],
  T3: [
    {
      name: 'the message box has an accessible name',
      run: async ({ C }) => {
        render(<C onSend={vi.fn()} />);
        if (!screen.queryAllByRole('textbox', { name: /\S/ }).length) fail('no textbox with an accessible name');
      },
    },
    {
      name: 'Enter sends the typed text',
      run: async ({ C, user }) => {
        const onSend = vi.fn();
        render(<C onSend={onSend} />);
        await user.type(screen.getAllByRole('textbox')[0], 'hello{Enter}');
        expect(onSend).toHaveBeenCalledTimes(1);
        expect(onSend).toHaveBeenCalledWith('hello');
      },
    },
    {
      name: 'Shift+Enter does not send',
      run: async ({ C, user }) => {
        const onSend = vi.fn();
        render(<C onSend={onSend} />);
        await user.type(screen.getAllByRole('textbox')[0], 'hello{Shift>}{Enter}{/Shift}');
        expect(onSend).not.toHaveBeenCalled();
      },
    },
    {
      name: 'Enter on an empty box does not send',
      run: async ({ C, user }) => {
        const onSend = vi.fn();
        render(<C onSend={onSend} />);
        await user.type(screen.getAllByRole('textbox')[0], '{Enter}');
        expect(onSend).not.toHaveBeenCalled();
      },
    },
  ],
  T4: [
    {
      name: 'a navigation landmark holds a link marked aria-current="page"',
      run: async ({ C }) => {
        render(<C />);
        const navs = screen.queryAllByRole('navigation');
        if (!navs.length) fail('no navigation landmark');
        if (!navs.some((n) => n.querySelector('[aria-current="page"]'))) fail('no aria-current="page" inside a navigation landmark');
      },
    },
  ],
  T5: [
    {
      name: 'aria-expanded is false before opening and true after',
      run: async (ctx) => {
        const { trigger, open } = await openActions(ctx);
        if (trigger.getAttribute('aria-expanded') !== 'false') fail('the trigger does not have aria-expanded="false" before opening');
        await open();
        await waitFor(() => {
          if (trigger.getAttribute('aria-expanded') !== 'true') fail('the trigger does not have aria-expanded="true" once open');
        });
      },
    },
    {
      name: 'focus moves into the list when it opens',
      run: async (ctx) => {
        const { trigger, open } = await openActions(ctx);
        await open();
        await waitFor(() => {
          const items = ACTIONS.map((a) => actionItem(a, trigger)).filter(Boolean) as HTMLElement[];
          if (items.length < 3) fail('the three actions are not all available once open');
          const now = focused();
          if (now === trigger || now === document.body) fail('focus did not move off the trigger');
          const inside = items.some((i) => i === now || i.contains(now) || now.contains(i));
          if (!inside) fail('focus is not inside the list of actions');
        });
      },
    },
    {
      name: 'choosing Duplicate with the keyboard alone calls onSelect("duplicate")',
      run: async (ctx) => {
        const { onSelect, open } = await openActions(ctx);
        await open();
        await waitFor(() => {
          if (!document.querySelector('[role="menuitem"], [role="menu"], button')) fail('the list did not open');
        });
        const key = document.querySelector('[role="menu"]') ? '{ArrowDown}' : '{Tab}';
        for (let i = 0; i < 6 && !/duplicate/i.test(label(focused())); i++) await ctx.user.keyboard(key);
        if (!/duplicate/i.test(label(focused()))) fail('Duplicate cannot be reached with the keyboard');
        await ctx.user.keyboard('{Enter}');
        expect(onSelect).toHaveBeenCalledTimes(1);
        expect(onSelect).toHaveBeenCalledWith('duplicate');
      },
    },
    {
      name: 'Escape closes the list and focus returns to the trigger',
      run: async (ctx) => {
        const { trigger, open } = await openActions(ctx);
        await open();
        await waitFor(() => {
          if (!actionItem('rename', trigger)) fail('the list did not open');
        });
        await ctx.user.keyboard('{Escape}');
        await waitFor(() => {
          if (actionItem('rename', trigger)) fail('Escape did not close the list');
        });
        await waitFor(() => {
          if (document.activeElement !== trigger) fail('focus did not return to the trigger');
        });
      },
    },
    {
      name: 'role="menu" only: ArrowDown moves focus between items',
      run: async (ctx) => {
        const { open } = await openActions(ctx);
        await open();
        if (!document.querySelector('[role="menu"]')) return ctx.skip();
        const before = focused();
        await ctx.user.keyboard('{ArrowDown}');
        if (focused() === before) fail('role="menu" promises arrow keys, but ArrowDown did not move focus');
      },
    },
  ],
};

export function runBehaviour({ id, task, load }: { id: string; task: string; load: Loader }) {
  describe(id, () => {
    it('R9 axe: no violations (semantics and ARIA; contrast not covered)', async () => {
      const C = await component(load);
      const user = userEvent.setup();
      render(<C {...PROPS[task]()} />);
      let inspected = 0;
      const incomplete = new Set<string>();
      const violated = new Set<string>();
      const detail: string[] = [];
      // The kit's own tests call axe(container). Scanning document.body instead adds page-level rules
      // such as `region` that do not apply to a component, so scan each top-level element in body:
      // that is the render container, plus anything the subject portals out of it.
      const scan = async () => {
        const roots = Array.from(document.body.children).filter((el) => !['SCRIPT', 'STYLE', 'LINK'].includes(el.tagName));
        for (const root of roots) {
          const results = await axe(root as HTMLElement);
          inspected += results.passes.length + results.violations.length;
          results.incomplete.forEach((r: { id: string }) => incomplete.add(r.id));
          results.violations.forEach((r: { id: string; nodes: { html: string }[] }) => {
            violated.add(r.id);
            detail.push(`${r.id}: ${r.nodes.slice(0, 2).map((n) => n.html.slice(0, 90)).join(' | ')}`);
          });
          if (!off('R9')) expect(results).toHaveNoViolations();
        }
      };
      try {
        await scan();
        // T2 and T5 only show their interesting markup once opened, so scan that state too.
        if (task === 'T2' || task === 'T5') {
          const name = task === 'T2' ? /delete project/i : /project actions/i;
          const trigger = screen.queryAllByRole('button', { name })[0];
          if (trigger) {
            try {
              await tabTo(user, trigger);
              await user.keyboard('{Enter}');
              await new Promise((r) => setTimeout(r, 50));
            } catch {
              /* R10 reports a trigger that cannot be opened; axe just scans what is there */
            }
            await scan();
          }
        }
      } finally {
        record(id, { rule: 'R9', inspected, incomplete: [...incomplete], violations: [...violated], detail });
      }
    });

    for (const check of CHECKS[task] ?? []) {
      it(`R10 ${check.name}`, async (t) => {
        const C = await component(load);
        if (off('R10')) return; // detector switched off: renders nothing, asserts nothing, passes
        await check.run({ C, user: userEvent.setup(), skip: () => t.skip() });
      });
    }
  });
}
