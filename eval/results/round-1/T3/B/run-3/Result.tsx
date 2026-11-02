import { useId, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Button } from '../src';

export interface ChatComposerProps {
  onSend: (text: string) => void;
}

/**
 * The kit's Input is single-line only, so the multi-line field is a native
 * <textarea> reusing the kit's `.nil-input` classes; the send action is the
 * kit Button.
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
    // Ignore Enter while an IME is composing (e.g. confirming a candidate).
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
      style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--nil-spacing-sm)' }}
    >
      <label
        htmlFor={id}
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          overflow: 'hidden',
          clip: 'rect(0 0 0 0)',
          whiteSpace: 'nowrap',
        }}
      >
        Message
      </label>
      <textarea
        id={id}
        className="nil-input"
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message. Enter to send, Shift+Enter for a new line."
        style={{ flex: 1, resize: 'vertical' }}
      />
      <Button type="submit" variant="primary" disabled={!canSend}>
        Send
      </Button>
    </form>
  );
}
