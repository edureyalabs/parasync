const MODAL_API_BASE_URL = process.env.NEXT_PUBLIC_MODAL_API_URL || 'https://your-modal-app.modal.run';

export interface ChatSendRequest {
  user_id: string;
  agent_id: string;
  message: string;
  task_id?: string;
}

export interface TaskCreateRequest {
  user_id: string;
  agent_id: string;
  message: string;
}

export interface TaskListRequest {
  user_id: string;
  agent_id: string;
  limit?: number;
}

export interface Task {
  id: string;
  title: string;
  status: string;
  created_at: string;
}

export const sendChatMessage = async (request: ChatSendRequest) => {
  const response = await fetch(`${MODAL_API_BASE_URL}/chat/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Failed to send message: ${response.statusText}`);
  }

  return response.json();
};

export const createTask = async (request: TaskCreateRequest) => {
  const response = await fetch(`${MODAL_API_BASE_URL}/task/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to create task');
  }

  return response.json();
};

export const listTasks = async (request: TaskListRequest): Promise<{ success: boolean; tasks: Task[] }> => {
  const response = await fetch(`${MODAL_API_BASE_URL}/task/list`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch tasks: ${response.statusText}`);
  }

  return response.json();
};