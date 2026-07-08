// parasync/app/console/_components/OverviewPanel.tsx
'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

const mono: React.CSSProperties = { fontFamily: "'DM Mono', monospace" };

interface Stats {
  agents: number;
  tasks: number;
  toolsets: number;
  contexts: number;
  totalRuns: number;
  completedRuns: number;
  failedRuns: number;
  runningRuns: number;
}

interface RecentRun {
  id: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  created_at: string;
  completed_at: string | null;
  agent_name: string;
  task_name: string;
}

function StatusBadge({ status }: { status: RecentRun['status'] }) {
  const config: Record<string, { bg: string; color: string; label: string }> = {
    queued:    { bg: '#f5f4f1', color: '#888',    label: 'queued' },
    running:   { bg: '#fff8e1', color: '#b57c00', label: '● running' },
    completed: { bg: '#f0faf6', color: '#1a7f5a', label: 'completed' },
    failed:    { bg: '#fef6f5', color: '#c0392b', label: 'failed' },
    cancelled: { bg: '#f5f4f1', color: '#888',    label: 'cancelled' },
  };
  const c = config[status] ?? config.queued;
  return (
    <span style={{
      ...mono, fontSize: '0.6rem', letterSpacing: '0.06em',
      textTransform: 'uppercase', padding: '0.18rem 0.5rem',
      borderRadius: 3, background: c.bg, color: c.color, flexShrink: 0,
    }}>
      {c.label}
    </span>
  );
}

function StatCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #e3e1dc', borderRadius: 6,
      padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem',
    }}>
      <p style={{ ...mono, fontSize: '0.65rem', color: '#888', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
        {label}
      </p>
      <p style={{ fontSize: '1.75rem', fontWeight: 500, color: '#111', margin: 0, letterSpacing: '-0.03em', lineHeight: 1 }}>
        {value}
      </p>
      {sub && (
        <p style={{ ...mono, fontSize: '0.65rem', color: '#aaa', margin: 0 }}>{sub}</p>
      )}
    </div>
  );
}

