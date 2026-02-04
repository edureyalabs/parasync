// app/biz/components/custom-tools/CodeEditor.tsx
import { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Info } from 'lucide-react';

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
}

export default function CodeEditor({ code, onChange }: CodeEditorProps) {
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Python Code Requirements</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Function must be named <code className="bg-blue-100 px-1 rounded">execute_tool</code></li>
              <li>Must accept <code className="bg-blue-100 px-1 rounded">params: Dict[str, Any]</code></li>
              <li>Must return <code className="bg-blue-100 px-1 rounded">Dict[str, Any]</code> with 'result' key</li>
              <li>Code will be syntax validated before saving</li>
            </ul>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Python Code
        </label>
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <Editor
            height="500px"
            defaultLanguage="python"
            value={code}
            onChange={(value) => onChange(value || '')}
            onMount={handleEditorDidMount}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 4,
              wordWrap: 'on',
            }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Code size: {new Blob([code]).size.toLocaleString()} / 512,000 bytes
        </p>
      </div>

      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm text-amber-800">
          <strong>Note:</strong> Code will be tested before saving. Ensure your function handles errors gracefully.
        </p>
      </div>
    </div>
  );
}