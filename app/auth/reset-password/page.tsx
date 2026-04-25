// app/auth/reset-password/page.tsx
'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSession, updatePassword, signOut } from '@/lib/api';

function ResetPasswordContent() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    getSession().then((session) => {
      if (session) setHasSession(true);
      else setError('Invalid or expired reset link. Please request a new one.');
      setChecking(false);
    });
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setLoading(true);
    const { error: err } = await updatePassword(password);
    if (err) { setError(err); setLoading(false); }
    else {
      setSuccess(true);
      setTimeout(async () => {
        await signOut();
        router.push('/auth');
      }, 2500);
    }
  };

  const navBar = (
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
  );

  const pageStyle: React.CSSProperties = {
    minHeight: '100vh', background: '#fafaf8',
    fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", color: '#111',
  };

  return (
    <div style={pageStyle}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&family=DM+Mono:wght@300;400&display=swap');
        * { box-sizing: border-box; }
        .ps-input {
          width: 100%; background: #fafaf8; border: 1px solid #ddd; border-radius: 4px;
          color: #111; font-family: 'DM Sans', sans-serif; font-size: 0.875rem;
          padding: 0.6rem 0.8rem; transition: border-color 0.15s; outline: none;
        }
        .ps-input:focus { border-color: #111; background: #fff; }
        .ps-btn {
          width: 100%; background: #111; color: #fafaf8; border: none;
          padding: 0.65rem 1rem; font-size: 0.875rem; font-family: 'DM Sans', sans-serif;
          font-weight: 400; cursor: pointer; border-radius: 4px; transition: background 0.15s;
        }
        .ps-btn:hover:not(:disabled) { background: #222; }
        .ps-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes progress { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {navBar}

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '5rem 1.5rem', minHeight: 'calc(100vh - 56px)' }}>
        <div style={{ width: '100%', maxWidth: 380, animation: 'fadeUp 0.4s ease both' }}>

          {checking ? (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: 20, height: 20, border: '1.5px solid #ddd', borderTopColor: '#111', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>

          ) : !hasSession ? (
            <>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', color: '#aaa', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>error</p>
              <h1 style={{ fontSize: '1.55rem', fontWeight: 500, letterSpacing: '-0.025em', margin: '0 0 0.4rem' }}>Link expired.</h1>
              <p style={{ fontSize: '0.85rem', color: '#888', fontWeight: 300, margin: '0 0 2rem', lineHeight: 1.6 }}>
                This password reset link is no longer valid.
              </p>
              <div style={{ background: '#fff', border: '1px solid #e3e1dc', borderRadius: 6, padding: '1.75rem' }}>
                <div style={{ background: '#fff8f8', border: '1px solid #f5c6c6', borderRadius: 4, padding: '0.75rem', marginBottom: '1.25rem' }}>
                  <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.73rem', color: '#c0392b', margin: 0 }}>{error}</p>
                </div>
                <button onClick={() => router.push('/auth')} className="ps-btn">Request a new link</button>
              </div>
            </>

          ) : success ? (
            <>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', color: '#aaa', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>done</p>
              <h1 style={{ fontSize: '1.55rem', fontWeight: 500, letterSpacing: '-0.025em', margin: '0 0 0.4rem' }}>Password updated.</h1>
              <p style={{ fontSize: '0.85rem', color: '#888', fontWeight: 300, margin: '0 0 2rem', lineHeight: 1.6 }}>Redirecting you to sign in…</p>
              <div style={{ height: 2, background: '#e8e6e1', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '100%', background: '#111', animation: 'progress 2.5s linear forwards' }} />
              </div>
            </>

          ) : (
            <>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', color: '#aaa', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>reset password</p>
              <h1 style={{ fontSize: '1.55rem', fontWeight: 500, letterSpacing: '-0.025em', margin: '0 0 0.4rem' }}>Choose a new password.</h1>
              <p style={{ fontSize: '0.85rem', color: '#888', fontWeight: 300, margin: '0 0 2rem', lineHeight: 1.6 }}>Must be at least 6 characters.</p>

              <div style={{ background: '#fff', border: '1px solid #e3e1dc', borderRadius: 6, padding: '1.75rem' }}>
                <form onSubmit={handleReset}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.775rem', color: '#555', marginBottom: '0.35rem' }}>New password</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                      className="ps-input" placeholder="••••••••" required minLength={6} />
                  </div>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.775rem', color: '#555', marginBottom: '0.35rem' }}>Confirm password</label>
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                      className="ps-input" placeholder="••••••••" required minLength={6} />
                  </div>
                  {error && (
                    <div style={{ background: '#fff8f8', border: '1px solid #f5c6c6', borderRadius: 4, padding: '0.6rem 0.75rem', marginBottom: '1rem' }}>
                      <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.73rem', color: '#c0392b', margin: 0 }}>{error}</p>
                    </div>
                  )}
                  <button type="submit" disabled={loading || !hasSession} className="ps-btn">
                    {loading ? 'Updating…' : 'Update password'}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#fafaf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 20, height: 20, border: '1.5px solid #ddd', borderTopColor: '#111', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}