import { useId, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Button } from '../src';

export interface ChatComposerProps {
  onSend: (text: string) => void;
}

export default function ChatComposer({ onSend }: ChatComposerProps) {
  const [text, setText] = useState('');
  const id = useId();
  const isEmpty = text.trim().length === 0;

  const send = () => {
    if (isEmpty) return;
    onSend(text);
    setText('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Don't send while an IME composition is in progress.
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
        placeholder="Type a message…"
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{ flex: 1, resize: 'vertical', minWidth: 0 }}
      />
      <Button type="button" variant="primary" onClick={send} disabled={isEmpty}>
        SEND
      </Button>
    </div>
  );
}
