import { useId, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Button } from '../src';

export interface ChatComposerProps {
  onSend: (text: string) => void;
}

/**
 * The kit's `Input` is single-line, so the message box is a native `<textarea>`
 * reusing the kit's `.nil-input` / `.nil-input-label` classes (token-only styling).
 */
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
    // Shift+Enter falls through to insert a newline; IME confirmation must not send.
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  };

  return (
    <form
      className="nil-input-group"
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
    >
      <label htmlFor={id} className="nil-input-label">
        Message
      </label>
      <div style={{ display: 'flex', gap: 'var(--nil-spacing-sm)', alignItems: 'flex-end' }}>
        <textarea
          id={id}
          className="nil-input"
          rows={3}
          value={text}
          placeholder="Type a message. Enter to send, Shift+Enter for a new line."
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{ flex: 1, resize: 'vertical' }}
        />
        <Button type="submit" variant="primary" disabled={!canSend}>
          Send
        </Button>
      </div>
    </form>
  );
}
