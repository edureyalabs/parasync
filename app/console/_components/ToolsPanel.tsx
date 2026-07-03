// console/_components/ToolsPanel.tsx
'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Toolset, Tool, ToolsetSecret } from './tools/types';
import { Spinner, PageHeader, SaveButton } from './tools/ui';
import { ToolsetList } from './tools/ToolsetList';
import SecretsManager from './tools/SecretsManager';
import ToolEditor from './tools/ToolEditor';

// ─── View state ───────────────────────────────────────────────────────────────
// list → toolset detail → tool editor

type View =
  | { type: 'list' }
  | { type: 'toolset'; toolset: Toolset }
  | { type: 'tool-editor'; toolset: Toolset; editing: Tool | null };

// ─── Tool list row ────────────────────────────────────────────────────────────

function ToolRow({
  tool,
  onEdit,
  onDelete,
}: {
  tool: Tool;
  onEdit: () => void;
  onDelete: (id: string) => void;
}) {
  const [confirm, setConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    const supabase = createClient();
    await supabase.from('tools').delete().eq('id', tool.id);
    onDelete(tool.id);
  };

  return (
    <div style={{
      background: '#fff', border: '1px solid #e3e1dc', borderRadius: 6,
      padding: '1rem 1.25rem', display: 'flex', alignItems: 'flex-start',
      justifyContent: 'space-between', gap: '1rem',
    }}>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.82rem', fontWeight: 500, color: '#111' }}>
            {tool.name}
          </span>
          <span style={{
            fontFamily: "'DM Mono', monospace", fontSize: '0.6rem',
            color: '#555', background: '#f0eeea',
            padding: '0.15rem 0.45rem', borderRadius: 3,
            textTransform: 'uppercase', letterSpacing: '0.04em',
          }}>
            {Object.keys(tool.parameters.properties).length} params
          </span>
        </div>
        <p style={{ fontSize: '0.8rem', color: '#555', margin: 0, lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 460 }}>
          {tool.description}
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
        <button
          onClick={onEdit}
          style={{
            background: 'none', border: '1px solid #ddd', color: '#444',
            padding: '0.3rem 0.7rem', fontSize: '0.75rem',
            fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', borderRadius: 4,
            transition: 'border-color 0.12s, color 0.12s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#999'; (e.currentTarget as HTMLButtonElement).style.color = '#111'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#ddd'; (e.currentTarget as HTMLButtonElement).style.color = '#444'; }}
        >
          Edit
        </button>
        {!confirm ? (
          <button
            onClick={() => setConfirm(true)}
            style={{
              background: 'none', border: '1px solid #ddd', color: '#888',
              padding: '0.3rem 0.7rem', fontSize: '0.75rem',
              fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', borderRadius: 4,
              transition: 'border-color 0.12s, color 0.12s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#e55'; (e.currentTarget as HTMLButtonElement).style.color = '#c0392b'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#ddd'; (e.currentTarget as HTMLButtonElement).style.color = '#888'; }}
          >
            Delete
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: '#888', fontFamily: "'DM Mono', monospace" }}>Sure?</span>
            <button onClick={handleDelete} disabled={deleting} style={{ background: '#c0392b', border: 'none', color: '#fff', padding: '0.3rem 0.65rem', fontSize: '0.72rem', fontFamily: "'DM Sans', sans-serif", cursor: deleting ? 'not-allowed' : 'pointer', borderRadius: 4 }}>
              {deleting ? 'Deleting…' : 'Yes, delete'}
            </button>
            <button onClick={() => setConfirm(false)} style={{ background: 'none', border: '1px solid #ddd', color: '#555', padding: '0.3rem 0.65rem', fontSize: '0.72rem', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', borderRadius: 4 }}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Toolset Detail ───────────────────────────────────────────────────────────

function ToolsetDetail({
  toolset,
  orgId,
  userId,
  onBack,
  onNewTool,
  onEditTool,
}: {
  toolset: Toolset;
  orgId: string;
  userId: string;
  onBack: () => void;
  onNewTool: () => void;
  onEditTool: (t: Tool) => void;
}) {
  const [tab, setTab] = useState<'tools' | 'secrets'>('tools');
  const [tools, setTools] = useState<Tool[]>([]);
  const [secrets, setSecrets] = useState<ToolsetSecret[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from('tools').select('*').eq('toolset_id', toolset.id).order('created_at', { ascending: true }),
      supabase.from('toolset_secrets').select('*').eq('toolset_id', toolset.id).order('created_at', { ascending: true }),
    ]).then(([toolsRes, secretsRes]) => {
      setTools((toolsRes.data as Tool[]) ?? []);
      setSecrets((secretsRes.data as ToolsetSecret[]) ?? []);
      setLoading(false);
    });
  }, [toolset.id]);

  const TAB_STYLE = (active: boolean): React.CSSProperties => ({
    background: 'none', border: 'none',
    borderBottom: `2px solid ${active ? '#111' : 'transparent'}`,
    color: active ? '#111' : '#888',
    padding: '0.55rem 0.85rem',
    fontSize: '0.82rem', fontFamily: "'DM Sans', sans-serif",
    cursor: 'pointer', transition: 'color 0.12s, border-color 0.12s',
  });

  return (
    <div style={{ padding: '2.5rem 2rem', width: '100%' }}>
      <PageHeader
        eyebrow="console · tools"
        title={toolset.name}
        onBack={onBack}
      />
      {toolset.description && (
        <p style={{ fontSize: '0.825rem', color: '#555', margin: '-1rem 0 1.75rem', lineHeight: 1.6 }}>
          {toolset.description}
        </p>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e3e1dc', marginBottom: '1.75rem' }}>
        <button style={TAB_STYLE(tab === 'tools')} onClick={() => setTab('tools')}>Tools</button>
        <button style={TAB_STYLE(tab === 'secrets')} onClick={() => setTab('secrets')}>Secrets</button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#666', fontSize: '0.8rem' }}>
          <Spinner /> Loading…
        </div>
      ) : tab === 'tools' ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.25rem' }}>
            <button
              onClick={onNewTool}
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
              New tool
            </button>
          </div>
          {tools.length === 0 ? (
            <div style={{ border: '1.5px dashed #ddd', borderRadius: 6, padding: '2rem' }}>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', color: '#aaa', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 0.4rem' }}>
                No tools yet
              </p>
              <p style={{ fontSize: '0.825rem', color: '#777', margin: '0 0 1.1rem', lineHeight: 1.6 }}>
                Add a tool to this toolset. Each tool is a Python function the agent can call.
              </p>
              <button onClick={onNewTool} style={{ background: '#111', color: '#fafaf8', border: 'none', padding: '0.5rem 1.1rem', fontSize: '0.8rem', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', borderRadius: 4 }}>
                Add tool
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {tools.map(t => (
                <ToolRow
                  key={t.id}
                  tool={t}
                  onEdit={() => onEditTool(t)}
                  onDelete={id => setTools(prev => prev.filter(x => x.id !== id))}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <SecretsManager
          toolsetId={toolset.id}
          secrets={secrets}
          onAdded={s => setSecrets(prev => [...prev, s])}
          onDeleted={k => setSecrets(prev => prev.filter(s => s.key_name !== k))}
        />
      )}
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function ToolsPanel({ orgId, userId }: { orgId: string; userId: string }) {
  const [view, setView] = useState<View>({ type: 'list' });
  const [toolsets, setToolsets] = useState<Toolset[]>([]);
  const [loading, setLoading] = useState(true);
  // Cache secrets per toolset so ToolEditor can show them
  const [secretsCache, setSecretsCache] = useState<Record<string, ToolsetSecret[]>>({});

  useEffect(() => {
    if (!orgId) return;
    const supabase = createClient();
    supabase
      .from('toolsets')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setToolsets((data as Toolset[]) ?? []);
        setLoading(false);
      });
  }, [orgId]);

  // When entering toolset, pre-load secrets for ToolEditor
  const loadSecrets = async (toolsetId: string) => {
    if (secretsCache[toolsetId]) return;
    const supabase = createClient();
    const { data } = await supabase
      .from('toolset_secrets')
      .select('*')
      .eq('toolset_id', toolsetId);
    if (data) setSecretsCache(prev => ({ ...prev, [toolsetId]: data as ToolsetSecret[] }));
  };

  const openToolset = (t: Toolset) => {
    loadSecrets(t.id);
    setView({ type: 'toolset', toolset: t });
  };

  if (view.type === 'list') {
    return (
      <ToolsetList
        toolsets={toolsets}
        loading={loading}
        onOpen={openToolset}
        onCreated={t => { setToolsets(prev => [...prev, t]); openToolset(t); }}
        orgId={orgId}
        userId={userId}
      />
    );
  }

  if (view.type === 'toolset') {
    return (
      <ToolsetDetail
        toolset={view.toolset}
        orgId={orgId}
        userId={userId}
        onBack={() => setView({ type: 'list' })}
        onNewTool={() => setView({ type: 'tool-editor', toolset: view.toolset, editing: null })}
        onEditTool={t => setView({ type: 'tool-editor', toolset: view.toolset, editing: t })}
      />
    );
  }

  // tool-editor
  return (
    <ToolEditor
      toolsetId={view.toolset.id}
      orgId={orgId}
      userId={userId}
      secrets={secretsCache[view.toolset.id] ?? []}
      editing={view.editing}
      onBack={() => setView({ type: 'toolset', toolset: view.toolset })}
      onSaved={() => setView({ type: 'toolset', toolset: view.toolset })}
      onUpdated={() => setView({ type: 'toolset', toolset: view.toolset })}
    />
  );
}