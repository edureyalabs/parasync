// app/biz/components/Agents.tsx
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Plus, Bot } from 'lucide-react';
import AgentCard from './agents/AgentCard';
import CreateAgentModal from './agents/CreateAgentModal';

interface AgentsProps {
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

export default function Agents({ userId }: AgentsProps) {
  const supabase = createClient();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

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
    } catch (error) {
      console.error('Error loading agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAgentCreated = (newAgent: Agent) => {
    setAgents([newAgent, ...agents]);
    setShowCreateModal(false);
  };

  const handleAgentDeleted = (agentId: string) => {
    setAgents(agents.filter(agent => agent.id !== agentId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  const canCreateMore = agents.length < 5;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">AI Agents</h1>
          <p className="text-gray-600 mt-1">
            Manage your AI agents ({agents.length}/5)
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          disabled={!canCreateMore}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors shadow-md"
        >
          <Plus size={20} />
          Create Agent
        </button>
      </div>

      {!canCreateMore && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">
            You've reached the maximum limit of 5 agents. Delete an existing agent to create a new one.
          </p>
        </div>
      )}

      {agents.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Bot size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No agents yet</h2>
          <p className="text-gray-600 mb-6">
            Create your first AI agent to get started
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            <Plus size={20} />
            Create Your First Agent
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onDelete={handleAgentDeleted}
            />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateAgentModal
          userId={userId}
          onClose={() => setShowCreateModal(false)}
          onAgentCreated={handleAgentCreated}
        />
      )}
    </div>
  );
}