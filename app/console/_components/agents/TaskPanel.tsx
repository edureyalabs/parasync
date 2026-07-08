// parasync/app/console/_components/agents/TaskPanel.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Agent, Task, Run } from './types';
import RunViewer from './RunViewer';
import EnvironmentPanel from './EnvironmentPanel';
import AgentSecretsPanel from './AgentSecretsPanel';
import ToolRegistryPanel from './ToolRegistryPanel';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000';

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.6rem 0.75rem', fontSize: '0.875rem',
  fontFamily: "'DM Sans', sans-serif", color: '#111', background: '#fafaf8',
  border: '1px solid #ddd', borderRadius: 4, outline: 'none',
  boxSizing: 'border-box', transition: 'border-color 0.15s',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontFamily: "'DM Mono', monospace", fontSize: '0.67rem',
  color: '#333', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.4rem',
};

const mono: React.CSSProperties = { fontFamily: "'DM Mono', monospace" };

type Tab = 'tasks' | 'environment' | 'secrets' | 'registry';

function StatusDot({ status }: { status: Run['status'] }) {
  const colors: Record<string, string> = {
    queued: '#aaa', running: '#f59e0b', completed: '#1a7f5a',
    failed: '#c0392b', cancelled: '#aaa',
  };
  return (
    <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: colors[status] ?? '#aaa', flexShrink: 0 }} />
  );
}

