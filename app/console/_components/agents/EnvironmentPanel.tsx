// parasync/app/console/_components/agents/EnvironmentPanel.tsx
'use client';
import { useState, useEffect } from 'react';
import { AgentEnvironment } from './types';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000';

const mono: React.CSSProperties = { fontFamily: "'DM Mono', monospace" };

function StatusBadge({ status }: { status: AgentEnvironment['status'] }) {
  const styles: Record<string, React.CSSProperties> = {
    pending:    { background: '#f5f4f1', color: '#888' },
    installing: { background: '#fff8e1', color: '#b57c00' },
    ready:      { background: '#f0faf6', color: '#1a7f5a' },
    failed:     { background: '#fef6f5', color: '#c0392b' },
  };
  return (
    <span style={{
      ...styles[status],
      ...mono, fontSize: '0.65rem',
      letterSpacing: '0.06em', textTransform: 'uppercase',
      padding: '0.2rem 0.55rem', borderRadius: 3,
    }}>
      {status === 'installing' ? '● ' : ''}{status}
    </span>
  );
}

interface Props {
  agentId: string;
  orgId: string;
}

export default function EnvironmentPanel({ agentId, orgId }: Props) {
  const [env, setEnv]           = useState<AgentEnvironment | null>(null);
  const [loading, setLoading]   = useState(true);
  const [input, setInput]       = useState('');
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  const fetchEnv = async () => {
    const res = await fetch(`${BACKEND}/environments/agents/${agentId}?org_id=${orgId}`);
    if (res.ok) setEnv(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchEnv(); }, [agentId]);

  const handleSave = async () => {
    const packages = input.split('\n').map(p => p.trim()).filter(Boolean);
    setSaving(true);
    setError('');
    setSuccess('');

    const res = await fetch(`${BACKEND}/environments/agents/${agentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packages, org_id: orgId }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok || !data.ok) {
      setError(data.error ?? 'Failed to install packages.');
      return;
    }

    setSuccess('Packages installed successfully.');
    await fetchEnv();
  };

  const handleRemove = async (pkg: string) => {
    if (!env) return;
    const packages = env.packages.filter(p => p !== pkg);
    setSaving(true);
    setError('');

    const res = await fetch(`${BACKEND}/environments/agents/${agentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packages, org_id: orgId }),
    });

    const data = await res.json();
    setSaving(false);
    if (data.ok) await fetchEnv();
    else setError(data.error ?? 'Failed to remove package.');
  };

  if (loading) {
    return <p style={{ fontSize: '0.825rem', color: '#888' }}>Loading environment…</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <style>{`@keyframes env-spin { to { transform: rotate(360deg); } }`}</style>

      {/* Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <p style={{ ...mono, fontSize: '0.68rem', color: '#777', letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>
          Environment status
        </p>
        {env && <StatusBadge status={env.status} />}
        {env?.last_built_at && (
          <p style={{ ...mono, fontSize: '0.62rem', color: '#bbb', margin: 0 }}>
            Last built {new Date(env.last_built_at).toLocaleString()}
          </p>
        )}
      </div>

      {/* Installed packages */}
      <div>
        <p style={{ ...mono, fontSize: '0.68rem', color: '#333', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 0.75rem' }}>
          Installed packages ({env?.packages.length ?? 0})
        </p>
        {!env?.packages.length ? (
          <p style={{ fontSize: '0.825rem', color: '#aaa', fontStyle: 'italic', margin: 0 }}>
            No packages installed. Add packages below.
          </p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {env.packages.map(pkg => (
              <div key={pkg} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#f0eeea', border: '1px solid #e3e1dc', borderRadius: 4, padding: '0.25rem 0.5rem 0.25rem 0.65rem' }}>
                <span style={{ ...mono, fontSize: '0.75rem', color: '#333' }}>{pkg}</span>
                <button
                  onClick={() => handleRemove(pkg)}
                  disabled={saving}
                  style={{ background: 'none', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', color: '#aaa', padding: '0 2px', display: 'flex', alignItems: 'center', lineHeight: 1 }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = '#c0392b'}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = '#aaa'}
                >
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add packages */}
      <div style={{ background: '#fafaf8', border: '1.5px dashed #ddd', borderRadius: 6, padding: '1.25rem' }}>
        <p style={{ ...mono, fontSize: '0.65rem', color: '#777', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 0.75rem' }}>
          Add packages
        </p>
        <p style={{ fontSize: '0.78rem', color: '#666', margin: '0 0 0.75rem', lineHeight: 1.5 }}>
          One package per line. Standard pip format — e.g. <code style={mono}>requests</code>, <code style={mono}>pandas==2.1.0</code>
        </p>
        <textarea
          value={input}
          onChange={e => { setInput(e.target.value); setError(''); setSuccess(''); }}
          placeholder={'requests\npandas\nnumpy==1.26.0'}
          rows={5}
          style={{
            width: '100%', padding: '0.6rem 0.75rem',
            fontSize: '0.825rem', ...mono,
            color: '#111', background: '#fff',
            border: '1px solid #ddd', borderRadius: 4,
            outline: 'none', resize: 'vertical',
            boxSizing: 'border-box', lineHeight: 1.6,
          }}
        />

        {error && (
          <p style={{ fontSize: '0.78rem', color: '#c0392b', background: '#fef6f5', border: '1px solid #fad4ce', borderRadius: 4, padding: '0.5rem 0.75rem', margin: '0.75rem 0 0' }}>
            {error}
          </p>
        )}
        {success && (
          <p style={{ fontSize: '0.78rem', color: '#1a7f5a', background: '#f0faf6', border: '1px solid #b6e8d3', borderRadius: 4, padding: '0.5rem 0.75rem', margin: '0.75rem 0 0' }}>
            {success}
          </p>
        )}

        <button
          onClick={handleSave}
          disabled={saving || !input.trim()}
          style={{
            marginTop: '0.75rem',
            background: saving || !input.trim() ? '#888' : '#111',
            color: '#fafaf8', border: 'none',
            padding: '0.5rem 1.1rem', fontSize: '0.8rem',
            fontFamily: "'DM Sans', sans-serif",
            cursor: saving || !input.trim() ? 'not-allowed' : 'pointer',
            borderRadius: 4, display: 'flex', alignItems: 'center', gap: '0.5rem',
            opacity: !input.trim() ? 0.55 : 1,
          }}
        >
          {saving && (
            <div style={{ width: 13, height: 13, border: '1.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'env-spin 0.8s linear infinite' }} />
          )}
          {saving ? 'Installing…' : 'Install packages'}
        </button>
      </div>
    </div>
  );
}