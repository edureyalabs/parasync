// app/biz/components/agents/ManageAgentToolsModal.tsx
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { X, Loader2, Wrench, Check, AlertCircle } from 'lucide-react';

interface ManageAgentToolsModalProps {
  agentId: string;
  agentName: string;
  userId: string;
  onClose: () => void;
}

interface ApiTool {
  id: string;
  tool_name: string;
  tool_description: string;
  url: string;
  http_method: string;
}

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-blue-100 text-blue-800 border-blue-200',
  POST: 'bg-green-100 text-green-800 border-green-200',
  PUT: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  PATCH: 'bg-orange-100 text-orange-800 border-orange-200',
  DELETE: 'bg-red-100 text-red-800 border-red-200',
  HEAD: 'bg-purple-100 text-purple-800 border-purple-200',
  OPTIONS: 'bg-gray-100 text-gray-800 border-gray-200',
};

export default function ManageAgentToolsModal({
  agentId,
  agentName,
  userId,
  onClose,
}: ManageAgentToolsModalProps) {
  const supabase = createClient();
  
  const [allTools, setAllTools] = useState<ApiTool[]>([]);
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
      // Load all user's tools
      const { data: toolsData, error: toolsError } = await supabase
        .from('api_tools')
        .select('id, tool_name, tool_description, url, http_method')
        .eq('user_id', userId)
        .order('tool_name');

      if (toolsError) throw toolsError;

      // Load currently mapped tools for this agent
      const { data: mappedData, error: mappedError } = await supabase
        .from('agent_tools')
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
          .from('agent_tools')
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
          .from('agent_tools')
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
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Manage API Tools</h2>
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
              <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
          ) : allTools.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Wrench size={64} className="text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">No API Tools Yet</h3>
              <p className="text-gray-600 mb-4">
                Create API tools first to map them to this agent
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Select the API tools you want to map to this agent. 
                  <span className="font-semibold text-gray-800 ml-1">
                    {mappedToolIds.size} of {allTools.length} tools mapped
                  </span>
                </p>
              </div>

              {allTools.map((tool) => {
                const isMapped = mappedToolIds.has(tool.id);
                const methodColorClass = METHOD_COLORS[tool.http_method] || METHOD_COLORS.GET;

                return (
                  <div
                    key={tool.id}
                    className={`border rounded-lg p-4 transition-all ${
                      isMapped
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <label className="flex items-start gap-4 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isMapped}
                        onChange={() => handleToggleTool(tool.id, isMapped)}
                        disabled={saving}
                        className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-sm">
                              {tool.tool_name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${methodColorClass}`}>
                                {tool.http_method}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-1">
                          {truncateText(tool.tool_description, 120)}
                        </p>
                        
                        <p className="text-xs text-gray-500 font-mono truncate" title={tool.url}>
                          {truncateText(tool.url, 60)}
                        </p>
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
                <span className="font-semibold text-blue-600">{mappedToolIds.size}</span> tool
                {mappedToolIds.size !== 1 ? 's' : ''} mapped to this agent
              </span>
            ) : (
              <span className="text-gray-500">No tools mapped yet</span>
            )}
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}