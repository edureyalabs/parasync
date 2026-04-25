// app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#fafaf8]" style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=DM+Mono:wght@300;400&display=swap');
      `}</style>

      {/* Header */}
      <header style={{ borderBottom: '1px solid #e8e6e1', background: '#fafaf8' }} className="flex items-center justify-between px-8 h-14 sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <div style={{ width: 28, height: 28, background: '#111', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="3" y="2" width="2" height="10" fill="white" />
              <rect x="3" y="2" width="6" height="2" fill="white" />
              <rect x="3" y="6" width="5" height="2" fill="white" />
              <rect x="7" y="2" width="2" height="6" fill="white" />
            </svg>
          </div>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.85rem', color: '#111', letterSpacing: '-0.01em' }}>
            parasync
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8" style={{ fontSize: '0.85rem', color: '#666' }}>
          <a href="#" style={{ color: '#666', textDecoration: 'none' }}>Product</a>
          <a href="#" style={{ color: '#666', textDecoration: 'none' }}>Docs</a>
          <a href="#" style={{ color: '#666', textDecoration: 'none' }}>Pricing</a>
        </nav>

        <Link href="/auth" style={{
          background: '#111', color: '#fafaf8', padding: '0.45rem 1.1rem',
          fontSize: '0.825rem', fontFamily: "'DM Sans', sans-serif", fontWeight: 400,
          letterSpacing: '0.01em', cursor: 'pointer', borderRadius: 4, textDecoration: 'none',
        }}>
          Login / Sign up
        </Link>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center text-center px-6" style={{ paddingTop: '7rem', paddingBottom: '7rem' }}>
        <p style={{
          fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', color: '#777',
          letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1.5rem',
        }}>
          Early access · Agents for everyone
        </p>

        <h1 style={{
          fontSize: 'clamp(2.4rem, 6vw, 3.75rem)', fontWeight: 600,
          letterSpacing: '-0.035em', lineHeight: 1.08, color: '#111',
          maxWidth: 620, margin: '0 auto 1.5rem',
        }}>
          Workflows that run in parallel, not in sequence.
        </h1>

        <p style={{
          fontSize: '1.05rem', color: '#777', fontWeight: 300, lineHeight: 1.7,
          maxWidth: 460, margin: '0 auto 3rem',
        }}>
          Parasync orchestrates intelligent agents simultaneously — so your work finishes faster, without the bottlenecks.
        </p>

        <div className="flex items-center gap-3 justify-center flex-wrap">
          <Link href="/auth" style={{
            background: '#111', color: '#fafaf8', padding: '0.7rem 1.6rem',
            fontSize: '0.875rem', borderRadius: 4, textDecoration: 'none', letterSpacing: '0.01em',
          }}>
            Get started free
          </Link>
          <a href="#" style={{
            color: '#555', padding: '0.7rem 1.4rem', fontSize: '0.875rem',
            border: '1px solid #ddd', borderRadius: 4, textDecoration: 'none',
            background: '#fff', letterSpacing: '0.01em',
          }}>
            See how it works →
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #e8e6e1', padding: '1.25rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', color: '#888' }}>© 2025 Parasync</span>
        <div className="flex gap-6" style={{ fontSize: '0.75rem', color: '#888' }}>
          <a href="/terms" style={{ color: '#888', textDecoration: 'none' }}>Terms</a>
          <a href="/privacy" style={{ color: '#888', textDecoration: 'none' }}>Privacy</a>
        </div>
      </footer>
    </div>
  );
}