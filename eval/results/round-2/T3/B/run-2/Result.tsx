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
    <form
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 'var(--nil-spacing-sm)',
      }}
    >
      <div className="nil-input-group" style={{ flex: 1 }}>
        <label htmlFor={id} className="nil-input-label">
          Message
        </label>
        <textarea
          id={id}
          className="nil-input"
          rows={3}
          value={text}
          placeholder="Type a message. Enter to send, Shift+Enter for a new line."
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{ resize: 'vertical' }}
        />
      </div>
      <Button type="submit" variant="primary" disabled={!canSend}>
        Send
      </Button>
    </form>
  );
}
