// parasync/app/console/_components/agents/ToolRegistryPanel.tsx
'use client';
import { useState, useEffect } from 'react';
import { PlatformTool } from './types';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000';
const mono: React.CSSProperties = { fontFamily: "'DM Mono', monospace" };

function ToolToggleCard({
  tool,
  enabled,
  onToggle,
  toggling,
}: {
  tool: PlatformTool;
  enabled: boolean;
  onToggle: (key: string, enabled: boolean) => void;
  toggling: boolean;
}) {
  return (
    <div style={{
      background: '#fff', border: `1px solid ${enabled ? '#111' : '#e3e1dc'}`,
      borderRadius: 6, padding: '1.25rem 1.5rem',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1.5rem',
      transition: 'border-color 0.15s',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
          <span style={{ ...mono, fontSize: '0.82rem', fontWeight: 500, color: '#111' }}>
            {tool.name}
          </span>
          <span style={{
            ...mono, fontSize: '0.6rem', color: '#555',
            background: '#f0eeea', padding: '0.15rem 0.45rem',
            borderRadius: 3, textTransform: 'uppercase', letterSpacing: '0.04em',
          }}>
            platform
          </span>
          {enabled && (
            <span style={{
              ...mono, fontSize: '0.6rem', color: '#1a7f5a',
              background: '#f0faf6', padding: '0.15rem 0.45rem',
              borderRadius: 3, textTransform: 'uppercase', letterSpacing: '0.04em',
            }}>
              enabled
            </span>
          )}
        </div>
        <p style={{ fontSize: '0.8rem', color: '#555', margin: 0, lineHeight: 1.55 }}>
          {tool.description}
        </p>
        {tool.key === 'execute_code' && (
          <p style={{ ...mono, fontSize: '0.68rem', color: '#888', margin: '0.5rem 0 0' }}>
            Agent secrets are injected as env vars. Add them in the Secrets tab.
          </p>
        )}
        {tool.key === 'web_search' && (
        <p style={{ ...mono, fontSize: '0.68rem', color: '#888', margin: '0.5rem 0 0' }}>
            Searches the web via Brave Search API. Returns titles, URLs and descriptions.
        </p>
        )}
        {tool.key === 'browse_web' && (
        <p style={{ ...mono, fontSize: '0.68rem', color: '#888', margin: '0.5rem 0 0' }}>
            Runs a full browser session. Slower than web search but can access any page including JS-rendered and Cloudflare-protected sites.
        </p>
        )}
      </div>

      {/* Toggle */}
      <button
        onClick={() => onToggle(tool.key, !enabled)}
        disabled={toggling}
        style={{
          flexShrink: 0,
          width: 44, height: 24, borderRadius: 12,
          background: enabled ? '#111' : '#ddd',
          border: 'none', cursor: toggling ? 'not-allowed' : 'pointer',
          position: 'relative', transition: 'background 0.2s',
          opacity: toggling ? 0.6 : 1,
        }}
        aria-label={enabled ? 'Disable' : 'Enable'}
      >
        <span style={{
          position: 'absolute', top: 3,
          left: enabled ? 23 : 3,
          width: 18, height: 18, borderRadius: '50%',
          background: '#fff', transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }} />
      </button>
    </div>
  );
}

interface Props {
  agentId: string;
}

export default function ToolRegistryPanel({ agentId }: Props) {
  const [tools, setTools]           = useState<PlatformTool[]>([]);
  const [enabled, setEnabled]       = useState<Set<string>>(new Set());
  const [loading, setLoading]       = useState(true);
  const [toggling, setToggling]     = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
        fetch(`${BACKEND}/agent-config/platform-tools`).then(r => r.json()),
        fetch(`${BACKEND}/agent-config/${agentId}/platform-tools`).then(r => r.json()),
    ]).then(([allTools, enabledKeys]) => {
        setTools(Array.isArray(allTools) ? allTools : []);
        setEnabled(new Set(Array.isArray(enabledKeys) ? enabledKeys : []));
        setLoading(false);
    }).catch(() => setLoading(false));
    }, [agentId]);

  const handleToggle = async (key: string, nextEnabled: boolean) => {
    setToggling(key);
    const res = await fetch(`${BACKEND}/agent-config/${agentId}/platform-tools/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: nextEnabled }),
    });
    if (res.ok) {
        setEnabled(prev => {
        const next = new Set(prev);
        nextEnabled ? next.add(key) : next.delete(key);
        return next;
        });
    }
    setToggling(null);
    };

  if (loading) return <p style={{ fontSize: '0.825rem', color: '#888' }}>Loading…</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <p style={{ fontSize: '0.825rem', color: '#555', margin: 0, lineHeight: 1.6 }}>
        Platform tools are built-in capabilities provided by Parasync. Enable them per agent to make them available during runs.
      </p>
      {tools.length === 0 ? (
        <p style={{ ...mono, fontSize: '0.75rem', color: '#aaa' }}>No platform tools available.</p>
      ) : (
        tools.map(tool => (
          <ToolToggleCard
            key={tool.key}
            tool={tool}
            enabled={enabled.has(tool.key)}
            onToggle={handleToggle}
            toggling={toggling === tool.key}
          />
        ))
      )}
    </div>
  );
}