import { useId, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { Button } from './Button';

export interface SidebarLink {
  label: string;
  href: string;
  /** The page you are on. Mark exactly one link in the whole sidebar. */
  current?: boolean;
}

export interface SidebarSection {
  /** The section's heading, which also names its list. */
  heading: string;
  items: SidebarLink[];
}

/** What `renderLink` receives. Spread it on your link component and map `href` to whatever it calls it. */
export interface SidebarLinkRenderProps {
  href: string;
  className: string;
  'aria-current'?: 'page';
  children: ReactNode;
}

export interface SidebarProps {
  /** The navigation landmark's accessible name, for example "Site". */
  label: string;
  sections?: SidebarSection[];
  /** Custom content, rendered after the sections, inside the part that collapses. */
  children?: ReactNode;
  /** Show the toggle that hides the list. Defaults to true. Without it the list is always shown. */
  collapsible?: boolean;
  /**
   * Where an uncontrolled sidebar starts. Without it, a sidebar starts collapsed on a narrow
   * screen (below the kit's md breakpoint) and open on a wide one. Read once, on first render:
   * resizing later does not move it.
   */
  defaultCollapsed?: boolean;
  /** Controlled. Pair with `onCollapsedChange`. */
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** The toggle's text while the list is hidden. */
  showLabel?: string;
  /** The toggle's text while the list is showing. */
  hideLabel?: string;
  /** The heading level for section headings. Pick the one that fits under the page's own headings. Defaults to 2. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /**
   * Render each link yourself, so a router's link component can be used without the kit depending
   * on a router: `renderLink={({ href, ...rest }) => <Link to={href} {...rest} />}`.
   * The default is a plain `<a href>`.
   */
  renderLink?: (props: SidebarLinkRenderProps) => ReactNode;
  className?: string;
  style?: CSSProperties;
}

/** Below the kit's md breakpoint, read from the token so it cannot drift from core.css. 768 if the tokens are not loaded. */
function isNarrow(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--nil-breakpoint-md');
  const md = parseFloat(raw) || 768;
  return window.matchMedia(`(max-width: ${md - 1}px)`).matches;
}

const defaultRenderLink = (props: SidebarLinkRenderProps) => <a {...props} />;

/**
 * App navigation: a named `<nav>`, headed sections of links, the current page marked, and a
 * toggle that hides the list. In-page switching between views stays with TabStrip.
 *
 * Collapsing is in flow, not a drawer over the page, so there is nothing to trap. The list is
 * hidden with the `hidden` attribute, so it leaves the page for everyone: sight, keyboard and
 * screen reader. The nav landmark and the toggle stay, so the way back is always there. The toggle
 * is a disclosure button: `aria-expanded`, and `aria-controls` pointing at the list. If the focused
 * link is about to be hidden, focus moves to the toggle first, so it never drops to the page.
 *
 * The current link carries `aria-current="page"` and a second cue besides colour: a thick left rule
 * and the emphasis weight. Links are plain anchors; see `renderLink` for a router's link.
 *
 * Nothing animates, so there is nothing to switch off under reduced motion.
 */
export function Sidebar({
  label,
  sections = [],
  children,
  collapsible = true,
  defaultCollapsed,
  collapsed: collapsedProp,
  onCollapsedChange,
  showLabel = 'Show navigation',
  hideLabel = 'Hide navigation',
  headingLevel = 2,
  renderLink = defaultRenderLink,
  className,
  style,
}: SidebarProps) {
  const [internal, setInternal] = useState(() => defaultCollapsed ?? isNarrow());
  const controlled = collapsedProp !== undefined;
  // Without a toggle there is no way back, so a non-collapsible sidebar is always open.
  const collapsed = collapsible && (controlled ? collapsedProp : internal);
  const listRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const listId = useId();
  const HeadingTag = `h${headingLevel}` as 'h2';

  const rescueFocus = () => {
    if (listRef.current?.contains(document.activeElement)) toggleRef.current?.focus();
  };

  const setCollapsed = (next: boolean) => {
    // Before the list is hidden, so focus is never left on something that is about to vanish.
    if (next) rescueFocus();
    if (!controlled) setInternal(next);
    onCollapsedChange?.(next);
  };

  // A parent can collapse a controlled sidebar while a link has focus. Same rule, applied after the fact.
  useLayoutEffect(() => {
    if (collapsed) rescueFocus();
  }, [collapsed]);

  return (
    <div className={['nil-sidebar', className].filter(Boolean).join(' ')} style={style}>
      <nav aria-label={label} className="nil-sidebar__nav">
        {collapsible ? (
          <Button
            ref={toggleRef}
            type="button"
            variant="secondary"
            size="sm"
            icon="menu"
            className="nil-sidebar__toggle"
            aria-expanded={!collapsed}
            aria-controls={listId}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? showLabel : hideLabel}
          </Button>
        ) : null}
        <div ref={listRef} id={listId} hidden={collapsed} className="nil-sidebar__body">
          {sections.map((section) => (
            <SidebarSectionView
              key={section.heading}
              section={section}
              HeadingTag={HeadingTag}
              renderLink={renderLink}
            />
          ))}
          {children}
        </div>
      </nav>
    </div>
  );
}

function SidebarSectionView({
  section,
  HeadingTag,
  renderLink,
}: {
  section: SidebarSection;
  HeadingTag: 'h2';
  renderLink: (props: SidebarLinkRenderProps) => ReactNode;
}) {
  const headingId = useId();
  return (
    <div className="nil-sidebar__section">
      <HeadingTag id={headingId} className="nil-sidebar__heading">
        {section.heading}
      </HeadingTag>
      <ul aria-labelledby={headingId} className="nil-sidebar__links">
        {section.items.map((item) => (
          <li key={item.href} className="nil-sidebar__item">
            {renderLink({
              href: item.href,
              className: 'nil-sidebar__link',
              'aria-current': item.current ? 'page' : undefined,
              children: item.label,
            })}
          </li>
        ))}
      </ul>
    </div>
  );
}
