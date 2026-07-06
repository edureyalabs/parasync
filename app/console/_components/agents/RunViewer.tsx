// console/_components/agents/RunViewer.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { Run, RunStep } from './types';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000';
const POLL_MS = 2000;

// ─── Step icon ────────────────────────────────────────────────────────────────

function StepIcon({ type }: { type: RunStep['type'] }) {
  const icons: Record<string, React.ReactNode> = {
    llm_call: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <circle cx="6" cy="6" r="5" stroke="#888" strokeWidth="1.3" />
        <path d="M4 6h4M6 4v4" stroke="#888" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
    llm_response: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2 3.5l4 4 4-4" stroke="#1a7f5a" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    tool_call: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <rect x="2" y="2" width="8" height="8" rx="1.5" stroke="#7c5cfc" strokeWidth="1.3" />
        <path d="M4 6h4" stroke="#7c5cfc" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
    tool_result: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2 6l3 3 5-5" stroke="#1a7f5a" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    error: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <circle cx="6" cy="6" r="5" stroke="#c0392b" strokeWidth="1.3" />
        <path d="M6 4v3M6 8.5v.5" stroke="#c0392b" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  };
  return <span style={{ flexShrink: 0, marginTop: 2 }}>{icons[type] ?? icons.llm_call}</span>;
}

// ─── Step card ────────────────────────────────────────────────────────────────

function StepCard({ step }: { step: RunStep }) {
  const [expanded, setExpanded] = useState(false);

  const label: Record<string, string> = {
    llm_call:     'LLM call',
    llm_response: 'LLM response',
    tool_call:    `Tool call: ${step.tool}`,
    tool_result:  `Tool result: ${step.tool}`,
    error:        'Error',
  };

  const borderColor: Record<string, string> = {
    llm_call:     '#e3e1dc',
    llm_response: '#b6e8d3',
    tool_call:    '#ddd6fe',
    tool_result:  '#b6e8d3',
    error:        '#fad4ce',
  };

  const hasDetail = step.content || step.arguments || step.result || step.traceback || step.message;

  return (
    <div style={{
      border: `1px solid ${borderColor[step.type] ?? '#e3e1dc'}`,
      borderRadius: 5, background: '#fff',
      overflow: 'hidden',
    }}>
      <div
        onClick={() => hasDetail && setExpanded(e => !e)}
        style={{
          display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
          padding: '0.65rem 0.85rem',
          cursor: hasDetail ? 'pointer' : 'default',
        }}
      >
        <StepIcon type={step.type} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.75rem', color: '#333', margin: 0, fontWeight: 500 }}>
            {label[step.type] ?? step.type}
          </p>
          {step.type === 'tool_call' && step.arguments && (
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.68rem', color: '#888', margin: '0.2rem 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {JSON.stringify(step.arguments)}
            </p>
          )}
          {step.type === 'llm_response' && step.content && (
            <p style={{ fontSize: '0.75rem', color: '#555', margin: '0.2rem 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {step.content}
            </p>
          )}
        </div>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.62rem', color: '#bbb', flexShrink: 0, margin: 0 }}>
          {new Date(step.timestamp).toLocaleTimeString()}
        </p>
        {hasDetail && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', color: '#aaa' }}>
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      {expanded && hasDetail && (
        <div style={{ borderTop: '1px solid #f0eeea', padding: '0.65rem 0.85rem' }}>
          {(step.content || step.message) && (
            <pre style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', color: '#333', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.6 }}>
              {step.content ?? step.message}
            </pre>
          )}
          {step.arguments && (
            <pre style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', color: '#555', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {JSON.stringify(step.arguments, null, 2)}
            </pre>
          )}
          {step.result && (
            <pre style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', color: '#1a7f5a', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {step.result}
            </pre>
          )}
          {step.traceback && (
            <pre style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', color: '#c0392b', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {step.traceback}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Run['status'] }) {
  const styles: Record<string, React.CSSProperties> = {
    queued:    { background: '#f5f4f1', color: '#666' },
    running:   { background: '#fff8e1', color: '#b57c00' },
    completed: { background: '#f0faf6', color: '#1a7f5a' },
    failed:    { background: '#fef6f5', color: '#c0392b' },
  };
  return (
    <span style={{
      ...styles[status],
      fontFamily: "'DM Mono', monospace", fontSize: '0.65rem',
      letterSpacing: '0.06em', textTransform: 'uppercase',
      padding: '0.2rem 0.55rem', borderRadius: 3,
    }}>
      {status === 'running' ? '● ' : ''}{status}
    </span>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

interface Props {
  runId: string;
  onClose: () => void;
}

export default function RunViewer({ runId, onClose }: Props) {
  const [run, setRun] = useState<Run | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchRun = async () => {
    const res = await fetch(`${BACKEND}/agents/runs/${runId}`);
    if (!res.ok) return;
    const data: Run = await res.json();
    setRun(data);
    if (data.status === 'completed' || data.status === 'failed') {
      if (pollRef.current) clearInterval(pollRef.current);
    }
  };

  useEffect(() => {
    fetchRun();
    pollRef.current = setInterval(fetchRun, POLL_MS);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [runId]);

  // Auto-scroll to bottom as steps arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [run?.steps.length]);

  return (
    <div style={{ padding: '2rem', width: '100%', maxWidth: 720 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', padding: '2px', display: 'flex', alignItems: 'center' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.68rem', color: '#777', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 0.2rem' }}>
            console · agents · run
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 500, letterSpacing: '-0.02em', color: '#111', margin: 0 }}>
              Run trace
            </h1>
            {run && <StatusBadge status={run.status} />}
          </div>
        </div>
        {run && (
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', color: '#aaa', margin: 0 }}>
            {run.steps.length} steps
          </p>
        )}
      </div>

      {/* Steps */}
      {!run ? (
        <p style={{ fontSize: '0.825rem', color: '#888' }}>Loading…</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {run.steps.map((step, i) => <StepCard key={i} step={step} />)}
          {(run.status === 'queued' || run.status === 'running') && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 0.85rem', background: '#fff8e1', border: '1px solid #ffe082', borderRadius: 5 }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%',
                border: '1.5px solid #b57c00', borderTopColor: 'transparent',
                animation: 'agent-spin 0.8s linear infinite', flexShrink: 0,
              }} />
              <style>{`@keyframes agent-spin { to { transform: rotate(360deg); } }`}</style>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', color: '#b57c00', margin: 0 }}>
                {run.status === 'queued' ? 'Queued…' : 'Agent running…'}
              </p>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Final output */}
      {run?.output && (
        <div style={{ background: '#f0faf6', border: '1px solid #b6e8d3', borderRadius: 6, padding: '1rem 1.25rem' }}>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', color: '#1a7f5a', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 0.5rem' }}>
            Final output
          </p>
          <pre style={{ fontSize: '0.825rem', color: '#111', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.65, fontFamily: "'DM Sans', sans-serif" }}>
            {run.output}
          </pre>
        </div>
      )}

      {run?.error && (
        <div style={{ background: '#fef6f5', border: '1px solid #fad4ce', borderRadius: 6, padding: '1rem 1.25rem' }}>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', color: '#c0392b', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 0.5rem' }}>
            Error
          </p>
          <pre style={{ fontSize: '0.8rem', color: '#c0392b', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.6, fontFamily: "'DM Mono', monospace" }}>
            {run.error}
          </pre>
        </div>
      )}
    </div>
  );
}