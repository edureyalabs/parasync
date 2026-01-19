// app/biz/components/agents/CreateAgentModal.tsx
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { X, Loader2, Check, AlertCircle, Info } from 'lucide-react';
import { Agent } from '../Agents';

interface CreateAgentModalProps {
  userId: string;
  onClose: () => void;
  onAgentCreated: (agent: Agent) => void;
}

const DEFAULT_AGENT = {
  role: 'AI Assistant',
  goal: 'Help users accomplish their tasks efficiently and effectively',
  backstory: 'A versatile AI agent designed to assist with various tasks while maintaining professionalism and helpfulness.',
};

export default function CreateAgentModal({ userId, onClose, onAgentCreated }: CreateAgentModalProps) {
  const supabase = createClient();
  const [step, setStep] = useState<'name' | 'username' | 'creating'>('name');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');
  const [usernameError, setUsernameError] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  // Auto-generate username from display name
  useEffect(() => {
    if (displayName && step === 'name') {
      const generatedUsername = displayName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '')
        .slice(0, 20);
      setUsername(generatedUsername);
    }
  }, [displayName, step]);

  // Check username availability
  useEffect(() => {
    if (username && step === 'username') {
      const timeoutId = setTimeout(() => {
        checkUsernameAvailability(username);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [username, step]);

  const checkUsernameAvailability = async (usernameToCheck: string) => {
    if (!usernameToCheck || usernameToCheck.length < 3 || usernameToCheck.length > 20) {
      setUsernameStatus('idle');
      return;
    }

    setUsernameStatus('checking');
    setUsernameError('');

    try {
      const { data, error } = await supabase
        .from('agents')
        .select('username')
        .eq('username', usernameToCheck)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setUsernameStatus('unavailable');
        setUsernameError('Username is already taken');
      } else {
        setUsernameStatus('available');
      }
    } catch (error: any) {
      setUsernameStatus('unavailable');
      setUsernameError(error.message || 'Failed to check username');
    }
  };

  const handleNext = () => {
    if (step === 'name') {
      if (!displayName.trim()) {
        setError('Please enter a display name');
        return;
      }
      setError('');
      setStep('username');
    } else if (step === 'username') {
      if (usernameStatus !== 'available') {
        setError('Please choose an available username');
        return;
      }
      setError('');
      handleCreateAgent();
    }
  };

  const handleCreateAgent = async () => {
    setStep('creating');
    setCreating(true);
    setError('');

    try {
      const { data, error } = await supabase
        .from('agents')
        .insert({
          profile_id: userId,
          username,
          display_name: displayName,
          role: DEFAULT_AGENT.role,
          goal: DEFAULT_AGENT.goal,
          backstory: DEFAULT_AGENT.backstory,
        })
        .select()
        .single();

      if (error) throw error;

      onAgentCreated(data);
    } catch (error: any) {
      setError(error.message || 'Failed to create agent');
      setCreating(false);
      setStep('username');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Create AI Agent</h2>
          <button
            onClick={onClose}
            disabled={creating}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="text-red-600" size={20} />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {step === 'name' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Agent Display Name *
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., My Assistant"
                  maxLength={50}
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  This is how your agent will be displayed
                </p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-2">Default Agent Configuration</p>
                    <p className="mb-1"><strong>Role:</strong> {DEFAULT_AGENT.role}</p>
                    <p className="mb-1"><strong>Goal:</strong> {DEFAULT_AGENT.goal}</p>
                    <p><strong>Backstory:</strong> {DEFAULT_AGENT.backstory}</p>
                    <p className="mt-2 text-xs">You can customize these after creation</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'username' && (
            <div className="space-y-6">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-amber-600 mt-0.5 flex-shrink-0" size={20} />
                  <div className="text-sm text-amber-800">
                    <p className="font-semibold">Important: Username cannot be changed</p>
                    <p className="mt-1">Choose carefully - your username will be permanent once created.</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Username *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none pr-10 ${
                      usernameError ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="agent_username"
                    maxLength={20}
                    autoFocus
                  />
                  {usernameStatus === 'checking' && (
                    <Loader2 className="absolute right-3 top-3.5 animate-spin text-gray-400" size={20} />
                  )}
                  {usernameStatus === 'available' && (
                    <Check className="absolute right-3 top-3.5 text-green-600" size={20} />
                  )}
                  {usernameStatus === 'unavailable' && (
                    <AlertCircle className="absolute right-3 top-3.5 text-red-600" size={20} />
                  )}
                </div>
                {usernameError && (
                  <p className="text-sm text-red-600 mt-1">{usernameError}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  3-20 characters, lowercase letters, numbers, and underscores only
                </p>
              </div>
            </div>
          )}

          {step === 'creating' && (
            <div className="py-12 text-center">
              <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
              <p className="text-gray-600 font-medium">Creating your AI agent...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {step !== 'creating' && (
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3">
            {step === 'username' && (
              <button
                onClick={() => setStep('name')}
                className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={
                (step === 'name' && !displayName.trim()) ||
                (step === 'username' && usernameStatus !== 'available')
              }
              className="flex-1 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
            >
              {step === 'name' ? 'Next' : 'Create Agent'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}