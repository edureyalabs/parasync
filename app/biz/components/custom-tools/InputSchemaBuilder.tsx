// app/biz/components/custom-tools/InputSchemaBuilder.tsx
import { useState } from 'react';
import { Plus, Trash2, Info } from 'lucide-react';

interface InputSchemaBuilderProps {
  schema: Record<string, any>;
  onChange: (schema: Record<string, any>) => void;
}

interface Parameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required: boolean;
}

export default function InputSchemaBuilder({ schema, onChange }: InputSchemaBuilderProps) {
  const [parameters, setParameters] = useState<Parameter[]>(() => {
    const props = schema.properties || {};
    const required = schema.required || [];
    
    return Object.keys(props).map(name => ({
      name,
      type: props[name].type,
      description: props[name].description || '',
      required: required.includes(name)
    }));
  });

  const addParameter = () => {
    setParameters([...parameters, {
      name: '',
      type: 'string',
      description: '',
      required: false
    }]);
  };

  const removeParameter = (index: number) => {
    const updated = parameters.filter((_, i) => i !== index);
    setParameters(updated);
    updateSchema(updated);
  };

  const updateParameter = (index: number, field: keyof Parameter, value: any) => {
    const updated = [...parameters];
    updated[index] = { ...updated[index], [field]: value };
    setParameters(updated);
    updateSchema(updated);
  };

  const updateSchema = (params: Parameter[]) => {
    const properties: Record<string, any> = {};
    const required: string[] = [];

    params.forEach(param => {
      if (param.name.trim()) {
        properties[param.name] = {
          type: param.type,
          description: param.description
        };
        if (param.required) {
          required.push(param.name);
        }
      }
    });

    onChange({
      type: 'object',
      properties,
      required
    });
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Define Input Parameters</p>
            <p>Specify what parameters your tool accepts. These will be passed to your execute_tool function as a dictionary.</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-700">
          Input Parameters
        </label>
        <button
          type="button"
          onClick={addParameter}
          className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1 font-medium"
        >
          <Plus size={16} />
          Add Parameter
        </button>
      </div>

      {parameters.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-3">No parameters defined yet</p>
          <button
            onClick={addParameter}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
          >
            Add First Parameter
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {parameters.map((param, index) => (
            <div key={index} className="p-4 border border-gray-300 rounded-lg space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Parameter Name *
                  </label>
                  <input
                    type="text"
                    value={param.name}
                    onChange={(e) => updateParameter(index, 'name', e.target.value.replace(/[^a-z0-9_]/g, ''))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
                    placeholder="param_name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Type *
                  </label>
                  <select
                    value={param.type}
                    onChange={(e) => updateParameter(index, 'type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
                  >
                    <option value="string">String</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                    <option value="object">Object</option>
                    <option value="array">Array</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  value={param.description}
                  onChange={(e) => updateParameter(index, 'description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
                  placeholder="Describe this parameter"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={param.required}
                    onChange={(e) => updateParameter(index, 'required', e.target.checked)}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">Required parameter</span>
                </label>
                <button
                  type="button"
                  onClick={() => removeParameter(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xs font-semibold text-gray-600 mb-2">Preview (JSON Schema)</p>
        <pre className="text-xs text-gray-800 font-mono overflow-auto max-h-32">
          {JSON.stringify(schema, null, 2)}
        </pre>
      </div>
    </div>
  );
}