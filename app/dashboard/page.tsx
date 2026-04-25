// app/dashboard/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSession, signOut } from '@/lib/api';

function LogoMark() {
  return (
    <div style={{ width: 28, height: 28, background: '#111', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="3" y="2" width="2" height="10" fill="white" />
        <rect x="3" y="2" width="6" height="2" fill="white" />
        <rect x="3" y="6" width="5" height="2" fill="white" />
        <rect x="7" y="2" width="2" height="6" fill="white" />
      </svg>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string; id?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    getSession().then((session) => {
      if (!session) {
        router.replace('/auth');
      } else {
        setUser(session.user);
        setLoading(false);
      }
    });
  }, [router]);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    router.replace('/auth');
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#fafaf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 20, height: 20, border: '1.5px solid #ddd', borderTopColor: '#111', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#fafaf8', fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", color: '#111' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&family=DM+Mono:wght@300;400&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Header */}
      <header style={{ borderBottom: '1px solid #e8e6e1', padding: '0 2rem', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fafaf8' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
          <LogoMark />
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.85rem', color: '#111', letterSpacing: '-0.01em' }}>parasync</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {user?.email && (
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.75rem', color: '#aaa' }}>
              {user.email}
            </span>
          )}
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            style={{
              background: 'none', border: '1px solid #ddd', color: '#555',
              padding: '0.4rem 0.9rem', fontSize: '0.8rem', fontFamily: "'DM Sans', sans-serif",
              cursor: 'pointer', borderRadius: 4, transition: 'border-color 0.15s, color 0.15s',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
            }}
          >
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </header>

      {/* Main */}
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 2rem', animation: 'fadeUp 0.4s ease both' }}>

        {/* Welcome */}
        <div style={{ marginBottom: '3rem' }}>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', color: '#aaa', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Dashboard
          </p>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 500, letterSpacing: '-0.03em', margin: '0 0 0.4rem', color: '#111' }}>
            Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}.
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#888', fontWeight: 300, margin: 0, lineHeight: 1.6 }}>
            Your agents are ready. This is your Parasync workspace.
          </p>
        </div>

        {/* Placeholder cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
          {[
            { label: 'Active agents', value: '—', note: 'None running' },
            { label: 'Completed runs', value: '—', note: 'No history yet' },
            { label: 'Saved workflows', value: '—', note: 'None created' },
          ].map((card) => (
            <div key={card.label} style={{ background: '#fff', border: '1px solid #e3e1dc', borderRadius: 6, padding: '1.5rem' }}>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', color: '#aaa', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 0.6rem' }}>
                {card.label}
              </p>
              <p style={{ fontSize: '1.5rem', fontWeight: 500, letterSpacing: '-0.02em', color: '#111', margin: '0 0 0.25rem' }}>
                {card.value}
              </p>
              <p style={{ fontSize: '0.78rem', color: '#bbb', margin: 0 }}>{card.note}</p>
            </div>
          ))}
        </div>

        {/* Empty state */}
        <div style={{ background: '#fff', border: '1px dashed #ddd', borderRadius: 6, padding: '3rem 2rem', textAlign: 'center' }}>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', color: '#ccc', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Coming soon
          </p>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 500, letterSpacing: '-0.02em', color: '#999', margin: '0 0 0.5rem' }}>
            Your workspace is empty.
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#bbb', fontWeight: 300, margin: '0 auto', lineHeight: 1.6, maxWidth: 340 }}>
            Agent orchestration and workflow creation are being built. You&apos;ll be among the first to access them.
          </p>
        </div>
      </main>
    </div>
  );
}