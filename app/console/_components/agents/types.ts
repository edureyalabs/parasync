// parasync/app/console/_components/agents/types.ts

export interface Agent {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  system_prompt: string;
  created_at: string;
}

export interface Task {
  id: string;
  agent_id: string;
  org_id: string;
  name: string;
  instruction: string;
  trigger_type: 'manual' | 'cron' | 'webhook';
  is_active: boolean;
  created_at: string;
}

export interface RunStep {
  type: 'llm_call' | 'llm_response' | 'tool_call' | 'tool_result' | 'sandbox_output' | 'error';
  iteration?: number;
  tool?: string;
  arguments?: Record<string, unknown>;
  result?: string;
  content?: string;
  message?: string;
  traceback?: string;
  status?: string;
  timestamp: string;
  stdout?: string;
  stderr?: string;
  exit_code?: number;
  duration_ms?: number;
  output_files?: string[];
}

export interface Run {
  id: string;
  task_id: string;
  agent_id: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  triggered_by: string;
  output: string | null;
  error: string | null;
  steps: RunStep[];
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface AgentEnvironment {
  id: string;
  agent_id: string;
  org_id: string;
  packages: string[];
  packages_hash: string | null;
  status: 'pending' | 'installing' | 'ready' | 'failed';
  last_built_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskFile {
  id: string;
  task_id: string;
  agent_id: string;
  org_id: string;
  filename: string;
  storage_path: string;
  size_bytes: number | null;
  mime_type: string | null;
  uploaded_by: 'user' | 'agent';
  created_at: string;
}

export interface AgentSecret {
  id: string;
  key_name: string;
  created_at: string;
}

export interface PlatformTool {
  key: string;
  name: string;
  description: string;
  is_active: boolean;
}