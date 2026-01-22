// app/biz/components/tools/CreateApiToolModal.tsx
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { X, Loader2, Plus, Trash2, AlertCircle } from 'lucide-react';
import { ApiTool } from './ApiTools';

interface CreateApiToolModalProps {
  userId: string;
  onClose: () => void;
  onToolCreated: (tool: ApiTool) => void;
}

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
const MAX_TIMEOUT = 120;
const DEFAULT_TIMEOUT = 30;

interface KeyValuePair {
  key: string;
  value: string;
}

export default function CreateApiToolModal({ userId, onClose, onToolCreated }: CreateApiToolModalProps) {
  const supabase = createClient();
  
  const [toolName, setToolName] = useState('');
  const [toolDescription, setToolDescription] = useState('');
  const [url, setUrl] = useState('');
  const [httpMethod, setHttpMethod] = useState('GET');
  const [timeoutSeconds, setTimeoutSeconds] = useState(DEFAULT_TIMEOUT);
  
  const [headers, setHeaders] = useState<KeyValuePair[]>([{ key: '', value: '' }]);
  const [queryParams, setQueryParams] = useState<KeyValuePair[]>([{ key: '', value: '' }]);
  const [bodyParams, setBodyParams] = useState<KeyValuePair[]>([{ key: '', value: '' }]);
  
  const [nameStatus, setNameStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');
  const [nameError, setNameError] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  // Check tool name availability
  useEffect(() => {
    if (toolName) {
      const timeoutId = setTimeout(() => {
        checkNameAvailability(toolName);
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setNameStatus('idle');
    }
  }, [toolName]);

  const checkNameAvailability = async (name: string) => {
    if (!name.trim()) {
      setNameStatus('idle');
      return;
    }

    setNameStatus('checking');
    setNameError('');

    try {
      const { data, error } = await supabase
        .from('api_tools')
        .select('tool_name')
        .eq('user_id', userId)
        .eq('tool_name', name)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setNameStatus('unavailable');
        setNameError('Tool name already exists');
      } else {
        setNameStatus('available');
      }
    } catch (error: any) {
      setNameStatus('unavailable');
      setNameError(error.message || 'Failed to check tool name');
    }
  };

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

  const handleCreate = async () => {
    setError('');

    // Validation
    if (!toolName.trim()) {
      setError('Tool name is required');
      return;
    }
    if (nameStatus !== 'available') {
      setError('Please choose an available tool name');
      return;
    }
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

    setCreating(true);

    try {
      const { data, error } = await supabase
        .from('api_tools')
        .insert({
          user_id: userId,
          tool_name: toolName.trim(),
          tool_description: toolDescription.trim(),
          url: url.trim(),
          http_method: httpMethod,
          headers: convertToObject(headers),
          query_params: convertToObject(queryParams),
          body_params: convertToObject(bodyParams),
          timeout_seconds: timeoutSeconds,
        })
        .select()
        .single();

      if (error) throw error;

      onToolCreated(data);
    } catch (error: any) {
      setError(error.message || 'Failed to create API tool');
    } finally {
      setCreating(false);
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
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Create API Tool</h2>
          <button
            onClick={onClose}
            disabled={creating}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

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
                Tool Name *
              </label>
              <input
                type="text"
                value={toolName}
                onChange={(e) => setToolName(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                  nameError ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., weather_api"
                maxLength={255}
              />
              {nameError && (
                <p className="text-sm text-red-600 mt-1">{nameError}</p>
              )}
              {nameStatus === 'available' && (
                <p className="text-sm text-green-600 mt-1">✓ Tool name is available</p>
              )}
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
                  value={timeoutSeconds}
                  onChange={(e) => setTimeoutSeconds(Math.min(MAX_TIMEOUT, Math.max(1, parseInt(e.target.value) || DEFAULT_TIMEOUT)))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  min="1"
                  max={MAX_TIMEOUT}
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
            disabled={creating}
            className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={creating || nameStatus !== 'available' || !toolName.trim() || !toolDescription.trim() || !url.trim()}
            className="flex-1 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {creating ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Creating...
              </>
            ) : (
              'Create API Tool'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}