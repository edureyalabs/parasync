// app/biz/components/custom-tools/EditCustomToolModal.tsx
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { X, Loader2, AlertCircle, Check } from 'lucide-react';
import { CustomTool } from '../CustomTools';
import CodeEditor from './CodeEditor';
import InputSchemaBuilder from './InputSchemaBuilder';
import PackageValidator from './PackageValidator';

interface EditCustomToolModalProps {
  tool: CustomTool;
  userId: string;
  onClose: () => void;
  onToolUpdated: (tool: CustomTool) => void;
}

type Tab = 'description' | 'schema' | 'code' | 'packages';

export default function EditCustomToolModal({ tool, userId, onClose, onToolUpdated }: EditCustomToolModalProps) {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<Tab>('description');
  const [toolDescription, setToolDescription] = useState(tool.tool_description);
  const [timeoutSeconds, setTimeoutSeconds] = useState(tool.timeout_seconds);
  const [pythonCode, setPythonCode] = useState(tool.python_code);
  const [inputSchema, setInputSchema] = useState(tool.input_schema);
  const [requiredPackages, setRequiredPackages] = useState(tool.required_packages);
  
  const [updating, setUpdating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleUpdate = async () => {
    setError('');
    setUpdating(true);

    try {
      const { data, error } = await supabase
        .from('custom_tools')
        .update({
          tool_description: toolDescription.trim(),
          timeout_seconds: timeoutSeconds,
          python_code: pythonCode,
          input_schema: inputSchema,
          required_packages: requiredPackages,
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
      setError(error.message || 'Failed to update custom tool');
    } finally {
      setUpdating(false);
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'description', label: 'Description' },
    { id: 'schema', label: 'Parameters' },
    { id: 'code', label: 'Code' },
    { id: 'packages', label: 'Packages' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Edit Custom Tool</h2>
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

        {showSuccess && (
          <div className="bg-green-50 border-b border-green-200 px-6 py-3 flex items-center gap-2">
            <Check className="text-green-600" size={20} />
            <p className="text-green-800 font-medium">Updated successfully!</p>
          </div>
        )}

        <div className="bg-white border-b border-gray-200">
          <nav className="flex -mb-px px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="text-red-600" size={20} />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {activeTab === 'description' && (
            <div className="space-y-6">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                  rows={4}
                  placeholder="Describe what this tool does and when agents should use it"
                  maxLength={1000}
                  disabled={updating}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {toolDescription.length}/1000 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Timeout (seconds)
                </label>
                <input
                  type="number"
                  value={timeoutSeconds}
                  onChange={(e) => setTimeoutSeconds(Math.min(300, Math.max(1, parseInt(e.target.value) || 30)))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  min="1"
                  max="300"
                  disabled={updating}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum execution time (1-300 seconds)
                </p>
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
            <InputSchemaBuilder
              schema={inputSchema}
              onChange={setInputSchema}
            />
          )}

          {activeTab === 'code' && (
            <CodeEditor
              code={pythonCode}
              onChange={setPythonCode}
            />
          )}

          {activeTab === 'packages' && (
            <PackageValidator
              code={pythonCode}
              selectedPackages={requiredPackages}
              onChange={setRequiredPackages}
            />
          )}
        </div>

        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            disabled={updating}
            className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={updating || !toolDescription.trim()}
            className="flex-1 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
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