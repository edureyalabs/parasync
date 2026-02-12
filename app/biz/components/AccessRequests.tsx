'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2, User, Check, X, Clock } from 'lucide-react';

interface AccessRequestsProps {
  userId: string;
}

interface AccessRequest {
  id: string;
  agent_id: string;
  requester_user_id: string;
  status: string;
  request_message: string;
  response_message: string | null;
  requested_at: string;
  responded_at: string | null;
  agent: {
    display_name: string;
    username: string;
  };
  requester: {
    username: string;
    display_name: string;
    avatar_url: string | null;
  };
}

export default function AccessRequests({ userId }: AccessRequestsProps) {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();

    const channel = supabase
      .channel('access_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agent_access_requests'
        },
        () => {
          loadRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeTab]);

  const loadRequests = async () => {
    try {
      setLoading(true);

      const { data: agentIds } = await supabase
        .from('agents')
        .select('id')
        .eq('profile_id', userId);

      if (!agentIds || agentIds.length === 0) {
        setRequests([]);
        return;
      }

      const ids = agentIds.map(a => a.id);

      const query = supabase
        .from('agent_access_requests')
        .select(`
          *,
          agent:agents(display_name, username),
          requester:profiles!agent_access_requests_requester_user_id_fkey(username, display_name, avatar_url)
        `)
        .in('agent_id', ids)
        .order('requested_at', { ascending: false });

      if (activeTab === 'pending') {
        query.eq('status', 'pending');
      } else {
        query.in('status', ['approved', 'rejected']);
      }

      const { data, error } = await query;

      if (error) throw error;

      setRequests(data || []);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (requestId: string, status: 'approved' | 'rejected', responseMessage: string = '') => {
    setResponding(requestId);

    try {
      const { error } = await supabase.rpc('respond_to_access_request', {
        p_request_id: requestId,
        p_status: status,
        p_response_message: responseMessage,
        p_responded_by: userId
      });

      if (error) throw error;

      await loadRequests();
    } catch (error: any) {
      console.error('Error responding to request:', error);
      alert(error.message || 'Failed to respond to request');
    } finally {
      setResponding(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Access Requests</h1>
        <p className="text-gray-600 mt-1">Manage who can connect to your private agents</p>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'pending'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Pending
              {requests.length > 0 && activeTab === 'pending' && (
                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs">
                  {requests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'history'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              History
            </button>
          </nav>
        </div>

        <div className="p-6">
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <Clock size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {activeTab === 'pending' ? 'No pending requests' : 'No history yet'}
              </h3>
              <p className="text-gray-600">
                {activeTab === 'pending'
                  ? 'Access requests will appear here when users request access to your private agents'
                  : 'Approved and rejected requests will appear here'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0">
                      {request.requester?.avatar_url ? (
                        <img
                          src={request.requester.avatar_url}
                          alt={request.requester.display_name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User size={24} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {request.requester?.display_name || 'Unknown User'}
                          </h4>
                          <p className="text-sm text-gray-500">
                            @{request.requester?.username || 'unknown'}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {formatDate(request.requested_at)}
                        </span>
                      </div>

                      <div className="mb-2">
                        <span className="text-sm text-gray-600">
                          Requesting access to{' '}
                          <span className="font-semibold text-gray-900">
                            {request.agent?.display_name}
                          </span>
                        </span>
                      </div>

                      {request.request_message && (
                        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">{request.request_message}</p>
                        </div>
                      )}

                      {request.status === 'pending' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRespond(request.id, 'approved')}
                            disabled={responding === request.id}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm disabled:opacity-50"
                          >
                            {responding === request.id ? (
                              <Loader2 className="animate-spin" size={16} />
                            ) : (
                              <Check size={16} />
                            )}
                            Approve
                          </button>
                          <button
                            onClick={() => handleRespond(request.id, 'rejected', 'Access denied')}
                            disabled={responding === request.id}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm disabled:opacity-50"
                          >
                            <X size={16} />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              request.status === 'approved'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {request.status === 'approved' ? 'Approved' : 'Rejected'}
                          </span>
                          {request.responded_at && (
                            <span className="text-xs text-gray-500">
                              on {new Date(request.responded_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}