// console/_components/AgentsPanel.tsx
'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Agent } from './agents/types';
import AgentForm from './agents/AgentForm';
import TaskPanel from './agents/TaskPanel';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000';

type View =
  | { type: 'list' }
  | { type: 'form'; editing: Agent | null }
  | { type: 'tasks'; agent: Agent };

function AgentCard({ agent, onOpen, onEdit, onDelete }: {
  agent: Agent;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: (id: string) => void;
}) {
  const [confirm, setConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const initials = agent.name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');

  const handleDelete = async () => {
    setDeleting(true);
    const supabase = createClient();
    await supabase.from('agents').delete().eq('id', agent.id);
    onDelete(agent.id);
  };

  return (
    <div style={{ background: '#fff', border: '1px solid #e3e1dc', borderRadius: 6, padding: '1.1rem 1.35rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, minWidth: 0, cursor: 'pointer' }}
        onClick={onOpen}
      >
        <div style={{ width: 34, height: 34, borderRadius: 6, background: '#111', color: '#fafaf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', flexShrink: 0 }}>
          {initials}
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#111', margin: '0 0 0.2rem', letterSpacing: '-0.01em' }}>
            {agent.name}
          </p>
          {agent.description && (
            <p style={{ fontSize: '0.78rem', color: '#666', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 360 }}>
              {agent.description}
            </p>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
        <button
          onClick={onOpen}
          style={{ background: '#111', color: '#fafaf8', border: 'none', padding: '0.3rem 0.75rem', fontSize: '0.75rem', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', borderRadius: 4 }}
        >
          Tasks →
        </button>
        <button
          onClick={onEdit}
          style={{ background: 'none', border: '1px solid #ddd', color: '#444', padding: '0.3rem 0.65rem', fontSize: '0.75rem', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', borderRadius: 4, transition: 'border-color 0.12s' }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = '#999'}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.borderColor = '#ddd'}
        >
          Edit
        </button>
        {!confirm ? (
          <button
            onClick={() => setConfirm(true)}
            style={{ background: 'none', border: '1px solid #ddd', color: '#888', padding: '0.3rem 0.65rem', fontSize: '0.75rem', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', borderRadius: 4, transition: 'border-color 0.12s, color 0.12s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#e55'; (e.currentTarget as HTMLButtonElement).style.color = '#c0392b'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#ddd'; (e.currentTarget as HTMLButtonElement).style.color = '#888'; }}
          >
            Delete
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: '#888', fontFamily: "'DM Mono', monospace" }}>Sure?</span>
            <button onClick={handleDelete} disabled={deleting} style={{ background: '#c0392b', border: 'none', color: '#fff', padding: '0.3rem 0.6rem', fontSize: '0.72rem', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', borderRadius: 4 }}>
              {deleting ? 'Deleting…' : 'Yes, delete'}
            </button>
            <button onClick={() => setConfirm(false)} style={{ background: 'none', border: '1px solid #ddd', color: '#555', padding: '0.3rem 0.6rem', fontSize: '0.72rem', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', borderRadius: 4 }}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AgentsPanel({ orgId, userId }: { orgId: string; userId: string }) {
  const [view, setView]       = useState<View>({ type: 'list' });
  const [agents, setAgents]   = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orgId) return;
    const supabase = createClient();
    supabase
      .from('agents')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: true })
      .then(({ data }) => { setAgents((data as Agent[]) ?? []); setLoading(false); });
  }, [orgId]);

  if (view.type === 'form') {
    return (
      <AgentForm
        orgId={orgId} userId={userId}
        editing={view.editing}
        onBack={() => setView({ type: 'list' })}
        onSaved={a => { setAgents(prev => [...prev, a]); setView({ type: 'tasks', agent: a }); }}
        onUpdated={a => { setAgents(prev => prev.map(x => x.id === a.id ? a : x)); setView({ type: 'list' }); }}
      />
    );
  }

  if (view.type === 'tasks') {
    return (
      <TaskPanel
        agent={view.agent} orgId={orgId} userId={userId}
        onBack={() => setView({ type: 'list' })}
      />
    );
  }

  return (
    <div style={{ padding: '2.5rem 2rem', width: '100%' }}>
      <div style={{ marginBottom: '2rem' }}>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.68rem', color: '#777', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 0.35rem' }}>
          console · agents
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 500, letterSpacing: '-0.025em', color: '#111', margin: 0 }}>Agents</h1>
          <button
            onClick={() => setView({ type: 'form', editing: null })}
            style={{ background: '#111', color: '#fafaf8', border: 'none', padding: '0.5rem 1rem', fontSize: '0.8rem', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', borderRadius: 4, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            New agent
          </button>
        </div>
      </div>

      {loading ? (
        <p style={{ fontSize: '0.825rem', color: '#888' }}>Loading agents…</p>
      ) : agents.length === 0 ? (
        <div style={{ border: '1.5px dashed #ddd', borderRadius: 6, padding: '2rem' }}>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', color: '#aaa', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 0.4rem' }}>No agents yet</p>
          <p style={{ fontSize: '0.825rem', color: '#777', margin: '0 0 1.1rem', lineHeight: 1.6 }}>
            Create your first agent. Assign it tools and context, then give it tasks to run.
          </p>
          <button
            onClick={() => setView({ type: 'form', editing: null })}
            style={{ background: '#111', color: '#fafaf8', border: 'none', padding: '0.5rem 1.1rem', fontSize: '0.8rem', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', borderRadius: 4 }}
          >
            Create agent
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {agents.map(a => (
            <AgentCard
              key={a.id} agent={a}
              onOpen={() => setView({ type: 'tasks', agent: a })}
              onEdit={() => setView({ type: 'form', editing: a })}
              onDelete={id => setAgents(prev => prev.filter(x => x.id !== id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}