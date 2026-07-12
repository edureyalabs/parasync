// parasync/app/apps/[agentId]/[taskId]/[appName]/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000';
const mono: React.CSSProperties = { fontFamily: "'DM Mono', monospace" };

export default function AppPage() {
  const params  = useParams();
  const router  = useRouter();
  const agentId = params.agentId as string;
  const taskId  = params.taskId  as string;
  const appName = params.appName as string;

  const [token,   setToken]   = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      const t = data.session?.access_token ?? null;
      if (!t) {
        router.replace('/auth');
        return;
      }
      setToken(t);
      setLoading(false);
    });
  }, [router]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#fafaf8', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: 32, height: 32, border: '2px solid #e3e1dc', borderTopColor: '#111', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ ...mono, fontSize: '0.75rem', color: '#888' }}>Loading app…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#fafaf8', flexDirection: 'column', gap: '1rem' }}>
        <p style={{ fontSize: '0.875rem', color: '#c0392b' }}>{error}</p>
        <button onClick={() => router.back()} style={{ ...mono, fontSize: '0.75rem', padding: '0.4rem 0.9rem', border: '1px solid #ddd', borderRadius: 4, background: 'none', cursor: 'pointer' }}>
          Go back
        </button>
      </div>
    );
  }

  if (!token) return null;

  // The iframe src hits beparasync which serves the HTML with the SDK injected
  const src = `${BACKEND}/app/${agentId}/${taskId}/${appName}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#fafaf8' }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.6rem 1.25rem', borderBottom: '1px solid #e3e1dc',
        background: '#fff', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => router.back()}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', display: 'flex', alignItems: 'center' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1a7f5a' }} />
            <span style={{ ...mono, fontSize: '0.75rem', color: '#333', fontWeight: 500 }}>{appName}</span>
            <span style={{ ...mono, fontSize: '0.65rem', color: '#bbb', background: '#f5f4f1', padding: '0.1rem 0.4rem', borderRadius: 3 }}>
              agent app
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {/* Copy link button */}
          <button
            onClick={() => navigator.clipboard.writeText(window.location.href)}
            style={{ ...mono, fontSize: '0.7rem', padding: '0.3rem 0.75rem', border: '1px solid #ddd', borderRadius: 4, background: 'none', cursor: 'pointer', color: '#555', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <rect x="1" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M3 3V2a1 1 0 011-1h5a1 1 0 011 1v5a1 1 0 01-1 1H8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            Copy link
          </button>

          {/* Open in new tab */}
          <button
            onClick={() => window.open(window.location.href, '_blank')}
            style={{ ...mono, fontSize: '0.7rem', padding: '0.3rem 0.75rem', border: '1px solid #ddd', borderRadius: 4, background: 'none', cursor: 'pointer', color: '#555', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M6.5 1.5H9.5V4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9.5 1.5L5 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M4.5 2.5H2a1 1 0 00-1 1v6a1 1 0 001 1h6a1 1 0 001-1V7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            New tab
          </button>
        </div>
      </div>

      {/* App iframe — passes token via localStorage injection */}
      <iframe
        src={`${src}?token=${encodeURIComponent(token)}`}
        style={{ flex: 1, border: 'none', width: '100%' }}
        title={appName}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        onLoad={(e) => {
          // Inject token into iframe's localStorage so the SDK can use it
          try {
            const iframe = e.target as HTMLIFrameElement;
            iframe.contentWindow?.localStorage.setItem('sb-access-token', token);
          } catch {}
        }}
      />
    </div>
  );
}