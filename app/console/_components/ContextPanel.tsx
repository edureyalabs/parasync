// console/_components/ContextPanel.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Context {
  id: string;
  name: string;
  description: string | null;
  content: string;
  org_id: string;
  created_at: string;
}

interface Props {
  orgId: string;
  userId: string;
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner({ size = 15, color = '#888' }: { size?: number; color?: string }) {
  return (
    <>
      <div style={{
        width: size, height: size,
        border: `1.5px solid rgba(0,0,0,0.1)`,
        borderTopColor: color,
        borderRadius: '50%',
        animation: 'ctx-spin 0.8s linear infinite',
        flexShrink: 0,
      }} />
      <style>{`@keyframes ctx-spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_CONTEXTS = 100;

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.6rem 0.75rem',
  fontSize: '0.875rem',
  fontFamily: "'DM Sans', sans-serif",
  color: '#111',
  background: '#fafaf8',
  border: '1px solid #ddd',
  borderRadius: 4,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: "'DM Mono', monospace",
  fontSize: '0.67rem',
  color: '#333',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  marginBottom: '0.4rem',
};

// ─── Context Card ─────────────────────────────────────────────────────────────

function ContextCard({
  ctx,
  onEdit,
  onDelete,
}: {
  ctx: Context;
  onEdit: (ctx: Context) => void;
  onDelete: (id: string) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    const supabase = createClient();
    await supabase.from('contexts').delete().eq('id', ctx.id);
    onDelete(ctx.id);
  };

  return (
    <div style={{
      background: '#fff', border: '1px solid #e3e1dc',
      borderRadius: 6, padding: '1.1rem 1.35rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
        {/* Left: content */}
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{
            fontSize: '0.875rem', fontWeight: 500,
            color: '#111', margin: '0 0 0.3rem',
            letterSpacing: '-0.01em',
          }}>
            {ctx.name}
          </p>
          {ctx.description && (
            <p style={{ fontSize: '0.8rem', color: '#555', margin: '0 0 0.4rem', lineHeight: 1.5 }}>
              {ctx.description}
            </p>
          )}
          <p style={{
            fontSize: '0.78rem', color: '#888', margin: 0,
            overflow: 'hidden', textOverflow: 'ellipsis',
            whiteSpace: 'nowrap', maxWidth: 480,
          }}>
            {ctx.content.slice(0, 120)}{ctx.content.length > 120 ? '…' : ''}
          </p>
        </div>

        {/* Right: date + actions */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.6rem', flexShrink: 0 }}>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', color: '#aaa', margin: 0 }}>
            {new Date(ctx.created_at).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
            })}
          </p>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={() => onEdit(ctx)}
              style={{
                background: 'none', border: '1px solid #ddd',
                color: '#444', padding: '0.3rem 0.7rem',
                fontSize: '0.75rem', fontFamily: "'DM Sans', sans-serif",
                cursor: 'pointer', borderRadius: 4,
                transition: 'border-color 0.12s, color 0.12s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#999';
                (e.currentTarget as HTMLButtonElement).style.color = '#111';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#ddd';
                (e.currentTarget as HTMLButtonElement).style.color = '#444';
              }}
            >
              Edit
            </button>
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                style={{
                  background: 'none', border: '1px solid #ddd',
                  color: '#888', padding: '0.3rem 0.7rem',
                  fontSize: '0.75rem', fontFamily: "'DM Sans', sans-serif",
                  cursor: 'pointer', borderRadius: 4,
                  transition: 'border-color 0.12s, color 0.12s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#e55';
                  (e.currentTarget as HTMLButtonElement).style.color = '#c0392b';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#ddd';
                  (e.currentTarget as HTMLButtonElement).style.color = '#888';
                }}
              >
                Delete
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#888', fontFamily: "'DM Mono', monospace" }}>Sure?</span>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  style={{
                    background: '#c0392b', border: 'none',
                    color: '#fff', padding: '0.3rem 0.65rem',
                    fontSize: '0.75rem', fontFamily: "'DM Sans', sans-serif",
                    cursor: deleting ? 'not-allowed' : 'pointer', borderRadius: 4,
                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                  }}
                >
                  {deleting && <Spinner size={11} color="#fff" />}
                  {deleting ? 'Deleting…' : 'Yes, delete'}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  style={{
                    background: 'none', border: '1px solid #ddd',
                    color: '#555', padding: '0.3rem 0.65rem',
                    fontSize: '0.75rem', fontFamily: "'DM Sans', sans-serif",
                    cursor: 'pointer', borderRadius: 4,
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── List View ────────────────────────────────────────────────────────────────

function ContextList({
  contexts,
  loading,
  onAdd,
  onEdit,
  onDelete,
}: {
  contexts: Context[];
  loading: boolean;
  onAdd: () => void;
  onEdit: (ctx: Context) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div style={{ padding: '2.5rem 2rem', width: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <p style={{
          fontFamily: "'DM Mono', monospace", fontSize: '0.68rem',
          color: '#777', letterSpacing: '0.08em',
          textTransform: 'uppercase', margin: '0 0 0.35rem',
        }}>
          console · context
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{
            fontSize: '1.35rem', fontWeight: 500,
            letterSpacing: '-0.025em', color: '#111', margin: 0,
          }}>
            Context library
          </h1>
          <button
            onClick={onAdd}
            disabled={contexts.length >= MAX_CONTEXTS}
            style={{
              background: '#111', color: '#fafaf8', border: 'none',
              padding: '0.5rem 1rem', fontSize: '0.8rem',
              fontFamily: "'DM Sans', sans-serif",
              cursor: contexts.length >= MAX_CONTEXTS ? 'not-allowed' : 'pointer',
              borderRadius: 4, display: 'flex', alignItems: 'center', gap: '0.4rem',
              opacity: contexts.length >= MAX_CONTEXTS ? 0.5 : 1, flexShrink: 0,
            }}
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Add context
          </button>
        </div>
      </div>

      {/* Body */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#666', fontSize: '0.8rem', padding: '2rem 0' }}>
          <Spinner /> Loading…
        </div>
      ) : contexts.length === 0 ? (
        <div style={{ border: '1.5px dashed #ddd', borderRadius: 6, padding: '2rem' }}>
          <p style={{
            fontFamily: "'DM Mono', monospace", fontSize: '0.72rem',
            color: '#aaa', letterSpacing: '0.06em',
            textTransform: 'uppercase', margin: '0 0 0.4rem',
          }}>
            No contexts yet
          </p>
          <p style={{ fontSize: '0.825rem', color: '#777', margin: '0 0 1.1rem', lineHeight: 1.6 }}>
            Add your first context to make it available to agents.
          </p>
          <button
            onClick={onAdd}
            style={{
              background: '#111', color: '#fafaf8', border: 'none',
              padding: '0.5rem 1.1rem', fontSize: '0.8rem',
              fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', borderRadius: 4,
            }}
          >
            Add context
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {contexts.map(ctx => (
            <ContextCard
              key={ctx.id}
              ctx={ctx}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Create / Edit Form ───────────────────────────────────────────────────────

function ContextForm({
  onBack,
  onSaved,
  onUpdated,
  orgId,
  userId,
  atLimit,
  editing,
}: {
  onBack: () => void;
  onSaved: (ctx: Context) => void;
  onUpdated: (ctx: Context) => void;
  orgId: string;
  userId: string;
  atLimit: boolean;
  editing: Context | null;
}) {
  const [name, setName] = useState(editing?.name ?? '');
  const [description, setDescription] = useState(editing?.description ?? '');
  const [content, setContent] = useState(editing?.content ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  const isEdit = !!editing;

  useEffect(() => {
    setTimeout(() => nameRef.current?.focus(), 50);
  }, []);

  const handleSave = async () => {
    if (!name.trim()) { setError('Name is required.'); return; }
    if (name.trim().length < 2) { setError('Name must be at least 2 characters.'); return; }
    if (!content.trim()) { setError('Content is required.'); return; }
    if (!isEdit && atLimit) { setError('Context limit of 100 reached.'); return; }

    setSaving(true);
    setError('');

    const supabase = createClient();

    if (isEdit) {
      const { data, error: dbError } = await supabase
        .from('contexts')
        .update({
          name: name.trim(),
          description: description.trim() || null,
          content: content.trim(),
        })
        .eq('id', editing.id)
        .select()
        .single();

      setSaving(false);
      if (dbError) {
        console.error('Context update error:', dbError);
        setError(dbError.message ?? 'Something went wrong. Please try again.');
        return;
      }
      setSuccess(true);
      setTimeout(() => { onUpdated(data as Context); }, 1000);
    } else {
      const { data, error: dbError } = await supabase
        .from('contexts')
        .insert({
          name: name.trim(),
          description: description.trim() || null,
          content: content.trim(),
          org_id: orgId,
          created_by: userId,
        })
        .select()
        .single();

      setSaving(false);
      if (dbError) {
        console.error('Context insert error:', dbError);
        setError(dbError.message ?? 'Something went wrong. Please try again.');
        return;
      }
      setSuccess(true);
      setTimeout(() => { onSaved(data as Context); }, 1000);
    }
  };

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: 680 }}>
      <style>{`
        .ctx-input:focus { border-color: #111 !important; }
        .ctx-input::placeholder { color: #999; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <button
          onClick={onBack}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#666', padding: '2px', display: 'flex', alignItems: 'center',
          }}
          aria-label="Back"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div>
          <p style={{
            fontFamily: "'DM Mono', monospace", fontSize: '0.68rem',
            color: '#777', letterSpacing: '0.08em',
            textTransform: 'uppercase', margin: '0 0 0.2rem',
          }}>
            console · context
          </p>
          <h1 style={{
            fontSize: '1.2rem', fontWeight: 500,
            letterSpacing: '-0.025em', color: '#111', margin: 0,
          }}>
            {isEdit ? 'Edit context' : 'Add context'}
          </h1>
        </div>
      </div>

      {/* Fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>

        {/* Name */}
        <div>
          <label style={labelStyle}>
            Name <span style={{ color: '#e55' }}>*</span>
          </label>
          <input
            ref={nameRef}
            className="ctx-input"
            type="text"
            placeholder="e.g. Sales playbook"
            value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
            onKeyDown={e => { if (e.key === 'Enter') handleSave(); }}
            maxLength={80}
            style={inputStyle}
          />
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.67rem', color: '#bbb', margin: '0.3rem 0 0', textAlign: 'right' }}>
            {name.length}/80
          </p>
        </div>

        {/* Description */}
        <div>
          <label style={labelStyle}>
            Description{' '}
            <span style={{ color: '#888', fontFamily: "'DM Sans', sans-serif", textTransform: 'none', letterSpacing: 0, fontSize: '0.7rem' }}>
              optional
            </span>
          </label>
          <input
            className="ctx-input"
            type="text"
            placeholder="What is this context used for?"
            value={description}
            onChange={e => setDescription(e.target.value)}
            maxLength={200}
            style={inputStyle}
          />
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.67rem', color: '#bbb', margin: '0.3rem 0 0', textAlign: 'right' }}>
            {description.length}/200
          </p>
        </div>

        {/* Content */}
        <div>
          <label style={labelStyle}>
            Content <span style={{ color: '#e55' }}>*</span>
          </label>
          <textarea
            className="ctx-input"
            placeholder="Paste or write the context that agents will use…"
            value={content}
            onChange={e => { setContent(e.target.value); setError(''); }}
            maxLength={20000}
            rows={14}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.65, minHeight: 200 }}
          />
          <p style={{
            fontFamily: "'DM Mono', monospace", fontSize: '0.67rem',
            color: content.length > 18000 ? '#c0392b' : '#bbb',
            margin: '0.3rem 0 0', textAlign: 'right',
          }}>
            {content.length.toLocaleString()}/20,000
          </p>
        </div>

        {/* Error */}
        {error && (
          <p style={{
            fontSize: '0.8rem', color: '#c0392b',
            background: '#fef6f5', border: '1px solid #fad4ce',
            borderRadius: 4, padding: '0.5rem 0.75rem', margin: 0,
          }}>
            {error}
          </p>
        )}

        {/* Success */}
        {success && (
          <p style={{
            fontSize: '0.8rem', color: '#1a7f5a',
            background: '#f0faf6', border: '1px solid #b6e8d3',
            borderRadius: 4, padding: '0.5rem 0.75rem', margin: 0,
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M2 6.5l3.5 3.5 5.5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {isEdit ? 'Context updated.' : 'Context saved.'}
          </p>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.65rem', paddingTop: '0.25rem' }}>
          <button
            onClick={onBack}
            style={{
              background: 'none', border: '1px solid #ccc', color: '#333',
              padding: '0.55rem 1.1rem', fontSize: '0.825rem',
              fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', borderRadius: 4,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim() || !content.trim()}
            style={{
              background: !name.trim() || !content.trim() ? '#888' : '#111',
              color: '#fafaf8', border: 'none',
              padding: '0.55rem 1.25rem', fontSize: '0.825rem',
              fontFamily: "'DM Sans', sans-serif",
              cursor: saving || !name.trim() || !content.trim() ? 'not-allowed' : 'pointer',
              borderRadius: 4, display: 'flex', alignItems: 'center', gap: '0.5rem',
              opacity: !name.trim() || !content.trim() ? 0.55 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            {saving && (
              <div style={{
                width: 14, height: 14,
                border: '1.5px solid rgba(255,255,255,0.3)',
                borderTopColor: '#fff', borderRadius: '50%',
                animation: 'ctx-spin 0.8s linear infinite',
              }} />
            )}
            {saving ? (isEdit ? 'Updating…' : 'Saving…') : (isEdit ? 'Update context' : 'Save context')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function ContextPanel({ orgId, userId }: Props) {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [contexts, setContexts] = useState<Context[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [editing, setEditing] = useState<Context | null>(null);

  useEffect(() => {
    if (!orgId) return;
    const supabase = createClient();
    supabase
      .from('contexts')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setContexts((data as Context[]) ?? []);
        setLoadingList(false);
      });
  }, [orgId]);

  const openCreate = () => { setEditing(null); setView('form'); };
  const openEdit = (ctx: Context) => { setEditing(ctx); setView('form'); };
  const closeForm = () => { setEditing(null); setView('list'); };

  const handleSaved = (ctx: Context) => {
    setContexts(prev => [ctx, ...prev]);
    closeForm();
  };

  const handleUpdated = (ctx: Context) => {
    setContexts(prev => prev.map(c => c.id === ctx.id ? ctx : c));
    closeForm();
  };

  const handleDeleted = (id: string) => {
    setContexts(prev => prev.filter(c => c.id !== id));
  };

  if (view === 'form') {
    return (
      <ContextForm
        orgId={orgId}
        userId={userId}
        atLimit={contexts.length >= MAX_CONTEXTS}
        editing={editing}
        onBack={closeForm}
        onSaved={handleSaved}
        onUpdated={handleUpdated}
      />
    );
  }

  return (
    <ContextList
      contexts={contexts}
      loading={loadingList}
      onAdd={openCreate}
      onEdit={openEdit}
      onDelete={handleDeleted}
    />
  );
}