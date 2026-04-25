// app/auth/page.tsx
'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSession, signIn, signUp, forgotPassword, signInWithGoogle } from '@/lib/api';

type AuthView = 'sign_in' | 'sign_up' | 'forgot_password' | 'check_email';

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  );
}

const S = {
  page: {
    minHeight: '100vh',
    background: '#fafaf8',
    fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
    color: '#111',
  } as React.CSSProperties,
  nav: {
    padding: '0 2rem',
    height: '56px',
    display: 'flex',
    alignItems: 'center',
    borderBottom: '1px solid #e8e6e1',
  } as React.CSSProperties,
  logoMark: {
    width: 28, height: 28, background: '#111', borderRadius: 6,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  } as React.CSSProperties,
  logoText: {
    fontFamily: "'DM Mono', monospace", fontSize: '0.85rem', color: '#111',
    letterSpacing: '-0.01em', textDecoration: 'none',
  } as React.CSSProperties,
  center: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
    padding: '5rem 1.5rem', minHeight: 'calc(100vh - 56px)',
  } as React.CSSProperties,
  card: {
    width: '100%', maxWidth: '380px',
  } as React.CSSProperties,
  eyebrow: {
    fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', color: '#777',
    letterSpacing: '0.07em', marginBottom: '0.6rem', textTransform: 'uppercase' as const,
  },
  h1: {
    fontSize: '1.55rem', fontWeight: 500, letterSpacing: '-0.025em',
    margin: '0 0 0.4rem', lineHeight: 1.2, color: '#111',
  } as React.CSSProperties,
  subtitle: {
    fontSize: '0.85rem', color: '#666', fontWeight: 300, margin: '0 0 2rem', lineHeight: 1.6,
  } as React.CSSProperties,
  box: {
    background: '#fff', border: '1px solid #e3e1dc',
    borderRadius: 6, padding: '1.75rem',
  } as React.CSSProperties,
  label: {
    display: 'block', fontSize: '0.775rem', color: '#555', marginBottom: '0.35rem',
    fontWeight: 400,
  } as React.CSSProperties,
  fieldWrap: { marginBottom: '1rem' } as React.CSSProperties,
  errorBox: {
    background: '#fff8f8', border: '1px solid #f5c6c6', borderRadius: 4,
    padding: '0.6rem 0.75rem', marginBottom: '1rem',
  } as React.CSSProperties,
  errorText: {
    fontFamily: "'DM Mono', monospace", fontSize: '0.73rem', color: '#c0392b',
    margin: 0, lineHeight: 1.5,
  } as React.CSSProperties,
  successBox: {
    background: '#f0faf5', border: '1px solid #a7f3d0', borderRadius: 4,
    padding: '0.6rem 0.75rem', marginBottom: '1rem',
  } as React.CSSProperties,
  successText: {
    fontFamily: "'DM Mono', monospace", fontSize: '0.73rem', color: '#2a9d5c',
    margin: 0, lineHeight: 1.5,
  } as React.CSSProperties,
  footer: {
    marginTop: '1.25rem', fontSize: '0.75rem', color: '#888',
    textAlign: 'center' as const, fontWeight: 300, lineHeight: 1.6,
  },
};

