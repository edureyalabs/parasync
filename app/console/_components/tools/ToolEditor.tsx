// console/_components/tools/ToolEditor.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';
import { Tool, ToolParameter, ToolsetSecret } from './types';
import { Spinner, inputStyle, labelStyle, PageHeader, ErrorBanner, SuccessBanner, SaveButton } from './ui';
import ParameterBuilder from './ParameterBuilder';

// Monaco loads client-side only
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false, loading: () => (
  <div style={{ background: '#1e1e1e', borderRadius: 4, height: 380, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Spinner size={18} color="#555" />
  </div>
) });

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'info' | 'parameters' | 'code' | 'test';

interface Props {
  toolsetId: string;
  orgId: string;
  userId: string;
  secrets: ToolsetSecret[];
  editing: Tool | null;
  onBack: () => void;
  onSaved: (tool: Tool) => void;
  onUpdated: (tool: Tool) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function paramsToToolParameters(schema: Tool['parameters']): ToolParameter[] {
  return Object.entries(schema.properties).map(([name, def]) => ({
    name,
    type: def.type as ToolParameter['type'],
    description: def.description,
    required: schema.required.includes(name),
  }));
}

function toolParametersToSchema(params: ToolParameter[]): Tool['parameters'] {
  return {
    type: 'object',
    properties: Object.fromEntries(params.map(p => [p.name, { type: p.type, description: p.description }])),
    required: params.filter(p => p.required).map(p => p.name),
  };
}

function buildFunctionSignature(name: string, params: ToolParameter[]): string {
  if (params.length === 0) return `def ${name || 'my_tool'}():`;
  const args = params.map(p => {
    const pyType: Record<string, string> = { string: 'str', number: 'float', boolean: 'bool', array: 'list', object: 'dict' };
    return `${p.name}: ${pyType[p.type] ?? 'str'}`;
  });
  return `def ${name || 'my_tool'}(${args.join(', ')}):`;
}

// ─── Tab button ───────────────────────────────────────────────────────────────

function TabBtn({ id, label, active, onClick }: { id: string; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        borderBottom: `2px solid ${active ? '#111' : 'transparent'}`,
        color: active ? '#111' : '#888',
        padding: '0.55rem 0.85rem',
        fontSize: '0.82rem',
        fontFamily: "'DM Sans', sans-serif",
        cursor: 'pointer',
        transition: 'color 0.12s, border-color 0.12s',
        flexShrink: 0,
      }}
    >
      {label}
    </button>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildFullCode(name: string, params: ToolParameter[], body: string): string {
  const sig = buildFunctionSignature(name, params);
  const indented = body.trim().split('\n').map(l => `    ${l}`).join('\n');
  return `${sig}\n${indented}`;
}

// ─── Test Runner ──────────────────────────────────────────────────────────────

function TestRunner({
  tool,
  params,
  secrets,
  backendUrl,
}: {
  tool: Partial<Tool>;
  params: ToolParameter[];
  secrets: ToolsetSecret[];
  backendUrl: string;
}) {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [resultType, setResultType] = useState<'success' | 'error' | null>(null);

  const handleRun = async () => {
    if (!backendUrl) {
      setResult('Backend URL not configured. Set NEXT_PUBLIC_BACKEND_URL in your environment.');
      setResultType('error');
      return;
    }
    setRunning(true);
    setResult(null);

    try {
      const res = await fetch(`${backendUrl}/tools/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool_id: tool.id ?? '__preview__',
          toolset_id: tool.toolset_id,
          code: tool.code ?? '',
          tool_name: tool.name,
          parameters: toolParametersToSchema(params),
          arguments: inputs,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        const detail = json.detail;
        const msg = typeof detail === 'string'
          ? detail
          : typeof detail === 'object' && detail !== null
            ? [detail.error, detail.traceback].filter(Boolean).join('\n\n')
            : JSON.stringify(json, null, 2);
        setResult(msg);
        setResultType('error');
      } else {
        setResult(typeof json.result === 'string' ? json.result : JSON.stringify(json.result, null, 2));
        setResultType('success');
      }
    } catch (err: unknown) {
      setResult(err instanceof Error ? err.message : 'Network error');
      setResultType('error');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div>
      <style>{`.test-input:focus { border-color: #111 !important; } .test-input::placeholder { color: #999; }`}</style>

      {params.length === 0 ? (
        <p style={{ fontSize: '0.825rem', color: '#888', fontStyle: 'italic' }}>
          No parameters defined. Add parameters first.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          {params.map(p => (
            <div key={p.name}>
              <label style={labelStyle}>
                {p.name}
                {p.required && <span style={{ color: '#e55', marginLeft: 3 }}>*</span>}
                <span style={{ color: '#999', fontFamily: "'DM Sans', sans-serif", textTransform: 'none', letterSpacing: 0, fontSize: '0.7rem', marginLeft: 6 }}>
                  {p.type} — {p.description}
                </span>
              </label>
              <input
                className="test-input"
                type="text"
                placeholder={`Enter ${p.name}…`}
                value={inputs[p.name] ?? ''}
                onChange={e => setInputs(prev => ({ ...prev, [p.name]: e.target.value }))}
                style={inputStyle}
              />
            </div>
          ))}
        </div>
      )}

      {/* Secrets hint */}
      {secrets.length > 0 && (
        <div style={{ background: '#f5f4f1', border: '1px solid #e3e1dc', borderRadius: 5, padding: '0.75rem 1rem', marginBottom: '1.25rem' }}>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', color: '#777', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 0.4rem' }}>
            Injected secrets
          </p>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {secrets.map(s => (
              <span key={s.key_name} style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', color: '#555', background: '#eceae6', padding: '0.2rem 0.5rem', borderRadius: 3 }}>
                {s.key_name}
              </span>
            ))}
          </div>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.62rem', color: '#aaa', margin: '0.5rem 0 0', lineHeight: 1.5 }}>
            Available as os.environ["KEY_NAME"] — injected by backend at runtime.
          </p>
        </div>
      )}

      <button
        onClick={handleRun}
        disabled={running || params.length === 0}
        style={{
          background: running || params.length === 0 ? '#888' : '#111',
          color: '#fafaf8', border: 'none',
          padding: '0.55rem 1.25rem', fontSize: '0.825rem',
          fontFamily: "'DM Sans', sans-serif",
          cursor: running || params.length === 0 ? 'not-allowed' : 'pointer',
          borderRadius: 4, display: 'flex', alignItems: 'center', gap: '0.5rem',
          opacity: params.length === 0 ? 0.5 : 1,
          marginBottom: '1.25rem',
        }}
      >
        {running && <Spinner size={14} color="#fff" />}
        {running ? 'Running…' : 'Run tool'}
      </button>

      {result !== null && (
        <div>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', color: '#aaa', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 0.5rem' }}>
            {resultType === 'error' ? 'Error' : 'Result'}
          </p>
          <pre style={{
            background: resultType === 'error' ? '#fef6f5' : '#f0faf6',
            border: `1px solid ${resultType === 'error' ? '#fad4ce' : '#b6e8d3'}`,
            borderRadius: 5, padding: '0.85rem 1rem',
            fontSize: '0.78rem', fontFamily: "'DM Mono', monospace",
            color: resultType === 'error' ? '#c0392b' : '#1a7f5a',
            margin: 0, overflow: 'auto', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          }}>
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function ToolEditor({ toolsetId, orgId, userId, secrets, editing, onBack, onSaved, onUpdated }: Props) {
  const isEdit = !!editing;
  const [activeTab, setActiveTab] = useState<Tab>('info');

  // Info
  const [name, setName] = useState(editing?.name ?? '');
  const [description, setDescription] = useState(editing?.description ?? '');

  // Parameters
  const [params, setParams] = useState<ToolParameter[]>(
    editing ? paramsToToolParameters(editing.parameters) : []
  );

  // Code
  const [code, setCode] = useState(editing?.code ?? '');

  // Save state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const normalizeName = (v: string) => v.toLowerCase().replace(/[^a-z0-9_]/g, '_');

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? '';

  const signature = buildFunctionSignature(name, params);
  const secretHints = secrets.map(s => `# os.environ["${s.key_name}"]`).join('\n');
  const codeComment = `# Available secrets:\n${secretHints || '# (no secrets configured for this toolset)'}\n# Function signature (auto-generated from parameters):\n# ${signature}\n\n`;

  const handleSave = async () => {
    if (!name.trim()) { setError('Tool name is required.'); setActiveTab('info'); return; }
    if (!/^[a-z][a-z0-9_]*$/.test(name)) { setError('Name must be lowercase_snake_case.'); setActiveTab('info'); return; }
    if (!description.trim()) { setError('Description is required — the agent reads this.'); setActiveTab('info'); return; }
    if (!code.trim()) { setError('Code is required.'); setActiveTab('code'); return; }

    setSaving(true);
    setError('');

    const schema = toolParametersToSchema(params);
    const supabase = createClient();

    if (isEdit) {
      const { data, error: dbErr } = await supabase
        .from('tools')
        .update({ name, description, parameters: schema, code })
        .eq('id', editing.id)
        .select().single();
      setSaving(false);
      if (dbErr) { setError(dbErr.message); return; }
      setSuccess(true);
      setTimeout(() => { onUpdated(data as Tool); }, 900);
    } else {
      const { data, error: dbErr } = await supabase
        .from('tools')
        .insert({ name, description, parameters: schema, code, toolset_id: toolsetId, org_id: orgId, created_by: userId })
        .select().single();
      setSaving(false);
      if (dbErr) { setError(dbErr.message); return; }
      setSuccess(true);
      setTimeout(() => { onSaved(data as Tool); }, 900);
    }
  };

  const TABS: { id: Tab; label: string }[] = [
    { id: 'info', label: 'Info' },
    { id: 'parameters', label: 'Parameters' },
    { id: 'code', label: 'Code' },
    { id: 'test', label: 'Test' },
  ];

  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: 820, width: '100%' }}>
      <style>{`.tool-input:focus { border-color: #111 !important; } .tool-input::placeholder { color: #999; }`}</style>

      <PageHeader
        eyebrow="console · tools"
        title={isEdit ? `Edit: ${editing.name}` : 'New tool'}
        onBack={onBack}
      />

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e3e1dc', marginBottom: '1.75rem', gap: '0.1rem' }}>
        {TABS.map(t => <TabBtn key={t.id} id={t.id} label={t.label} active={activeTab === t.id} onClick={() => setActiveTab(t.id)} />)}
      </div>

      {/* ── Info ── */}
      {activeTab === 'info' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={labelStyle}>Tool name <span style={{ color: '#e55' }}>*</span></label>
            <input
              className="tool-input"
              type="text"
              placeholder="e.g. search_web"
              value={name}
              onChange={e => setName(normalizeName(e.target.value))}
              maxLength={60}
              style={inputStyle}
            />
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.67rem', color: '#bbb', margin: '0.3rem 0 0' }}>
              snake_case · this is what the agent calls
            </p>
          </div>
          <div>
            <label style={labelStyle}>Description <span style={{ color: '#e55' }}>*</span></label>
            <textarea
              className="tool-input"
              placeholder="Describe what this tool does. The agent reads this to decide when to use it."
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={500}
              rows={4}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.65 }}
            />
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.67rem', color: '#bbb', margin: '0.3rem 0 0', textAlign: 'right' }}>
              {description.length}/500
            </p>
          </div>
        </div>
      )}

      {/* ── Parameters ── */}
      {activeTab === 'parameters' && (
        <ParameterBuilder parameters={params} onChange={setParams} />
      )}

      {/* ── Code ── */}
      {activeTab === 'code' && (
        <div>
          {/* Signature preview */}
          <div style={{ background: '#1e1e1e', borderRadius: '4px 4px 0 0', padding: '0.6rem 1rem', borderBottom: '1px solid #333' }}>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.75rem', color: '#569cd6', margin: 0 }}>
              {signature}
            </p>
            {secrets.map(s => (
              <p key={s.key_name} style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', color: '#6a9955', margin: '0.2rem 0 0' }}>
                {'    '}{s.key_name} = os.environ["{s.key_name}"]
              </p>
            ))}
          </div>
          <MonacoEditor
            height="380px"
            language="python"
            theme="vs-dark"
            value={code}
            onChange={v => setCode(v ?? '')}
            options={{
              fontSize: 13,
              fontFamily: "'DM Mono', monospace",
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              lineNumbers: 'on',
              renderLineHighlight: 'line',
              padding: { top: 12, bottom: 12 },
              tabSize: 4,
              wordWrap: 'on',
              automaticLayout: true,
            }}
          />
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.67rem', color: '#bbb', margin: '0.5rem 0 0', lineHeight: 1.5 }}>
            Write the function body. Return the result. Secrets are injected as env vars at runtime.
          </p>
        </div>
      )}

      {/* ── Test ── */}
      {activeTab === 'test' && (
        <TestRunner
          tool={{ id: editing?.id, toolset_id: toolsetId, code, name }}
          params={params}
          secrets={secrets}
          backendUrl={backendUrl}
        />
      )}

      {/* Footer: error / success / save */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e8e6e1' }}>
        {error && <ErrorBanner message={error} />}
        {success && <SuccessBanner message={isEdit ? 'Tool updated.' : 'Tool saved.'} />}
        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button
            onClick={onBack}
            style={{ background: 'none', border: '1px solid #ccc', color: '#333', padding: '0.55rem 1.1rem', fontSize: '0.825rem', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', borderRadius: 4 }}
          >
            Cancel
          </button>
          <SaveButton
            onClick={handleSave}
            loading={saving}
            disabled={!name || !description}
            label={isEdit ? 'Update tool' : 'Save tool'}
            loadingLabel={isEdit ? 'Updating…' : 'Saving…'}
          />
        </div>
      </div>
    </div>
  );
}