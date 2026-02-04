// app/biz/components/CustomTools.tsx
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Plus, Code } from 'lucide-react';
import CustomToolCard from './custom-tools/CustomToolCard';
import CreateCustomToolModal from './custom-tools/CreateCustomToolModal';

interface CustomToolsProps {
  userId: string;
}

export interface CustomTool {
  id: string;
  user_id: string;
  tool_name: string;
  tool_description: string;
  python_code: string;
  input_schema: Record<string, any>;
  timeout_seconds: number;
  required_packages: string[];
  is_active: boolean;
  last_tested_at: string | null;
  created_at: string;
  updated_at: string;
}

const MAX_TOOLS = 10;

export default function CustomTools({ userId }: CustomToolsProps) {
  const supabase = createClient();
  const [tools, setTools] = useState<CustomTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadTools();
  }, [userId]);

  const loadTools = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_tools')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTools(data || []);
    } catch (error) {
      console.error('Error loading custom tools:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToolCreated = (newTool: CustomTool) => {
    setTools([newTool, ...tools]);
    setShowCreateModal(false);
  };

  const handleToolDeleted = (toolId: string) => {
    setTools(tools.filter(tool => tool.id !== toolId));
  };

  const handleToolUpdated = (updatedTool: CustomTool) => {
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
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Custom Tools</h1>
          <p className="text-gray-600 mt-1">
            Create Python-based tools for your agents ({tools.length}/{MAX_TOOLS})
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          disabled={!canCreateMore}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors shadow-md"
        >
          <Plus size={20} />
          Create Tool
        </button>
      </div>

      {!canCreateMore && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">
            You've reached the maximum limit of {MAX_TOOLS} custom tools. Delete an existing tool to create a new one.
          </p>
        </div>
      )}

      {tools.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Code size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No custom tools yet</h2>
          <p className="text-gray-600 mb-6">
            Create your first Python-based custom tool to extend agent capabilities
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            <Plus size={20} />
            Create Your First Tool
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <CustomToolCard
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
        <CreateCustomToolModal
          userId={userId}
          onClose={() => setShowCreateModal(false)}
          onToolCreated={handleToolCreated}
        />
      )}
    </div>
  );
}