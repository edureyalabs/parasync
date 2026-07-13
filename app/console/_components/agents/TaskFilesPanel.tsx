// parasync/app/console/_components/agents/TaskFilesPanel.tsx
'use client';
import { useState, useEffect, useRef } from 'react';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000';
const mono: React.CSSProperties = { fontFamily: "'DM Mono', monospace" };

function formatBytes(bytes: number | null): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface UserFile {
  id: string;
  filename: string;
  storage_path: string;
  size_bytes: number | null;
  mime_type: string | null;
  uploaded_by: string;
  created_at: string;
  source: 'upload';
  file_path: string;
}

interface WorkspaceFile {
  id: string;
  file_path: string;
  filename: string;
  storage_path: string;
  size_bytes: number | null;
  written_by: string;
  updated_at: string;
  uploaded_by: string;
  created_at: string;
  source: 'workspace';
}

type AnyFile = UserFile | WorkspaceFile;

// ── File row ─────────────────────────────────────────────────────────────────
function FileRow({ file, taskId, onDelete }: {
  file: AnyFile;
  taskId: string;
  onDelete: (id: string) => void;
}) {
  const [downloading, setDownloading] = useState(false);
  const [confirm,     setConfirm]     = useState(false);
  const [deleting,    setDeleting]    = useState(false);

  const isWorkspace = file.source === 'workspace';

  const handleDownload = async () => {
    setDownloading(true);
    const url = isWorkspace
      ? `${BACKEND}/files/tasks/${taskId}/workspace/download?file_path=${encodeURIComponent((file as WorkspaceFile).file_path)}`
      : `${BACKEND}/files/tasks/${taskId}/download?storage_path=${encodeURIComponent(file.storage_path)}`;

    const res = await fetch(url);
    if (res.ok) {
      const { url: signedUrl } = await res.json();
      window.open(signedUrl, '_blank');
    }
    setDownloading(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    if (isWorkspace) {
      await fetch(
        `${BACKEND}/files/tasks/${taskId}/workspace?file_path=${encodeURIComponent((file as WorkspaceFile).file_path)}`,
        { method: 'DELETE' }
      );
    } else {
      await fetch(`${BACKEND}/files/tasks/${taskId}/user/${(file as UserFile).filename}`, { method: 'DELETE' });
    }
    onDelete(file.id);
    setDeleting(false);
  };

  return (
    <div style={{
      background: '#fff', border: '1px solid #e3e1dc', borderRadius: 5,
      padding: '0.7rem 1rem', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', gap: '1rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, color: '#888' }}>
          <rect x="2" y="1" width="8" height="11" rx="1" stroke="currentColor" strokeWidth="1.3" />
          <path d="M4 4h4M4 6.5h4M4 9h2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
        <div style={{ minWidth: 0 }}>
          <p style={{ ...mono, fontSize: '0.78rem', color: '#111', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {isWorkspace ? (file as WorkspaceFile).file_path : (file as UserFile).filename}
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.15rem', flexWrap: 'wrap' }}>
            <span style={{ ...mono, fontSize: '0.62rem', color: '#aaa' }}>{formatBytes(file.size_bytes)}</span>
            <span style={{
              ...mono, fontSize: '0.6rem',
              color: isWorkspace ? '#7c5cfc' : '#1a7f5a',
              background: isWorkspace ? '#f0eeff' : '#f0faf6',
              padding: '0.1rem 0.4rem', borderRadius: 3,
              textTransform: 'uppercase', letterSpacing: '0.04em',
            }}>
              {isWorkspace ? 'agent' : 'user'}
            </span>
            <span style={{ ...mono, fontSize: '0.62rem', color: '#bbb' }}>
              {new Date(file.created_at).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0, alignItems: 'center' }}>
        <button
          onClick={handleDownload} disabled={downloading}
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
          >Delete</button>
        ) : (
          <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
            <span style={{ ...mono, fontSize: '0.68rem', color: '#888' }}>Sure?</span>
            <button onClick={handleDelete} disabled={deleting} style={{ background: '#c0392b', border: 'none', color: '#fff', padding: '0.28rem 0.6rem', fontSize: '0.72rem', fontFamily: "'DM Sans', sans-serif", cursor: deleting ? 'not-allowed' : 'pointer', borderRadius: 4 }}>
              {deleting ? 'Deleting…' : 'Yes'}
            </button>
            <button onClick={() => setConfirm(false)} style={{ background: 'none', border: '1px solid #ddd', color: '#555', padding: '0.28rem 0.6rem', fontSize: '0.72rem', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', borderRadius: 4 }}>No</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────
interface Props {
  taskId: string;
}

export default function TaskFilesPanel({ taskId }: Props) {
  const [userFiles,      setUserFiles]      = useState<UserFile[]>([]);
  const [workspaceFiles, setWorkspaceFiles] = useState<WorkspaceFile[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [uploading,      setUploading]      = useState(false);
  const [error,          setError]          = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async () => {
    setLoading(true);
    const res = await fetch(`${BACKEND}/files/tasks/${taskId}`);
    if (res.ok) {
      const data = await res.json();
      setUserFiles(data.user_files ?? []);
      setWorkspaceFiles(data.workspace_files ?? []);
    }
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
      method: 'POST', body: form,
    });

    if (res.ok) {
      const newFile = await res.json();
      setUserFiles(prev => [...prev, newFile]);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.detail ?? 'Upload failed.');
    }

    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const totalCount = userFiles.length + workspaceFiles.length;

  if (loading) return <p style={{ fontSize: '0.825rem', color: '#888' }}>Loading files…</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ ...mono, fontSize: '0.68rem', color: '#333', letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>
          Files ({totalCount})
        </p>
        <div>
          <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={handleUpload} />
          <button
            onClick={() => fileRef.current?.click()} disabled={uploading}
            style={{ background: '#111', color: '#fafaf8', border: 'none', padding: '0.4rem 0.85rem', fontSize: '0.78rem', fontFamily: "'DM Sans', sans-serif", cursor: uploading ? 'not-allowed' : 'pointer', borderRadius: 4, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            {uploading ? 'Uploading…' : (
              <><svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>Upload file</>
            )}
          </button>
        </div>
      </div>

      {error && (
        <p style={{ fontSize: '0.78rem', color: '#c0392b', background: '#fef6f5', border: '1px solid #fad4ce', borderRadius: 4, padding: '0.5rem 0.75rem', margin: 0 }}>{error}</p>
      )}

      {/* User uploads section */}
      <div>
        <p style={{ ...mono, fontSize: '0.62rem', color: '#aaa', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 0.5rem' }}>
          User uploads ({userFiles.length})
        </p>
        {userFiles.length === 0 ? (
          <div style={{ border: '1.5px dashed #eee', borderRadius: 5, padding: '1rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.78rem', color: '#aaa', margin: 0 }}>No uploaded files. Use the button above to upload.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {userFiles.map(f => (
              <FileRow key={f.id} file={f} taskId={taskId} onDelete={id => setUserFiles(prev => prev.filter(x => x.id !== id))} />
            ))}
          </div>
        )}
      </div>

      {/* Agent workspace files section */}
      <div>
        <p style={{ ...mono, fontSize: '0.62rem', color: '#aaa', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 0.5rem' }}>
          Agent workspace ({workspaceFiles.length})
        </p>
        {workspaceFiles.length === 0 ? (
          <div style={{ border: '1.5px dashed #eee', borderRadius: 5, padding: '1rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.78rem', color: '#aaa', margin: 0 }}>No agent files yet. Files the agent creates during runs appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {workspaceFiles.map(f => (
              <FileRow key={f.id} file={f} taskId={taskId} onDelete={id => setWorkspaceFiles(prev => prev.filter(x => x.id !== id))} />
            ))}
          </div>
        )}
      </div>

      <p style={{ ...mono, fontSize: '0.62rem', color: '#bbb', margin: 0, lineHeight: 1.5 }}>
        <span style={{ color: '#7c5cfc' }}>Agent</span> files are written during runs and persist across sessions. Max 50MB per upload.
      </p>
    </div>
  );
}