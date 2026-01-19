// app/biz/components/agents/EditAgentFieldModal.tsx
import { useState } from 'react';
import { X, Loader2, Check } from 'lucide-react';

interface EditAgentFieldModalProps {
  field: 'display_name' | 'role' | 'goal' | 'backstory';
  currentValue: string;
  onClose: () => void;
  onSave: (field: string, value: string) => Promise<void>;
}

const FIELD_CONFIG = {
  display_name: {
    label: 'Display Name',
    maxLength: 50,
    rows: 1,
    multiline: false,
    placeholder: 'Enter agent display name',
  },
  role: {
    label: 'Role',
    maxLength: 500,
    rows: 3,
    multiline: true,
    placeholder: 'Define the role of your agent (e.g., Customer Support Specialist, Data Analyst)',
  },
  goal: {
    label: 'Goal',
    maxLength: 2000,
    rows: 6,
    multiline: true,
    placeholder: 'What is the primary goal or objective of this agent?',
  },
  backstory: {
    label: 'Backstory',
    maxLength: 5000,
    rows: 10,
    multiline: true,
    placeholder: 'Provide context and background information about this agent',
  },
};

export default function EditAgentFieldModal({ 
  field, 
  currentValue, 
  onClose, 
  onSave 
}: EditAgentFieldModalProps) {
  const [value, setValue] = useState(currentValue);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const config = FIELD_CONFIG[field];
  const remainingChars = config.maxLength - value.length;

  const handleSave = async () => {
    if (!value.trim() || saving) return;

    setSaving(true);
    try {
      await onSave(field, value.trim());
      setShowSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
    // Ctrl/Cmd + Enter to save
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Edit {config.label}</h2>
          <button
            onClick={onClose}
            disabled={saving}
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
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {config.label}
              </label>
              {config.multiline ? (
                <textarea
                  value={value}
                  onChange={(e) => setValue(e.target.value.slice(0, config.maxLength))}
                  onKeyDown={handleKeyDown}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none font-mono text-sm"
                  rows={config.rows}
                  placeholder={config.placeholder}
                  maxLength={config.maxLength}
                  autoFocus
                  disabled={saving}
                />
              ) : (
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value.slice(0, config.maxLength))}
                  onKeyDown={handleKeyDown}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder={config.placeholder}
                  maxLength={config.maxLength}
                  autoFocus
                  disabled={saving}
                />
              )}
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-500">
                  Press <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Esc</kbd> to cancel, 
                  <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs ml-1">Ctrl+Enter</kbd> to save
                </p>
                <p className={`text-sm font-medium ${
                  remainingChars < 100 ? 'text-orange-600' : 
                  remainingChars < 50 ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {remainingChars.toLocaleString()} characters remaining
                </p>
              </div>
            </div>

            {/* Preview */}
            {config.multiline && value.trim() && (
              <div className="border-t pt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Preview
                </label>
                <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{value}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !value.trim()}
            className="flex-1 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Saving...
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