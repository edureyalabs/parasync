// app/biz/components/tools/EditApiToolModal.tsx
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { X, Loader2, Plus, Trash2, AlertCircle, Check } from 'lucide-react';
import { ApiTool } from './ApiTools';

interface EditApiToolModalProps {
  tool: ApiTool;
  userId: string;
  onClose: () => void;
  onToolUpdated: (tool: ApiTool) => void;
}

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
const MAX_TIMEOUT = 120;

interface KeyValuePair {
  key: string;
  value: string;
}

export default function EditApiToolModal({ tool, userId, onClose, onToolUpdated }: EditApiToolModalProps) {
  const supabase = createClient();
  
  const [toolDescription, setToolDescription] = useState(tool.tool_description);
  const [url, setUrl] = useState(tool.url);
  const [httpMethod, setHttpMethod] = useState(tool.http_method);
  const [timeout, setTimeout] = useState(tool.timeout_seconds);
  
  const objectToArray = (obj: Record<string, string>): KeyValuePair[] => {
    const entries = Object.entries(obj || {});
    return entries.length > 0 ? entries.map(([key, value]) => ({ key, value })) : [{ key: '', value: '' }];
  };

  const [headers, setHeaders] = useState<KeyValuePair[]>(objectToArray(tool.headers));
  const [queryParams, setQueryParams] = useState<KeyValuePair[]>(objectToArray(tool.query_params));
  const [bodyParams, setBodyParams] = useState<KeyValuePair[]>(objectToArray(tool.body_params));
  
  const [updating, setUpdating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const addKeyValuePair = (type: 'headers' | 'query' | 'body') => {
    if (type === 'headers') {
      setHeaders([...headers, { key: '', value: '' }]);
    } else if (type === 'query') {
      setQueryParams([...queryParams, { key: '', value: '' }]);
    } else {
      setBodyParams([...bodyParams, { key: '', value: '' }]);
    }
  };

  const removeKeyValuePair = (type: 'headers' | 'query' | 'body', index: number) => {
    if (type === 'headers') {
      setHeaders(headers.filter((_, i) => i !== index));
    } else if (type === 'query') {
      setQueryParams(queryParams.filter((_, i) => i !== index));
    } else {
      setBodyParams(bodyParams.filter((_, i) => i !== index));
    }
  };

  const updateKeyValuePair = (
    type: 'headers' | 'query' | 'body',
    index: number,
    field: 'key' | 'value',
    value: string
  ) => {
    if (type === 'headers') {
      const updated = [...headers];
      updated[index][field] = value;
      setHeaders(updated);
    } else if (type === 'query') {
      const updated = [...queryParams];
      updated[index][field] = value;
      setQueryParams(updated);
    } else {
      const updated = [...bodyParams];
      updated[index][field] = value;
      setBodyParams(updated);
    }
  };

  const convertToObject = (pairs: KeyValuePair[]): Record<string, string> => {
    return pairs.reduce((acc, pair) => {
      if (pair.key.trim()) {
        acc[pair.key.trim()] = pair.value;
      }
      return acc;
    }, {} as Record<string, string>);
  };

  const handleUpdate = async () => {
    setError('');

    // Validation
    if (!toolDescription.trim()) {
      setError('Tool description is required');
      return;
    }
    if (!url.trim()) {
      setError('URL is required');
      return;
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      setError('Invalid URL format');
      return;
    }

    setUpdating(true);

    try {
      const { data, error } = await supabase
        .from('api_tools')
        .update({
          tool_description: toolDescription.trim(),
          url: url.trim(),
          http_method: httpMethod,
          headers: convertToObject(headers),
          query_params: convertToObject(queryParams),
          body_params: convertToObject(bodyParams),
          timeout_seconds: timeout,
          updated_at: new Date().toISOString(),
        })
        .eq('id', tool.id)
        .select()
        .single();

      if (error) throw error;

      onToolUpdated(data);
      setShowSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error: any) {
      setError(error.message || 'Failed to update API tool');
    } finally {
      setUpdating(false);
    }
  };

  const renderKeyValueInputs = (
    pairs: KeyValuePair[],
    type: 'headers' | 'query' | 'body',
    label: string
  ) => (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-semibold text-gray-700">{label}</label>
        <button
          type="button"
          onClick={() => addKeyValuePair(type)}
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <Plus size={14} />
          Add
        </button>
      </div>
      <div className="space-y-2">
        {pairs.map((pair, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={pair.key}
              onChange={(e) => updateKeyValuePair(type, index, 'key', e.target.value)}
              placeholder="Key"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            />
            <input
              type="text"
              value={pair.value}
              onChange={(e) => updateKeyValuePair(type, index, 'value', e.target.value)}
              placeholder="Value"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            />
            {pairs.length > 1 && (
              <button
                type="button"
                onClick={() => removeKeyValuePair(type, index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Edit API Tool</h2>
            <p className="text-sm text-white/80 mt-1">{tool.tool_name}</p>
          </div>
          <button
            onClick={onClose}
            disabled={updating}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Success Notification */}
        {showSuccess && (
          <div className="bg-green-50 border-b border-green-200 px-6 py-3 flex items-center gap-2">
            <Check className="text-green-600" size={20} />
            <p className="text-green-800 font-medium">Updated successfully!</p>
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="text-red-600" size={20} />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tool Name (Cannot be changed)
              </label>
              <input
                type="text"
                value={tool.tool_name}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={toolDescription}
                onChange={(e) => setToolDescription(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                rows={3}
                placeholder="Describe what this API tool does"
                disabled={updating}
              />
            </div>
          </div>

          {/* Endpoint Configuration */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900">Endpoint Configuration</h3>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                URL *
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm"
                placeholder="https://api.example.com/endpoint"
                maxLength={1024}
                disabled={updating}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  HTTP Method *
                </label>
                <select
                  value={httpMethod}
                  onChange={(e) => setHttpMethod(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  disabled={updating}
                >
                  {HTTP_METHODS.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Timeout (seconds)
                </label>
                <input
                  type="number"
                  value={timeout}
                  onChange={(e) => setTimeout(Math.min(MAX_TIMEOUT, Math.max(1, parseInt(e.target.value) || 30)))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  min="1"
                  max={MAX_TIMEOUT}
                  disabled={updating}
                />
                <p className="text-xs text-gray-500 mt-1">Max: {MAX_TIMEOUT}s</p>
              </div>
            </div>
          </div>

          {/* Request Configuration */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900">Request Configuration</h3>
            
            {renderKeyValueInputs(headers, 'headers', 'Headers')}
            {renderKeyValueInputs(queryParams, 'query', 'Query Parameters')}
            {(httpMethod === 'POST' || httpMethod === 'PUT' || httpMethod === 'PATCH') && 
              renderKeyValueInputs(bodyParams, 'body', 'Body Parameters')}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            disabled={updating}
            className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={updating || !toolDescription.trim() || !url.trim()}
            className="flex-1 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {updating ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Updating...
              </>
            ) : (
              <>
                <Check size={18} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
```

## 6. Update `app/biz/page.tsx` to include Tools
```typescript
// Update the imports section
import Tools from './components/Tools';

// Update the renderContent function to include the tools case:
const renderContent = () => {
  switch (activeSection) {
    case 'dashboard':
      return (
        <div className="flex items-center justify-center h-full">
          <h1 className="text-4xl font-bold text-gray-800">Dashboard</h1>
        </div>
      );
    case 'chats':
      return <Chats userId={userId} />;
    case 'agents':
      return <Agents userId={userId} />;
    case 'tools':
      return <Tools userId={userId} />;
    case 'account':
      return <Account userEmail={userEmail} userId={userId} onLogout={handleLogout} />;
    default:
      return null;
  }
};