// parasync/app/console/_components/agents/TaskFilesPanel.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { TaskFile } from './types';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000';
const mono: React.CSSProperties = { fontFamily: "'DM Mono', monospace" };

function formatBytes(bytes: number | null): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileRow({ file, onDelete }: { file: TaskFile; onDelete: (id: string) => void }) {
  const [downloading, setDownloading] = useState(false);
  const [confirm, setConfirm]         = useState(false);
  const [deleting, setDeleting]       = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    const res = await fetch(`${BACKEND}/files/tasks/${file.task_id}/${file.filename}`);
    if (res.ok) {
      const { url } = await res.json();
      window.open(url, '_blank');
    }
    setDownloading(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    await fetch(`${BACKEND}/files/tasks/${file.task_id}/${file.filename}`, { method: 'DELETE' });
    onDelete(file.id);
  };

  return (
    <div style={{ background: '#fff', border: '1px solid #e3e1dc', borderRadius: 5, padding: '0.7rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, color: '#888' }}>
          <rect x="2" y="1" width="8" height="11" rx="1" stroke="currentColor" strokeWidth="1.3" />
          <path d="M4 4h4M4 6.5h4M4 9h2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
        <div style={{ minWidth: 0 }}>
          <p style={{ ...mono, fontSize: '0.78rem', color: '#111', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {file.filename}
          </p>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginTop: '0.15rem' }}>
            <span style={{ ...mono, fontSize: '0.62rem', color: '#aaa' }}>{formatBytes(file.size_bytes)}</span>
            <span style={{
              ...mono, fontSize: '0.6rem', color: file.uploaded_by === 'agent' ? '#7c5cfc' : '#666',
              background: file.uploaded_by === 'agent' ? '#f0eeff' : '#f0eeea',
              padding: '0.1rem 0.4rem', borderRadius: 3, textTransform: 'uppercase', letterSpacing: '0.04em',
            }}>
              {file.uploaded_by}
            </span>
            <span style={{ ...mono, fontSize: '0.62rem', color: '#bbb' }}>
              {new Date(file.created_at).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0, alignItems: 'center' }}>
        <button
          onClick={handleDownload}
          disabled={downloading}
          style={{ background: 'none', border: '1px solid #ddd', color: '#444', padding: '0.28rem 0.65rem', fontSize: '0.72rem', fontFamily: "'DM Sans', sans-serif", cursor: downloading ? 'not-allowed' : 'pointer', borderRadius: 4 }}
        >
          {downloading ? 'Getting link…' : 'Download'}
        </button>
        {!confirm ? (
          <button
            onClick={() => setConfirm(true)}
            style={{ background: 'none', border: '1px solid #ddd', color: '#888', padding: '0.28rem 0.65rem', fontSize: '0.72rem', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', borderRadius: 4 }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#e55'; (e.currentTarget as HTMLButtonElement).style.color = '#c0392b'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#ddd'; (e.currentTarget as HTMLButtonElement).style.color = '#888'; }}
          >
            Delete
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
            <span style={{ ...mono, fontSize: '0.68rem', color: '#888' }}>Sure?</span>
            <button onClick={handleDelete} disabled={deleting} style={{ background: '#c0392b', border: 'none', color: '#fff', padding: '0.28rem 0.6rem', fontSize: '0.72rem', fontFamily: "'DM Sans', sans-serif", cursor: deleting ? 'not-allowed' : 'pointer', borderRadius: 4 }}>
              {deleting ? 'Deleting…' : 'Yes'}
            </button>
            <button onClick={() => setConfirm(false)} style={{ background: 'none', border: '1px solid #ddd', color: '#555', padding: '0.28rem 0.6rem', fontSize: '0.72rem', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', borderRadius: 4 }}>
              No
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface Props {
  taskId: string;
}

export default function TaskFilesPanel({ taskId }: Props) {
  const [files, setFiles]       = useState<TaskFile[]>([]);
  const [loading, setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError]       = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async () => {
    const res = await fetch(`${BACKEND}/files/tasks/${taskId}`);
    if (res.ok) setFiles(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchFiles(); }, [taskId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');

    const form = new FormData();
    form.append('file', file);

    const res = await fetch(`${BACKEND}/files/tasks/${taskId}/upload`, {
      method: 'POST',
      body: form,
    });

    if (res.ok) {
      const newFile = await res.json();
      setFiles(prev => [...prev, newFile]);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.detail ?? 'Upload failed.');
    }

    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  if (loading) return <p style={{ fontSize: '0.825rem', color: '#888' }}>Loading files…</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ ...mono, fontSize: '0.68rem', color: '#333', letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>
          Files ({files.length})
        </p>
        <div>
          <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={handleUpload} />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            style={{ background: '#111', color: '#fafaf8', border: 'none', padding: '0.4rem 0.85rem', fontSize: '0.78rem', fontFamily: "'DM Sans', sans-serif", cursor: uploading ? 'not-allowed' : 'pointer', borderRadius: 4, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            {uploading ? 'Uploading…' : (
              <>
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Upload file
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <p style={{ fontSize: '0.78rem', color: '#c0392b', background: '#fef6f5', border: '1px solid #fad4ce', borderRadius: 4, padding: '0.5rem 0.75rem', margin: 0 }}>
          {error}
        </p>
      )}

      {files.length === 0 ? (
        <div style={{ border: '1.5px dashed #ddd', borderRadius: 5, padding: '1.5rem', textAlign: 'center' }}>
          <p style={{ ...mono, fontSize: '0.7rem', color: '#aaa', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 0.4rem' }}>No files</p>
          <p style={{ fontSize: '0.8rem', color: '#777', margin: 0, lineHeight: 1.5 }}>
            Upload files for this task. The agent can read and write files during execution.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {files.map(f => (
            <FileRow key={f.id} file={f} onDelete={id => setFiles(prev => prev.filter(x => x.id !== id))} />
          ))}
        </div>
      )}

      <p style={{ ...mono, fontSize: '0.62rem', color: '#bbb', margin: 0, lineHeight: 1.5 }}>
        Files tagged <span style={{ color: '#7c5cfc' }}>agent</span> were written by the agent during a run. Max 50MB per file.
      </p>
    </div>
  );
}