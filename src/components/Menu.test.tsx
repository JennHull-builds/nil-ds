import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Menu, type MenuEntry } from './Menu';
import registry from '../../registry.json';

const root = join(__dirname, '..', '..');
const coreCss = readFileSync(join(root, 'src/core/core.css'), 'utf8');

const trigger = () => screen.getByRole('button', { name: 'Project actions' });
const itemNames = () => screen.getAllByRole('menuitem').map((el) => el.textContent);

function setup(overrides: { items?: MenuEntry[] } = {}) {
  const onRename = vi.fn();
  const onDuplicate = vi.fn();
  const onDelete = vi.fn();
  const items: MenuEntry[] = overrides.items ?? [
    { label: 'Rename', onSelect: onRename },
    { label: 'Duplicate', onSelect: onDuplicate },
    { separator: true },
    { label: 'Delete', onSelect: onDelete, variant: 'danger' },
  ];
  const user = userEvent.setup();
  const view = render(
    <>
      <button type="button">Before</button>
      <Menu label="Project actions" items={items} />
      <button type="button">After</button>
    </>,
  );
  return { user, onRename, onDuplicate, onDelete, ...view };
}

describe('Menu', () => {
  describe('trigger and structure', () => {
    it('is a menu button: aria-haspopup, collapsed, and pointing at the menu', () => {
      setup();
      expect(trigger()).toHaveAttribute('aria-haspopup', 'menu');
      expect(trigger()).toHaveAttribute('aria-expanded', 'false');
      const menuId = trigger().getAttribute('aria-controls');
      expect(menuId).toBeTruthy();
      // Closed: the menu is in the document for aria-controls, but hidden from everyone.
      expect(document.getElementById(menuId!)).toHaveAttribute('hidden');
      expect(screen.queryByRole('menu')).toBeNull();
      expect(screen.queryAllByRole('menuitem')).toHaveLength(0);
    });

    it('the trigger is the kit Button and keeps a plain name; the chevron icon is decorative', () => {
      const { container } = setup();
      expect(container.querySelector('.nil-btn')).toBe(trigger());
      expect(trigger()).toHaveAccessibleName('Project actions');
      const chevron = trigger().querySelector('svg');
      expect(chevron).not.toBeNull();
      expect(chevron).toHaveAttribute('aria-hidden', 'true');
      expect(chevron!.innerHTML).toContain('M6 9l6 6 6-6');
      expect(trigger().textContent).toBe('Project actions');
    });

    it('opens a role=menu named by the trigger, with menuitems and a separator', async () => {
      const { user } = setup();
      await user.click(trigger());
      expect(trigger()).toHaveAttribute('aria-expanded', 'true');
      const menu = screen.getByRole('menu', { name: 'Project actions' });
      expect(menu).toHaveAttribute('id', trigger().getAttribute('aria-controls')!);
      expect(itemNames()).toEqual(['Rename', 'Duplicate', 'Delete']);
      expect(screen.getByRole('separator')).toBeInTheDocument();
    });

    it('puts only one item in the Tab order (roving tabindex)', async () => {
      const { user } = setup();
      await user.click(trigger());
      const tabIndexes = screen.getAllByRole('menuitem').map((el) => el.getAttribute('tabindex'));
      expect(tabIndexes).toEqual(['0', '-1', '-1']);
    });

    it('marks a danger item with a class and leaves the label as it is', async () => {
      const { user } = setup();
      await user.click(trigger());
      expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveClass('nil-menu__item--danger');
      expect(screen.getByRole('menuitem', { name: 'Rename' })).not.toHaveClass('nil-menu__item--danger');
    });

    it('uses the end edge when asked', async () => {
      const user = userEvent.setup();
      render(<Menu label="Project actions" align="end" items={[{ label: 'Rename', onSelect: () => {} }]} />);
      await user.click(trigger());
      expect(screen.getByRole('menu')).toHaveClass('nil-menu__list--end');
    });
  });

  describe('opening', () => {
    it('Enter opens it and focuses the first item', async () => {
      const { user } = setup();
      await user.tab();
      await user.tab();
      expect(trigger()).toHaveFocus();
      await user.keyboard('{Enter}');
      expect(screen.getByRole('menuitem', { name: 'Rename' })).toHaveFocus();
    });

    it('Space opens it and focuses the first item', async () => {
      const { user } = setup();
      trigger().focus();
      await user.keyboard(' ');
      expect(screen.getByRole('menuitem', { name: 'Rename' })).toHaveFocus();
    });

    it('ArrowDown on the trigger opens it onto the first item', async () => {
      const { user } = setup();
      trigger().focus();
      await user.keyboard('{ArrowDown}');
      expect(trigger()).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByRole('menuitem', { name: 'Rename' })).toHaveFocus();
    });

    it('ArrowUp on the trigger opens it onto the last item', async () => {
      const { user } = setup();
      trigger().focus();
      await user.keyboard('{ArrowUp}');
      expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveFocus();
    });

    it('a second click on the trigger closes it', async () => {
      const { user } = setup();
      await user.click(trigger());
      await user.click(trigger());
      expect(trigger()).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByRole('menu')).toBeNull();
    });
  });

  describe('moving', () => {
    it('ArrowDown and ArrowUp move, step over the separator, and wrap', async () => {
      const { user } = setup();
      await user.click(trigger());
      await user.keyboard('{ArrowDown}');
      expect(screen.getByRole('menuitem', { name: 'Duplicate' })).toHaveFocus();
      await user.keyboard('{ArrowDown}');
      expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveFocus();
      await user.keyboard('{ArrowDown}');
      expect(screen.getByRole('menuitem', { name: 'Rename' })).toHaveFocus();
      await user.keyboard('{ArrowUp}');
      expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveFocus();
    });

    it('Home and End jump to the first and last item', async () => {
      const { user } = setup();
      await user.click(trigger());
      await user.keyboard('{End}');
      expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveFocus();
      await user.keyboard('{Home}');
      expect(screen.getByRole('menuitem', { name: 'Rename' })).toHaveFocus();
    });

    it('moves the Tab stop with the focus', async () => {
      const { user } = setup();
      await user.click(trigger());
      await user.keyboard('{ArrowDown}');
      const tabIndexes = screen.getAllByRole('menuitem').map((el) => el.getAttribute('tabindex'));
      expect(tabIndexes).toEqual(['-1', '0', '-1']);
    });

    it('skips a disabled item, and never natively disables it', async () => {
      const { user } = setup({
        items: [
          { label: 'Rename', onSelect: () => {} },
          { label: 'Duplicate', onSelect: () => {}, disabled: true },
          { label: 'Delete', onSelect: () => {}, variant: 'danger' },
        ],
      });
      await user.click(trigger());
      await user.keyboard('{ArrowDown}');
      expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveFocus();
      const disabled = screen.getByRole('menuitem', { name: 'Duplicate' });
      expect(disabled).toHaveAttribute('aria-disabled', 'true');
      expect(disabled).not.toBeDisabled();
    });

    it('opens onto the first enabled item when the first is disabled', async () => {
      const { user } = setup({
        items: [
          { label: 'Rename', onSelect: () => {}, disabled: true },
          { label: 'Duplicate', onSelect: () => {} },
        ],
      });
      await user.click(trigger());
      expect(screen.getByRole('menuitem', { name: 'Duplicate' })).toHaveFocus();
      expect(screen.getByRole('menuitem', { name: 'Duplicate' })).toHaveAttribute('tabindex', '0');
    });

    it('pointing at an item moves the highlight to it', async () => {
      const { user } = setup();
      await user.click(trigger());
      await user.hover(screen.getByRole('menuitem', { name: 'Delete' }));
      expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveFocus();
      await user.keyboard('{ArrowUp}');
      expect(screen.getByRole('menuitem', { name: 'Duplicate' })).toHaveFocus();
    });
  });

  describe('choosing', () => {
    it('Enter calls onSelect once, closes, and returns focus to the trigger', async () => {
      const { user, onDuplicate } = setup();
      await user.click(trigger());
      await user.keyboard('{ArrowDown}{Enter}');
      expect(onDuplicate).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole('menu')).toBeNull();
      expect(trigger()).toHaveFocus();
    });

    it('Space chooses too', async () => {
      const { user, onRename } = setup();
      await user.click(trigger());
      await user.keyboard(' ');
      expect(onRename).toHaveBeenCalledTimes(1);
      expect(trigger()).toHaveFocus();
    });

    it('a click chooses, closes and returns focus', async () => {
      const { user, onDelete } = setup();
      await user.click(trigger());
      await user.click(screen.getByRole('menuitem', { name: 'Delete' }));
      expect(onDelete).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole('menu')).toBeNull();
      expect(trigger()).toHaveFocus();
    });

    it('focus is already back on the trigger when onSelect runs, so a Dialog it opens has an opener', async () => {
      let focusedWhenSelected: Element | null = null;
      const { user } = setup({
        items: [{ label: 'Rename', onSelect: () => (focusedWhenSelected = document.activeElement) }],
      });
      await user.click(trigger());
      await user.keyboard('{Enter}');
      expect(focusedWhenSelected).toBe(trigger());
    });

    it('a disabled item cannot be chosen, and the menu stays open', async () => {
      const onSelect = vi.fn();
      const { user } = setup({ items: [{ label: 'Rename', onSelect, disabled: true }, { label: 'Other', onSelect: () => {} }] });
      await user.click(trigger());
      await user.click(screen.getByRole('menuitem', { name: 'Rename' }));
      expect(onSelect).not.toHaveBeenCalled();
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });
  });

  describe('closing', () => {
    it('Escape closes and returns focus to the trigger', async () => {
      const { user, onRename } = setup();
      await user.click(trigger());
      expect(screen.getByRole('menuitem', { name: 'Rename' })).toHaveFocus();
      await user.keyboard('{Escape}');
      expect(screen.queryByRole('menu')).toBeNull();
      expect(trigger()).toHaveAttribute('aria-expanded', 'false');
      expect(trigger()).toHaveFocus();
      expect(onRename).not.toHaveBeenCalled();
    });

    it('Tab closes the menu without trapping: focus goes on to the next control', async () => {
      const { user } = setup();
      await user.click(trigger());
      await user.keyboard('{Tab}');
      expect(screen.queryByRole('menu')).toBeNull();
      expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
    });

    it('Shift+Tab closes the menu and goes to the control before the trigger', async () => {
      const { user } = setup();
      await user.click(trigger());
      await user.keyboard('{Shift>}{Tab}{/Shift}');
      expect(screen.queryByRole('menu')).toBeNull();
      expect(screen.getByRole('button', { name: 'Before' })).toHaveFocus();
    });

    it('a press outside closes it and leaves focus where the press put it', async () => {
      const { user } = setup();
      await user.click(trigger());
      await user.click(screen.getByRole('button', { name: 'After' }));
      expect(screen.queryByRole('menu')).toBeNull();
      expect(trigger()).toHaveAttribute('aria-expanded', 'false');
      expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
    });

    it('a press inside the menu on a disabled item does not close it', async () => {
      const { user } = setup({ items: [{ label: 'Rename', onSelect: () => {}, disabled: true }, { label: 'Other', onSelect: () => {} }] });
      await user.click(trigger());
      await user.click(screen.getByRole('menuitem', { name: 'Rename' }));
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('animates nothing, so reduced motion has nothing to switch off', () => {
      const rules = coreCss.match(/[^{}]*nil-menu[^{}]*\{[^{}]*\}/g) ?? [];
      expect(rules.length).toBeGreaterThan(6);
      for (const rule of rules) expect(rule).not.toMatch(/animation|transition/);
    });

    it('a danger item is red text, never a red fill', () => {
      const danger = coreCss.match(/\.nil-menu__item--danger\s*\{[^}]*\}/)?.[0] ?? '';
      expect(danger).toContain('color: var(--nil-color-text-danger)');
      expect(danger).not.toMatch(/background/);
      expect(danger).not.toContain('--nil-color-danger)');
    });

    it('reads only semantic tokens and no literal sizes', () => {
      const rules = (coreCss.match(/[^{}]*nil-menu[^{}]*\{[^{}]*\}/g) ?? []).join('\n');
      expect(rules).not.toContain('--nil-primitive');
      expect(rules).not.toMatch(/\d(px|rem|em)\b/);
    });

    it('the registry token list matches the tokens the .nil-menu* rules read', () => {
      const rules = (coreCss.match(/[^{}]*nil-menu[^{}]*\{[^{}]*\}/g) ?? []).join('\n');
      const read = [...new Set([...rules.matchAll(/var\((--nil-[\w-]+)\)/g)].map((m) => m[1]))].sort();
      const listed = [...(registry.components.find((c) => c.name === 'Menu')?.tokens ?? [])].sort();
      expect(listed).toEqual(read);
    });
  });

  describe('axe', () => {
    it('has no violations closed or open', async () => {
      const { container, user } = setup();
      expect(await axe(container)).toHaveNoViolations();
      await user.click(trigger());
      expect(await axe(container)).toHaveNoViolations();
    });

    it('can fail: a menu item with no name is a violation', async () => {
      const user = userEvent.setup();
      const { container } = render(<Menu label="Project actions" items={[{ label: '', onSelect: () => {} }]} />);
      await user.click(trigger());
      const results = await axe(container);
      expect(results.violations.length).toBeGreaterThan(0);
    });

    it('can fail: menu items outside a role=menu are a violation', async () => {
      const user = userEvent.setup();
      const { container } = render(<Menu label="Project actions" items={[{ label: 'Rename', onSelect: () => {} }]} />);
      await user.click(trigger());
      screen.getByRole('menu').removeAttribute('role');
      const results = await axe(container);
      expect(results.violations.length).toBeGreaterThan(0);
    });
  });
});
