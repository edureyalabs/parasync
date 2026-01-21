'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Send } from 'lucide-react';

interface NetworkAgent {
  network_id: string;
  agent_id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  role: string | null;
  goal: string | null;
  last_interaction_at: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
}

export default function MyChats() {
  const [networkAgents, setNetworkAgents] = useState<NetworkAgent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<NetworkAgent | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyNetwork();
  }, []);

  const fetchMyNetwork = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_network_agents')
        .select('*')
        .eq('user_id', user.id)
        .order('last_interaction_at', { ascending: false });

      if (error) throw error;

      setNetworkAgents(data || []);
      
      // Auto-select first agent if available
      if (data && data.length > 0 && !selectedAgent) {
        setSelectedAgent(data[0]);
      }
    } catch (error) {
      console.error('Error fetching network:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !selectedAgent) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages([...messages, newMessage]);
    setInputMessage('');

    // TODO: Send to AI agent backend and get response
    // Simulate agent response after 1 second
    setTimeout(() => {
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `This is a simulated response from ${selectedAgent.display_name}. Connect to your AI backend here.`,
        sender: 'agent',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, agentMessage]);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-600">Loading chats...</div>
      </div>
    );
  }

  if (networkAgents.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-gray-600 mb-2">No agents in your network</p>
          <p className="text-sm text-gray-500">Add agents from the Discover section</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Left Sidebar - Agent List */}
      <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Chats</h2>
        </div>

        {/* Agent List */}
        <div className="flex-1 overflow-y-auto">
          {networkAgents.map((agent) => (
            <button
              key={agent.network_id}
              onClick={() => {
                setSelectedAgent(agent);
                setMessages([]); // Clear messages when switching agents
              }}
              className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                selectedAgent?.agent_id === agent.agent_id ? 'bg-blue-50' : ''
              }`}
            >
              {/* Avatar */}
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

              {/* Info */}
              <div className="flex-1 text-left min-w-0">
                <h3 className="font-medium text-gray-900 truncate">
                  {agent.display_name}
                </h3>
                <p className="text-sm text-gray-500 truncate">
                  {agent.role || 'AI Agent'}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Side - Chat Window */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedAgent ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                {selectedAgent.avatar_url ? (
                  <img 
                    src={selectedAgent.avatar_url} 
                    alt={selectedAgent.display_name} 
                    className="w-full h-full rounded-full object-cover" 
                  />
                ) : (
                  <User size={20} />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {selectedAgent.display_name}
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedAgent.role || 'AI Agent'}
                </p>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white mx-auto mb-4">
                      {selectedAgent.avatar_url ? (
                        <img 
                          src={selectedAgent.avatar_url} 
                          alt={selectedAgent.display_name} 
                          className="w-full h-full rounded-full object-cover" 
                        />
                      ) : (
                        <User size={32} />
                      )}
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {selectedAgent.display_name}
                    </h4>
                    <p className="text-sm text-gray-500 mb-4">
                      {selectedAgent.goal || 'Start a conversation'}
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={`Message ${selectedAgent.display_name}...`}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}