// app/biz/components/Chats.tsx
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';
import AgentList from './chats/AgentList';
import ChatWindow from './chats/ChatWindow';

interface ChatsProps {
  userId: string;
}

export interface Agent {
  id: string;
  profile_id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  role: string;
  goal: string;
  backstory: string;
  created_at: string;
}

export default function Chats({ userId }: ChatsProps) {
  const supabase = createClient();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  useEffect(() => {
    loadAgents();
  }, [userId]);

  const loadAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('profile_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAgents(data || []);
      
      // Auto-select first agent if available
      if (data && data.length > 0 && !selectedAgent) {
        setSelectedAgent(data[0]);
      }
    } catch (error) {
      console.error('Error loading agents:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="flex h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Left Sidebar - Agent List */}
      <AgentList
        agents={agents}
        selectedAgent={selectedAgent}
        onSelectAgent={setSelectedAgent}
      />

      {/* Right Section - Chat Window */}
      <ChatWindow
        selectedAgent={selectedAgent}
        userId={userId}
      />
    </div>
  );
}