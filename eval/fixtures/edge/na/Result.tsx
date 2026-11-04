import { useState } from 'react';
import { Button } from '../src';

// EDGE FIXTURE: no style of any kind, so R1 to R5 inspect nothing and must say n/a, never pass.
export default function Result({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState('');
  const send = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
  };
  return (
    <div>
      <textarea aria-label="Message" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} />
      <Button onClick={send}>Send</Button>
    </div>
  );
}
