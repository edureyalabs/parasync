// console/_components/tools/ui.tsx
import React from 'react';

export function Spinner({ size = 15, color = '#888' }: { size?: number; color?: string }) {
  return (
    <>
      <div style={{
        width: size, height: size,
        border: '1.5px solid rgba(0,0,0,0.1)',
        borderTopColor: color,
        borderRadius: '50%',
        animation: 'tool-spin 0.8s linear infinite',
        flexShrink: 0,
      }} />
      <style>{`@keyframes tool-spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}

export const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.6rem 0.75rem',
  fontSize: '0.875rem',
  fontFamily: "'DM Sans', sans-serif",
  color: '#111',
  background: '#fafaf8',
  border: '1px solid #ddd',
  borderRadius: 4,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
};

export const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: "'DM Mono', monospace",
  fontSize: '0.67rem',
  color: '#333',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  marginBottom: '0.4rem',
};

export function PageHeader({
  eyebrow,
  title,
  onBack,
}: {
  eyebrow: string;
  title: string;
  onBack?: () => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
      {onBack && (
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', padding: '2px', display: 'flex', alignItems: 'center' }}
          aria-label="Back"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
      <div>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.68rem', color: '#777', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 0.2rem' }}>
          {eyebrow}
        </p>
        <h1 style={{ fontSize: '1.2rem', fontWeight: 500, letterSpacing: '-0.025em', color: '#111', margin: 0 }}>
          {title}
        </h1>
      </div>
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <p style={{
      fontSize: '0.8rem', color: '#c0392b',
      background: '#fef6f5', border: '1px solid #fad4ce',
      borderRadius: 4, padding: '0.5rem 0.75rem', margin: 0,
    }}>
      {message}
    </p>
  );
}

export function SuccessBanner({ message }: { message: string }) {
  return (
    <p style={{
      fontSize: '0.8rem', color: '#1a7f5a',
      background: '#f0faf6', border: '1px solid #b6e8d3',
      borderRadius: 4, padding: '0.5rem 0.75rem', margin: 0,
      display: 'flex', alignItems: 'center', gap: '0.5rem',
    }}>
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <path d="M2 6.5l3.5 3.5 5.5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {message}
    </p>
  );
}

export function SaveButton({
  onClick,
  loading,
  disabled,
  label,
  loadingLabel,
}: {
  onClick: () => void;
  loading: boolean;
  disabled: boolean;
  label: string;
  loadingLabel: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      style={{
        background: disabled ? '#888' : '#111',
        color: '#fafaf8', border: 'none',
        padding: '0.55rem 1.25rem', fontSize: '0.825rem',
        fontFamily: "'DM Sans', sans-serif",
        cursor: loading || disabled ? 'not-allowed' : 'pointer',
        borderRadius: 4, display: 'flex', alignItems: 'center', gap: '0.5rem',
        opacity: disabled ? 0.55 : 1, transition: 'opacity 0.15s',
      }}
    >
      {loading && <Spinner size={14} color="#fff" />}
      {loading ? loadingLabel : label}
    </button>
  );
}