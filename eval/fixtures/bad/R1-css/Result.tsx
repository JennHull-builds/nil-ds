// BAD FIXTURE R1: a raw colour in a .css file the subject wrote. Every other rule must still pass.
import './styles.css';
import { useState, type KeyboardEvent } from 'react';
import { Button, Heading } from '../src';

/**
 * Fixture: a clean T3 (chat composer), written by hand to pass every rule.
 * It also carries one line for each "allowed" case the rules promise, so a detector that
 * wrongly flags them fails this fixture: transparent, currentColor, inherit (R1), 0 and a
 * percentage and a calc() built from tokens (R4), 0 and a radius token (R5).
 */
export default function Result({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState('');

  const send = () => {
    const message = text.trim();
    if (!message) return;
    onSend(message);
    setText('');
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  };

  return (
    <section
      aria-labelledby="composer-title"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'calc(var(--nil-spacing-sm) * 2)',
        padding: 'var(--nil-spacing-md)',
        marginLeft: '5%',
        background: 'var(--nil-color-surface)',
        color: 'var(--nil-color-text)',
        border: 'var(--nil-border-width) solid var(--nil-color-border)',
        borderRadius: 'var(--nil-radius-default)',
      }}
    >
      <Heading level={2} id="composer-title">
        Message
      </Heading>
      <textarea
        aria-label="Message"
        rows={3}
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={onKeyDown}
        style={{
          padding: 'var(--nil-spacing-sm)',
          margin: 0,
          background: 'transparent',
          color: 'inherit',
          borderColor: 'currentColor',
          borderRadius: 0,
          fontFamily: 'var(--nil-font-body)',
          fontSize: 'var(--nil-type-scale-base)',
        }}
      />
      <Button variant="primary" onClick={send}>
        Send
      </Button>
    </section>
  );
}
