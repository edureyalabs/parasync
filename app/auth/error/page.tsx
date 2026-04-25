// app/auth/error/page.tsx
'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function ErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get('error') || 'An unknown error occurred.';

  return (
    <div style={{ minHeight: '100vh', background: '#fafaf8', fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", color: '#111' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&family=DM+Mono:wght@300;400&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <nav style={{ padding: '0 2rem', height: 56, display: 'flex', alignItems: 'center', borderBottom: '1px solid #e8e6e1' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
          <div style={{ width: 28, height: 28, background: '#111', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="3" y="2" width="2" height="10" fill="white" />
              <rect x="3" y="2" width="6" height="2" fill="white" />
              <rect x="3" y="6" width="5" height="2" fill="white" />
              <rect x="7" y="2" width="2" height="6" fill="white" />
            </svg>
          </div>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.85rem', color: '#111' }}>parasync</span>
        </Link>
      </nav>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '5rem 1.5rem', minHeight: 'calc(100vh - 56px)' }}>
        <div style={{ width: '100%', maxWidth: 380, animation: 'fadeUp 0.4s ease both' }}>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', color: '#aaa', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
            error
          </p>
          <h1 style={{ fontSize: '1.55rem', fontWeight: 500, letterSpacing: '-0.025em', margin: '0 0 0.4rem' }}>
            Something went wrong.
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#888', fontWeight: 300, margin: '0 0 2rem', lineHeight: 1.6 }}>
            Authentication could not be completed.
          </p>

          <div style={{ background: '#fff', border: '1px solid #e3e1dc', borderRadius: 6, padding: '1.75rem', marginBottom: '1.25rem' }}>
            <div style={{ background: '#fff8f8', border: '1px solid #f5c6c6', borderRadius: 4, padding: '0.75rem', marginBottom: '1.5rem' }}>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.73rem', color: '#c0392b', margin: 0, lineHeight: 1.6 }}>
                {error}
              </p>
            </div>
            <button
              onClick={() => router.push('/auth')}
              style={{
                width: '100%', background: '#111', color: '#fafaf8', border: 'none',
                padding: '0.65rem 1rem', fontSize: '0.875rem', fontFamily: "'DM Sans', sans-serif",
                fontWeight: 400, cursor: 'pointer', borderRadius: 4,
              }}
            >
              Back to sign in
            </button>
          </div>

          <p style={{ fontSize: '0.75rem', color: '#bbb', textAlign: 'center', fontWeight: 300 }}>
            If this keeps happening, contact support.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#fafaf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 20, height: 20, border: '1.5px solid #ddd', borderTopColor: '#111', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}