function RunRow({ run }: { run: RecentRun }) {
  const duration = run.completed_at && run.created_at
    ? Math.round((new Date(run.completed_at).getTime() - new Date(run.created_at).getTime()) / 1000)
    : null;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '1rem',
      padding: '0.7rem 0', borderBottom: '1px solid #f0eeea',
    }}>
      <StatusBadge status={run.status} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '0.825rem', color: '#111', margin: 0, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {run.task_name}
        </p>
        <p style={{ fontSize: '0.75rem', color: '#888', margin: '0.1rem 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {run.agent_name}
        </p>
      </div>
      <div style={{ flexShrink: 0, textAlign: 'right' }}>
        <p style={{ ...mono, fontSize: '0.65rem', color: '#aaa', margin: 0 }}>
          {new Date(run.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
        {duration !== null && (
          <p style={{ ...mono, fontSize: '0.62rem', color: '#bbb', margin: '0.1rem 0 0' }}>
            {duration < 60 ? `${duration}s` : `${Math.round(duration / 60)}m`}
          </p>
        )}
      </div>
    </div>
  );
}

interface Props {
  orgId: string;
}

export default function OverviewPanel({ orgId }: Props) {
  const [stats, setStats]       = useState<Stats | null>(null);
  const [runs, setRuns]         = useState<RecentRun[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!orgId) return;
    const supabase = createClient();

    Promise.all([
      supabase.from('agents').select('id', { count: 'exact', head: true }).eq('org_id', orgId),
      supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('org_id', orgId),
      supabase.from('toolsets').select('id', { count: 'exact', head: true }).eq('org_id', orgId),
      supabase.from('contexts').select('id', { count: 'exact', head: true }).eq('org_id', orgId),
      supabase.from('runs').select('id, status', { count: 'exact' }).eq('org_id', orgId),
      supabase.from('runs')
        .select('id, status, created_at, completed_at, task_id, agent_id')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })
        .limit(10),
    ]).then(async ([agentsRes, tasksRes, toolsetsRes, contextsRes, runsRes, recentRunsRes]) => {
      const allRuns = runsRes.data ?? [];
      const recentRaw = recentRunsRes.data ?? [];

      // Fetch agent and task names for recent runs
      const agentIds = [...new Set(recentRaw.map(r => r.agent_id))];
      const taskIds  = [...new Set(recentRaw.map(r => r.task_id))];

      const [agentsData, tasksData] = await Promise.all([
        agentIds.length > 0
          ? supabase.from('agents').select('id, name').in('id', agentIds)
          : Promise.resolve({ data: [] }),
        taskIds.length > 0
          ? supabase.from('tasks').select('id, name').in('id', taskIds)
          : Promise.resolve({ data: [] }),
      ]);

      const agentMap = Object.fromEntries((agentsData.data ?? []).map(a => [a.id, a.name]));
      const taskMap  = Object.fromEntries((tasksData.data  ?? []).map(t => [t.id, t.name]));

      setStats({
        agents:       agentsRes.count   ?? 0,
        tasks:        tasksRes.count    ?? 0,
        toolsets:     toolsetsRes.count ?? 0,
        contexts:     contextsRes.count ?? 0,
        totalRuns:    allRuns.length,
        completedRuns: allRuns.filter(r => r.status === 'completed').length,
        failedRuns:   allRuns.filter(r => r.status === 'failed').length,
        runningRuns:  allRuns.filter(r => r.status === 'running' || r.status === 'queued').length,
      });

      setRuns(recentRaw.map(r => ({
        id:           r.id,
        status:       r.status,
        created_at:   r.created_at,
        completed_at: r.completed_at,
        agent_name:   agentMap[r.agent_id] ?? 'Unknown agent',
        task_name:    taskMap[r.task_id]   ?? 'Unknown task',
      })));

      setLoading(false);
    });
  }, [orgId]);

  if (loading) {
    return (
      <div style={{ padding: '2.5rem 2rem' }}>
        <p style={{ fontSize: '0.825rem', color: '#888' }}>Loading…</p>
      </div>
    );
  }

  const successRate = stats && stats.totalRuns > 0
    ? Math.round((stats.completedRuns / stats.totalRuns) * 100)
    : null;

  return (
    <div style={{ padding: '2.5rem 2rem', width: '100%', maxWidth: 900 }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <p style={{ ...mono, fontSize: '0.68rem', color: '#777', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 0.35rem' }}>
          console · overview
        </p>
        <h1 style={{ fontSize: '1.35rem', fontWeight: 500, letterSpacing: '-0.025em', color: '#111', margin: 0 }}>
          Overview
        </h1>
      </div>

      {/* Stat grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
        <StatCard label="Agents"   value={stats?.agents   ?? 0} />
        <StatCard label="Tasks"    value={stats?.tasks    ?? 0} />
        <StatCard label="Toolsets" value={stats?.toolsets ?? 0} />
        <StatCard label="Contexts" value={stats?.contexts ?? 0} />
      </div>

      {/* Run stats */}
      {stats && stats.totalRuns > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '2rem' }}>
          <StatCard label="Total runs"     value={stats.totalRuns} />
          <StatCard label="Completed"      value={stats.completedRuns} sub={successRate !== null ? `${successRate}% success rate` : undefined} />
          <StatCard label="Failed"         value={stats.failedRuns} />
          {stats.runningRuns > 0 && (
            <StatCard label="Active now" value={stats.runningRuns} />
          )}
        </div>
      )}

      {/* Recent runs */}
      <div style={{ background: '#fff', border: '1px solid #e3e1dc', borderRadius: 6, padding: '1.25rem 1.5rem' }}>
        <p style={{ ...mono, fontSize: '0.65rem', color: '#777', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 0.25rem' }}>
          Recent runs
        </p>
        {runs.length === 0 ? (
          <div style={{ padding: '1.5rem 0' }}>
            <p style={{ ...mono, fontSize: '0.72rem', color: '#aaa', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 0.4rem' }}>
              No runs yet
            </p>
            <p style={{ fontSize: '0.825rem', color: '#777', margin: 0, lineHeight: 1.6 }}>
              Create an agent, add a task, and run it to see activity here.
            </p>
          </div>
        ) : (
          <div>
            {runs.map(run => <RunRow key={run.id} run={run} />)}
            <p style={{ ...mono, fontSize: '0.62rem', color: '#bbb', margin: '0.75rem 0 0' }}>
              Showing last {runs.length} run{runs.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}