function TaskDetail({ task, onClose, onUpdated }: {
  task: Task; onClose: () => void; onUpdated: (t: Task) => void;
}) {
  const [editing, setEditing]         = useState(false);
  const [name, setName]               = useState(task.name);
  const [instruction, setInstruction] = useState(task.instruction);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState('');

  const handleSave = async () => {
    if (!name.trim())        { setError('Name is required.'); return; }
    if (!instruction.trim()) { setError('Instruction is required.'); return; }
    setSaving(true); setError('');
    const supabase = createClient();
    const { data, error: dbErr } = await supabase
      .from('tasks').update({ name: name.trim(), instruction: instruction.trim() })
      .eq('id', task.id).select().single();
    setSaving(false);
    if (dbErr) { setError(dbErr.message); return; }
    onUpdated(data as Task);
    setEditing(false);
  };

  return (
    <div style={{ background: '#fff', border: '1px solid #e3e1dc', borderRadius: 6, padding: '1.5rem', marginBottom: '1rem' }}>
      <style>{`.td-input:focus { border-color: #111 !important; } .td-input::placeholder { color: #999; }`}</style>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <p style={{ ...mono, fontSize: '0.65rem', color: '#777', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 0.25rem' }}>Task detail</p>
          {!editing && <h2 style={{ fontSize: '1rem', fontWeight: 500, color: '#111', margin: 0, letterSpacing: '-0.01em' }}>{task.name}</h2>}
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {!editing && (
            <button onClick={() => setEditing(true)} style={{ background: 'none', border: '1px solid #ddd', color: '#444', padding: '0.3rem 0.7rem', fontSize: '0.75rem', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', borderRadius: 4 }}>
              Edit
            </button>
          )}
          <button onClick={onClose} style={{ background: 'none', border: '1px solid #ddd', color: '#666', padding: '0.3rem 0.7rem', fontSize: '0.75rem', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', borderRadius: 4 }}>
            Close
          </button>
        </div>
      </div>

      {editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Task name <span style={{ color: '#e55' }}>*</span></label>
            <input className="td-input" type="text" value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              maxLength={80} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Instruction <span style={{ color: '#e55' }}>*</span></label>
            <textarea className="td-input" value={instruction}
              onChange={e => { setInstruction(e.target.value); setError(''); }}
              maxLength={8000} rows={8} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.65 }} />
            <p style={{ ...mono, fontSize: '0.67rem', color: '#bbb', margin: '0.3rem 0 0', textAlign: 'right' }}>
              {instruction.length}/8000
            </p>
          </div>
          {error && <p style={{ fontSize: '0.8rem', color: '#c0392b', background: '#fef6f5', border: '1px solid #fad4ce', borderRadius: 4, padding: '0.5rem 0.75rem', margin: 0 }}>{error}</p>}
          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button onClick={() => { setEditing(false); setName(task.name); setInstruction(task.instruction); setError(''); }}
              style={{ background: 'none', border: '1px solid #ccc', color: '#333', padding: '0.5rem 1rem', fontSize: '0.8rem', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', borderRadius: 4 }}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              style={{ background: '#111', color: '#fafaf8', border: 'none', padding: '0.5rem 1.1rem', fontSize: '0.8rem', fontFamily: "'DM Sans', sans-serif", cursor: saving ? 'not-allowed' : 'pointer', borderRadius: 4 }}>
              {saving ? 'Saving…' : 'Update task'}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p style={{ ...mono, fontSize: '0.65rem', color: '#aaa', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 0.5rem' }}>Instruction</p>
          <pre style={{ fontSize: '0.825rem', color: '#444', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif" }}>
            {task.instruction}
          </pre>
          <p style={{ ...mono, fontSize: '0.62rem', color: '#bbb', margin: '1rem 0 0' }}>
            Created {new Date(task.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      )}
    </div>
  );
}

function TaskCard({ task, orgId, onViewRun, onDelete, onUpdated }: {
  task: Task; orgId: string;
  onViewRun: (runId: string, taskId: string) => void;
  onDelete: (id: string) => void;
  onUpdated: (t: Task) => void;
}) {
  const [runs, setRuns]             = useState<Run[]>([]);
  const [triggering, setTriggering] = useState(false);
  const [confirm, setConfirm]       = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [expanded, setExpanded]     = useState(false);

  const loadRuns = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('runs')
      .select('id, status, triggered_by, output, error, started_at, completed_at, created_at')
      .eq('task_id', task.id)
      .order('created_at', { ascending: false });
    setRuns((data as Run[]) ?? []);
  };

  useEffect(() => { loadRuns(); }, [task.id]);

  const handleRun = async () => {
    setTriggering(true);
    try {
      const res = await fetch(`${BACKEND}/agents/tasks/${task.id}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ org_id: orgId }),
      });
      if (!res.ok) { setTriggering(false); return; }
      const { run_id } = await res.json();
      await loadRuns();
      onViewRun(run_id, task.id);
    } catch { /* network error */ }
    setTriggering(false);
  };

  const handleDelete = async () => {
    const supabase = createClient();
    await supabase.from('tasks').delete().eq('id', task.id);
    onDelete(task.id);
  };

  const latestRun = runs[0];

  return (
    <>
      {showDetail && (
        <TaskDetail task={task} onClose={() => setShowDetail(false)}
          onUpdated={t => { onUpdated(t); setShowDetail(false); }} />
      )}
      <div style={{ background: '#fff', border: '1px solid #e3e1dc', borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#111', margin: '0 0 0.25rem', letterSpacing: '-0.01em' }}>{task.name}</p>
            <p style={{ fontSize: '0.78rem', color: '#666', margin: 0, lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 340 }}>
              {task.instruction}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <button onClick={() => setShowDetail(v => !v)}
              style={{ background: 'none', border: '1px solid #ddd', color: '#555', padding: '0.3rem 0.65rem', fontSize: '0.72rem', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', borderRadius: 4 }}>
              {showDetail ? 'Hide' : 'View'}
            </button>
            {latestRun && (
              <button onClick={() => onViewRun(latestRun.id, task.id)}
                style={{ background: 'none', border: '1px solid #ddd', color: '#555', padding: '0.3rem 0.65rem', fontSize: '0.72rem', ...mono, cursor: 'pointer', borderRadius: 4, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <StatusDot status={latestRun.status} /> Last run
              </button>
            )}
            <button onClick={handleRun} disabled={triggering}
              style={{ background: '#111', color: '#fafaf8', border: 'none', padding: '0.35rem 0.85rem', fontSize: '0.78rem', fontFamily: "'DM Sans', sans-serif", cursor: triggering ? 'not-allowed' : 'pointer', borderRadius: 4, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {triggering
                ? <div style={{ width: 11, height: 11, border: '1.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'agent-spin 0.8s linear infinite' }} />
                : <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 1.5l6 3.5-6 3.5V1.5z" fill="currentColor" /></svg>
              }
              {triggering ? 'Starting…' : 'Run'}
            </button>
            {!confirm ? (
              <button onClick={() => setConfirm(true)}
                style={{ background: 'none', border: '1px solid #ddd', color: '#888', padding: '0.3rem 0.6rem', fontSize: '0.72rem', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', borderRadius: 4 }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#e55'; (e.currentTarget as HTMLButtonElement).style.color = '#c0392b'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#ddd'; (e.currentTarget as HTMLButtonElement).style.color = '#888'; }}>
                Delete
              </button>
            ) : (
              <>
                <span style={{ fontSize: '0.72rem', color: '#888', ...mono }}>Sure?</span>
                <button onClick={handleDelete} style={{ background: '#c0392b', border: 'none', color: '#fff', padding: '0.3rem 0.6rem', fontSize: '0.72rem', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', borderRadius: 4 }}>Yes</button>
                <button onClick={() => setConfirm(false)} style={{ background: 'none', border: '1px solid #ddd', color: '#555', padding: '0.3rem 0.6rem', fontSize: '0.72rem', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', borderRadius: 4 }}>No</button>
              </>
            )}
            <button onClick={() => setExpanded(e => !e)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', padding: '0.3rem' }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {expanded && runs.length > 0 && (
          <div style={{ borderTop: '1px solid #f0eeea', padding: '0.75rem 1.25rem' }}>
            <p style={{ ...mono, fontSize: '0.62rem', color: '#aaa', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 0.6rem' }}>Run history</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {runs.slice(0, 8).map(run => (
                <div key={run.id} onClick={() => onViewRun(run.id, task.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.4rem 0.6rem', borderRadius: 4, cursor: 'pointer', transition: 'background 0.1s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#f5f4f1'}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}>
                  <StatusDot status={run.status} />
                  <span style={{ ...mono, fontSize: '0.65rem', color: '#555', flex: 1 }}>
                    {new Date(run.created_at).toLocaleString()}
                  </span>
                  <span style={{ ...mono, fontSize: '0.62rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {run.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function CreateTaskForm({ agent, orgId, userId, onCreated, onCancel }: {
  agent: Agent; orgId: string; userId: string;
  onCreated: (t: Task) => void; onCancel: () => void;
}) {
  const [name, setName]               = useState('');
  const [instruction, setInstruction] = useState('');
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState('');
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setTimeout(() => nameRef.current?.focus(), 50); }, []);

  const handleSave = async () => {
    if (!name.trim())        { setError('Name is required.'); return; }
    if (!instruction.trim()) { setError('Instruction is required.'); return; }
    setSaving(true); setError('');
    const supabase = createClient();
    const { data, error: dbErr } = await supabase
      .from('tasks')
      .insert({ agent_id: agent.id, org_id: orgId, created_by: userId, name: name.trim(), instruction: instruction.trim() })
      .select().single();
    setSaving(false);
    if (dbErr) { setError(dbErr.message); return; }
    onCreated(data as Task);
  };

  return (
    <div style={{ background: '#fff', border: '1px solid #e3e1dc', borderRadius: 6, padding: '1.5rem', marginBottom: '1rem' }}>
      <style>{`.task-input:focus { border-color: #111 !important; } .task-input::placeholder { color: #999; }`}</style>
      <p style={{ ...mono, fontSize: '0.68rem', color: '#777', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 1.25rem' }}>New task</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={labelStyle}>Task name <span style={{ color: '#e55' }}>*</span></label>
          <input ref={nameRef} className="task-input" type="text" placeholder="e.g. Summarise weekly leads"
            value={name} onChange={e => { setName(e.target.value); setError(''); }}
            maxLength={80} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Instruction <span style={{ color: '#e55' }}>*</span></label>
          <textarea className="task-input"
            placeholder="Detailed task objective. The agent reads this as its goal."
            value={instruction} onChange={e => { setInstruction(e.target.value); setError(''); }}
            maxLength={8000} rows={6} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.65 }} />
          <p style={{ ...mono, fontSize: '0.67rem', color: '#bbb', margin: '0.3rem 0 0', textAlign: 'right' }}>
            {instruction.length}/8000
          </p>
        </div>
        {error && <p style={{ fontSize: '0.8rem', color: '#c0392b', background: '#fef6f5', border: '1px solid #fad4ce', borderRadius: 4, padding: '0.5rem 0.75rem', margin: 0 }}>{error}</p>}
        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button onClick={onCancel} style={{ background: 'none', border: '1px solid #ccc', color: '#333', padding: '0.5rem 1rem', fontSize: '0.8rem', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', borderRadius: 4 }}>Cancel</button>
          <button onClick={handleSave} disabled={saving || !name.trim() || !instruction.trim()}
            style={{ background: !name.trim() || !instruction.trim() ? '#888' : '#111', color: '#fafaf8', border: 'none', padding: '0.5rem 1.1rem', fontSize: '0.8rem', fontFamily: "'DM Sans', sans-serif", cursor: saving ? 'not-allowed' : 'pointer', borderRadius: 4, opacity: !name.trim() || !instruction.trim() ? 0.55 : 1 }}>
            {saving ? 'Creating…' : 'Create task'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface Props {
  agent: Agent;
  orgId: string;
  userId: string;
  onBack: () => void;
}

export default function TaskPanel({ agent, orgId, userId, onBack }: Props) {
  const [tasks, setTasks]         = useState<Task[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('tasks');
  const [viewRun, setViewRun]     = useState<{ runId: string; taskId: string } | null>(null);

  const TABS: { id: Tab; label: string }[] = [
    { id: 'tasks',       label: 'Tasks' },
    { id: 'registry',    label: 'Tool Registry' },
    { id: 'secrets',     label: 'Secrets' },
    { id: 'environment', label: 'Environment' },
  ];

  const TAB_STYLE = (active: boolean): React.CSSProperties => ({
    background: 'none', border: 'none',
    borderBottom: `2px solid ${active ? '#111' : 'transparent'}`,
    color: active ? '#111' : '#888',
    padding: '0.55rem 0.85rem', fontSize: '0.82rem',
    fontFamily: "'DM Sans', sans-serif",
    cursor: 'pointer', transition: 'color 0.12s, border-color 0.12s',
    whiteSpace: 'nowrap',
  });

  useEffect(() => {
    const supabase = createClient();
    supabase.from('tasks').select('*').eq('agent_id', agent.id).order('created_at', { ascending: true })
      .then(({ data }) => { setTasks((data as Task[]) ?? []); setLoading(false); });
  }, [agent.id]);

  if (viewRun) {
    return <RunViewer runId={viewRun.runId} taskId={viewRun.taskId} onClose={() => setViewRun(null)} />;
  }

  return (
    <div style={{ padding: '2.5rem 2rem', width: '100%' }}>
      <style>{`@keyframes agent-spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', padding: '2px', display: 'flex', alignItems: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.68rem', color: '#777', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 0.2rem' }}>
            console · agents
          </p>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 500, letterSpacing: '-0.025em', color: '#111', margin: 0 }}>
            {agent.name}
          </h1>
        </div>
        {activeTab === 'tasks' && (
          <button onClick={() => setShowForm(true)}
            style={{ background: '#111', color: '#fafaf8', border: 'none', padding: '0.5rem 1rem', fontSize: '0.8rem', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', borderRadius: 4, display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            New task
          </button>
        )}
      </div>

      {agent.description && (
        <p style={{ fontSize: '0.82rem', color: '#666', margin: '0 0 1rem 2.25rem', lineHeight: 1.5 }}>
          {agent.description}
        </p>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e3e1dc', margin: '1rem 0 1.75rem', overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t.id} style={TAB_STYLE(activeTab === t.id)} onClick={() => setActiveTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'environment' && <EnvironmentPanel agentId={agent.id} orgId={orgId} />}
      {activeTab === 'secrets'     && <AgentSecretsPanel agentId={agent.id} orgId={orgId} />}
      {activeTab === 'registry'    && <ToolRegistryPanel agentId={agent.id} />}

      {activeTab === 'tasks' && (
        <div>
          {showForm && (
            <CreateTaskForm agent={agent} orgId={orgId} userId={userId}
              onCreated={t => { setTasks(prev => [...prev, t]); setShowForm(false); }}
              onCancel={() => setShowForm(false)} />
          )}
          {loading ? (
            <p style={{ fontSize: '0.825rem', color: '#888' }}>Loading tasks…</p>
          ) : tasks.length === 0 && !showForm ? (
            <div style={{ border: '1.5px dashed #ddd', borderRadius: 6, padding: '2rem' }}>
              <p style={{ ...mono, fontSize: '0.72rem', color: '#aaa', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 0.4rem' }}>No tasks yet</p>
              <p style={{ fontSize: '0.825rem', color: '#777', margin: '0 0 1.1rem', lineHeight: 1.6 }}>Create a task with an instruction for this agent to run.</p>
              <button onClick={() => setShowForm(true)} style={{ background: '#111', color: '#fafaf8', border: 'none', padding: '0.5rem 1.1rem', fontSize: '0.8rem', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', borderRadius: 4 }}>
                Add task
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {tasks.map(t => (
                <TaskCard key={t.id} task={t} orgId={orgId}
                  onViewRun={(runId, taskId) => setViewRun({ runId, taskId })}
                  onDelete={id => setTasks(prev => prev.filter(x => x.id !== id))}
                  onUpdated={updated => setTasks(prev => prev.map(x => x.id === updated.id ? updated : x))}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}