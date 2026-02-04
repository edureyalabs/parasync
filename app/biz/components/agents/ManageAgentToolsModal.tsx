// app/biz/components/agents/ManageAgentToolsModal.tsx
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { X, Loader2, Code, Check, AlertCircle, Clock, Package } from 'lucide-react';

interface ManageAgentToolsModalProps {
  agentId: string;
  agentName: string;
  userId: string;
  onClose: () => void;
}

interface CustomTool {
  id: string;
  tool_name: string;
  tool_description: string;
  timeout_seconds: number;
  required_packages: string[];
}

export default function ManageAgentToolsModal({
  agentId,
  agentName,
  userId,
  onClose,
}: ManageAgentToolsModalProps) {
  const supabase = createClient();
  
  const [allTools, setAllTools] = useState<CustomTool[]>([]);
  const [mappedToolIds, setMappedToolIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadData();
  }, [agentId, userId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load all user's custom tools
      const { data: toolsData, error: toolsError } = await supabase
        .from('custom_tools')
        .select('id, tool_name, tool_description, timeout_seconds, required_packages')
        .eq('user_id', userId)
        .order('tool_name');

      if (toolsError) throw toolsError;

      // Load currently mapped tools for this agent
      const { data: mappedData, error: mappedError } = await supabase
        .from('agent_custom_tools')
        .select('tool_id')
        .eq('agent_id', agentId);

      if (mappedError) throw mappedError;

      setAllTools(toolsData || []);
      setMappedToolIds(new Set(mappedData?.map(m => m.tool_id) || []));
    } catch (error: any) {
      console.error('Error loading data:', error);
      setError(error.message || 'Failed to load tools');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTool = async (toolId: string, isCurrentlyMapped: boolean) => {
    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      if (isCurrentlyMapped) {
        // Remove mapping
        const { error } = await supabase
          .from('agent_custom_tools')
          .delete()
          .eq('agent_id', agentId)
          .eq('tool_id', toolId);

        if (error) throw error;

        setMappedToolIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(toolId);
          return newSet;
        });
        
        setSuccessMessage('Tool unmapped successfully');
      } else {
        // Add mapping
        const { error } = await supabase
          .from('agent_custom_tools')
          .insert({
            agent_id: agentId,
            tool_id: toolId,
          });

        if (error) throw error;

        setMappedToolIds(prev => new Set([...prev, toolId]));
        setSuccessMessage('Tool mapped successfully');
      }

      // Clear success message after 2 seconds
      setTimeout(() => setSuccessMessage(''), 2000);
    } catch (error: any) {
      console.error('Error toggling tool:', error);
      setError(error.message || 'Failed to update tool mapping');
    } finally {
      setSaving(false);
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Manage Custom Tools</h2>
            <p className="text-sm text-white/80 mt-1">{agentName}</p>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="bg-green-50 border-b border-green-200 px-6 py-3 flex items-center gap-2">
            <Check className="text-green-600" size={20} />
            <p className="text-green-800 font-medium">{successMessage}</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border-b border-red-200 px-6 py-3 flex items-center gap-2">
            <AlertCircle className="text-red-600" size={20} />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="animate-spin text-purple-600" size={32} />
            </div>
          ) : allTools.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Code size={64} className="text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Custom Tools Yet</h3>
              <p className="text-gray-600 mb-4">
                Create custom tools first to map them to this agent
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Select the custom tools you want to map to this agent. 
                  <span className="font-semibold text-gray-800 ml-1">
                    {mappedToolIds.size} of {allTools.length} tools mapped
                  </span>
                </p>
              </div>

              {allTools.map((tool) => {
                const isMapped = mappedToolIds.has(tool.id);

                return (
                  <div
                    key={tool.id}
                    className={`border rounded-lg p-4 transition-all ${
                      isMapped
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <label className="flex items-start gap-4 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isMapped}
                        onChange={() => handleToggleTool(tool.id, isMapped)}
                        disabled={saving}
                        className="mt-1 w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer disabled:cursor-not-allowed"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-sm">
                              {tool.tool_name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center gap-1 text-xs text-gray-600">
                                <Clock size={12} />
                                {tool.timeout_seconds}s timeout
                              </div>
                              {tool.required_packages.length > 0 && (
                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                  <Package size={12} />
                                  {tool.required_packages.length} packages
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-1">
                          {truncateText(tool.tool_description, 120)}
                        </p>
                        
                        {tool.required_packages.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {tool.required_packages.slice(0, 3).map((pkg) => (
                              <span key={pkg} className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                                {pkg}
                              </span>
                            ))}
                            {tool.required_packages.length > 3 && (
                              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                +{tool.required_packages.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {mappedToolIds.size > 0 ? (
              <span>
                <span className="font-semibold text-purple-600">{mappedToolIds.size}</span> tool
                {mappedToolIds.size !== 1 ? 's' : ''} mapped to this agent
              </span>
            ) : (
              <span className="text-gray-500">No tools mapped yet</span>
            )}
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}