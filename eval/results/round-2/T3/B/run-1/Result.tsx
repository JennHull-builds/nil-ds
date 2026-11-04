import { useId, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Button } from '../src';

export interface ChatComposerProps {
  onSend: (text: string) => void;
}

/**
 * The kit's Input is single-line only, so the message box is a native
 * <textarea> that reuses the kit's `.nil-input` / `.nil-input-label` classes
 * from core.css. The send control is the kit's primary Button.
 */
export default function ChatComposer({ onSend }: ChatComposerProps) {
  const [text, setText] = useState('');
  const id = useId();

  const isEmpty = text.trim().length === 0;

  const send = () => {
    if (isEmpty) return;
    onSend(text.trim());
    setText('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Don't send while an IME is composing (e.g. confirming a candidate).
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter' && !e.shiftKey) {
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
        flexDirection: 'column',
        gap: 'var(--nil-spacing-sm)',
      }}
    >
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
        style={{ resize: 'vertical', width: '100%', boxSizing: 'border-box' }}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="submit" variant="primary" disabled={isEmpty}>
          SEND
        </Button>
      </div>
    </form>
  );
}
