// console/_components/tools/ParameterBuilder.tsx
'use client';
import { useState } from 'react';
import { ToolParameter } from './types';
import { inputStyle, labelStyle } from './ui';

const PARAM_TYPES = ['string', 'number', 'boolean', 'array', 'object'] as const;

interface Props {
  parameters: ToolParameter[];
  onChange: (params: ToolParameter[]) => void;
}

export default function ParameterBuilder({ parameters, onChange }: Props) {
  const [name, setName] = useState('');
  const [type, setType] = useState<ToolParameter['type']>('string');
  const [description, setDescription] = useState('');
  const [required, setRequired] = useState(true);
  const [error, setError] = useState('');

  const normalizeParamName = (v: string) => v.toLowerCase().replace(/[^a-z0-9_]/g, '_');

  const handleAdd = () => {
    const n = name.trim();
    if (!n) { setError('Parameter name is required.'); return; }
    if (!/^[a-z][a-z0-9_]*$/.test(n)) { setError('Name must be lowercase_snake_case.'); return; }
    if (parameters.some(p => p.name === n)) { setError(`"${n}" already exists.`); return; }
    if (!description.trim()) { setError('Description helps the agent understand when to use this parameter.'); return; }

    onChange([...parameters, { name: n, type, description: description.trim(), required }]);
    setName('');
    setDescription('');
    setType('string');
    setRequired(true);
    setError('');
  };

  const handleRemove = (paramName: string) => {
    onChange(parameters.filter(p => p.name !== paramName));
  };

  const toggleRequired = (paramName: string) => {
    onChange(parameters.map(p => p.name === paramName ? { ...p, required: !p.required } : p));
  };

  return (
    <div>
      <style>{`
        .param-input:focus { border-color: #111 !important; }
        .param-input::placeholder { color: #999; }
        .type-btn { transition: background 0.1s, color 0.1s, border-color 0.1s; }
      `}</style>

      {/* Existing params */}
      {parameters.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {parameters.map(p => (
            <div key={p.name} style={{
              background: '#fff', border: '1px solid #e3e1dc', borderRadius: 5,
              padding: '0.65rem 1rem', display: 'flex', alignItems: 'flex-start',
              justifyContent: 'space-between', gap: '1rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', minWidth: 0 }}>
                <span style={{
                  fontFamily: "'DM Mono', monospace", fontSize: '0.68rem',
                  background: '#111', color: '#fafaf8',
                  padding: '0.2rem 0.5rem', borderRadius: 3, flexShrink: 0, marginTop: 1,
                }}>
                  {p.type}
                </span>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.78rem', fontWeight: 500, color: '#111', margin: '0 0 0.2rem' }}>
                    {p.name}
                    {p.required && <span style={{ color: '#e55', marginLeft: 4 }}>*</span>}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#666', margin: 0, lineHeight: 1.4 }}>{p.description}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                <button
                  onClick={() => toggleRequired(p.name)}
                  style={{
                    background: 'none',
                    border: `1px solid ${p.required ? '#111' : '#ddd'}`,
                    color: p.required ? '#111' : '#aaa',
                    padding: '0.25rem 0.55rem', fontSize: '0.7rem',
                    fontFamily: "'DM Mono', monospace", cursor: 'pointer', borderRadius: 3,
                  }}
                  title="Toggle required"
                >
                  {p.required ? 'required' : 'optional'}
                </button>
                <button
                  onClick={() => handleRemove(p.name)}
                  style={{
                    background: 'none', border: '1px solid #ddd', color: '#888',
                    padding: '0.25rem 0.55rem', fontSize: '0.7rem',
                    fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', borderRadius: 3,
                    transition: 'border-color 0.12s, color 0.12s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#e55'; (e.currentTarget as HTMLButtonElement).style.color = '#c0392b'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#ddd'; (e.currentTarget as HTMLButtonElement).style.color = '#888'; }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add param row */}
      <div style={{ background: '#fafaf8', border: '1.5px dashed #ddd', borderRadius: 6, padding: '1.1rem' }}>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', color: '#777', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 0.85rem' }}>
          Add parameter
        </p>

        {/* Type picker */}
        <div style={{ marginBottom: '0.85rem' }}>
          <label style={labelStyle}>Type</label>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {PARAM_TYPES.map(t => (
              <button
                key={t}
                className="type-btn"
                onClick={() => setType(t)}
                style={{
                  padding: '0.3rem 0.7rem', fontSize: '0.75rem',
                  fontFamily: "'DM Mono', monospace", cursor: 'pointer', borderRadius: 4,
                  border: `1.5px solid ${type === t ? '#111' : '#ddd'}`,
                  background: type === t ? '#111' : 'transparent',
                  color: type === t ? '#fafaf8' : '#555',
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 140px' }}>
            <label style={labelStyle}>Name</label>
            <input
              className="param-input"
              type="text"
              placeholder="e.g. query"
              value={name}
              onChange={e => { setName(normalizeParamName(e.target.value)); setError(''); }}
              maxLength={40}
              style={inputStyle}
            />
          </div>
          <div style={{ flex: '2 1 200px' }}>
            <label style={labelStyle}>Description</label>
            <input
              className="param-input"
              type="text"
              placeholder="What this parameter is for"
              value={description}
              onChange={e => { setDescription(e.target.value); setError(''); }}
              maxLength={200}
              onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
              style={inputStyle}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <label style={{ ...labelStyle, visibility: 'hidden' }}>add</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.78rem', color: '#444', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' }}>
                <input
                  type="checkbox"
                  checked={required}
                  onChange={e => setRequired(e.target.checked)}
                  style={{ accentColor: '#111', width: 13, height: 13 }}
                />
                Required
              </label>
              <button
                onClick={handleAdd}
                style={{
                  background: '#111', color: '#fafaf8', border: 'none',
                  padding: '0.55rem 1rem', fontSize: '0.8rem',
                  fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', borderRadius: 4,
                }}
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {error && (
          <p style={{ fontSize: '0.75rem', color: '#c0392b', margin: '0.6rem 0 0', fontFamily: "'DM Mono', monospace" }}>
            {error}
          </p>
        )}
      </div>

      {/* JSON Schema preview */}
      {parameters.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.65rem', color: '#aaa', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 0.5rem' }}>
            Generated schema
          </p>
          <pre style={{
            background: '#f5f4f1', border: '1px solid #e3e1dc', borderRadius: 5,
            padding: '0.85rem 1rem', fontSize: '0.75rem', fontFamily: "'DM Mono', monospace",
            color: '#333', margin: 0, overflow: 'auto', lineHeight: 1.6,
          }}>
            {JSON.stringify(
              {
                type: 'object',
                properties: Object.fromEntries(parameters.map(p => [p.name, { type: p.type, description: p.description }])),
                required: parameters.filter(p => p.required).map(p => p.name),
              },
              null, 2
            )}
          </pre>
        </div>
      )}
    </div>
  );
}