import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TabStrip } from './TabStrip';
import { axe } from 'vitest-axe';

describe('TabStrip', () => {
  const tabs = ['Overview', 'Schedule', 'Settings'];

  it('renders a tablist with a tab per entry', () => {
    render(<TabStrip tabs={tabs} activeIndex={0} onTabChange={vi.fn()} />);
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(3);
  });

  it('marks only the active tab as aria-selected', () => {
    render(<TabStrip tabs={tabs} activeIndex={1} onTabChange={vi.fn()} />);
    const [overview, schedule, settings] = screen.getAllByRole('tab');
    expect(overview).toHaveAttribute('aria-selected', 'false');
    expect(schedule).toHaveAttribute('aria-selected', 'true');
    expect(settings).toHaveAttribute('aria-selected', 'false');
  });

  it('calls onTabChange with the clicked tab index', async () => {
    const user = userEvent.setup();
    const onTabChange = vi.fn();
    render(<TabStrip tabs={tabs} activeIndex={0} onTabChange={onTabChange} />);
    await user.click(screen.getByRole('tab', { name: 'Settings' }));
    expect(onTabChange).toHaveBeenCalledWith(2);
  });

  it('calls onTabChange even when clicking the already-active tab', async () => {
    const user = userEvent.setup();
    const onTabChange = vi.fn();
    render(<TabStrip tabs={tabs} activeIndex={0} onTabChange={onTabChange} />);
    await user.click(screen.getByRole('tab', { name: 'Overview' }));
    expect(onTabChange).toHaveBeenCalledWith(0);
  });

  it('renders tabs in the given order with type="button"', () => {
    render(<TabStrip tabs={tabs} activeIndex={0} onTabChange={vi.fn()} />);
    const rendered = screen.getAllByRole('tab').map((el) => el.textContent);
    expect(rendered).toEqual(tabs);
    screen.getAllByRole('tab').forEach((tab) => expect(tab).toHaveAttribute('type', 'button'));
  });

  describe('keyboard', () => {
    // Controlled, the way it is used: the parent keeps the selected index.
    function Harness({ onTabChange }: { onTabChange?: (i: number) => void }) {
      const [active, setActive] = useState(0);
      return (
        <>
          <button type="button">Before</button>
          <TabStrip
            tabs={tabs}
            activeIndex={active}
            onTabChange={(i) => {
              onTabChange?.(i);
              setActive(i);
            }}
          />
          <button type="button">After</button>
        </>
      );
    }

    it('puts only the selected tab in the Tab order', () => {
      render(<TabStrip tabs={tabs} activeIndex={1} onTabChange={vi.fn()} />);
      expect(screen.getAllByRole('tab').map((t) => t.getAttribute('tabindex'))).toEqual(['-1', '0', '-1']);
    });

    it('falls back to the first tab when the index is out of range', () => {
      render(<TabStrip tabs={tabs} activeIndex={-1} onTabChange={vi.fn()} />);
      expect(screen.getAllByRole('tab').map((t) => t.getAttribute('tabindex'))).toEqual(['0', '-1', '-1']);
    });

    it('Tab enters on the selected tab and the next Tab leaves the strip', async () => {
      const user = userEvent.setup();
      render(<Harness />);
      await user.tab();
      await user.tab();
      expect(screen.getByRole('tab', { name: 'Overview' })).toHaveFocus();
      await user.tab();
      expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
    });

    it('ArrowRight and ArrowLeft move focus and select, wrapping at the ends', async () => {
      const user = userEvent.setup();
      const onTabChange = vi.fn();
      render(<Harness onTabChange={onTabChange} />);
      screen.getByRole('tab', { name: 'Overview' }).focus();
      await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('tab', { name: 'Schedule' })).toHaveFocus();
      expect(screen.getByRole('tab', { name: 'Schedule' })).toHaveAttribute('aria-selected', 'true');
      expect(onTabChange).toHaveBeenLastCalledWith(1);
      await user.keyboard('{ArrowRight}{ArrowRight}');
      expect(screen.getByRole('tab', { name: 'Overview' })).toHaveFocus();
      await user.keyboard('{ArrowLeft}');
      expect(screen.getByRole('tab', { name: 'Settings' })).toHaveFocus();
      expect(screen.getByRole('tab', { name: 'Settings' })).toHaveAttribute('aria-selected', 'true');
    });

    it('Home and End jump to the first and last tab', async () => {
      const user = userEvent.setup();
      render(<Harness />);
      screen.getByRole('tab', { name: 'Overview' }).focus();
      await user.keyboard('{End}');
      expect(screen.getByRole('tab', { name: 'Settings' })).toHaveFocus();
      await user.keyboard('{Home}');
      expect(screen.getByRole('tab', { name: 'Overview' })).toHaveFocus();
    });

    it('moves the Tab stop to the newly selected tab', async () => {
      const user = userEvent.setup();
      render(<Harness />);
      screen.getByRole('tab', { name: 'Overview' }).focus();
      await user.keyboard('{ArrowRight}');
      expect(screen.getAllByRole('tab').map((t) => t.getAttribute('tabindex'))).toEqual(['-1', '0', '-1']);
    });

    it('leaves ArrowUp and ArrowDown alone', async () => {
      const user = userEvent.setup();
      const onTabChange = vi.fn();
      render(<Harness onTabChange={onTabChange} />);
      screen.getByRole('tab', { name: 'Overview' }).focus();
      await user.keyboard('{ArrowDown}{ArrowUp}');
      expect(onTabChange).not.toHaveBeenCalled();
      expect(screen.getByRole('tab', { name: 'Overview' })).toHaveFocus();
    });

    it('still calls a consumer onKeyDown, and a prevented key is not handled', async () => {
      const user = userEvent.setup();
      const onTabChange = vi.fn();
      const onKeyDown = vi.fn((e: React.KeyboardEvent) => e.preventDefault());
      render(<TabStrip tabs={tabs} activeIndex={0} onTabChange={onTabChange} onKeyDown={onKeyDown} />);
      screen.getByRole('tab', { name: 'Overview' }).focus();
      await user.keyboard('{ArrowRight}');
      expect(onKeyDown).toHaveBeenCalled();
      expect(onTabChange).not.toHaveBeenCalled();
    });
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <TabStrip tabs={['Overview', 'Tokens']} activeIndex={0} onTabChange={() => {}} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
