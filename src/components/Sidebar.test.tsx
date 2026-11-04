import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { useState } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Sidebar, type SidebarSection } from './Sidebar';
import registry from '../../registry.json';

const root = join(__dirname, '..', '..');
const coreCss = readFileSync(join(root, 'src/core/core.css'), 'utf8');

const sections: SidebarSection[] = [
  {
    heading: 'Foundations',
    items: [
      { label: 'Tokens', href: '#tokens' },
      { label: 'Contrast', href: '#contrast', current: true },
    ],
  },
  {
    heading: 'Components',
    items: [
      { label: 'Composer', href: '#composer' },
      { label: 'Dialog', href: '#dialog' },
      { label: 'Menu', href: '#menu' },
    ],
  },
];

const toggle = () => screen.getByRole('button', { name: /navigation$/ });

/** jsdom has no matchMedia. Fake one that answers "narrow" and records the query it was asked. */
function mockViewport(narrow: boolean) {
  const queries: string[] = [];
  window.matchMedia = ((query: string) => {
    queries.push(query);
    return { matches: narrow, media: query, addEventListener() {}, removeEventListener() {} } as unknown as MediaQueryList;
  }) as typeof window.matchMedia;
  return queries;
}

afterEach(() => {
  // @ts-expect-error restoring jsdom's own state: it defines no matchMedia
  delete window.matchMedia;
});

