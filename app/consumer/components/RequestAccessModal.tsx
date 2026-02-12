'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Loader2, Send, User } from 'lucide-react';

interface RequestAccessModalProps {
  agent: {
    id: string;
    display_name: string;
    username: string;
    avatar_url: string | null;
  };
  onClose: () => void;
  onSubmit: () => void;
}

export default function RequestAccessModal({ agent, onClose, onSubmit }: RequestAccessModalProps) {
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (message.trim().length < 10) {
      setError('Please provide a reason (at least 10 characters)');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: rpcError } = await supabase.rpc('request_agent_access', {
        p_agent_id: agent.id,
        p_requester_user_id: user.id,
        p_request_message: message.trim()
      });

      if (rpcError) throw rpcError;

      onSubmit();
    } catch (error: any) {
      setError(error.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Request Access</h2>
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0">
              {agent.avatar_url ? (
                <img
                  src={agent.avatar_url}
                  alt={agent.display_name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User size={24} />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{agent.display_name}</h3>
              <p className="text-sm text-gray-500">@{agent.username}</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Why do you want access? (Optional but recommended)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 500))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              rows={4}
              placeholder="Tell the agent creator why you'd like to connect..."
              maxLength={500}
              disabled={submitting}
            />
            <p className="text-xs text-gray-500 mt-1">
              {message.length}/500 characters
            </p>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
            Your request will be sent to the agent creator. They'll review and respond to your request.
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Sending...
              </>
            ) : (
              <>
                <Send size={18} />
                Send Request
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}