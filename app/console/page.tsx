// console/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSession, signOut } from '@/lib/api';
import { createClient } from '@/lib/supabase/client';

import ContextPanel from './_components/ContextPanel';
import ToolsPanel from './_components/ToolsPanel';
import AgentsPanel from './_components/AgentsPanel';
import UnderConstruction from './_components/UnderConstruction';

// ─── Nav ──────────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  {
    id: 'overview',
    label: 'Overview',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
        <rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
        <rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
        <rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
      </svg>
    ),
  },
  {
    id: 'agents',
    label: 'Agents',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="5" r="3" stroke="currentColor" strokeWidth="1.3" />
        <path d="M2 12c0-2.21 2.239-4 5-4s5 1.79 5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'tools',
    label: 'Tools',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M2 4.5h10M2 7h6M2 9.5h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'context',
    label: 'Context',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="2" y="2" width="4" height="10" rx="1" stroke="currentColor" strokeWidth="1.3" />
        <rect x="8" y="2" width="4" height="10" rx="1" stroke="currentColor" strokeWidth="1.3" />
      </svg>
    ),
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    icon: (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" />
        <path d="M9 5L6.5 6.5 5 9l2.5-1.5L9 5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <>
      <div style={{
        width: 18, height: 18,
        border: '1.5px solid #ddd',
        borderTopColor: '#111',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ConsolePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string; id?: string } | null>(null);
  const [orgId, setOrgId] = useState('');
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [activeItem, setActiveItem] = useState('overview');

  useEffect(() => {
    getSession().then((session) => {
      if (!session) {
        router.replace('/auth');
        return;
      }
      setUser(session.user);
      setLoading(false);

      const supabase = createClient();
      supabase
        .from('organizations')
        .select('id')
        .eq('owner_id', session.user.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .single()
        .then(({ data }) => { if (data) setOrgId(data.id); });
    });
  }, [router]);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    router.replace('/auth');
  };

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafaf8' }}>
      <Spinner />
    </div>
  );

  // Don't render until orgId is loaded — prevents fetch with empty string
  if (!orgId) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafaf8' }}>
      <Spinner />
    </div>
  );

  const renderPanel = () => {
    switch (activeItem) {
      case 'context':
        return <ContextPanel orgId={orgId} userId={user?.id ?? ''} />;
      case 'tools':
        return <ToolsPanel orgId={orgId} userId={user?.id ?? ''} />;
      case 'agents':
        return <AgentsPanel orgId={orgId} userId={user?.id ?? ''} />;
      default:
        return <UnderConstruction label={NAV_ITEMS.find(i => i.id === activeItem)?.label ?? activeItem} />;
    }
  };

  return (
    <div style={{
      flex: '1 1 0', minHeight: 0,
      display: 'flex', flexDirection: 'column',
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
      background: '#fafaf8', color: '#111',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&family=DM+Mono:wght@300;400&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .nav-item {
          display: flex; align-items: center; gap: 0.55rem;
          padding: 0.42rem 0.65rem; border-radius: 4px;
          border: none; background: none; cursor: pointer;
          width: 100%; text-align: left;
          font-family: 'DM Sans', sans-serif; font-size: 0.825rem; color: #555;
          transition: background 0.12s, color 0.12s;
        }
        .nav-item:hover { background: #edecea; color: #111; }
        .nav-item.active { background: #111; color: #fafaf8; }
      `}</style>

      {/* ── Header ── */}
      <header style={{
        borderBottom: '1px solid #e8e6e1',
        padding: '0 1.25rem', height: 52,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#fafaf8', flexShrink: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', textDecoration: 'none' }}>
            <div style={{ width: 26, height: 26, background: '#111', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <rect x="3" y="2" width="2" height="10" fill="white" />
                <rect x="3" y="2" width="6" height="2" fill="white" />
                <rect x="3" y="6" width="5" height="2" fill="white" />
                <rect x="7" y="2" width="2" height="6" fill="white" />
              </svg>
            </div>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.82rem', color: '#111', letterSpacing: '-0.01em' }}>
              parasync
            </span>
          </Link>

          <span style={{ color: '#ccc' }}>/</span>

          <Link
            href="/dashboard"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none', fontFamily: "'DM Mono', monospace", fontSize: '0.75rem', color: '#666', transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#111')}
            onMouseLeave={e => (e.currentTarget.style.color = '#666')}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M7.5 2L3.5 6l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Dashboard
          </Link>

          <span style={{ color: '#ccc' }}>/</span>

          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.75rem', color: '#333' }}>
            console
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {user?.email && (
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', color: '#555' }}>
              {user.email}
            </span>
          )}
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            style={{
              background: 'none', border: '1px solid #ddd', color: '#333',
              padding: '0.35rem 0.85rem', fontSize: '0.78rem',
              fontFamily: "'DM Sans', sans-serif",
              cursor: signingOut ? 'not-allowed' : 'pointer', borderRadius: 4,
            }}
          >
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div style={{ display: 'flex', flex: '1 1 0', minHeight: 0, overflow: 'hidden' }}>

        {/* Left panel */}
        <aside style={{
          width: 216, flexShrink: 0,
          background: '#f4f2ee', borderRight: '1px solid #e3e1dc',
          display: 'flex', flexDirection: 'column',
          padding: '1.25rem 0.75rem', overflowY: 'auto',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                className={`nav-item${activeItem === item.id ? ' active' : ''}`}
                onClick={() => setActiveItem(item.id)}
              >
                <span style={{ opacity: activeItem === item.id ? 1 : 0.6, flexShrink: 0 }}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            ))}
          </div>

          <div style={{ marginTop: 'auto', borderTop: '1px solid #e3e1dc', paddingTop: '1rem' }}>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.55rem',
                width: '100%', padding: '0.42rem 0.65rem', borderRadius: 4,
                border: 'none', background: 'none',
                cursor: signingOut ? 'not-allowed' : 'pointer',
                fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem',
                color: '#888', textAlign: 'left', transition: 'color 0.12s',
              }}
              onMouseEnter={e => { if (!signingOut) (e.currentTarget as HTMLButtonElement).style.color = '#333'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#888'; }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ opacity: 0.6 }}>
                <path d="M5 2H3a1 1 0 00-1 1v8a1 1 0 001 1h2M9 10l3-3-3-3M12 7H5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {signingOut ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </aside>

        {/* Right panel */}
        <main style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          background: '#fafaf8', minHeight: 0, overflowY: 'auto',
          animation: 'fadeUp 0.3s ease both',
        }}>
          {renderPanel()}
        </main>
      </div>
    </div>
  );
}