// app/biz/components/custom-tools/CreateCustomToolModal.tsx
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { X, Loader2, AlertCircle, Check, ArrowRight, Info } from 'lucide-react';
import { CustomTool } from '../CustomTools';
import CodeEditor from './CodeEditor';
import InputSchemaBuilder from './InputSchemaBuilder';
import PackageValidator from './PackageValidator';

interface CreateCustomToolModalProps {
  userId: string;
  onClose: () => void;
  onToolCreated: (tool: CustomTool) => void;
}

type Step = 'basic' | 'schema' | 'code' | 'packages';

const DEFAULT_CODE = `from typing import Dict, Any

def execute_tool(params: Dict[str, Any]) -> Dict[str, Any]:
    """
    Tool execution function.
    
    Args:
        params: Dictionary containing input parameters
    
    Returns:
        Dictionary with 'result' key containing output
    """
    
    # Extract parameters
    # example_param = params.get('example_param')
    
    # Your logic here
    result = None
    
    return {
        "result": result,
        "metadata": {}
    }
`;

export default function CreateCustomToolModal({ userId, onClose, onToolCreated }: CreateCustomToolModalProps) {
  const supabase = createClient();
  const [step, setStep] = useState<Step>('basic');
  const [toolName, setToolName] = useState('');
  const [toolDescription, setToolDescription] = useState('');
  const [timeoutSeconds, setTimeoutSeconds] = useState(30);
  const [pythonCode, setPythonCode] = useState(DEFAULT_CODE);
  const [inputSchema, setInputSchema] = useState<Record<string, any>>({
    type: 'object',
    properties: {},
    required: []
  });
  const [requiredPackages, setRequiredPackages] = useState<string[]>([]);
  
  const [nameStatus, setNameStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');
  const [nameError, setNameError] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

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
        .from('custom_tools')
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

  const handleNext = () => {
    setError('');
    
    if (step === 'basic') {
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
      setStep('schema');
    } else if (step === 'schema') {
      setStep('code');
    } else if (step === 'code') {
      setStep('packages');
    }
  };

  const handleBack = () => {
    setError('');
    
    if (step === 'schema') {
      setStep('basic');
    } else if (step === 'code') {
      setStep('schema');
    } else if (step === 'packages') {
      setStep('code');
    }
  };

  const handleCreate = async () => {
    setError('');
    setCreating(true);

    try {
      const { data, error } = await supabase
        .from('custom_tools')
        .insert({
          user_id: userId,
          tool_name: toolName.trim(),
          tool_description: toolDescription.trim(),
          python_code: pythonCode,
          input_schema: inputSchema,
          timeout_seconds: timeoutSeconds,
          required_packages: requiredPackages,
        })
        .select()
        .single();

      if (error) throw error;
      onToolCreated(data);
    } catch (error: any) {
      setError(error.message || 'Failed to create custom tool');
      setCreating(false);
    }
  };

  const canProceed = () => {
    if (step === 'basic') {
      return nameStatus === 'available' && toolName.trim() && toolDescription.trim();
    }
    return true;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Create Custom Tool</h2>
            <p className="text-sm text-white/80 mt-1">Step {step === 'basic' ? 1 : step === 'schema' ? 2 : step === 'code' ? 3 : 4} of 4</p>
          </div>
          <button
            onClick={onClose}
            disabled={creating}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="text-red-600" size={20} />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {step === 'basic' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tool Name *
                </label>
                <input
                  type="text"
                  value={toolName}
                  onChange={(e) => setToolName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none ${
                    nameError ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="my_custom_tool"
                  maxLength={100}
                  autoFocus
                />
                {nameError && (
                  <p className="text-sm text-red-600 mt-1">{nameError}</p>
                )}
                {nameStatus === 'available' && (
                  <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                    <Check size={14} />
                    Tool name is available
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Lowercase letters, numbers, and underscores only
                </p>
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
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum execution time (1-300 seconds)
                </p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Tool Creation Wizard</p>
                    <p>You'll configure input parameters, write Python code, and select required packages in the following steps.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'schema' && (
            <InputSchemaBuilder
              schema={inputSchema}
              onChange={setInputSchema}
            />
          )}

          {step === 'code' && (
            <CodeEditor
              code={pythonCode}
              onChange={setPythonCode}
            />
          )}

          {step === 'packages' && (
            <PackageValidator
              code={pythonCode}
              selectedPackages={requiredPackages}
              onChange={setRequiredPackages}
            />
          )}
        </div>

        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3">
          {step !== 'basic' && (
            <button
              onClick={handleBack}
              disabled={creating}
              className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Back
            </button>
          )}
          <div className="flex-1"></div>
          {step !== 'packages' ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              Next
              <ArrowRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleCreate}
              disabled={creating}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {creating ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Creating...
                </>
              ) : (
                <>
                  <Check size={18} />
                  Create Tool
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}