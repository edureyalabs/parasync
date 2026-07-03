// console/_components/tools/SecretsManager.tsx
'use client';
import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ToolsetSecret } from './types';
import { Spinner, inputStyle, labelStyle, ErrorBanner, SaveButton } from './ui';

interface Props {
  toolsetId: string;
  secrets: ToolsetSecret[];
  onAdded: (s: ToolsetSecret) => void;
  onDeleted: (keyName: string) => void;
}

export default function SecretsManager({ toolsetId, secrets, onAdded, onDeleted }: Props) {
  const [keyName, setKeyName] = useState('');
  const [secretValue, setSecretValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [confirmKey, setConfirmKey] = useState<string | null>(null);
  const keyRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setTimeout(() => keyRef.current?.focus(), 50); }, []);

  // Enforce UPPER_SNAKE_CASE for key names
  const normalizeKey = (v: string) => v.toUpperCase().replace(/[^A-Z0-9_]/g, '_');

  const handleAdd = async () => {
    const k = keyName.trim();
    const v = secretValue.trim();
    if (!k) { setError('Key name is required.'); return; }
    if (!v) { setError('Secret value is required.'); return; }
    if (!/^[A-Z][A-Z0-9_]*$/.test(k)) { setError('Key name must be UPPER_SNAKE_CASE.'); return; }
    if (secrets.some(s => s.key_name === k)) { setError(`Key "${k}" already exists. Delete it first to replace.`); return; }

    setSaving(true);
    setError('');

    const supabase = createClient();

    // Call the SECURITY DEFINER RPC — raw value goes over TLS into Postgres vault.
    // It is never stored in any client-accessible table.
    const { data: vaultId, error: rpcErr } = await supabase.rpc('insert_toolset_secret', {
      p_toolset_id: toolsetId,
      p_key_name: k,
      p_secret: v,
    });

    setSaving(false);

    if (rpcErr) {
      console.error('Secret insert error:', rpcErr);
      setError(rpcErr.message ?? 'Failed to store secret.');
      return;
    }

    // Clear the value from state immediately — do not hold it in memory
    setSecretValue('');
    setKeyName('');

    // Fetch the registry row so the UI updates (no secret value in this row)
    const { data: newRow } = await supabase
      .from('toolset_secrets')
      .select('*')
      .eq('toolset_id', toolsetId)
      .eq('key_name', k)
      .single();

    if (newRow) onAdded(newRow as ToolsetSecret);
  };

  const handleDelete = async (kName: string) => {
    setDeletingKey(kName);
    const supabase = createClient();
    await supabase.rpc('delete_toolset_secret', {
      p_toolset_id: toolsetId,
      p_key_name: kName,
    });
    setDeletingKey(null);
    setConfirmKey(null);
    onDeleted(kName);
  };

  return (
    <div>
      <style>{`.tool-input:focus { border-color: #111 !important; } .tool-input::placeholder { color: #999; }`}</style>

      {/* Existing secrets */}
      {secrets.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {secrets.map(s => (
            <div key={s.key_name} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: '#fff', border: '1px solid #e3e1dc', borderRadius: 5,
              padding: '0.65rem 1rem', gap: '1rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {/* Lock icon */}
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ color: '#888', flexShrink: 0 }}>
                  <rect x="2" y="5.5" width="9" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M4 5.5V4a2.5 2.5 0 015 0v1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.78rem', color: '#111' }}>
                  {s.key_name}
                </span>
                {/* Value is never shown — intentional */}
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', color: '#bbb', letterSpacing: '0.1em' }}>
                  ••••••••••••
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.62rem', color: '#bbb', margin: 0 }}>
                  {new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
                {confirmKey === s.key_name ? (
                  <>
                    <span style={{ fontSize: '0.72rem', color: '#888', fontFamily: "'DM Mono', monospace" }}>Sure?</span>
                    <button
                      onClick={() => handleDelete(s.key_name)}
                      disabled={deletingKey === s.key_name}
                      style={{
                        background: '#c0392b', border: 'none', color: '#fff',
                        padding: '0.28rem 0.6rem', fontSize: '0.72rem',
                        fontFamily: "'DM Sans', sans-serif",
                        cursor: deletingKey === s.key_name ? 'not-allowed' : 'pointer',
                        borderRadius: 4, display: 'flex', alignItems: 'center', gap: '0.3rem',
                      }}
                    >
                      {deletingKey === s.key_name && <Spinner size={10} color="#fff" />}
                      {deletingKey === s.key_name ? 'Deleting…' : 'Yes, delete'}
                    </button>
                    <button
                      onClick={() => setConfirmKey(null)}
                      style={{ background: 'none', border: '1px solid #ddd', color: '#555', padding: '0.28rem 0.6rem', fontSize: '0.72rem', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', borderRadius: 4 }}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setConfirmKey(s.key_name)}
                    style={{
                      background: 'none', border: '1px solid #ddd', color: '#888',
                      padding: '0.28rem 0.6rem', fontSize: '0.72rem',
                      fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', borderRadius: 4,
                      transition: 'border-color 0.12s, color 0.12s',
                    }}
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
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', color: '#777', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 1rem' }}>
          Add secret
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 160px', minWidth: 140 }}>
            <label style={labelStyle}>Key name</label>
            <input
              ref={keyRef}
              className="tool-input"
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
              className="tool-input"
              type="password"
              placeholder="sk-••••••••••••••••"
              value={secretValue}
              onChange={e => { setSecretValue(e.target.value); setError(''); }}
              onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
              style={inputStyle}
              autoComplete="new-password"
            />
          </div>
          <div>
            <SaveButton
              onClick={handleAdd}
              loading={saving}
              disabled={!keyName.trim() || !secretValue.trim()}
              label="Add"
              loadingLabel="Saving…"
            />
          </div>
        </div>
        {error && <div style={{ marginTop: '0.75rem' }}><ErrorBanner message={error} /></div>}
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.62rem', color: '#bbb', margin: '0.75rem 0 0', lineHeight: 1.5 }}>
          Stored encrypted via Supabase Vault. Values cannot be retrieved after saving — delete and re-add to rotate.
        </p>
      </div>
    </div>
  );
}