// console/_components/tools/types.ts
export interface Toolset {
  id: string;
  name: string;
  description: string | null;
  org_id: string;
  created_at: string;
}

export interface ToolsetSecret {
  id: string;
  toolset_id: string;
  key_name: string;
  vault_id: string;
  created_at: string;
}

export interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  required: boolean;
}

export interface Tool {
  id: string;
  toolset_id: string;
  org_id: string;
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, { type: string; description: string }>;
    required: string[];
  };
  code: string;
  created_at: string;
  updated_at: string;
}