function Spinner() {
  return (
    <>
      <div style={{ width: 16, height: 16, border: '1.5px solid #ddd', borderTopColor: '#555', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

function AuthContent() {
  const router = useRouter();
  const [view, setView] = useState<AuthView>('sign_in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    getSession().then((session) => {
      if (session) router.replace('/dashboard');
      else setLoading(false);
    });
  }, [router]);

  const reset = () => { setError(''); setMessage(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    setSubmitting(true);

    if (view === 'sign_in') {
      const { error: err } = await signIn(email, password);
      if (err) { setError(err); setSubmitting(false); }
      else router.replace('/dashboard');
    } else if (view === 'sign_up') {
      const { requiresConfirmation, error: err } = await signUp(email, password);
      if (err) { setError(err); setSubmitting(false); }
      else if (requiresConfirmation) { setView('check_email'); setSubmitting(false); }
      else router.replace('/dashboard');
    } else if (view === 'forgot_password') {
      const { error: err } = await forgotPassword(email);
      if (err) setError(err);
      else setMessage('Check your email for a reset link.');
      setSubmitting(false);
    }
  };

  const handleGoogle = () => { setGoogleLoading(true); signInWithGoogle(); };

  if (loading) return (
    <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spinner />
    </div>
  );

  const titles: Record<AuthView, string> = {
    sign_in: 'Welcome back.',
    sign_up: 'Create an account.',
    forgot_password: 'Reset your password.',
    check_email: 'Check your email.',
  };

  const subtitles: Record<AuthView, string> = {
    sign_in: 'Sign in to your Parasync workspace.',
    sign_up: "Get started — it's free.",
    forgot_password: "Enter your email and we'll send a reset link.",
    check_email: `We sent a confirmation link to ${email}.`,
  };

  const showGoogle = view === 'sign_in' || view === 'sign_up';

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&family=DM+Mono:wght@300;400&display=swap');
        * { box-sizing: border-box; }
        ::selection { background: #111; color: #fafaf8; }
        .ps-input {
          width: 100%; background: #fafaf8; border: 1px solid #ddd; border-radius: 4px;
          color: #111; font-family: 'DM Sans', sans-serif; font-size: 0.875rem;
          padding: 0.6rem 0.8rem; transition: border-color 0.15s; outline: none;
        }
        .ps-input:focus { border-color: #111; background: #fff; }
        .ps-btn-primary {
          width: 100%; background: #111; color: #fafaf8; border: none;
          padding: 0.65rem 1rem; font-size: 0.875rem; font-family: 'DM Sans', sans-serif;
          font-weight: 400; letter-spacing: 0.01em; cursor: pointer; border-radius: 4px;
          transition: background 0.15s; display: flex; align-items: center; justify-content: center; gap: 0.5rem;
        }
        .ps-btn-primary:hover:not(:disabled) { background: #222; }
        .ps-btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
        .ps-btn-google {
          width: 100%; background: #fff; color: #111; border: 1px solid #ddd;
          padding: 0.6rem 1rem; font-size: 0.875rem; font-family: 'DM Sans', sans-serif;
          font-weight: 400; letter-spacing: 0.01em; cursor: pointer; border-radius: 4px;
          transition: background 0.15s, border-color 0.15s;
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
        }
        .ps-btn-google:hover:not(:disabled) { background: #f5f5f3; border-color: #ccc; }
        .ps-btn-google:disabled { opacity: 0.45; cursor: not-allowed; }
        .ps-divider {
          display: flex; align-items: center; gap: 0.75rem; margin: 1.1rem 0;
          color: #ccc; font-size: 0.72rem; font-family: 'DM Mono', monospace;
        }
        .ps-divider::before, .ps-divider::after { content: ''; flex: 1; height: 1px; background: #e8e6e1; }
        .ps-link { background: none; border: none; color: #333; font-size: 0.8rem;
          font-family: 'DM Sans', sans-serif; cursor: pointer; padding: 0;
          text-decoration: underline; text-underline-offset: 2px; }
        .ps-link:hover { color: #111; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Nav */}
      <nav style={S.nav}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
          <div style={S.logoMark}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="3" y="2" width="2" height="10" fill="white" />
              <rect x="3" y="2" width="6" height="2" fill="white" />
              <rect x="3" y="6" width="5" height="2" fill="white" />
              <rect x="7" y="2" width="2" height="6" fill="white" />
            </svg>
          </div>
          <span style={S.logoText}>parasync</span>
        </Link>
      </nav>

      <div style={S.center}>
        <div style={{ ...S.card, animation: 'fadeUp 0.4s ease both' }}>

          {/* Header text */}
          <div style={{ marginBottom: '1.75rem' }}>
            <p style={S.eyebrow}>parasync.com</p>
            <h1 style={S.h1}>{titles[view]}</h1>
            <p style={S.subtitle}>{subtitles[view]}</p>
          </div>

          {view === 'check_email' ? (
            <div style={{ ...S.box, textAlign: 'center' }}>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.75rem', color: '#2a9d5c', margin: '0 0 1rem' }}>✓ email sent</p>
              <p style={{ fontSize: '0.85rem', color: '#777', margin: '0 0 1.25rem', lineHeight: 1.6 }}>
                Click the link in your inbox to activate your account.
              </p>
              <button className="ps-link" onClick={() => { setView('sign_in'); setEmail(''); setPassword(''); reset(); }}>
                Back to sign in
              </button>
            </div>
          ) : (
            <div style={S.box}>
              {showGoogle && (
                <>
                  <button className="ps-btn-google" onClick={handleGoogle} disabled={googleLoading || submitting} type="button">
                    {googleLoading ? <><Spinner />Connecting…</> : <><GoogleIcon />Continue with Google</>}
                  </button>
                  <div className="ps-divider">or</div>
                </>
              )}

              <form onSubmit={handleSubmit}>
                <div style={S.fieldWrap}>
                  <label style={S.label}>Email address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className="ps-input" placeholder="you@example.com" required autoComplete="email" />
                </div>

                {(view === 'sign_in' || view === 'sign_up') && (
                  <div style={{ ...S.fieldWrap, marginBottom: '1.25rem' }}>
                    <label style={S.label}>Password</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                      className="ps-input" placeholder="••••••••" required minLength={6}
                      autoComplete={view === 'sign_in' ? 'current-password' : 'new-password'} />
                  </div>
                )}

                {error && (
                  <div style={S.errorBox}>
                    <p style={S.errorText}>{error}</p>
                  </div>
                )}

                {message && (
                  <div style={S.successBox}>
                    <p style={S.successText}>{message}</p>
                  </div>
                )}

                <button type="submit" className="ps-btn-primary" disabled={submitting || googleLoading}>
                  {submitting
                    ? <><Spinner />Please wait…</>
                    : view === 'sign_in' ? 'Sign in'
                    : view === 'sign_up' ? 'Create account'
                    : 'Send reset link'}
                </button>
              </form>

              {/* View switcher */}
              <div style={{ marginTop: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.45rem', alignItems: 'center' }}>
                {view === 'sign_in' && (
                  <>
                    <button className="ps-link" onClick={() => { setView('forgot_password'); reset(); }}>
                      Forgot your password?
                    </button>
                    <p style={{ fontSize: '0.8rem', color: '#999', margin: 0 }}>
                      No account?{' '}
                      <button className="ps-link" onClick={() => { setView('sign_up'); reset(); }}>Sign up</button>
                    </p>
                  </>
                )}
                {view === 'sign_up' && (
                  <p style={{ fontSize: '0.8rem', color: '#999', margin: 0 }}>
                    Already have an account?{' '}
                    <button className="ps-link" onClick={() => { setView('sign_in'); reset(); }}>Sign in</button>
                  </p>
                )}
                {view === 'forgot_password' && (
                  <button className="ps-link" onClick={() => { setView('sign_in'); reset(); }}>
                    Back to sign in
                  </button>
                )}
              </div>
            </div>
          )}

          <p style={S.footer}>
            By continuing, you agree to our{' '}
            <Link href="/terms" style={{ color: '#666' }}>Terms</Link>{' '}and{' '}
            <Link href="/privacy" style={{ color: '#666' }}>Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#fafaf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 20, height: 20, border: '1.5px solid #ddd', borderTopColor: '#111', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}