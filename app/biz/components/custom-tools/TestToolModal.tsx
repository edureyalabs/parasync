// app/biz/components/custom-tools/TestToolModal.tsx
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { X, Loader2, Play, CheckCircle, AlertCircle } from 'lucide-react';
import { CustomTool } from '../CustomTools';

interface TestToolModalProps {
  tool: CustomTool;
  onClose: () => void;
  onTestComplete: () => void;
}

export default function TestToolModal({ tool, onClose, onTestComplete }: TestToolModalProps) {
  const supabase = createClient();
  const [inputValues, setInputValues] = useState<Record<string, any>>({});
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const handleInputChange = (paramName: string, value: any, type: string) => {
    let parsedValue = value;
    
    if (type === 'number') {
      parsedValue = parseFloat(value) || 0;
    } else if (type === 'boolean') {
      parsedValue = value === 'true';
    } else if (type === 'object' || type === 'array') {
      try {
        parsedValue = JSON.parse(value);
      } catch {
        parsedValue = value;
      }
    }
    
    setInputValues({ ...inputValues, [paramName]: parsedValue });
  };

  const handleTest = async () => {
    setTesting(true);
    setResult(null);
    setError('');

    try {
      const response = await fetch('/biz/api/tools/test-custom-tool', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tool_id: tool.id,
          params: inputValues,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Test failed');
      }

      setResult(data.result);
      
      await supabase
        .from('custom_tools')
        .update({ last_tested_at: new Date().toISOString() })
        .eq('id', tool.id);

      onTestComplete();
    } catch (err: any) {
      setError(err.message || 'Test execution failed');
    } finally {
      setTesting(false);
    }
  };

  const properties = tool.input_schema.properties || {};
  const required = tool.input_schema.required || [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Test Tool</h2>
            <p className="text-sm text-white/80 mt-1">{tool.tool_name}</p>
          </div>
          <button
            onClick={onClose}
            disabled={testing}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Input Parameters</h3>
            {Object.keys(properties).length === 0 ? (
              <p className="text-sm text-gray-500">No input parameters required</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(properties).map(([name, schema]: [string, any]) => (
                  <div key={name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {name}
                      {required.includes(name) && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <p className="text-xs text-gray-500 mb-1">{schema.description}</p>
                    
                    {schema.type === 'boolean' ? (
                      <select
                        value={inputValues[name]?.toString() || 'false'}
                        onChange={(e) => handleInputChange(name, e.target.value, schema.type)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                      >
                        <option value="true">True</option>
                        <option value="false">False</option>
                      </select>
                    ) : schema.type === 'object' || schema.type === 'array' ? (
                      <textarea
                        value={typeof inputValues[name] === 'object' ? JSON.stringify(inputValues[name], null, 2) : inputValues[name] || ''}
                        onChange={(e) => handleInputChange(name, e.target.value, schema.type)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none font-mono text-sm"
                        rows={3}
                        placeholder={schema.type === 'object' ? '{"key": "value"}' : '["item1", "item2"]'}
                      />
                    ) : (
                      <input
                        type={schema.type === 'number' ? 'number' : 'text'}
                        value={inputValues[name] || ''}
                        onChange={(e) => handleInputChange(name, e.target.value, schema.type)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                        placeholder={`Enter ${schema.type}`}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {result && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-2 mb-2">
                <CheckCircle className="text-green-600 mt-0.5" size={20} />
                <h3 className="text-sm font-semibold text-green-800">Test Successful</h3>
              </div>
              <pre className="text-xs text-green-900 font-mono overflow-auto max-h-48 bg-white p-3 rounded border border-green-200">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="text-red-600 mt-0.5" size={20} />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-red-800 mb-1">Test Failed</h3>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            disabled={testing}
            className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Close
          </button>
          <button
            onClick={handleTest}
            disabled={testing}
            className="flex-1 px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {testing ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Testing...
              </>
            ) : (
              <>
                <Play size={18} />
                Run Test
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}