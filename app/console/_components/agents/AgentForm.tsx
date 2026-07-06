// console/_components/agents/AgentForm.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Agent } from './types';

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

interface Props {
  orgId: string;
  userId: string;
  editing: Agent | null;
  onBack: () => void;
  onSaved: (a: Agent) => void;
  onUpdated: (a: Agent) => void;
}

export default function AgentForm({ orgId, userId, editing, onBack, onSaved, onUpdated }: Props) {
  const isEdit = !!editing;

  const [name, setName]                 = useState(editing?.name ?? '');
  const [description, setDescription]   = useState(editing?.description ?? '');
  const [systemPrompt, setSystemPrompt] = useState(editing?.system_prompt ?? '');

  const [allContexts, setAllContexts]   = useState<{ id: string; name: string }[]>([]);
  const [allToolsets, setAllToolsets]   = useState<{ id: string; name: string }[]>([]);
  const [selectedContexts, setSelectedContexts] = useState<string[]>([]);
  const [selectedToolsets, setSelectedToolsets] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => nameRef.current?.focus(), 50);

    const supabase = createClient();

    // Load available contexts and toolsets from Supabase directly
    supabase.from('contexts').select('id, name').eq('org_id', orgId)
      .then(({ data }) => setAllContexts(data ?? []));

    supabase.from('toolsets').select('id, name').eq('org_id', orgId)
      .then(({ data }) => setAllToolsets(data ?? []));

    // If editing, load existing tags from Supabase
    if (isEdit) {
      supabase.from('agent_contexts').select('context_id').eq('agent_id', editing.id)
        .then(({ data }) => setSelectedContexts((data ?? []).map(r => r.context_id)));

      supabase.from('agent_toolsets').select('toolset_id').eq('agent_id', editing.id)
        .then(({ data }) => setSelectedToolsets((data ?? []).map(r => r.toolset_id)));
    }
  }, []);

  const toggle = (id: string, list: string[], setList: (l: string[]) => void) => {
    setList(list.includes(id) ? list.filter(x => x !== id) : [...list, id]);
  };

  const handleSave = async () => {
    if (!name.trim())         { setError('Name is required.'); return; }
    if (!systemPrompt.trim()) { setError('System prompt is required.'); return; }

    setSaving(true);
    setError('');

    const supabase = createClient();

    if (isEdit) {
      // Update agent row
      const { data, error: dbErr } = await supabase
        .from('agents')
        .update({ name: name.trim(), description: description.trim() || null, system_prompt: systemPrompt.trim() })
        .eq('id', editing.id)
        .select()
        .single();

      if (dbErr) { setError(dbErr.message); setSaving(false); return; }

      // Replace context + toolset mappings
      await supabase.from('agent_contexts').delete().eq('agent_id', editing.id);
      await supabase.from('agent_toolsets').delete().eq('agent_id', editing.id);

      if (selectedContexts.length > 0)
        await supabase.from('agent_contexts').insert(selectedContexts.map(cid => ({ agent_id: editing.id, context_id: cid })));
      if (selectedToolsets.length > 0)
        await supabase.from('agent_toolsets').insert(selectedToolsets.map(tid => ({ agent_id: editing.id, toolset_id: tid })));

      setSaving(false);
      onUpdated(data as Agent);

    } else {
      // Create agent row
      const { data, error: dbErr } = await supabase
        .from('agents')
        .insert({ org_id: orgId, created_by: userId, name: name.trim(), description: description.trim() || null, system_prompt: systemPrompt.trim() })
        .select()
        .single();

      if (dbErr) { setError(dbErr.message); setSaving(false); return; }

      const agentId = (data as Agent).id;

      // Insert context + toolset mappings
      if (selectedContexts.length > 0)
        await supabase.from('agent_contexts').insert(selectedContexts.map(cid => ({ agent_id: agentId, context_id: cid })));
      if (selectedToolsets.length > 0)
        await supabase.from('agent_toolsets').insert(selectedToolsets.map(tid => ({ agent_id: agentId, toolset_id: tid })));

      setSaving(false);
      onSaved(data as Agent);
    }
  };

  const TagPicker = ({
    label, items, selected, onToggle,
  }: { label: string; items: { id: string; name: string }[]; selected: string[]; onToggle: (id: string) => void }) => (
    <div>
      <label style={labelStyle}>{label}</label>
      {items.length === 0 ? (
        <p style={{ fontSize: '0.78rem', color: '#aaa', fontStyle: 'italic', margin: 0 }}>None available</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {items.map(item => {
            const active = selected.includes(item.id);
            return (
              <button key={item.id} onClick={() => onToggle(item.id)} style={{
                padding: '0.3rem 0.75rem', fontSize: '0.78rem',
                fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', borderRadius: 4,
                border: `1.5px solid ${active ? '#111' : '#ddd'}`,
                background: active ? '#111' : 'transparent',
                color: active ? '#fafaf8' : '#555',
                transition: 'all 0.12s',
              }}>
                {active && '✓ '}{item.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: 680, width: '100%' }}>
      <style>{`.agent-input:focus { border-color: #111 !important; } .agent-input::placeholder { color: #999; } @keyframes agent-spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', padding: '2px', display: 'flex', alignItems: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.68rem', color: '#777', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 0.2rem' }}>
            console · agents
          </p>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 500, letterSpacing: '-0.025em', color: '#111', margin: 0 }}>
            {isEdit ? `Edit: ${editing.name}` : 'New agent'}
          </h1>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>

        <div>
          <label style={labelStyle}>Name <span style={{ color: '#e55' }}>*</span></label>
          <input ref={nameRef} className="agent-input" type="text" placeholder="e.g. Sales researcher"
            value={name} onChange={e => { setName(e.target.value); setError(''); }}
            maxLength={80} style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>
            Description{' '}
            <span style={{ color: '#888', fontFamily: "'DM Sans', sans-serif", textTransform: 'none', letterSpacing: 0, fontSize: '0.7rem' }}>optional</span>
          </label>
          <input className="agent-input" type="text" placeholder="What does this agent do?"
            value={description} onChange={e => setDescription(e.target.value)}
            maxLength={200} style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>System prompt <span style={{ color: '#e55' }}>*</span></label>
          <textarea className="agent-input"
            placeholder="Define the agent's role and behaviour. e.g. 'You are a research analyst. Be concise and factual.'"
            value={systemPrompt} onChange={e => { setSystemPrompt(e.target.value); setError(''); }}
            maxLength={4000} rows={6}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.65 }} />
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.67rem', color: '#bbb', margin: '0.3rem 0 0', textAlign: 'right' }}>
            {systemPrompt.length}/4000
          </p>
        </div>

        <TagPicker label="Contexts" items={allContexts} selected={selectedContexts}
          onToggle={id => toggle(id, selectedContexts, setSelectedContexts)} />

        <TagPicker label="Toolsets" items={allToolsets} selected={selectedToolsets}
          onToggle={id => toggle(id, selectedToolsets, setSelectedToolsets)} />

        {error && (
          <p style={{ fontSize: '0.8rem', color: '#c0392b', background: '#fef6f5', border: '1px solid #fad4ce', borderRadius: 4, padding: '0.5rem 0.75rem', margin: 0 }}>
            {error}
          </p>
        )}

        <div style={{ display: 'flex', gap: '0.65rem', paddingTop: '0.25rem' }}>
          <button onClick={onBack} style={{ background: 'none', border: '1px solid #ccc', color: '#333', padding: '0.55rem 1.1rem', fontSize: '0.825rem', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', borderRadius: 4 }}>
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim() || !systemPrompt.trim()}
            style={{
              background: !name.trim() || !systemPrompt.trim() ? '#888' : '#111',
              color: '#fafaf8', border: 'none', padding: '0.55rem 1.25rem', fontSize: '0.825rem',
              fontFamily: "'DM Sans', sans-serif",
              cursor: saving || !name.trim() || !systemPrompt.trim() ? 'not-allowed' : 'pointer',
              borderRadius: 4, display: 'flex', alignItems: 'center', gap: '0.5rem',
              opacity: !name.trim() || !systemPrompt.trim() ? 0.55 : 1,
            }}
          >
            {saving && <div style={{ width: 14, height: 14, border: '1.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'agent-spin 0.8s linear infinite' }} />}
            {saving ? (isEdit ? 'Updating…' : 'Creating…') : (isEdit ? 'Update agent' : 'Create agent')}
          </button>
        </div>
      </div>
    </div>
  );
}