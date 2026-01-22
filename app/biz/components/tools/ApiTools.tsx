// app/biz/components/tools/ApiTools.tsx
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Plus, Wrench } from 'lucide-react';
import ApiToolCard from './ApiToolCard';
import CreateApiToolModal from './CreateApiToolModal';

interface ApiToolsProps {
  userId: string;
}

export interface ApiTool {
  id: string;
  user_id: string;
  tool_name: string;
  tool_description: string;
  url: string;
  http_method: string;
  headers: Record<string, string>;
  query_params: Record<string, string>;
  body_params: Record<string, string>;
  timeout_seconds: number;
  created_at: string;
  updated_at: string;
}

const MAX_TOOLS = 20;

export default function ApiTools({ userId }: ApiToolsProps) {
  const supabase = createClient();
  const [tools, setTools] = useState<ApiTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadTools();
  }, [userId]);

  const loadTools = async () => {
    try {
      const { data, error } = await supabase
        .from('api_tools')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTools(data || []);
    } catch (error) {
      console.error('Error loading API tools:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToolCreated = (newTool: ApiTool) => {
    setTools([newTool, ...tools]);
    setShowCreateModal(false);
  };

  const handleToolDeleted = (toolId: string) => {
    setTools(tools.filter(tool => tool.id !== toolId));
  };

  const handleToolUpdated = (updatedTool: ApiTool) => {
    setTools(tools.map(tool => 
      tool.id === updatedTool.id ? updatedTool : tool
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  const canCreateMore = tools.length < MAX_TOOLS;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">API Tools</h2>
          <p className="text-gray-600 text-sm mt-1">
            {tools.length} tool{tools.length !== 1 ? 's' : ''} created
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          disabled={!canCreateMore}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors shadow-md"
        >
          <Plus size={20} />
          Create API Tool
        </button>
      </div>

      {tools.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Wrench size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No API tools yet</h2>
          <p className="text-gray-600 mb-6">
            Create your first API tool to integrate external services
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            <Plus size={20} />
            Create Your First API Tool
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <ApiToolCard
              key={tool.id}
              tool={tool}
              userId={userId}
              onDelete={handleToolDeleted}
              onUpdate={handleToolUpdated}
            />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateApiToolModal
          userId={userId}
          onClose={() => setShowCreateModal(false)}
          onToolCreated={handleToolCreated}
        />
      )}
    </div>
  );
}