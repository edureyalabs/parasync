// parasync/app/console/_components/agents/AgentSecretsPanel.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { AgentSecret } from './types';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000';
const mono: React.CSSProperties = { fontFamily: "'DM Mono', monospace" };

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.6rem 0.75rem', fontSize: '0.875rem',
  fontFamily: "'DM Sans', sans-serif", color: '#111', background: '#fafaf8',
  border: '1px solid #ddd', borderRadius: 4, outline: 'none',
  boxSizing: 'border-box', transition: 'border-color 0.15s',
};

const labelStyle: React.CSSProperties = {
  display: 'block', ...mono, fontSize: '0.67rem', color: '#333',
  letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.4rem',
};

interface Props {
  agentId: string;
  orgId: string;
}

export default function AgentSecretsPanel({ agentId, orgId }: Props) {
  const [secrets, setSecrets]     = useState<AgentSecret[]>([]);
  const [loading, setLoading]     = useState(true);
  const [keyName, setKeyName]     = useState('');
  const [secretVal, setSecretVal] = useState('');
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [confirmKey, setConfirmKey] = useState<string | null>(null);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const keyRef = useRef<HTMLInputElement>(null);

  const normalizeKey = (v: string) => v.toUpperCase().replace(/[^A-Z0-9_]/g, '_');

  const fetchSecrets = async () => {
    const res = await fetch(`${BACKEND}/agent-config/${agentId}/secrets`);
    if (res.ok) setSecrets(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchSecrets();
    setTimeout(() => keyRef.current?.focus(), 50);
  }, [agentId]);

  const handleAdd = async () => {
    const k = keyName.trim();
    const v = secretVal.trim();
    if (!k) { setError('Key name is required.'); return; }
    if (!v) { setError('Secret value is required.'); return; }
    if (!/^[A-Z][A-Z0-9_]*$/.test(k)) { setError('Key must be UPPER_SNAKE_CASE.'); return; }
    if (secrets.some(s => s.key_name === k)) { setError(`"${k}" already exists. Delete it first.`); return; }

    setSaving(true); setError('');
    const res = await fetch(`${BACKEND}/agent-config/${agentId}/secrets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key_name: k, secret_value: v, org_id: orgId }),
    });
    setSaving(false);
    if (!res.ok) { const d = await res.json(); setError(d.detail ?? 'Failed to save.'); return; }
    const newRow = await res.json();
    setSecrets(prev => [...prev, newRow]);
    setKeyName(''); setSecretVal('');
  };

  const handleDelete = async (key: string) => {
    setDeletingKey(key);
    await fetch(`${BACKEND}/agent-config/${agentId}/secrets/${key}`, { method: 'DELETE' });
    setSecrets(prev => prev.filter(s => s.key_name !== key));
    setDeletingKey(null); setConfirmKey(null);
  };

  if (loading) return <p style={{ fontSize: '0.825rem', color: '#888' }}>Loading secrets…</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <style>{`.ag-sec-input:focus { border-color: #111 !important; } .ag-sec-input::placeholder { color: #999; } @keyframes ag-spin { to { transform: rotate(360deg); } }`}</style>

      <p style={{ fontSize: '0.825rem', color: '#555', margin: 0, lineHeight: 1.6 }}>
        Secrets are injected as environment variables into the sandbox when <code style={mono}>execute_code</code> runs.
        Access them with <code style={mono}>os.environ["KEY_NAME"]</code>.
        Key names are shown to the agent in the system prompt — values are never exposed.
      </p>

      {/* Existing secrets */}
      {secrets.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {secrets.map(s => (
            <div key={s.key_name} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: '#fff', border: '1px solid #e3e1dc', borderRadius: 5,
              padding: '0.65rem 1rem', gap: '1rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ color: '#888', flexShrink: 0 }}>
                  <rect x="2" y="5.5" width="9" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M4 5.5V4a2.5 2.5 0 015 0v1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                <span style={{ ...mono, fontSize: '0.78rem', color: '#111' }}>{s.key_name}</span>
                <span style={{ ...mono, fontSize: '0.72rem', color: '#bbb', letterSpacing: '0.1em' }}>••••••••••••</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                <p style={{ ...mono, fontSize: '0.62rem', color: '#bbb', margin: 0 }}>
                  {new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
                {confirmKey === s.key_name ? (
                  <>
                    <span style={{ fontSize: '0.72rem', color: '#888', ...mono }}>Sure?</span>
                    <button
                      onClick={() => handleDelete(s.key_name)}
                      disabled={deletingKey === s.key_name}
                      style={{ background: '#c0392b', border: 'none', color: '#fff', padding: '0.28rem 0.6rem', fontSize: '0.72rem', fontFamily: "'DM Sans', sans-serif", cursor: deletingKey ? 'not-allowed' : 'pointer', borderRadius: 4 }}
                    >
                      {deletingKey === s.key_name ? 'Deleting…' : 'Yes, delete'}
                    </button>
                    <button onClick={() => setConfirmKey(null)} style={{ background: 'none', border: '1px solid #ddd', color: '#555', padding: '0.28rem 0.6rem', fontSize: '0.72rem', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', borderRadius: 4 }}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setConfirmKey(s.key_name)}
                    style={{ background: 'none', border: '1px solid #ddd', color: '#888', padding: '0.28rem 0.6rem', fontSize: '0.72rem', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', borderRadius: 4 }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#e55'; (e.currentTarget as HTMLButtonElement).style.color = '#c0392b'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#ddd'; (e.currentTarget as HTMLButtonElement).style.color = '#888'; }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add secret form */}
      <div style={{ background: '#fafaf8', border: '1.5px dashed #ddd', borderRadius: 6, padding: '1.25rem' }}>
        <p style={{ ...mono, fontSize: '0.65rem', color: '#777', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 1rem' }}>
          Add secret
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 160px', minWidth: 140 }}>
            <label style={labelStyle}>Key name</label>
            <input
              ref={keyRef}
              className="ag-sec-input"
              type="text"
              placeholder="OPENAI_API_KEY"
              value={keyName}
              onChange={e => { setKeyName(normalizeKey(e.target.value)); setError(''); }}
              maxLength={60}
              style={inputStyle}
            />
          </div>
          <div style={{ flex: '2 1 220px', minWidth: 180 }}>
            <label style={labelStyle}>Secret value</label>
            <input
              className="ag-sec-input"
              type="password"
              placeholder="sk-••••••••••••••••"
              value={secretVal}
              onChange={e => { setSecretVal(e.target.value); setError(''); }}
              onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
              style={inputStyle}
              autoComplete="new-password"
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={saving || !keyName.trim() || !secretVal.trim()}
            style={{
              background: saving || !keyName.trim() || !secretVal.trim() ? '#888' : '#111',
              color: '#fafaf8', border: 'none', padding: '0.6rem 1.1rem', fontSize: '0.825rem',
              fontFamily: "'DM Sans', sans-serif",
              cursor: saving || !keyName.trim() || !secretVal.trim() ? 'not-allowed' : 'pointer',
              borderRadius: 4, display: 'flex', alignItems: 'center', gap: '0.4rem',
              opacity: !keyName.trim() || !secretVal.trim() ? 0.55 : 1,
            }}
          >
            {saving && <div style={{ width: 13, height: 13, border: '1.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'ag-spin 0.8s linear infinite' }} />}
            {saving ? 'Saving…' : 'Add'}
          </button>
        </div>
        {error && (
          <p style={{ fontSize: '0.75rem', color: '#c0392b', ...mono, margin: '0.6rem 0 0' }}>{error}</p>
        )}
        <p style={{ ...mono, fontSize: '0.62rem', color: '#bbb', margin: '0.75rem 0 0', lineHeight: 1.5 }}>
          Stored encrypted via Supabase Vault. Values cannot be retrieved after saving — delete and re-add to rotate.
        </p>
      </div>
    </div>
  );
}