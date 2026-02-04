'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Send, Loader, Clock, CheckCircle, XCircle, PlayCircle } from 'lucide-react';
import MessageBubble from './MessageBubble';

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
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  tool_name: string;
  result?: any;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

interface ActiveTask {
  id: string;
  name: string;
  status: string;
  progress: number;
  created_at: string;
}



export default function MyChats() {
  const [networkAgents, setNetworkAgents] = useState<NetworkAgent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<NetworkAgent | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [activeTasks, setActiveTasks] = useState<ActiveTask[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    initializeUser();
    fetchMyNetwork();
  }, []);

  useEffect(() => {
    if (selectedAgent && userId) {
      fetchMessages();
      fetchTasks();
      const unsubscribe = subscribeToMessages();
      const taskInterval = setInterval(fetchTasks, 5000);
      return () => {
        unsubscribe();
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
      const { data: messagesData, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', userId)
        .eq('agent_id', selectedAgent.agent_id)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      const formattedMessages: Message[] = messagesData.map((msg: any) => ({
        id: msg.id,
        message_text: msg.message_text,
        sender_type: msg.sender_type,
        created_at: msg.created_at,
        status: msg.status,
        error_message: msg.error_message,
        metadata: msg.metadata
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchTasks = async () => {
  if (!selectedAgent || !userId) return;

  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('agent_id', selectedAgent.agent_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const running = data?.filter(t => t.status === 'running') || [];
    const active = running.map(task => ({
      id: task.id,
      name: task.task_name,
      status: task.status,
      progress: task.progress,
      created_at: task.created_at
    }));

    setActiveTasks(active);
    setAllTasks(data || []);
  } catch (error) {
    console.error('Error fetching tasks:', error);
  }
};

  const subscribeToMessages = () => {
    if (!selectedAgent || !userId) return () => {};

    const channel = supabase
      .channel(`messages:${userId}:${selectedAgent.agent_id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `user_id=eq.${userId},agent_id=eq.${selectedAgent.agent_id}`
        },
        (payload) => {
          const newMessage: Message = {
            id: payload.new.id,
            message_text: payload.new.message_text,
            sender_type: payload.new.sender_type,
            created_at: payload.new.created_at,
            status: payload.new.status,
            error_message: payload.new.error_message,
            metadata: payload.new.metadata
          };

          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `user_id=eq.${userId},agent_id=eq.${selectedAgent.agent_id}`
        },
        (payload) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === payload.new.id
                ? {
                    ...msg,
                    status: payload.new.status,
                    error_message: payload.new.error_message,
                    metadata: payload.new.metadata
                  }
                : msg
            )
          );
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

    // Just insert to Supabase with pending status
    // The database trigger will handle the rest
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        user_id: userId,
        agent_id: selectedAgent.agent_id,
        message_text: inputMessage,
        sender_type: 'user',
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    setInputMessage('');
    
  } catch (error: any) {
    console.error('Error sending message:', error);
    alert(error.message || 'Failed to send message');
  } finally {
    setSending(false);
  }
};

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <PlayCircle className="text-blue-500 animate-pulse" size={16} />;
      case 'completed':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'failed':
        return <XCircle className="text-red-500" size={16} />;
      default:
        return <Clock className="text-yellow-500" size={16} />;
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
                setAllTasks([]);
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
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {selectedAgent.display_name}
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedAgent.role || 'AI Agent'}
                </p>
              </div>
              {activeTasks.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                  <PlayCircle size={14} className="animate-pulse" />
                  {activeTasks.length} active task{activeTasks.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>

            {activeTasks.length > 0 && (
              <div className="bg-white border-b border-gray-200 p-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Active Tasks</h4>
                <div className="space-y-2">
                  {activeTasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                      {getStatusIcon(task.status)}
                      <span className="text-sm font-medium text-gray-700 flex-1 truncate">
                        {task.name}
                      </span>
                      <span className="text-xs text-gray-500">{task.progress}%</span>
                    </div>
                  ))}
                </div>
              </div>
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