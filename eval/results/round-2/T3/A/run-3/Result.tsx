import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Button } from '../src';

export interface ChatComposerProps {
  onSend: (text: string) => void;
}

export default function ChatComposer({ onSend }: ChatComposerProps) {
  const [text, setText] = useState('');
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
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--nil-spacing-sm)' }}>
      <textarea
        className="nil-input"
        aria-label="Message"
        placeholder="Type a message…"
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{ flex: 1, resize: 'vertical', lineHeight: 1.5 }}
      />
      <Button variant="primary" type="button" onClick={send} disabled={!canSend}>
        Send
      </Button>
    </div>
  );
}
