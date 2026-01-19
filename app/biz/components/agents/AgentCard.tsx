// app/biz/components/agents/AgentCard.tsx
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Bot, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { Agent } from '../Agents';

interface AgentCardProps {
  agent: Agent;
  onDelete: (agentId: string) => void;
}

export default function AgentCard({ agent, onDelete }: AgentCardProps) {
  const supabase = createClient();
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', agent.id);

      if (error) throw error;
      onDelete(agent.id);
    } catch (error) {
      console.error('Error deleting agent:', error);
      alert('Failed to delete agent');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
        {/* Avatar Section */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden">
              {agent.avatar_url ? (
                <img
                  src={agent.avatar_url}
                  alt={agent.display_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Bot size={32} className="text-white" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">{agent.display_name}</h3>
              <p className="text-sm text-white/80">@{agent.username}</p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Role</label>
            <p className="text-gray-800 mt-1">{agent.role}</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Goal</label>
            <p className="text-gray-800 mt-1 text-sm">{agent.goal}</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Backstory</label>
            <p className="text-gray-600 mt-1 text-sm line-clamp-3">{agent.backstory}</p>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={deleting}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
            >
              {deleting ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Trash2 size={18} />
              )}
              Delete Agent
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="text-red-600" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Agent</h3>
                <p className="text-gray-600 mb-4">
                  Are you sure you want to delete <strong>{agent.display_name}</strong>? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleting}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        Deleting...
                      </>
                    ) : (
                      'Delete'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}