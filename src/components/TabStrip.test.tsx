import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TabStrip } from './TabStrip';

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
});
