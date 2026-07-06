// console/_components/agents/types.ts

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
  type: 'llm_call' | 'llm_response' | 'tool_call' | 'tool_result' | 'error';
  iteration?: number;
  tool?: string;
  arguments?: Record<string, unknown>;
  result?: string;
  content?: string;
  message?: string;
  traceback?: string;
  status?: string;
  timestamp: string;
}

export interface Run {
  id: string;
  task_id: string;
  agent_id: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  triggered_by: string;
  output: string | null;
  error: string | null;
  steps: RunStep[];
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}