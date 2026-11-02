import { useId, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Button } from '../src';

export interface ChatComposerProps {
  onSend: (text: string) => void;
}

export default function ChatComposer({ onSend }: ChatComposerProps) {
  const [text, setText] = useState('');
  const id = useId();
  const canSend = text.trim().length > 0;

  const send = () => {
    if (!canSend) return;
    onSend(text);
    setText('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Ignore Enter while an IME composition is in progress.
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 'var(--nil-spacing-sm)',
      }}
    >
      <textarea
        id={id}
        aria-label="Message"
        className="nil-input"
        rows={3}
        value={text}
        placeholder="Type a message…"
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{ flex: 1, resize: 'vertical', minWidth: 0 }}
      />
      <Button type="button" variant="primary" disabled={!canSend} onClick={send}>
        SEND
      </Button>
    </div>
  );
}