describe('Sidebar', () => {
  describe('landmark and structure', () => {
    it('is a navigation landmark with an accessible name', () => {
      render(<Sidebar label="Pages" sections={sections} defaultCollapsed={false} />);
      expect(screen.getByRole('navigation', { name: 'Pages' })).toBeInTheDocument();
    });

    it('has a heading per section, and each list is named by its heading', () => {
      render(<Sidebar label="Pages" sections={sections} defaultCollapsed={false} />);
      expect(screen.getAllByRole('heading').map((h) => h.textContent)).toEqual(['Foundations', 'Components']);
      expect(screen.getByRole('list', { name: 'Foundations' })).toBeInTheDocument();
      expect(within(screen.getByRole('list', { name: 'Components' })).getAllByRole('link')).toHaveLength(3);
    });

    it('uses the heading level it is given, 2 by default', () => {
      const { rerender } = render(<Sidebar label="Pages" sections={sections} defaultCollapsed={false} />);
      expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(2);
      rerender(<Sidebar label="Pages" sections={sections} defaultCollapsed={false} headingLevel={4} />);
      expect(screen.getAllByRole('heading', { level: 4 })).toHaveLength(2);
    });

    it('renders links as plain anchors with their href', () => {
      render(<Sidebar label="Pages" sections={sections} defaultCollapsed={false} />);
      expect(screen.getByRole('link', { name: 'Dialog' })).toHaveAttribute('href', '#dialog');
    });

    it('marks exactly one link as the current page', () => {
      const { container } = render(<Sidebar label="Pages" sections={sections} defaultCollapsed={false} />);
      const current = container.querySelectorAll('[aria-current]');
      expect(current).toHaveLength(1);
      expect(current[0]).toHaveAttribute('aria-current', 'page');
      expect(current[0]).toHaveTextContent('Contrast');
    });

    it('puts className and style on the outer column', () => {
      const { container } = render(
        <Sidebar label="Pages" sections={sections} defaultCollapsed={false} className="extra" style={{ marginTop: 'var(--nil-spacing-md)' }} />,
      );
      expect(container.firstElementChild).toHaveClass('nil-sidebar', 'extra');
      expect(container.firstElementChild).toHaveStyle({ marginTop: 'var(--nil-spacing-md)' });
    });

    it('renders children after the sections, inside the part that collapses', async () => {
      const user = userEvent.setup();
      render(
        <Sidebar label="Pages" sections={sections} defaultCollapsed={false}>
          <p>Custom footer</p>
        </Sidebar>,
      );
      expect(screen.getByText('Custom footer')).toBeVisible();
      await user.click(toggle());
      expect(screen.queryByText('Custom footer')).not.toBeVisible();
    });

    it('takes a router link through renderLink, with the current marker passed along', () => {
      render(
        <Sidebar
          label="Pages"
          sections={sections}
          defaultCollapsed={false}
          renderLink={({ href, ...rest }) => <a data-router-to={href.replace('#', '/')} href={href} {...rest} />}
        />,
      );
      const current = screen.getByRole('link', { name: 'Contrast' });
      expect(current).toHaveAttribute('data-router-to', '/contrast');
      expect(current).toHaveAttribute('aria-current', 'page');
      expect(current).toHaveClass('nil-sidebar__link');
    });
  });

  describe('the toggle', () => {
    it('is a button with aria-expanded and aria-controls pointing at the list', () => {
      render(<Sidebar label="Pages" sections={sections} defaultCollapsed={false} />);
      expect(toggle()).toHaveAttribute('aria-expanded', 'true');
      const id = toggle().getAttribute('aria-controls')!;
      expect(id).toBeTruthy();
      expect(document.getElementById(id)).toContainElement(screen.getByRole('link', { name: 'Tokens' }));
    });

    it('is the kit Button', () => {
      const { container } = render(<Sidebar label="Pages" sections={sections} defaultCollapsed={false} />);
      expect(container.querySelector('.nil-btn')).toBe(toggle());
    });

    it('hides the list from everyone and shows it again, swapping its label', async () => {
      const user = userEvent.setup();
      render(<Sidebar label="Pages" sections={sections} defaultCollapsed={false} />);
      expect(toggle()).toHaveTextContent('Hide navigation');
      await user.click(toggle());
      expect(toggle()).toHaveAttribute('aria-expanded', 'false');
      expect(toggle()).toHaveTextContent('Show navigation');
      expect(screen.queryAllByRole('link')).toHaveLength(0);
      expect(screen.queryAllByRole('heading')).toHaveLength(0);
      expect(document.getElementById(toggle().getAttribute('aria-controls')!)).toHaveAttribute('hidden');
      await user.click(toggle());
      expect(toggle()).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getAllByRole('link')).toHaveLength(5);
    });

    it('keeps the navigation landmark while collapsed, so the way back is announced', async () => {
      const user = userEvent.setup();
      render(<Sidebar label="Pages" sections={sections} defaultCollapsed={false} />);
      await user.click(toggle());
      expect(screen.getByRole('navigation', { name: 'Pages' })).toBeInTheDocument();
    });

    it('takes custom labels', () => {
      render(<Sidebar label="Pages" sections={sections} defaultCollapsed showLabel="Open menu of pages" hideLabel="Close" />);
      expect(screen.getByRole('button', { name: 'Open menu of pages' })).toBeInTheDocument();
    });

    it('is one Tab stop, and Tab then runs through the links', async () => {
      const user = userEvent.setup();
      render(<Sidebar label="Pages" sections={sections} defaultCollapsed={false} />);
      await user.tab();
      expect(toggle()).toHaveFocus();
      await user.tab();
      expect(screen.getByRole('link', { name: 'Tokens' })).toHaveFocus();
      await user.tab();
      expect(screen.getByRole('link', { name: 'Contrast' })).toHaveFocus();
    });

    it('Enter and Space on the toggle collapse and open it, and nothing traps focus', async () => {
      const user = userEvent.setup();
      render(
        <>
          <Sidebar label="Pages" sections={sections} defaultCollapsed={false} />
          <button type="button">After</button>
        </>,
      );
      toggle().focus();
      await user.keyboard('{Enter}');
      expect(toggle()).toHaveAttribute('aria-expanded', 'false');
      expect(toggle()).toHaveFocus();
      await user.keyboard(' ');
      expect(toggle()).toHaveAttribute('aria-expanded', 'true');
      await user.tab({ shift: true });
      expect(toggle()).not.toHaveFocus();
    });

    it('is absent when collapsible is false, and the list is always shown', () => {
      render(<Sidebar label="Pages" sections={sections} collapsible={false} defaultCollapsed />);
      expect(screen.queryByRole('button')).toBeNull();
      expect(screen.getAllByRole('link')).toHaveLength(5);
    });
  });

  describe('where it starts', () => {
    it('starts open on a wide screen', () => {
      mockViewport(false);
      render(<Sidebar label="Pages" sections={sections} />);
      expect(toggle()).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getAllByRole('link')).toHaveLength(5);
    });

    it('starts collapsed on a narrow screen, asking below the md breakpoint', () => {
      const queries = mockViewport(true);
      render(<Sidebar label="Pages" sections={sections} />);
      expect(queries).toContain('(max-width: 767px)');
      expect(toggle()).toHaveAttribute('aria-expanded', 'false');
      expect(toggle()).toHaveTextContent('Show navigation');
      expect(screen.queryAllByRole('link')).toHaveLength(0);
    });

    it('defaultCollapsed overrides the screen in both directions', () => {
      mockViewport(true);
      const { unmount } = render(<Sidebar label="Pages" sections={sections} defaultCollapsed={false} />);
      expect(screen.getAllByRole('link')).toHaveLength(5);
      unmount();
      mockViewport(false);
      render(<Sidebar label="Pages" sections={sections} defaultCollapsed />);
      expect(screen.queryAllByRole('link')).toHaveLength(0);
    });

    it('opens from a narrow start with one press, and closes again', async () => {
      mockViewport(true);
      const user = userEvent.setup();
      render(<Sidebar label="Pages" sections={sections} />);
      await user.click(toggle());
      expect(screen.getAllByRole('link')).toHaveLength(5);
      await user.click(toggle());
      expect(screen.queryAllByRole('link')).toHaveLength(0);
    });
  });

  describe('controlled', () => {
    function Controlled({ onChange }: { onChange?: (c: boolean) => void }) {
      const [collapsed, setCollapsed] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setCollapsed((c) => !c)}>
            Outside
          </button>
          <Sidebar
            label="Pages"
            sections={sections}
            collapsed={collapsed}
            onCollapsedChange={(c) => {
              onChange?.(c);
              setCollapsed(c);
            }}
          />
        </>
      );
    }

    it('reports the change and follows the prop', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Controlled onChange={onChange} />);
      await user.click(toggle());
      expect(onChange).toHaveBeenCalledWith(true);
      expect(toggle()).toHaveAttribute('aria-expanded', 'false');
      await user.click(screen.getByRole('button', { name: 'Outside' }));
      expect(toggle()).toHaveAttribute('aria-expanded', 'true');
    });

    it('a controlled parent that ignores the request keeps it open', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Sidebar label="Pages" sections={sections} collapsed={false} onCollapsedChange={onChange} />);
      await user.click(toggle());
      expect(onChange).toHaveBeenCalledWith(true);
      expect(screen.getAllByRole('link')).toHaveLength(5);
    });
  });

  describe('focus never drops when the list hides', () => {
    it('moves focus to the toggle when the toggle collapses it with a link focused', () => {
      render(<Sidebar label="Pages" sections={sections} defaultCollapsed={false} />);
      screen.getByRole('link', { name: 'Dialog' }).focus();
      // A click event with no pointer, so nothing but the component moves focus.
      fireEvent.click(toggle());
      expect(toggle()).toHaveFocus();
      expect(screen.queryAllByRole('link')).toHaveLength(0);
    });

    it('moves focus to the toggle when a parent collapses a controlled sidebar', () => {
      const { rerender } = render(<Sidebar label="Pages" sections={sections} collapsed={false} />);
      screen.getByRole('link', { name: 'Menu' }).focus();
      rerender(<Sidebar label="Pages" sections={sections} collapsed />);
      expect(toggle()).toHaveFocus();
    });

    it('leaves focus alone when it was not inside the list', () => {
      render(
        <>
          <button type="button">Elsewhere</button>
          <Sidebar label="Pages" sections={sections} defaultCollapsed={false} />
        </>,
      );
      screen.getByRole('button', { name: 'Elsewhere' }).focus();
      fireEvent.click(toggle());
      expect(screen.getByRole('button', { name: 'Elsewhere' })).toHaveFocus();
    });
  });

  describe('styling', () => {
    // Comments stripped, so prose about the rules is not read as a rule.
    const rules = () => (coreCss.replace(/\/\*[\s\S]*?\*\//g, '').match(/[^{}]*nil-sidebar[^{}]*\{[^{}]*\}/g) ?? []).join('\n');

    it('marks the current link with more than colour: a left rule and the emphasis weight', () => {
      const current = coreCss.match(/\.nil-sidebar__link\[aria-current='page'\]\s*\{[^}]*\}/)?.[0] ?? '';
      expect(current).toContain('border-left-color: var(--nil-color-text)');
      expect(current).toContain('font-weight: var(--nil-type-weight-mono-emphasis)');
    });

    it('animates nothing, so reduced motion has nothing to switch off', () => {
      expect(rules().match(/\{/g)?.length).toBeGreaterThan(8);
      expect(rules()).not.toMatch(/animation|transition/);
    });

    it('collapses in flow: no fixed, absolute or sticky positioning, no drawer', () => {
      expect(rules()).not.toMatch(/position\s*:/);
      expect(rules()).not.toMatch(/(^|[\s;])transform\s*:/);
    });

    it('reads only semantic tokens and no literal sizes', () => {
      expect(rules()).not.toContain('--nil-primitive');
      // Heading tracking is the one literal: 0.08em is how Panel, Label and TabStrip set mono caps, and the kit has no token for it.
      expect(rules().replace(/letter-spacing:\s*0\.08em;/g, '')).not.toMatch(/\d(px|rem|em)\b/);
    });

    it('moves its rule from the right edge to the bottom below the md breakpoint', () => {
      expect(coreCss).toMatch(/@media \(max-width: 767px\)\s*\{\s*\.nil-sidebar\s*\{[^}]*border-right: 0;[^}]*border-bottom:/);
    });

    it('the registry token list matches the tokens the .nil-sidebar* rules read', () => {
      const read = [...new Set([...rules().matchAll(/var\((--nil-[\w-]+)\)/g)].map((m) => m[1]))].sort();
      const listed = [...(registry.components.find((c) => c.name === 'Sidebar')?.tokens ?? [])].sort();
      expect(listed).toEqual(read);
    });
  });

  describe('axe', () => {
    // A second, nameless navigation sits beside the sidebar, the way a site header does. Two
    // navigation landmarks need different names, so this is where the sidebar's label is
    // load-bearing: take it away and the guard below fails.
    const withHeaderNav = (sidebar: React.ReactNode) => (
      <>
        <nav>
          <a href="#home">Home</a>
        </nav>
        {sidebar}
      </>
    );

    it('has no violations open or collapsed', async () => {
      const user = userEvent.setup();
      const { container } = render(withHeaderNav(<Sidebar label="Pages" sections={sections} defaultCollapsed={false} />));
      expect(await axe(container)).toHaveNoViolations();
      await user.click(toggle());
      expect(await axe(container)).toHaveNoViolations();
    });

    it('can fail: a sidebar with no label collides with the other navigation landmark', async () => {
      const { container } = render(withHeaderNav(<Sidebar label="" sections={sections} defaultCollapsed={false} />));
      const results = await axe(container);
      expect(results.violations.map((v) => v.id)).toContain('landmark-unique');
    });

    it('can fail: a link with no text is a violation', async () => {
      const { container } = render(
        <Sidebar label="Pages" sections={[{ heading: 'Foundations', items: [{ label: '', href: '#x' }] }]} defaultCollapsed={false} />,
      );
      const results = await axe(container);
      expect(results.violations.map((v) => v.id)).toContain('link-name');
    });
  });
});
