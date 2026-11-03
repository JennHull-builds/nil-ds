import { useId, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Button } from '../src';

export interface ChatComposerProps {
  onSend: (text: string) => void;
}

/**
 * Multi-line chat composer. Enter sends, Shift+Enter inserts a newline,
 * and empty / whitespace-only messages are never sent.
 *
 * The kit's Input is single-line (<input>), so a native <textarea> is used,
 * styled with the kit's input classes; Button comes from the kit.
 */
export default function ChatComposer({ onSend }: ChatComposerProps) {
  const [text, setText] = useState('');
  const id = useId();
  const canSend = text.trim().length > 0;

  const send = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Don't hijack Enter while an IME composition is being confirmed.
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
      style={{ display: 'flex', gap: 'var(--nil-space-2, 8px)', alignItems: 'flex-end' }}
    >
      <label htmlFor={id} style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
        Message
      </label>
      <textarea
        id={id}
        className="nil-input"
        value={text}
        rows={3}
        placeholder="Type a message…"
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{ flex: 1, resize: 'vertical', fontFamily: 'inherit' }}
      />
      <Button type="submit" variant="primary" disabled={!canSend}>
        Send
      </Button>
    </form>
  );
}
