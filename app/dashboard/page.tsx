// dashboard/page.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSession, signOut } from '@/lib/api';
import { createClient } from '@/lib/supabase/client';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Organization {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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

function Spinner({ size = 18, color = '#111' }: { size?: number; color?: string }) {
  return (
    <>
      <div style={{
        width: size, height: size,
        border: `1.5px solid ${color === '#111' ? '#ddd' : 'rgba(255,255,255,0.3)'}`,
        borderTopColor: color,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        flexShrink: 0,
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

// ─── Create Org Modal ─────────────────────────────────────────────────────────

interface CreateOrgModalProps {
  onClose: () => void;
  onCreated: (org: Organization) => void;
  userId: string;
}

function CreateOrgModal({ onClose, onCreated, userId }: CreateOrgModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) { setError('Organization name is required.'); return; }
    if (trimmedName.length < 2) { setError('Name must be at least 2 characters.'); return; }

    setLoading(true);
    setError('');

    const supabase = createClient();
    const { data, error: dbError } = await supabase
      .from('organizations')
      .insert({ name: trimmedName, description: description.trim() || null, owner_id: userId })
      .select()
      .single();

    setLoading(false);

    if (dbError) {
      setError('Something went wrong. Please try again.');
      return;
    }

    onCreated(data as Organization);
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(10,10,10,0.35)',
        backdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.15s ease both',
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .org-input {
          width: 100%;
          padding: 0.6rem 0.75rem;
          font-size: 0.875rem;
          font-family: 'DM Sans', sans-serif;
          color: #111;
          background: #fafaf8;
          border: 1px solid #ddd;
          border-radius: 4px;
          outline: none;
          transition: border-color 0.15s;
          box-sizing: border-box;
        }
        .org-input:focus { border-color: #111; }
        .org-input::placeholder { color: #888; }
      `}</style>

      <div style={{
        background: '#fff',
        border: '1px solid #e3e1dc',
        borderRadius: 8,
        padding: '2rem',
        width: '100%',
        maxWidth: 440,
        animation: 'slideUp 0.2s ease both',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
          <div>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.68rem', color: '#555', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 0.35rem' }}>
              New organization
            </p>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 500, letterSpacing: '-0.025em', color: '#111', margin: 0 }}>
              Create a workspace
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', padding: '2px', lineHeight: 1, marginLeft: '1rem', flexShrink: 0 }}
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div>
            <label style={{ display: 'block', fontFamily: "'DM Mono', monospace", fontSize: '0.68rem', color: '#333', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              Name <span style={{ color: '#e55' }}>*</span>
            </label>
            <input
              ref={nameRef}
              className="org-input"
              type="text"
              placeholder="e.g. Acme Corp"
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
              maxLength={60}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontFamily: "'DM Mono', monospace", fontSize: '0.68rem', color: '#333', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              Description <span style={{ color: '#777', fontFamily: "'DM Sans', sans-serif", textTransform: 'none', letterSpacing: 0, fontSize: '0.7rem' }}>optional</span>
            </label>
            <textarea
              className="org-input"
              placeholder="What does this organization do?"
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={200}
              rows={3}
              style={{ resize: 'none', lineHeight: 1.6 }}
            />
            <p style={{ fontSize: '0.72rem', color: '#777', margin: '0.3rem 0 0', textAlign: 'right', fontFamily: "'DM Mono', monospace" }}>
              {description.length}/200
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <p style={{ fontSize: '0.8rem', color: '#c0392b', margin: '0.9rem 0 0', background: '#fef6f5', border: '1px solid #fad4ce', borderRadius: 4, padding: '0.5rem 0.75rem' }}>
            {error}
          </p>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.65rem', marginTop: '1.75rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: '1px solid #ccc', color: '#333',
              padding: '0.55rem 1.1rem', fontSize: '0.825rem',
              fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', borderRadius: 4,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !name.trim()}
            style={{
              background: !name.trim() ? '#666' : '#111',
              color: '#fafaf8',
              border: 'none',
              padding: '0.55rem 1.25rem',
              fontSize: '0.825rem',
              fontFamily: "'DM Sans', sans-serif",
              cursor: !name.trim() || loading ? 'not-allowed' : 'pointer',
              borderRadius: 4,
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              opacity: !name.trim() ? 0.6 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            {loading && <Spinner size={14} color="#fff" />}
            {loading ? 'Creating…' : 'Create organization'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Org Card ─────────────────────────────────────────────────────────────────

function OrgCard({ org }: { org: Organization }) {
  const router = useRouter();
  const initials = org.name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');

  const createdDate = new Date(org.created_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <div
      onClick={() => router.push(`/console`)}
      style={{
      background: '#fff',
      border: '1px solid #e3e1dc',
      borderRadius: 6,
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.85rem',
      cursor: 'pointer',
      transition: 'border-color 0.15s, box-shadow 0.15s',
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = '#bbb';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.05)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = '#e3e1dc';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
      }}
    >
      {/* Avatar + name row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          width: 36, height: 36, borderRadius: 6,
          background: '#111', color: '#fafaf8',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', letterSpacing: '0.02em',
          flexShrink: 0,
        }}>
          {initials}
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: '0.9rem', fontWeight: 500, color: '#111', margin: 0, letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {org.name}
          </p>
          {/* Darkened: was #aaa, now #666 */}
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.68rem', color: '#555', margin: 0, marginTop: 2 }}>
            Created {createdDate}
          </p>
        </div>
      </div>

      {/* Description */}
      {org.description ? (
        <p style={{ fontSize: '0.82rem', color: '#444', fontWeight: 300, margin: 0, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {org.description}
        </p>
      ) : (
        /* Darkened: was #bbb, now #777 */
        <p style={{ fontSize: '0.82rem', color: '#777', margin: 0, fontStyle: 'italic' }}>No description</p>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid #e8e6e1' }}>
        {/* Darkened: was #aaa, now #555 */}
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.67rem', color: '#444', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Owner
        </span>
        <span style={{ fontSize: '0.75rem', color: '#333', background: '#eceae6', padding: '0.2rem 0.55rem', borderRadius: 3 }}>
          Open →
        </span>
      </div>
    </div>
  );
}

// ─── Create Org Button / Slot ─────────────────────────────────────────────────

function CreateOrgSlot({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: 'none',
        border: '1.5px dashed #ccc',
        borderRadius: 6,
        padding: '1.5rem',
        cursor: disabled ? 'not-allowed' : 'pointer',
        textAlign: 'left',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        opacity: disabled ? 0.65 : 1,
        transition: 'border-color 0.15s',
        width: '100%',
      }}
      onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.borderColor = '#999'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#ccc'; }}
    >
      <div style={{
        width: 32, height: 32, borderRadius: 6, border: '1.5px dashed #bbb',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#777',
      }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      {/* Darkened: was #666, now #333 */}
      <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#333', margin: 0, letterSpacing: '-0.01em' }}>
        New organization
      </p>
      {/* Darkened: was #aaa, now #666 */}
      <p style={{ fontSize: '0.78rem', color: '#555', fontWeight: 300, margin: 0, lineHeight: 1.5 }}>
        {disabled ? 'Limit of 2 organizations reached.' : 'Create a shared workspace for your team.'}
      </p>
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const MAX_ORGS = 2;

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string; id?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [orgsLoading, setOrgsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Auth check
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

  // Fetch orgs once user is known
  useEffect(() => {
    if (!user?.id) return;
    const supabase = createClient();
    supabase
      .from('organizations')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setOrgs((data as Organization[]) ?? []);
        setOrgsLoading(false);
      });
  }, [user?.id]);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    router.replace('/auth');
  };

  const handleOrgCreated = (org: Organization) => {
    setOrgs(prev => [...prev, org]);
    setShowModal(false);
  };

  const canCreateMore = orgs.length < MAX_ORGS;

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#fafaf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spinner />
    </div>
  );

  const firstName = user?.email?.split('@')[0] ?? '';

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
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.75rem', color: '#555' }}>
              {user.email}
            </span>
          )}
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            style={{
              background: 'none', border: '1px solid #ddd', color: '#333',
              padding: '0.4rem 0.9rem', fontSize: '0.8rem', fontFamily: "'DM Sans', sans-serif",
              cursor: 'pointer', borderRadius: 4, display: 'flex', alignItems: 'center', gap: '0.4rem',
            }}
          >
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </header>

      {/* Main */}
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 2rem', animation: 'fadeUp 0.4s ease both' }}>

        {/* Welcome — "Dashboard" label removed */}
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 500, letterSpacing: '-0.03em', margin: '0 0 0.4rem', color: '#111' }}>
            Welcome back{firstName ? `, ${firstName}` : ''}.
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#555', fontWeight: 300, margin: 0, lineHeight: 1.6 }}>
            Manage your organizations and agent workflows from here.
          </p>
        </div>

        {/* Organizations section */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.7rem', color: '#444', letterSpacing: '0.07em', textTransform: 'uppercase', margin: '0 0 0.2rem' }}>
                Organizations
              </p>
              <p style={{ fontSize: '0.78rem', color: '#666', margin: 0, fontFamily: "'DM Mono', monospace" }}>
                {orgs.length} / {MAX_ORGS} used
              </p>
            </div>
            {canCreateMore && (
              <button
                onClick={() => setShowModal(true)}
                style={{
                  background: '#111', color: '#fafaf8', border: 'none',
                  padding: '0.45rem 1rem', fontSize: '0.8rem',
                  fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', borderRadius: 4,
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  letterSpacing: '0.01em',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                New organization
              </button>
            )}
          </div>

          {/* Org grid */}
          {orgsLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', gap: '0.75rem', color: '#666', fontSize: '0.8rem' }}>
              <Spinner size={16} color="#666" />
              Loading organizations…
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
              {orgs.map(org => (
                <OrgCard key={org.id} org={org} />
              ))}
              <CreateOrgSlot onClick={() => setShowModal(true)} disabled={!canCreateMore} />
            </div>
          )}
        </div>

      </main>

      {/* Modal */}
      {showModal && user?.id && (
        <CreateOrgModal
          userId={user.id}
          onClose={() => setShowModal(false)}
          onCreated={handleOrgCreated}
        />
      )}
    </div>
  );
}