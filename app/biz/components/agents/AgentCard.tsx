// app/biz/components/agents/AgentCard.tsx
import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Bot, Trash2, Loader2, AlertCircle, Edit2, Upload, Code, Settings } from 'lucide-react';
import { Agent } from '../Agents';
import EditAgentFieldModal from './EditAgentFieldModal';
import ManageAgentToolsModal from './ManageAgentToolsModal';
import AgentAccessSettings from './AgentAccessSettings';

interface AgentCardProps {
  agent: Agent;
  userId: string;
  onDelete: (agentId: string) => void;
  onUpdate: (updatedAgent: Agent) => void;
}

type EditField = 'display_name' | 'role' | 'goal' | 'backstory' | null;

export default function AgentCard({ agent, userId, onDelete, onUpdate }: AgentCardProps) {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [editingField, setEditingField] = useState<EditField>(null);
  const [showToolsModal, setShowToolsModal] = useState(false);
  const [showAccessSettings, setShowAccessSettings] = useState(false);
  const [toolsCount, setToolsCount] = useState(0);
  const [loadingTools, setLoadingTools] = useState(true);

  useEffect(() => {
    loadToolsCount();
  }, [agent.id]);

  const loadToolsCount = async () => {
    try {
      // UPDATED: Query agent_custom_tools instead of agent_tools
      const { count, error } = await supabase
        .from('agent_custom_tools')
        .select('*', { count: 'exact', head: true })
        .eq('agent_id', agent.id);

      if (error) throw error;
      setToolsCount(count || 0);
    } catch (error) {
      console.error('Error loading tools count:', error);
    } finally {
      setLoadingTools(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);
      formData.append('agentId', agent.id);

      const response = await fetch('/biz/api/agents/upload-avatar', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to upload avatar');
      }

      onUpdate({ ...agent, avatar_url: data.url });
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      alert(error.message || 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSaveField = async (field: string, value: string) => {
    const { data, error } = await supabase
      .from('agents')
      .update({ [field]: value })
      .eq('id', agent.id)
      .select()
      .single();

    if (error) throw error;
    
    onUpdate(data);
  };

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

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
        {/* Avatar Section */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div 
                onClick={handleAvatarClick}
                className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden cursor-pointer group"
              >
                {uploadingAvatar ? (
                  <Loader2 className="animate-spin text-white" size={32} />
                ) : agent.avatar_url ? (
                  <>
                    <img
                      src={agent.avatar_url}
                      alt={agent.display_name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Upload size={24} className="text-white" />
                    </div>
                  </>
                ) : (
                  <div className="relative">
                    <Bot size={36} className="text-white" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Upload size={20} className="text-white" />
                    </div>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg truncate">{agent.display_name}</h3>
                  <p className="text-sm text-white/80 truncate">@{agent.username}</p>
                </div>
                <button
                  onClick={() => setEditingField('display_name')}
                  className="text-white/80 hover:text-white p-1 flex-shrink-0"
                  title="Edit display name"
                >
                  <Edit2 size={16} />
                </button>
              </div>
              <p className="text-xs text-white/60 mt-1">Click avatar to upload</p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-4">
          {/* Role */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">Role</label>
              <button
                onClick={() => setEditingField('role')}
                className="text-blue-600 hover:text-blue-700 p-1"
                title="Edit role"
              >
                <Edit2 size={14} />
              </button>
            </div>
            <p className="text-gray-800 text-sm">
              {truncateText(agent.role, 100)}
            </p>
          </div>

          {/* Goal */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">Goal</label>
              <button
                onClick={() => setEditingField('goal')}
                className="text-blue-600 hover:text-blue-700 p-1"
                title="Edit goal"
              >
                <Edit2 size={14} />
              </button>
            </div>
            <p className="text-gray-700 text-sm line-clamp-2">
              {agent.goal}
            </p>
          </div>

          {/* Backstory */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">Backstory</label>
              <button
                onClick={() => setEditingField('backstory')}
                className="text-blue-600 hover:text-blue-700 p-1"
                title="Edit backstory"
              >
                <Edit2 size={14} />
              </button>
            </div>
            <p className="text-gray-600 text-sm line-clamp-3">
              {agent.backstory}
            </p>
          </div>

          {/* Tools Section - UPDATED LABEL */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-500 uppercase">Custom Tools</label>
              {loadingTools ? (
                <Loader2 className="animate-spin text-gray-400" size={14} />
              ) : (
                <span className="text-xs font-semibold text-purple-600">
                  {toolsCount} mapped
                </span>
              )}
            </div>
            <button
              onClick={() => setShowToolsModal(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors font-medium"
            >
              <Code size={18} />
              Manage Tools
            </button>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-gray-200 space-y-2">
            <button
              onClick={() => setShowAccessSettings(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors font-medium"
            >
              <Settings size={18} />
              Access & Type
            </button>
            
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

      {/* Edit Field Modal */}
      {editingField && (
        <EditAgentFieldModal
          field={editingField}
          currentValue={agent[editingField]}
          onClose={() => setEditingField(null)}
          onSave={handleSaveField}
        />
      )}

      {/* Manage Tools Modal - UPDATED */}
      {showToolsModal && (
        <ManageAgentToolsModal
          agentId={agent.id}
          agentName={agent.display_name}
          userId={userId}
          onClose={() => {
            setShowToolsModal(false);
            loadToolsCount(); // Refresh count when modal closes
          }}
        />
      )}

      {/* Agent Access Settings Modal */}
      {showAccessSettings && (
        <AgentAccessSettings
          agent={agent}
          onClose={() => setShowAccessSettings(false)}
          onUpdate={onUpdate}
        />
      )}

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