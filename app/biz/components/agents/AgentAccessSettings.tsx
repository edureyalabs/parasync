'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { X, Loader2, Check, Globe, Lock } from 'lucide-react';
import { Agent } from '../Agents';

interface AgentAccessSettingsProps {
  agent: Agent;
  onClose: () => void;
  onUpdate: (updatedAgent: Agent) => void;
}

export default function AgentAccessSettings({ agent, onClose, onUpdate }: AgentAccessSettingsProps) {
  const supabase = createClient();
  const [accessType, setAccessType] = useState<'public' | 'private'>('public');
  const [agentType, setAgentType] = useState<'self' | 'enterprise' | 'public_marketplace'>('self');
  const [isDiscoverable, setIsDiscoverable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: accessSettings } = await supabase
        .from('agent_access_settings')
        .select('*')
        .eq('agent_id', agent.id)
        .single();

      if (accessSettings) {
        setAccessType(accessSettings.access_type);
        setIsDiscoverable(accessSettings.is_discoverable);
      }

      const { data: agentData } = await supabase
        .from('agents')
        .select('agent_type')
        .eq('id', agent.id)
        .single();

      if (agentData?.agent_type) {
        setAgentType(agentData.agent_type);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      const { error: rpcError } = await supabase.rpc('set_agent_access_type', {
        p_agent_id: agent.id,
        p_access_type: accessType,
        p_is_discoverable: isDiscoverable
      });

      if (rpcError) throw rpcError;

      const { error: updateError } = await supabase
        .from('agents')
        .update({ agent_type: agentType })
        .eq('id', agent.id);

      if (updateError) throw updateError;

      onUpdate({ ...agent, agent_type: agentType } as Agent);
      onClose();
    } catch (error: any) {
      setError(error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Access & Type Settings</h2>
            <p className="text-sm text-white/80 mt-1">{agent.display_name}</p>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Access Type
            </label>
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                style={{ borderColor: accessType === 'public' ? '#3b82f6' : '#e5e7eb' }}>
                <input
                  type="radio"
                  name="accessType"
                  value="public"
                  checked={accessType === 'public'}
                  onChange={(e) => setAccessType(e.target.value as 'public')}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Globe size={18} className="text-blue-600" />
                    <span className="font-semibold text-gray-900">Public</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Anyone can connect to this agent instantly without approval
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                style={{ borderColor: accessType === 'private' ? '#3b82f6' : '#e5e7eb' }}>
                <input
                  type="radio"
                  name="accessType"
                  value="private"
                  checked={accessType === 'private'}
                  onChange={(e) => setAccessType(e.target.value as 'private')}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Lock size={18} className="text-orange-600" />
                    <span className="font-semibold text-gray-900">Private</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Users must request access and you approve each request
                  </p>
                </div>
              </label>
            </div>

            {accessType === 'private' && (
              <div className="mt-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isDiscoverable}
                    onChange={(e) => setIsDiscoverable(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">
                    Show in public discovery (users can find and request access)
                  </span>
                </label>
              </div>
            )}
          </div>

          <div className="border-t pt-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Agent Type
            </label>
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                style={{ borderColor: agentType === 'self' ? '#3b82f6' : '#e5e7eb' }}>
                <input
                  type="radio"
                  name="agentType"
                  value="self"
                  checked={agentType === 'self'}
                  onChange={(e) => setAgentType(e.target.value as any)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <span className="font-semibold text-gray-900 block mb-1">Self Use</span>
                  <p className="text-sm text-gray-600">
                    You pay for your own usage. Agent for personal use only.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                style={{ borderColor: agentType === 'enterprise' ? '#3b82f6' : '#e5e7eb' }}>
                <input
                  type="radio"
                  name="agentType"
                  value="enterprise"
                  checked={agentType === 'enterprise'}
                  onChange={(e) => setAgentType(e.target.value as any)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <span className="font-semibold text-gray-900 block mb-1">Enterprise (Free for Users)</span>
                  <p className="text-sm text-gray-600">
                    You pay for all user usage. Users connect for free.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                style={{ borderColor: agentType === 'public_marketplace' ? '#3b82f6' : '#e5e7eb' }}>
                <input
                  type="radio"
                  name="agentType"
                  value="public_marketplace"
                  checked={agentType === 'public_marketplace'}
                  onChange={(e) => setAgentType(e.target.value as any)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <span className="font-semibold text-gray-900 block mb-1">Marketplace (Paid)</span>
                  <p className="text-sm text-gray-600">
                    Users pay for their own usage. You earn 15% revenue share.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Saving...
              </>
            ) : (
              <>
                <Check size={18} />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}