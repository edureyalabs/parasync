'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, User, CheckCircle, PlusCircle } from 'lucide-react';

interface Agent {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  role: string | null;
  goal: string | null;
  backstory: string | null;
  bio: string | null;
  is_in_network?: boolean;
}

export default function AgentDiscovery() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [connectingAgentId, setConnectingAgentId] = useState<string | null>(null);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch all verified public agents
      const { data: publicAgents, error: agentsError } = await supabase
        .from('agents')
        .select('*')
        .eq('is_verified', true)
        .eq('is_public', true)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (agentsError) throw agentsError;

      // Fetch user's network
      const { data: networkData, error: networkError } = await supabase
        .from('my_network')
        .select('agent_id')
        .eq('user_id', user.id);

      if (networkError) throw networkError;

      const networkAgentIds = new Set(networkData?.map(n => n.agent_id) || []);

      // Mark agents already in network
      const agentsWithStatus = (publicAgents || []).map(agent => ({
        ...agent,
        is_in_network: networkAgentIds.has(agent.id)
      }));

      setAgents(agentsWithStatus);
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (agentId: string) => {
    try {
      setConnectingAgentId(agentId);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('my_network')
        .insert({
          user_id: user.id,
          agent_id: agentId
        });

      if (error) throw error;

      // Update local state
      setAgents(agents.map(agent => 
        agent.id === agentId 
          ? { ...agent, is_in_network: true }
          : agent
      ));
    } catch (error) {
      console.error('Error connecting to agent:', error);
    } finally {
      setConnectingAgentId(null);
    }
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

  return (
    <div className="h-full bg-gray-50">
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover AI Agents</h1>
          <p className="text-gray-600">Browse and connect with verified AI agents</p>
        </div>

        {/* Search Bar */}
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

        {/* Agents List */}
        <div className="space-y-3">
          {filteredAgents.map((agent) => (
            <div 
              key={agent.id} 
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 flex items-center gap-4"
            >
              {/* Avatar */}
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

              {/* Agent Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {agent.display_name}
                  </h3>
                  <span title="Verified">
                    <CheckCircle size={16} className="text-blue-500" />
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-2">@{agent.username}</p>
                {agent.role && (
                  <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full mb-2">
                    {agent.role}
                  </span>
                )}
                {agent.bio && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-1">
                    {agent.bio}
                  </p>
                )}
                {agent.goal && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {agent.goal}
                  </p>
                )}
              </div>

              {/* Connect Button */}
              <div className="flex-shrink-0">
                {agent.is_in_network ? (
                  <div className="flex items-center gap-2 px-6 py-2 bg-green-50 text-green-700 rounded-lg font-medium">
                    <CheckCircle size={18} />
                    Connected
                  </div>
                ) : (
                  <button
                    onClick={() => handleConnect(agent.id)}
                    disabled={connectingAgentId === agent.id}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                  >
                    <PlusCircle size={18} />
                    {connectingAgentId === agent.id ? 'Connecting...' : 'Connect'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredAgents.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500">No agents found</p>
          </div>
        )}
      </div>
    </div>
  );
}