import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import {
  Badge,
  Button,
  Card,
  Composer,
  Dialog,
  Divider,
  Grid,
  Heading,
  Input,
  Lightbox,
  Meta,
  Prompt,
  Text,
  Toggle,
  type ComposerStatus,
  type LightboxImage,
} from '../../src';
import { useReveal } from '../hooks/useReveal';
import { DemoScene } from '../DemoScene';
import tokensJson from '../../src/tokens/tokens.json';

const ACCENT = tokensJson.primitive.color.accent.value;

const DEMO_LIGHTBOX: LightboxImage = {
  src:
    'data:image/svg+xml,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
        <rect width="800" height="500" fill="#0a0a0a"/>
        <rect x="40" y="40" width="720" height="420" fill="none" stroke="#f5f5f4" stroke-width="2"/>
        <text x="60" y="100" fill="#f5f5f4" font-family="monospace" font-size="28">NIL DS / SPEC</text>
        <line x1="60" y1="140" x2="740" y2="140" stroke="${ACCENT}" stroke-width="2"/>
      </svg>`,
    ),
  alt: 'Sample technical drawing',
};

const DEMO_REPLY =
  'Tokens are named values that code reads, like a colour or a spacing. A component asks for --nil-color-accent, never the hex, so one change in tokens.json reaches every component.';

type Turn = { id: number; role: 'you' | 'kit'; text: string };

/** What the conversation shows while "Show streaming state" is on: the canned reply, caught partway. */
const PINNED_TURNS: Turn[] = [
  { id: -2, role: 'you', text: 'Which token sets the accent?' },
  { id: -1, role: 'kit', text: DEMO_REPLY.split(' ').slice(0, 18).join(' ') },
];

/** Working Composer with a canned reply, so Send, Stop and the streaming state can be tried without a backend. */
function ComposerDemo() {
  const [status, setStatus] = useState<ComposerStatus>('idle');
  const [pinned, setPinned] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const timers = useRef<number[]>([]);
  const nextId = useRef(0);
  const toggleLabelId = useId();

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  const handleSend = (text: string) => {
    clearTimers();
    const words = DEMO_REPLY.split(' ');
    const replyId = nextId.current + 1;
    nextId.current += 2;
    setTurns((t) => [...t, { id: replyId - 1, role: 'you' as const, text }, { id: replyId, role: 'kit' as const, text: '' }].slice(-6));
    setStatus('sending');
    timers.current.push(
      window.setTimeout(() => {
        setStatus('streaming');
        words.forEach((_, i) => {
          timers.current.push(
            window.setTimeout(() => {
              setTurns((t) => t.map((turn) => (turn.id === replyId ? { ...turn, text: words.slice(0, i + 1).join(' ') } : turn)));
              if (i === words.length - 1) setStatus('idle');
            }, (i + 1) * 60),
          );
        });
      }, 700),
    );
  };

  const handleStop = () => {
    clearTimers();
    setStatus('idle');
    setPinned(false);
  };

  // Pinned on and nothing really streaming: show the reply caught partway, so the state has something to point at.
  const shown = pinned && status === 'idle' ? [...turns, ...PINNED_TURNS] : turns;
  const visible = shown.filter((turn) => turn.text);

  return (
    <div className="nil-demo-composer">
      {visible.length > 0 ? (
        <div className="nil-demo-composer-log" role="log" aria-label="Conversation">
          {visible.map((turn) =>
            turn.role === 'you' ? (
              <Prompt key={turn.id} showCursor={false} style={{ whiteSpace: 'pre-wrap' }}>
                {turn.text}
              </Prompt>
            ) : (
              <Text key={turn.id} size="sm" muted>
                {turn.text}
              </Text>
            ),
          )}
        </div>
      ) : null}
      <Composer
        label="Ask about NIL DS"
        placeholder="Ask what a token does"
        status={pinned ? 'streaming' : status}
        onSend={handleSend}
        onStop={handleStop}
      />
      <div className="nil-demo-composer-controls">
        <Toggle checked={pinned} onCheckedChange={setPinned} aria-labelledby={toggleLabelId} />
        <span id={toggleLabelId} className="nil-label">
          Show streaming state
        </span>
      </div>
    </div>
  );
}

/** How long the demo pretends to delete for. Long enough to see the working state. */
const DELETE_MS = 1400;

/**
 * A destructive confirmation. Danger variant, focus starts on Cancel, and the delete shows that it
 * is working: the label becomes "Deleting" with the kit's blinking cursor, and a status message says so.
 * While it runs the Dialog is `busy`, so Escape, Close and the backdrop do nothing and Close looks
 * unavailable. Cancel and Delete are the caller's buttons, so they are marked aria-disabled here,
 * never disabled: focus stays where it is.
 */
function DeleteDemo() {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const timer = useRef<number>();
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const cancel = () => {
    if (!deleting) setOpen(false);
  };
  const confirm = () => {
    if (deleting) return;
    setDeleting(true);
    timer.current = window.setTimeout(() => {
      setDeleting(false);
      setOpen(false);
      setDeleted(true);
    }, DELETE_MS);
  };

  return (
    <div className="nil-demo-dialog-row">
      <Button
        variant="secondary"
        onClick={() => {
          setDeleted(false);
          setOpen(true);
        }}
      >
        Delete project
      </Button>
      <Text size="sm" muted role="status">
        {deleted ? 'Project deleted. Nothing was removed, this is a demo.' : ''}
      </Text>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        busy={deleting}
        variant="danger"
        title="Delete project"
        description="This removes the project and every token in it. It can't be undone."
        initialFocusRef={cancelRef}
        actions={
          <>
            <Button ref={cancelRef} variant="secondary" aria-disabled={deleting || undefined} onClick={cancel}>
              Cancel
            </Button>
            <Button variant="danger" aria-disabled={deleting || undefined} onClick={confirm}>
              {deleting ? (
                <>
                  Deleting<span className="nil-cursor-blink" aria-hidden>▌</span>
                </>
              ) : (
                'Delete project'
              )}
            </Button>
          </>
        }
      >
        <p role="status" className="nil-sr-only">
          {deleting ? 'Deleting project' : ''}
        </p>
      </Dialog>
    </div>
  );
}

/** A short form. Focus starts in the field, Enter saves, and the Save button sits in the actions row. */
function RenameDemo() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('nil-ds demo');
  const [saved, setSaved] = useState<string | null>(null);
  const formId = useId();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = String(new FormData(event.currentTarget).get('name') ?? '').trim();
    if (!next) return;
    setName(next);
    setSaved(next);
    setOpen(false);
  };

  return (
    <div className="nil-demo-dialog-row">
      <Button
        variant="secondary"
        onClick={() => {
          setSaved(null);
          setOpen(true);
        }}
      >
        Rename project
      </Button>
      <Text size="sm" muted role="status">
        {saved ? `Renamed to ${saved}. Nothing was saved, this is a demo.` : ''}
      </Text>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Rename project"
        description="Pick a short name. You can change it again later."
        actions={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" form={formId}>
              Save name
            </Button>
          </>
        }
      >
        <form id={formId} onSubmit={handleSubmit}>
          <Input label="Project name" name="name" defaultValue={name} required />
        </form>
      </Dialog>
    </div>
  );
}

export function GalleryScene() {
  const { ref, visible } = useReveal();
  const [lightbox, setLightbox] = useState<LightboxImage | null>(null);

  return (
    <DemoScene id="gallery" ref={ref}>
      <div className={`nil-enter${visible ? ' is-visible' : ''}`}>
        <Heading level={2}>Gallery</Heading>
        <Text muted>Every primitive state, an appendix for auditors.</Text>
      </div>

      <div className="nil-demo-gallery-grid" style={{ marginTop: 'var(--nil-spacing-lg)' }}>
        <Card className="nil-demo-gallery-buttons" style={{ gridColumn: '1 / -1' }}>
          <Heading level={3}>Buttons</Heading>
          <Text size="sm" muted style={{ marginTop: 'var(--nil-spacing-xs)' }}>
            IBM Plex Mono · uppercase label · brackets match Meta spacing
          </Text>
          <div className="nil-demo-button-strip">
            <div className="nil-demo-button-cell">
              <Button variant="primary">Apply</Button>
              <span className="nil-demo-button-label">primary</span>
            </div>
            <div className="nil-demo-button-cell">
              <Button variant="secondary">Run query</Button>
              <span className="nil-demo-button-label">secondary</span>
            </div>
            <div className="nil-demo-button-cell">
              <Button variant="ghost">Cancel</Button>
              <span className="nil-demo-button-label">ghost</span>
            </div>
            <div className="nil-demo-button-cell">
              <Button variant="secondary" disabled>
                Disabled
              </Button>
              <span className="nil-demo-button-label">disabled</span>
            </div>
          </div>
        </Card>

        <Card style={{ gridColumn: '1 / -1' }}>
          <Heading level={3}>Composer</Heading>
          <Text size="sm" muted style={{ marginTop: 'var(--nil-spacing-xs)' }}>
            Prompt shows a line. Composer is where you write one. Enter sends and Shift+Enter starts a new line. It respects IME composition, the way people type Japanese, Chinese or Korean: the Enter that confirms your characters never sends a half-finished message.
          </Text>
          <div style={{ marginTop: 'var(--nil-spacing-md)' }}>
            <ComposerDemo />
          </div>
        </Card>

        <Card style={{ gridColumn: '1 / -1' }}>
          <Heading level={3}>Dialog</Heading>
          <Text size="sm" muted style={{ marginTop: 'var(--nil-spacing-xs)' }}>
            A modal for one decision or a short form. Focus moves in, stays in, and returns to the button that opened it.
          </Text>
          <div style={{ marginTop: 'var(--nil-spacing-md)' }}>
            <DeleteDemo />
            <RenameDemo />
          </div>
        </Card>

        <Card>
          <Heading level={3}>Badges</Heading>
          <div style={{ display: 'flex', gap: 'var(--nil-spacing-sm)', flexWrap: 'wrap', marginTop: 'var(--nil-spacing-sm)' }}>
            <Badge tone="neutral">Neutral</Badge>
            <Badge tone="accent">Accent</Badge>
            <Badge tone="danger">Danger</Badge>
            <Badge tone="success">Success</Badge>
          </div>
        </Card>

        <Card>
          <Heading level={3}>Meta</Heading>
          <div style={{ display: 'flex', gap: 'var(--nil-spacing-md)', flexWrap: 'wrap', marginTop: 'var(--nil-spacing-sm)' }}>
            <Meta label="Role">Design Engineer</Meta>
            <Meta label="Status" tone="accent">Active</Meta>
            <Meta label="Alert" tone="danger">Fault</Meta>
            <Meta label="Health" tone="success">OK</Meta>
          </div>
        </Card>

        <Card>
          <Heading level={3}>Input</Heading>
          <div style={{ marginTop: 'var(--nil-spacing-sm)' }}>
            <Input label="Name" placeholder="Your name" />
            <Input label="Device ID" placeholder="Required" error="Invalid ID: check the format" style={{ marginTop: 'var(--nil-spacing-md)' }} />
          </div>
        </Card>

        <Card>
          <Heading level={3}>Grid</Heading>
          <div style={{ marginTop: 'var(--nil-spacing-sm)' }}>
            <Grid columns={2}>
              <Text size="sm" muted>Cell A</Text>
              <Text size="sm" muted>Cell B</Text>
            </Grid>
          </div>
        </Card>

        <Card>
          <Heading level={3}>Lightbox</Heading>
          <Button variant="secondary" style={{ marginTop: 'var(--nil-spacing-sm)' }} onClick={() => setLightbox(DEMO_LIGHTBOX)}>
            Open sample
          </Button>
        </Card>
      </div>

      <Divider spacing="var(--nil-spacing-xl)" />
      <Text size="sm" muted>
        Motion: <code>.nil-grid-bg</code>, <code>.nil-cursor-blink</code>, <code>.nil-enter</code>. See the scenes above.
      </Text>

      <Lightbox image={lightbox} onClose={() => setLightbox(null)} />
    </DemoScene>
  );
}
