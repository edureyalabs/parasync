// app/biz/components/tools/ApiToolCard.tsx
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Wrench, Trash2, Loader2, AlertCircle, Edit2, ExternalLink } from 'lucide-react';
import { ApiTool } from './ApiTools';
import EditApiToolModal from './EditApiToolModal';

interface ApiToolCardProps {
  tool: ApiTool;
  userId: string;
  onDelete: (toolId: string) => void;
  onUpdate: (updatedTool: ApiTool) => void;
}

const METHOD_COLORS = {
  GET: 'bg-blue-100 text-blue-800 border-blue-200',
  POST: 'bg-green-100 text-green-800 border-green-200',
  PUT: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  PATCH: 'bg-orange-100 text-orange-800 border-orange-200',
  DELETE: 'bg-red-100 text-red-800 border-red-200',
  HEAD: 'bg-purple-100 text-purple-800 border-purple-200',
  OPTIONS: 'bg-gray-100 text-gray-800 border-gray-200',
};

export default function ApiToolCard({ tool, userId, onDelete, onUpdate }: ApiToolCardProps) {
  const supabase = createClient();
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('api_tools')
        .delete()
        .eq('id', tool.id);

      if (error) throw error;
      onDelete(tool.id);
    } catch (error) {
      console.error('Error deleting API tool:', error);
      alert('Failed to delete API tool');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const truncateUrl = (url: string, maxLength: number) => {
    if (url.length <= maxLength) return url;
    return url.slice(0, maxLength) + '...';
  };

  const methodColorClass = METHOD_COLORS[tool.http_method as keyof typeof METHOD_COLORS] || METHOD_COLORS.GET;

  return (
    <>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Wrench size={24} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg truncate">{tool.tool_name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${methodColorClass} bg-white`}>
                  {tool.http_method}
                </span>
                <span className="text-xs text-white/60">
                  {tool.timeout_seconds}s timeout
                </span>
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

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Description</label>
            <p className="text-gray-800 text-sm mt-1 line-clamp-2">
              {tool.tool_description}
            </p>
          </div>

          {/* URL */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase">Endpoint URL</label>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-gray-700 text-sm font-mono truncate flex-1" title={tool.url}>
                {truncateUrl(tool.url, 40)}
              </p>
              
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 flex-shrink-0"
                title="Open URL"
              >
                <ExternalLink size={14} />
              </a>
            </div>
          </div>

          {/* Configuration Summary */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-200">
            <div className="text-center">
              <p className="text-xs text-gray-500">Headers</p>
              <p className="text-sm font-semibold text-gray-800">
                {Object.keys(tool.headers || {}).length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Query</p>
              <p className="text-sm font-semibold text-gray-800">
                {Object.keys(tool.query_params || {}).length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Body</p>
              <p className="text-sm font-semibold text-gray-800">
                {Object.keys(tool.body_params || {}).length}
              </p>
            </div>
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
              Delete Tool
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <EditApiToolModal
          tool={tool}
          userId={userId}
          onClose={() => setShowEditModal(false)}
          onToolUpdated={onUpdate}
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
                <h3 className="text-lg font-bold text-gray-900 mb-2">Delete API Tool</h3>
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