// console/_components/UnderConstruction.tsx
import Link from 'next/link';

interface Props {
  label: string;
}

export default function UnderConstruction({ label }: Props) {
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 2rem',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        maxWidth: 400,
        textAlign: 'center',
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 10,
          border: '1.5px dashed #ccc',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#bbb', marginBottom: '0.25rem',
        }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
            <rect x="12" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
            <rect x="3" y="12" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
            <path d="M15.5 12v7M12 15.5h7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </div>

        <div>
          <p style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: '0.68rem', color: '#999',
            letterSpacing: '0.08em', textTransform: 'uppercase',
            margin: '0 0 0.5rem',
          }}>
            console · {label.toLowerCase()}
          </p>
          <h2 style={{
            fontSize: '1.15rem', fontWeight: 500,
            letterSpacing: '-0.025em', color: '#111',
            margin: '0 0 0.5rem',
          }}>
            This section is being built.
          </h2>
          <p style={{
            fontSize: '0.825rem', color: '#666',
            fontWeight: 300, margin: 0, lineHeight: 1.65,
          }}>
            The console will be expanded further. Check back soon.
          </p>
        </div>

        <Link
          href="/dashboard"
          style={{
            marginTop: '0.5rem',
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            fontFamily: "'DM Mono', monospace", fontSize: '0.75rem',
            color: '#555', textDecoration: 'none',
            border: '1px solid #ddd', padding: '0.45rem 0.9rem',
            borderRadius: 4, background: '#fff',
            transition: 'border-color 0.15s, color 0.15s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLAnchorElement).style.borderColor = '#999';
            (e.currentTarget as HTMLAnchorElement).style.color = '#111';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLAnchorElement).style.borderColor = '#ddd';
            (e.currentTarget as HTMLAnchorElement).style.color = '#555';
          }}
        >
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path d="M7.5 2L3.5 6l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}