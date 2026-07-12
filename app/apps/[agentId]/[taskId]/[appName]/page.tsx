// parasync/app/apps/[agentId]/[taskId]/[appName]/page.tsx
'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000';
const mono: React.CSSProperties = { fontFamily: "'DM Mono', monospace" };

export default function AppPage() {
  const params    = useParams();
  const router    = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const agentId = params.agentId as string;
  const taskId  = params.taskId  as string;
  const appName = params.appName as string;

  const [token,   setToken]   = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied,  setCopied]  = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      const t = data.session?.access_token ?? null;
      if (!t) { router.replace('/auth'); return; }
      setToken(t);
      setLoading(false);
    });
  }, [router]);

  // Inject token into iframe via postMessage after load
  const handleIframeLoad = () => {
    if (!token || !iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage(
      { type: 'PARASYNC_TOKEN', token },
      '*'
    );
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#fafaf8', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ width: 32, height: 32, border: '2px solid #e3e1dc', borderTopColor: '#111', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ ...mono, fontSize: '0.75rem', color: '#888' }}>Authenticating…</p>
    </div>
  );

  if (!token) return null;

  // Use the Next.js proxy route — handles auth server-side, no CORS issues
  const iframeSrc = `/api/app/${agentId}/${taskId}/${appName}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#fafaf8' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 1.25rem', borderBottom: '1px solid #e3e1dc', background: '#fff', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', display: 'flex', alignItems: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1a7f5a' }} />
            <span style={{ ...mono, fontSize: '0.75rem', color: '#333', fontWeight: 500 }}>{appName}</span>
            <span style={{ ...mono, fontSize: '0.6rem', color: '#888', background: '#f5f4f1', padding: '0.1rem 0.4rem', borderRadius: 3 }}>agent app</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button onClick={copyLink} style={{ ...mono, fontSize: '0.7rem', padding: '0.3rem 0.75rem', border: '1px solid #ddd', borderRadius: 4, background: copied ? '#f0faf6' : 'none', color: copied ? '#1a7f5a' : '#555', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', transition: 'all 0.15s' }}>
            {copied
              ? <><svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 5.5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>Copied</>
              : <><svg width="11" height="11" viewBox="0 0 11 11" fill="none"><rect x="1" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2" /><path d="M3 3V2a1 1 0 011-1h5a1 1 0 011 1v5a1 1 0 01-1 1H8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>Copy link</>
            }
          </button>
          <button onClick={() => window.open(window.location.href, '_blank')} style={{ ...mono, fontSize: '0.7rem', padding: '0.3rem 0.75rem', border: '1px solid #ddd', borderRadius: 4, background: 'none', color: '#555', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M6.5 1.5H9.5V4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /><path d="M9.5 1.5L5 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /><path d="M4.5 2.5H2a1 1 0 00-1 1v6a1 1 0 001 1h6a1 1 0 001-1V7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
            New tab
          </button>
        </div>
      </div>

      {/* Iframe using Next.js proxy — auth handled server-side */}
      <iframe
        ref={iframeRef}
        src={iframeSrc}
        style={{ flex: 1, border: 'none', width: '100%' }}
        title={appName}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        onLoad={handleIframeLoad}
      />
    </div>
  );
}