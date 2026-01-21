const MODAL_API_BASE_URL = process.env.NEXT_PUBLIC_MODAL_API_URL || 'https://your-modal-app.modal.run';

export interface Agent {
  id: string;
  username: string;
  display_name: string;
  role: string | null;
  goal: string | null;
  backstory: string | null;
  avatar_url: string | null;
}