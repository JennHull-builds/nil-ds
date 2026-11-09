import type { ReactNode } from 'react';
import { Button, Heading, ICON_NAMES, Icon, Meta, Text, type IconName } from '../../src';
import { useReveal } from '../hooks/useReveal';
import { DemoScene } from '../DemoScene';

const GROUPS: { title: string; names: IconName[] }[] = [
  { title: 'Capture and voice', names: ['mic', 'stop', 'arrow-up'] },
  { title: 'Navigation', names: ['capture', 'review', 'patterns', 'settings'] },
  { title: 'Review actions', names: ['check', 'clock', 'close', 'trash', 'help', 'plus', 'arrow-right'] },
  { title: 'Sharing and files', names: ['copy', 'download', 'upload', 'share', 'mail', 'printer', 'external-link'] },
  { title: 'Settings and state', names: ['eye', 'eye-off', 'key', 'bell', 'volume', 'volume-off', 'sun', 'moon'] },
  { title: 'Kit furniture', names: ['chevron-down', 'chevron-right', 'chevron-left', 'menu', 'info', 'warning', 'error'] },
];

/** Both themes side by side: a light panel and a dark panel, whatever the page is set to. */
function Panes({ children, wide }: { children: (theme: 'light' | 'dark') => ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? 'nil-demo-panes nil-demo-panes--wide' : 'nil-demo-panes'}>
      {(['light', 'dark'] as const).map((theme) => (
        <div key={theme} data-theme={theme} className="nil-demo-pane">
          <span className="nil-demo-pane__label">{theme}</span>
          {children(theme)}
        </div>
      ))}
    </div>
  );
}

function IconSheet() {
  return (
    <Panes>
      {() => (
        <div className="nil-demo-icon-sheet">
          {GROUPS.map((group) => (
            <div key={group.title} className="nil-demo-icon-group">
              <span className="nil-demo-pane__label">{group.title}</span>
              <div className="nil-demo-icon-grid">
                {group.names.map((name) => (
                  <div key={name} className="nil-demo-icon-cell">
                    <div className="nil-demo-icon-sizes">
                      <Icon name={name} size="lg" />
                      <Icon name={name} size="md" />
                      <Icon name={name} size="sm" />
                    </div>
                    <span className="nil-demo-icon-name">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Panes>
  );
}

const VARIANTS = ['primary', 'secondary', 'ghost', 'danger'] as const;
const LABELS = { primary: 'Save', secondary: 'Cancel', ghost: 'Skip', danger: 'Delete' } as const;

function ButtonStates() {
  return (
    <Panes wide>
      {() => (
        <div className="nil-demo-icon-sheet">
          <div className="nil-demo-state-grid">
            <span />
            <span className="nil-demo-pane__label">rest</span>
            <span className="nil-demo-pane__label">on (aria-pressed)</span>
            <span className="nil-demo-pane__label">unavailable</span>
            <span className="nil-demo-pane__label">busy</span>
            {VARIANTS.map((variant) => (
              <div key={variant} className="nil-demo-state-row">
                <span className="nil-demo-pane__label">{variant}</span>
                <Button variant={variant}>{LABELS[variant]}</Button>
                {variant === 'secondary' || variant === 'ghost' ? (
                  <Button variant={variant} aria-pressed="true">On</Button>
                ) : (
                  <span className="nil-demo-pane__label">n/a</span>
                )}
                <Button variant={variant} aria-disabled="true">{LABELS[variant]}</Button>
                <Button variant={variant} aria-busy="true">{LABELS[variant]}</Button>
              </div>
            ))}
          </div>
          <span className="nil-demo-pane__label">Sizes and icon forms. The small ones are 36 px to see and 44 px to tap.</span>
          <div className="nil-demo-button-row">
            <Button variant="primary" icon="arrow-up">Park</Button>
            <Button variant="secondary" icon="check">Saved</Button>
            <Button variant="secondary" icon="mic" aria-label="Start voice capture" />
            <Button variant="primary" icon="arrow-up" aria-label="Send" />
            <Button variant="ghost" icon="eye" aria-label="Show key" />
            <Button variant="secondary" icon="close" aria-label="Close" />
          </div>
          <div className="nil-demo-button-row">
            <Button variant="primary" size="sm" icon="arrow-up">Park</Button>
            <Button variant="secondary" size="sm">Cancel</Button>
            <Button variant="secondary" size="sm" icon="stop" aria-label="Stop recording" />
            <Button variant="ghost" size="sm" icon="eye-off" aria-label="Hide key" />
            <Button variant="secondary" size="sm" icon="sun" aria-label="Light mode" aria-pressed="true" />
            <Button variant="danger" size="sm" icon="trash">Delete</Button>
          </div>
        </div>
      )}
    </Panes>
  );
}

/** The icon set and the button, both drawn from tokens, in light and dark. */
export function IconsScene() {
  const { ref, visible } = useReveal();
  return (
    <DemoScene id="icons" ref={ref}>
      <div className={`nil-enter${visible ? ' is-visible' : ''}`}>
        <Heading level={2}>Icons and buttons</Heading>
        <Text muted style={{ marginTop: 'var(--nil-spacing-xs)', maxWidth: '72ch' }}>
          {ICON_NAMES.length} icons, drawn for this kit on a 24 unit grid. Straight lines only, with the curves cut into 45 degree
          facets, square ends and mitre joins. The stroke is the border token: the thin one at 16 px, the thick one at 20 and 24 px.
          Each is shown at 24, 20 and 16 px.
        </Text>
        <div style={{ marginTop: 'var(--nil-spacing-sm)' }}>
          <Meta label="Icons">decorative by default</Meta>
        </div>
      </div>
      <div style={{ marginTop: 'var(--nil-spacing-lg)' }}>
        <Heading level={3}>The set</Heading>
        <IconSheet />
      </div>
      <div style={{ marginTop: 'var(--nil-spacing-xl)' }}>
        <Heading level={3}>Buttons</Heading>
        <Text muted style={{ marginTop: 'var(--nil-spacing-xs)', maxWidth: '72ch' }}>
          A thick frame with a hard shadow in the border colour. Hover lifts it, pressing pushes it into the shadow, and a toggle that is on stays
          pushed in. Tab to any of them: the shadow turns to the accent colour.
        </Text>
        <ButtonStates />
      </div>
    </DemoScene>
  );
}
