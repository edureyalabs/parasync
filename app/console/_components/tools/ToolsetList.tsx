// console/_components/tools/ToolsetList.tsx
'use client';
import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Toolset } from './types';
import { Spinner, inputStyle, labelStyle, PageHeader, ErrorBanner, SuccessBanner, SaveButton } from './ui';

// ─── Toolset Card ─────────────────────────────────────────────────────────────

function ToolsetCard({ toolset, onClick }: { toolset: Toolset; onClick: () => void }) {
  const initials = toolset.name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
  return (
    <div
      onClick={onClick}
      style={{
        background: '#fff', border: '1px solid #e3e1dc', borderRadius: 6,
        padding: '1.25rem 1.35rem', cursor: 'pointer',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = '#bbb';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = '#e3e1dc';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 6,
          background: '#111', color: '#fafaf8',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', flexShrink: 0,
        }}>
          {initials}
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#111', margin: '0 0 0.2rem', letterSpacing: '-0.01em' }}>
            {toolset.name}
          </p>
          {toolset.description && (
            <p style={{ fontSize: '0.78rem', color: '#666', margin: 0, lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 380 }}>
              {toolset.description}
            </p>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', color: '#aaa', margin: 0 }}>
          {new Date(toolset.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
        <span style={{ fontSize: '0.75rem', color: '#333', background: '#eceae6', padding: '0.2rem 0.55rem', borderRadius: 3 }}>
          Open →
        </span>
      </div>
    </div>
  );
}

// ─── Toolset List ─────────────────────────────────────────────────────────────

export function ToolsetList({
  toolsets,
  loading,
  onOpen,
  onCreated,
  orgId,
  userId,
}: {
  toolsets: Toolset[];
  loading: boolean;
  onOpen: (t: Toolset) => void;
  onCreated: (t: Toolset) => void;
  orgId: string;
  userId: string;
}) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div style={{ padding: '2.5rem 2rem', width: '100%' }}>
      <style>{`.tool-input:focus { border-color: #111 !important; } .tool-input::placeholder { color: #999; }`}</style>

      <div style={{ marginBottom: '2rem' }}>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.68rem', color: '#777', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 0.35rem' }}>
          console · tools
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 500, letterSpacing: '-0.025em', color: '#111', margin: 0 }}>
            Toolsets
          </h1>
          <button
            onClick={() => setShowForm(true)}
            style={{
              background: '#111', color: '#fafaf8', border: 'none',
              padding: '0.5rem 1rem', fontSize: '0.8rem',
              fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
              borderRadius: 4, display: 'flex', alignItems: 'center', gap: '0.4rem',
            }}
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            New toolset
          </button>
        </div>
      </div>

      {showForm && (
        <CreateToolsetForm
          orgId={orgId}
          userId={userId}
          onCancel={() => setShowForm(false)}
          onCreated={(t) => { onCreated(t); setShowForm(false); }}
        />
      )}

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#666', fontSize: '0.8rem', padding: '2rem 0' }}>
          <Spinner /> Loading…
        </div>
      ) : toolsets.length === 0 && !showForm ? (
        <div style={{ border: '1.5px dashed #ddd', borderRadius: 6, padding: '2rem' }}>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', color: '#aaa', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 0.4rem' }}>
            No toolsets yet
          </p>
          <p style={{ fontSize: '0.825rem', color: '#777', margin: '0 0 1.1rem', lineHeight: 1.6 }}>
            A toolset groups tools that share the same API keys or secrets.
          </p>
          <button
            onClick={() => setShowForm(true)}
            style={{ background: '#111', color: '#fafaf8', border: 'none', padding: '0.5rem 1.1rem', fontSize: '0.8rem', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', borderRadius: 4 }}
          >
            Create toolset
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {toolsets.map(t => <ToolsetCard key={t.id} toolset={t} onClick={() => onOpen(t)} />)}
        </div>
      )}
    </div>
  );
}

// ─── Create Toolset Form ──────────────────────────────────────────────────────

function CreateToolsetForm({
  orgId,
  userId,
  onCancel,
  onCreated,
}: {
  orgId: string;
  userId: string;
  onCancel: () => void;
  onCreated: (t: Toolset) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setTimeout(() => nameRef.current?.focus(), 50); }, []);

  const handleSave = async () => {
    if (!name.trim()) { setError('Name is required.'); return; }
    setSaving(true);
    setError('');
    const supabase = createClient();
    const { data, error: dbErr } = await supabase
      .from('toolsets')
      .insert({ name: name.trim(), description: description.trim() || null, org_id: orgId, created_by: userId })
      .select().single();
    setSaving(false);
    if (dbErr) { setError(dbErr.message); return; }
    onCreated(data as Toolset);
  };

  return (
    <div style={{ background: '#fff', border: '1px solid #e3e1dc', borderRadius: 6, padding: '1.5rem', marginBottom: '1.5rem' }}>
      <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.68rem', color: '#777', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 1.25rem' }}>
        New toolset
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={labelStyle}>Name <span style={{ color: '#e55' }}>*</span></label>
          <input ref={nameRef} className="tool-input" type="text" placeholder="e.g. OpenAI tools" value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
            onKeyDown={e => { if (e.key === 'Enter') handleSave(); }}
            maxLength={60} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Description <span style={{ color: '#888', fontFamily: "'DM Sans', sans-serif", textTransform: 'none', letterSpacing: 0, fontSize: '0.7rem' }}>optional</span></label>
          <input className="tool-input" type="text" placeholder="What does this toolset do?" value={description}
            onChange={e => setDescription(e.target.value)} maxLength={200} style={inputStyle} />
        </div>
        {error && <ErrorBanner message={error} />}
        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button onClick={onCancel} style={{ background: 'none', border: '1px solid #ccc', color: '#333', padding: '0.5rem 1rem', fontSize: '0.8rem', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', borderRadius: 4 }}>
            Cancel
          </button>
          <SaveButton onClick={handleSave} loading={saving} disabled={!name.trim()} label="Create toolset" loadingLabel="Creating…" />
        </div>
      </div>
    </div>
  );
}