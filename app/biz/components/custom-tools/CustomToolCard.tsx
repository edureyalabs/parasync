// app/biz/components/custom-tools/CustomToolCard.tsx
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Code, Trash2, Loader2, AlertCircle, Edit2, Play, Clock, Package } from 'lucide-react';
import { CustomTool } from '../CustomTools';
import EditCustomToolModal from './EditCustomToolModal';
import TestToolModal from './TestToolModal';

interface CustomToolCardProps {
  tool: CustomTool;
  userId: string;
  onDelete: (toolId: string) => void;
  onUpdate: (updatedTool: CustomTool) => void;
}

export default function CustomToolCard({ tool, userId, onDelete, onUpdate }: CustomToolCardProps) {
  const supabase = createClient();
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('custom_tools')
        .delete()
        .eq('id', tool.id);

      if (error) throw error;
      onDelete(tool.id);
    } catch (error) {
      console.error('Error deleting custom tool:', error);
      alert('Failed to delete custom tool');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Code size={24} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg truncate">{tool.tool_name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Clock size={14} />
                <span className="text-xs text-white/80">{tool.timeout_seconds}s timeout</span>
              </div>
            </div>
            <button
              onClick={() => setShowEditModal(true)}
              className="text-white/80 hover:text-white p-1 flex-shrink-0"
              title="Edit tool"
            >
              <Edit2 size={16} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Description</label>
            <p className="text-gray-800 text-sm mt-1 line-clamp-2">
              {tool.tool_description}
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Input Parameters</label>
            <p className="text-gray-700 text-sm mt-1">
              {Object.keys(tool.input_schema.properties || {}).length} parameters
            </p>
          </div>

          {tool.required_packages.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
                <Package size={12} />
                Required Packages
              </label>
              <div className="flex flex-wrap gap-1 mt-1">
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
            </div>
          )}

          <div className="text-xs text-gray-500">
            {tool.last_tested_at ? (
              <span>Last tested: {formatDate(tool.last_tested_at)}</span>
            ) : (
              <span>Not tested yet</span>
            )}
          </div>

          <div className="pt-4 border-t border-gray-200 space-y-2">
            <button
              onClick={() => setShowTestModal(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors font-medium"
            >
              <Play size={18} />
              Test Tool
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
              Delete Tool
            </button>
          </div>
        </div>
      </div>

      {showEditModal && (
        <EditCustomToolModal
          tool={tool}
          userId={userId}
          onClose={() => setShowEditModal(false)}
          onToolUpdated={onUpdate}
        />
      )}

      {showTestModal && (
        <TestToolModal
          tool={tool}
          onClose={() => setShowTestModal(false)}
          onTestComplete={() => {
            loadTools();
          }}
        />
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="text-red-600" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Custom Tool</h3>
                <p className="text-gray-600 mb-4">
                  Are you sure you want to delete <strong>{tool.tool_name}</strong>? This action cannot be undone.
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

function loadTools() {
  window.location.reload();
}