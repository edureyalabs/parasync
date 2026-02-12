'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, User, CheckCircle, PlusCircle, Clock, Lock, Globe } from 'lucide-react';
import RequestAccessModal from './RequestAccessModal';

interface Agent {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  role: string | null;
  goal: string | null;
  backstory: string | null;
  bio: string | null;
  agent_type: string | null;
  is_in_network?: boolean;
  access_type?: string;
  has_pending_request?: boolean;
  has_access?: boolean;
}

export default function AgentDiscovery() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [connectingAgentId, setConnectingAgentId] = useState<string | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: publicAgents, error: agentsError } = await supabase
        .from('agents')
        .select(`
          *,
          agent_access_settings(access_type, is_discoverable)
        `)
        .eq('is_verified', true)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (agentsError) throw agentsError;

      const { data: networkData } = await supabase
        .from('my_network')
        .select('agent_id')
        .eq('user_id', user.id);

      const networkAgentIds = new Set(networkData?.map(n => n.agent_id) || []);

      const { data: requestsData } = await supabase
        .from('agent_access_requests')
        .select('agent_id, status')
        .eq('requester_user_id', user.id)
        .eq('status', 'pending');

      const pendingRequestIds = new Set(requestsData?.map(r => r.agent_id) || []);

      const { data: grantsData } = await supabase
        .from('agent_access_grants')
        .select('agent_id')
        .eq('user_id', user.id)
        .eq('is_active', true);

      const grantedAgentIds = new Set(grantsData?.map(g => g.agent_id) || []);

      const processedAgents = (publicAgents || [])
        .filter(agent => {
          const settings = agent.agent_access_settings?.[0];
          const accessType = settings?.access_type || 'public';
          const isDiscoverable = settings?.is_discoverable !== false;

          if (accessType === 'public') return true;
          if (accessType === 'private' && isDiscoverable) return true;
          if (grantedAgentIds.has(agent.id)) return true;

          return false;
        })
        .map(agent => {
          const settings = agent.agent_access_settings?.[0];
          return {
            ...agent,
            access_type: settings?.access_type || 'public',
            is_in_network: networkAgentIds.has(agent.id),
            has_pending_request: pendingRequestIds.has(agent.id),
            has_access: settings?.access_type === 'public' || grantedAgentIds.has(agent.id)
          };
        });

      setAgents(processedAgents);
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (agent: Agent) => {
    if (agent.access_type === 'private' && !agent.has_access) {
      setSelectedAgent(agent);
      setShowRequestModal(true);
      return;
    }

    try {
      setConnectingAgentId(agent.id);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('my_network')
        .insert({
          user_id: user.id,
          agent_id: agent.id
        });

      if (error) throw error;

      setAgents(agents.map(a => 
        a.id === agent.id 
          ? { ...a, is_in_network: true }
          : a
      ));
    } catch (error) {
      console.error('Error connecting to agent:', error);
    } finally {
      setConnectingAgentId(null);
    }
  };

  const handleRequestSubmitted = () => {
    fetchAgents();
    setShowRequestModal(false);
    setSelectedAgent(null);
  };

  const filteredAgents = agents.filter(agent => 
    agent.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (agent.role && agent.role.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (agent.bio && agent.bio.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-600">Loading agents...</div>
      </div>
    );
  }

  const getAgentButton = (agent: Agent) => {
    if (agent.is_in_network) {
      return (
        <div className="flex items-center gap-2 px-6 py-2 bg-green-50 text-green-700 rounded-lg font-medium">
          <CheckCircle size={18} />
          Connected
        </div>
      );
    }

    if (agent.has_pending_request) {
      return (
        <div className="flex items-center gap-2 px-6 py-2 bg-yellow-50 text-yellow-700 rounded-lg font-medium cursor-not-allowed">
          <Clock size={18} />
          Request Pending
        </div>
      );
    }

    if (agent.access_type === 'private' && !agent.has_access) {
      return (
        <button
          onClick={() => handleConnect(agent)}
          className="flex items-center gap-2 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
        >
          <Lock size={18} />
          Request Access
        </button>
      );
    }

    return (
      <button
        onClick={() => handleConnect(agent)}
        disabled={connectingAgentId === agent.id}
        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
      >
        <PlusCircle size={18} />
        {connectingAgentId === agent.id ? 'Connecting...' : 'Connect'}
      </button>
    );
  };

  const getAgentTypeBadge = (agentType: string | null) => {
    if (agentType === 'public_marketplace') {
      return <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">Paid</span>;
    }
    if (agentType === 'enterprise') {
      return <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">Free</span>;
    }
    return null;
  };

  return (
    <div className="h-full bg-gray-50">
      <div className="max-w-6xl mx-auto p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover AI Agents</h1>
          <p className="text-gray-600">Browse and connect with verified AI agents</p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filteredAgents.map((agent) => (
            <div 
              key={agent.id} 
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 flex items-center gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0">
                {agent.avatar_url ? (
                  <img 
                    src={agent.avatar_url} 
                    alt={agent.display_name} 
                    className="w-full h-full rounded-full object-cover" 
                  />
                ) : (
                  <User size={32} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {agent.display_name}
                  </h3>
                  <CheckCircle size={16} className="text-blue-500" />
                  {agent.access_type === 'private' && (
                    <span title="Private Agent">
                      <Lock size={14} className="text-orange-500" />
                    </span>
                  )}
                  {agent.access_type === 'public' && (
                    <span title="Public Agent">
                      <Globe size={14} className="text-green-500" />
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-2">@{agent.username}</p>
                <div className="flex items-center gap-2 mb-2">
                  {agent.role && (
                    <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
                      {agent.role}
                    </span>
                  )}
                  {getAgentTypeBadge(agent.agent_type)}
                </div>
                {agent.goal && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {agent.goal}
                  </p>
                )}
              </div>

              <div className="flex-shrink-0">
                {getAgentButton(agent)}
              </div>
            </div>
          ))}
        </div>

        {filteredAgents.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500">No agents found</p>
          </div>
        )}
      </div>

      {showRequestModal && selectedAgent && (
        <RequestAccessModal
          agent={selectedAgent}
          onClose={() => {
            setShowRequestModal(false);
            setSelectedAgent(null);
          }}
          onSubmit={handleRequestSubmitted}
        />
      )}
    </div>
  );
}