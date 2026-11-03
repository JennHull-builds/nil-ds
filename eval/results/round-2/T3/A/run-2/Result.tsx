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
      className="nil-input-group"
      style={{ width: '100%' }}
    >
      <label htmlFor={id} className="nil-input-label">
        Message
      </label>
      <div style={{ display: 'flex', gap: 'var(--nil-spacing-sm)', alignItems: 'flex-end' }}>
        <textarea
          id={id}
          className="nil-input"
          value={text}
          rows={3}
          placeholder="Type a message…"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{ flex: 1, resize: 'vertical', minWidth: 0 }}
        />
        <Button type="button" variant="primary" onClick={send} disabled={!canSend}>
          Send
        </Button>
      </div>
    </div>
  );
}
