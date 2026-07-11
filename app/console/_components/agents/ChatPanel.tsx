// parasync/app/console/_components/agents/ChatPanel.tsx
'use client';
import { useState, useEffect, useRef } from 'react';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000';
const mono: React.CSSProperties = { fontFamily: "'DM Mono', monospace" };

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_calls?: any[];
  tool_name?: string;
  task_id?: string;
  created_at: string;
}

// ─── Minimal markdown renderer (no external deps) ─────────────────────────────
function MarkdownContent({ content }: { content: string }) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  const inlineRender = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|__[^_]+__|_[^_]+_|\[([^\]]+)\]\(([^)]+)\))/g;
    let last = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > last) parts.push(text.slice(last, match.index));
      const m = match[0];
      if (m.startsWith('`'))
        parts.push(<code key={match.index} style={{ ...mono, fontSize: '0.82em', background: '#f0eeea', padding: '0.1em 0.35em', borderRadius: 3 }}>{m.slice(1, -1)}</code>);
      else if (m.startsWith('**') || m.startsWith('__'))
        parts.push(<strong key={match.index}>{m.slice(2, -2)}</strong>);
      else if (m.startsWith('*') || m.startsWith('_'))
        parts.push(<em key={match.index}>{m.slice(1, -1)}</em>);
      else if (m.startsWith('['))
        parts.push(<a key={match.index} href={match[3]} target="_blank" rel="noopener noreferrer" style={{ color: '#1a7f5a', textDecoration: 'underline' }}>{match[2]}</a>);
      last = match.index + m.length;
    }
    if (last < text.length) parts.push(text.slice(last));
    return parts;
  };

  while (i < lines.length) {
    const line = lines[i];

    // Code block
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) { codeLines.push(lines[i]); i++; }
      elements.push(
        <div key={`code-${i}`} style={{ margin: '0.6rem 0', borderRadius: 6, overflow: 'hidden', border: '1px solid #e3e1dc' }}>
          {lang && <div style={{ ...mono, fontSize: '0.65rem', color: '#888', background: '#f5f4f1', padding: '0.3rem 0.75rem', borderBottom: '1px solid #e3e1dc', letterSpacing: '0.05em' }}>{lang}</div>}
          <pre style={{ ...mono, fontSize: '0.78rem', color: '#222', background: '#f9f8f6', margin: 0, padding: '0.75rem', overflowX: 'auto', lineHeight: 1.65 }}>{codeLines.join('\n')}</pre>
        </div>
      );
      i++; continue;
    }

    // Headings
    const h3 = line.match(/^### (.+)/);
    const h2 = line.match(/^## (.+)/);
    const h1 = line.match(/^# (.+)/);
    if (h1) { elements.push(<h1 key={`h1-${i}`} style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0.8rem 0 0.4rem', color: '#111' }}>{inlineRender(h1[1])}</h1>); i++; continue; }
    if (h2) { elements.push(<h2 key={`h2-${i}`} style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0.75rem 0 0.35rem', color: '#111' }}>{inlineRender(h2[1])}</h2>); i++; continue; }
    if (h3) { elements.push(<h3 key={`h3-${i}`} style={{ fontSize: '0.875rem', fontWeight: 600, margin: '0.6rem 0 0.3rem', color: '#111' }}>{inlineRender(h3[1])}</h3>); i++; continue; }

    // HR
    if (line.match(/^---+$/)) { elements.push(<hr key={`hr-${i}`} style={{ border: 'none', borderTop: '1px solid #e3e1dc', margin: '0.6rem 0' }} />); i++; continue; }

    // Table
    if (line.includes('|') && lines[i + 1]?.match(/^\|[-| :]+\|$/)) {
      const headers = line.split('|').filter(Boolean).map(h => h.trim());
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes('|')) { rows.push(lines[i].split('|').filter(Boolean).map(c => c.trim())); i++; }
      elements.push(
        <div key={`table-${i}`} style={{ overflowX: 'auto', margin: '0.6rem 0' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.82rem' }}>
            <thead>
              <tr>{headers.map((h, j) => <th key={j} style={{ ...mono, fontSize: '0.7rem', textAlign: 'left', padding: '0.4rem 0.75rem', background: '#f5f4f1', borderBottom: '2px solid #e3e1dc', color: '#555', letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} style={{ background: ri % 2 === 0 ? '#fff' : '#fafaf8' }}>
                  {row.map((cell, ci) => <td key={ci} style={{ padding: '0.4rem 0.75rem', borderBottom: '1px solid #f0eeea', color: '#333', lineHeight: 1.5 }}>{inlineRender(cell)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // Unordered list
    if (line.match(/^[-*+] /)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^[-*+] /)) { items.push(lines[i].slice(2)); i++; }
      elements.push(<ul key={`ul-${i}`} style={{ margin: '0.4rem 0', paddingLeft: '1.25rem' }}>{items.map((item, j) => <li key={j} style={{ margin: '0.2rem 0', lineHeight: 1.6 }}>{inlineRender(item)}</li>)}</ul>);
      continue;
    }

    // Ordered list
    if (line.match(/^\d+\. /)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^\d+\. /)) { items.push(lines[i].replace(/^\d+\. /, '')); i++; }
      elements.push(<ol key={`ol-${i}`} style={{ margin: '0.4rem 0', paddingLeft: '1.25rem' }}>{items.map((item, j) => <li key={j} style={{ margin: '0.2rem 0', lineHeight: 1.6 }}>{inlineRender(item)}</li>)}</ol>);
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      elements.push(<blockquote key={`bq-${i}`} style={{ borderLeft: '3px solid #ddd', margin: '0.4rem 0', padding: '0.3rem 0.75rem', color: '#666', fontStyle: 'italic' }}>{inlineRender(line.slice(2))}</blockquote>);
      i++; continue;
    }

    // Empty line
    if (line.trim() === '') { elements.push(<div key={`br-${i}`} style={{ height: '0.5rem' }} />); i++; continue; }

    // Paragraph
    elements.push(<p key={`p-${i}`} style={{ margin: '0.15rem 0', lineHeight: 1.65 }}>{inlineRender(line)}</p>);
    i++;
  }

  return <div style={{ fontSize: '0.875rem', color: '#111', wordBreak: 'break-word' }}>{elements}</div>;
}

// ─── Tool call badge ──────────────────────────────────────────────────────────
function ToolCallBadge({ toolName, content }: { toolName: string; content: string }) {
  const [open, setOpen] = useState(false);
  const colors: Record<string, { bg: string; color: string }> = {
    memory:         { bg: '#f0eeea', color: '#555' },
    execute_code:   { bg: '#fff8e1', color: '#b57c00' },
    web_search:     { bg: '#e8f4fd', color: '#1a6fa8' },
    browse_web:     { bg: '#f0eeff', color: '#7c5cfc' },
    create_task:    { bg: '#f0faf6', color: '#1a7f5a' },
    run_task:       { bg: '#f0faf6', color: '#1a7f5a' },
    list_tasks:     { bg: '#f5f4f1', color: '#666' },
    search_history: { bg: '#f0eeff', color: '#7c5cfc' },
  };
  const style = colors[toolName] ?? { bg: '#f5f4f1', color: '#666' };
  return (
    <div style={{ marginTop: '0.5rem' }}>
      <button onClick={() => setOpen(o => !o)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: style.bg, color: style.color, border: 'none', borderRadius: 4, padding: '0.25rem 0.65rem', fontSize: '0.72rem', ...mono, cursor: 'pointer' }}>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><rect x="1" y="1" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3" /><path d="M3 5h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
        {toolName}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}><path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {open && content && (
        <pre style={{ ...mono, fontSize: '0.72rem', color: '#444', background: '#f5f4f1', border: '1px solid #e3e1dc', borderRadius: 4, padding: '0.6rem 0.75rem', margin: '0.35rem 0 0', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.6, maxHeight: 200, overflowY: 'auto' }}>
          {content}
        </pre>
      )}
    </div>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function MessageBubble({ msg, prevRole }: { msg: Message; prevRole?: string }) {
  const isUser      = msg.role === 'user';
  const isAssistant = msg.role === 'assistant';
  const isTool      = msg.role === 'tool';

  if (isTool) return <ToolCallBadge toolName={msg.tool_name ?? 'tool'} content={msg.content ?? ''} />;

  const showTime = prevRole !== msg.role;

  return (
    <div style={{ display: 'flex', flexDirection: isUser ? 'row-reverse' : 'row', gap: '0.6rem', marginTop: showTime ? '1rem' : '0.25rem', alignItems: 'flex-end' }}>
      {isAssistant && showTime && (
        <div style={{ width: 26, height: 26, borderRadius: 6, background: '#111', color: '#fafaf8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.6rem', ...mono }}>AI</div>
      )}
      {isAssistant && !showTime && <div style={{ width: 26, flexShrink: 0 }} />}

      <div style={{ maxWidth: '72%', minWidth: 0 }}>
        {showTime && (
          <p style={{ ...mono, fontSize: '0.6rem', color: '#bbb', margin: '0 0 0.3rem', textAlign: isUser ? 'right' : 'left' }}>
            {new Date(msg.created_at).toLocaleTimeString()}
          </p>
        )}
        <div style={{
          background: isUser ? '#111' : '#fff',
          color: isUser ? '#fafaf8' : '#111',
          border: isUser ? 'none' : '1px solid #e3e1dc',
          borderRadius: isUser ? '12px 12px 2px 12px' : '2px 12px 12px 12px',
          padding: '0.65rem 0.9rem',
          wordBreak: 'break-word',
        }}>
          {isUser ? (
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem', lineHeight: 1.65, color: '#fafaf8' }}>{msg.content}</pre>
          ) : (
            <MarkdownContent content={msg.content ?? ''} />
          )}
        </div>
        {isAssistant && msg.tool_calls && msg.tool_calls.map((tc: any, idx: number) => (
          <ToolCallBadge key={idx} toolName={tc.name ?? tc.function?.name} content={JSON.stringify(tc.arguments ?? tc.function?.arguments, null, 2)} />
        ))}
      </div>
    </div>
  );
}

// ─── Memory drawer ────────────────────────────────────────────────────────────
function MemoryDrawer({ agentId }: { agentId: string }) {
  const [open, setOpen]  = useState(false);
  const [memory, setMem] = useState<{ agent: string; user: string } | null>(null);

  useEffect(() => {
    if (!open || memory) return;
    fetch(`${BACKEND}/chat/${agentId}/memory`)
      .then(r => r.json())
      .then(data => setMem({ agent: data?.agent ?? '', user: data?.user ?? '' }))
      .catch(() => setMem({ agent: '', user: '' }));
  }, [open, agentId]);

  return (
    <>
      <button onClick={() => setOpen(o => !o)} style={{ background: 'none', border: '1px solid #ddd', color: '#666', padding: '0.3rem 0.75rem', fontSize: '0.75rem', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', borderRadius: 4, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.3" /><path d="M6 4v4M4 6h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
        Memory
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '100%', right: 0, zIndex: 20, width: 380, background: '#fff', border: '1px solid #e3e1dc', borderRadius: 6, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', padding: '1rem', marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <p style={{ ...mono, fontSize: '0.68rem', color: '#777', letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>Agent Memory</p>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa' }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </button>
          </div>
          {!memory ? <p style={{ fontSize: '0.8rem', color: '#888' }}>Loading…</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(['agent', 'user'] as const).map(type => (
                <div key={type}>
                  <p style={{ ...mono, fontSize: '0.65rem', color: '#aaa', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 0.4rem' }}>
                    {type.toUpperCase()}.md ({(memory[type] ?? '').length}/{type === 'agent' ? 2000 : 1500})
                  </p>
                  <div style={{ background: '#f5f4f1', borderRadius: 4, padding: '0.6rem', maxHeight: 180, overflowY: 'auto' }}>
                    <MarkdownContent content={memory[type] || '*(empty)*'} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

// ─── Main ChatPanel ───────────────────────────────────────────────────────────
interface Props {
  agentId: string;
  orgId: string;
  agentName: string;
}

export default function ChatPanel({ agentId, orgId, agentName }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]       = useState('');
  const [sending, setSending]   = useState(false);
  const [loading, setLoading]   = useState(true);
  const [activeTaskId]          = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch(`${BACKEND}/chat/${agentId}/history?limit=50`)
      .then(r => r.json())
      .then(data => { setMessages(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [agentId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages.length]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setMessages(prev => [...prev, { id: `local-${Date.now()}`, role: 'user', content: text, created_at: new Date().toISOString() }]);
    setInput('');
    setSending(true);
    try {
      const res = await fetch(`${BACKEND}/chat/${agentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, org_id: orgId, active_task_id: activeTaskId }),
      });
      const content = res.ok ? (await res.json()).response : 'Something went wrong. Please try again.';
      setMessages(prev => [...prev, { id: `local-assistant-${Date.now()}`, role: 'assistant', content, created_at: new Date().toISOString() }]);
    } catch {
      setMessages(prev => [...prev, { id: `error-${Date.now()}`, role: 'assistant', content: 'Could not reach the server. Check your connection.', created_at: new Date().toISOString() }]);
    }
    setSending(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#888', fontSize: '0.825rem' }}>Loading conversation…</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <style>{`@keyframes chat-spin { to { transform: rotate(360deg); } } @keyframes dot-bounce { 0%,100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1); } }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderBottom: '1px solid #e3e1dc', flexShrink: 0, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1a7f5a' }} />
          <span style={{ fontSize: '0.825rem', color: '#333', fontWeight: 500 }}>{agentName}</span>
          {messages.length > 0 && <span style={{ ...mono, fontSize: '0.65rem', color: '#bbb' }}>{messages.length} messages</span>}
        </div>
        <MemoryDrawer agentId={agentId} />
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1rem', minHeight: 0 }}>
        {messages.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '0.75rem', color: '#888' }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 9h12M9 3v12" stroke="white" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </div>
            <p style={{ fontSize: '0.875rem', margin: 0 }}>Start a conversation with {agentName}</p>
            <p style={{ ...mono, fontSize: '0.72rem', color: '#bbb', margin: 0, textAlign: 'center', maxWidth: 320, lineHeight: 1.6 }}>
              The agent can create tasks, run code, search the web, browse pages, and remember important facts.
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => <MessageBubble key={msg.id} msg={msg} prevRole={idx > 0 ? messages[idx - 1].role : undefined} />)}
            {sending && (
              <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem', alignItems: 'flex-end' }}>
                <div style={{ width: 26, height: 26, borderRadius: 6, background: '#111', color: '#fafaf8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.6rem', ...mono }}>AI</div>
                <div style={{ background: '#fff', border: '1px solid #e3e1dc', borderRadius: '2px 12px 12px 12px', padding: '0.75rem 1rem', display: 'flex', gap: '5px', alignItems: 'center' }}>
                  {[0, 1, 2].map(k => <div key={k} style={{ width: 6, height: 6, borderRadius: '50%', background: '#bbb', animation: `dot-bounce 1.2s ease-in-out ${k * 0.2}s infinite` }} />)}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid #e3e1dc', flexShrink: 0, background: '#fafaf8' }}>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-end' }}>
          <textarea
            ref={inputRef} value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${agentName}… (Enter to send, Shift+Enter for new line)`}
            rows={1} disabled={sending}
            style={{ flex: 1, padding: '0.65rem 0.85rem', fontSize: '0.875rem', fontFamily: "'DM Sans', sans-serif", color: '#111', background: '#fff', border: '1px solid #ddd', borderRadius: 8, outline: 'none', resize: 'none', lineHeight: 1.5, maxHeight: 140, overflowY: 'auto', transition: 'border-color 0.15s' }}
            onFocus={e => (e.target.style.borderColor = '#111')}
            onBlur={e => (e.target.style.borderColor = '#ddd')}
          />
          <button onClick={handleSend} disabled={!input.trim() || sending} style={{ width: 38, height: 38, borderRadius: 8, flexShrink: 0, background: !input.trim() || sending ? '#ddd' : '#111', border: 'none', cursor: !input.trim() || sending ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}>
            {sending
              ? <div style={{ width: 14, height: 14, border: '1.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'chat-spin 0.8s linear infinite' }} />
              : <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M12 7L2 2l2.5 5L2 12l10-5z" fill={!input.trim() ? '#aaa' : 'white'} /></svg>
            }
          </button>
        </div>
        <p style={{ ...mono, fontSize: '0.62rem', color: '#bbb', margin: '0.4rem 0 0' }}>
          The agent has memory, can create tasks, run code, search the web, and browse pages.
        </p>
      </div>
    </div>
  );
}