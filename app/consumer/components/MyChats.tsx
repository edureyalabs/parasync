'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User, Send, Loader } from 'lucide-react';
import MessageBubble from './MessageBubble';
import TaskWidget from './TaskWidget';
import AgentStatusIndicator from './AgentStatusIndicator';

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
  message_text: string;
  sender_type: 'user' | 'agent';
  created_at: string;
  status?: string;
  error_message?: string;
  metadata?: any;
}

interface Task {
  id: string;
  task_name: string;
  status: 'created' | 'ongoing' | 'submitted' | 'reattempt' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  tool_name: string;
  error_message?: string;
  created_at: string;
}

interface AgentSession {
  status: 'sleeping' | 'awake' | 'working' | 'inactive';
  active_task_count: number;
  last_activity_at: string;
}

export default function MyChats() {
  const supabase = createClient();
  const [networkAgents, setNetworkAgents] = useState<NetworkAgent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<NetworkAgent | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeTasks, setActiveTasks] = useState<Task[]>([]);
  const [agentSession, setAgentSession] = useState<AgentSession | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    initializeUser();
    fetchMyNetwork();
  }, []);

  useEffect(() => {
    if (selectedAgent && userId) {
      fetchMessages();
      fetchAgentSession();
      fetchActiveTasks();
      
      const messageSubscription = subscribeToMessages();
      const taskSubscription = subscribeToTasks();
      const sessionSubscription = subscribeToAgentSession();
      
      const taskInterval = setInterval(fetchActiveTasks, 5000);
      
      return () => {
        messageSubscription();
        taskSubscription();
        sessionSubscription();
        clearInterval(taskInterval);
      };
    }
  }, [selectedAgent, userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
      
      if (data && data.length > 0 && !selectedAgent) {
        setSelectedAgent(data[0]);
      }
    } catch (error) {
      console.error('Error fetching network:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedAgent || !userId) return;

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', userId)
        .eq('agent_id', selectedAgent.agent_id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchAgentSession = async () => {
    if (!selectedAgent || !userId) return;

    try {
      const { data, error } = await supabase
        .from('agent_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('agent_id', selectedAgent.agent_id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      setAgentSession(data || { status: 'sleeping', active_task_count: 0, last_activity_at: new Date().toISOString() });
    } catch (error) {
      console.error('Error fetching agent session:', error);
    }
  };

  const fetchActiveTasks = async () => {
    if (!selectedAgent || !userId) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .eq('agent_id', selectedAgent.agent_id)
        .in('status', ['created', 'ongoing', 'submitted', 'reattempt'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      setActiveTasks(data || []);
    } catch (error) {
      console.error('Error fetching active tasks:', error);
    }
  };

  const subscribeToMessages = () => {
    if (!selectedAgent || !userId) return () => {};

    const channel = supabase
      .channel(`messages:${userId}:${selectedAgent.agent_id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
          filter: `user_id=eq.${userId},agent_id=eq.${selectedAgent.agent_id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMessages((prev) => [...prev, payload.new as Message]);
          } else if (payload.eventType === 'UPDATE') {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === payload.new.id ? (payload.new as Message) : msg
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const subscribeToTasks = () => {
    if (!selectedAgent || !userId) return () => {};

    const channel = supabase
      .channel(`tasks:${userId}:${selectedAgent.agent_id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${userId},agent_id=eq.${selectedAgent.agent_id}`
        },
        () => {
          fetchActiveTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const subscribeToAgentSession = () => {
    if (!selectedAgent || !userId) return () => {};

    const channel = supabase
      .channel(`session:${userId}:${selectedAgent.agent_id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agent_sessions',
          filter: `user_id=eq.${userId},agent_id=eq.${selectedAgent.agent_id}`
        },
        (payload) => {
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            setAgentSession(payload.new as AgentSession);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedAgent || !userId || sending) return;

    try {
      setSending(true);

      const { error } = await supabase
        .from('chat_messages')
        .insert({
          user_id: userId,
          agent_id: selectedAgent.agent_id,
          message_text: inputMessage,
          sender_type: 'user',
          status: 'pending'
        });

      if (error) throw error;

      setInputMessage('');
      
    } catch (error: any) {
      console.error('Error sending message:', error);
      alert(error.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
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
      <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Chats</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {networkAgents.map((agent) => (
            <button
              key={agent.network_id}
              onClick={() => {
                setSelectedAgent(agent);
                setMessages([]);
                setActiveTasks([]);
                setAgentSession(null);
              }}
              className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                selectedAgent?.agent_id === agent.agent_id ? 'bg-blue-50' : ''
              }`}
            >
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

      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedAgent ? (
          <>
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center gap-3">
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
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {selectedAgent.display_name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-500">
                      {selectedAgent.role || 'AI Agent'}
                    </p>
                    {agentSession && (
                      <>
                        <span className="text-gray-300">•</span>
                        <AgentStatusIndicator 
                          status={agentSession.status} 
                          activeTaskCount={agentSession.active_task_count}
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {activeTasks.length > 0 && (
              <TaskWidget tasks={activeTasks} />
            )}

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
                <>
                  {messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={`Message ${selectedAgent.display_name}...`}
                  disabled={sending}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || sending}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {sending ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
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
