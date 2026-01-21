'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { sendChatMessage, createTask, listTasks, Task } from '@/lib/api';
import { User, Send, Loader } from 'lucide-react';
import TaskDropdown from './TaskDropdown';
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
  task_id?: string;
  task_status?: string;
}

export default function MyChats() {
  const [networkAgents, setNetworkAgents] = useState<NetworkAgent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<NetworkAgent | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showTaskDropdown, setShowTaskDropdown] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
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
      subscribeToMessages();
      subscribeToTasks();
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
        .select('*, tasks(status)')
        .eq('user_id', userId)
        .eq('agent_id', selectedAgent.agent_id)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      const formattedMessages = messagesData.map((msg: any) => ({
        id: msg.id,
        message_text: msg.message_text,
        sender_type: msg.sender_type,
        created_at: msg.created_at,
        task_id: msg.task_id,
        task_status: msg.tasks?.status
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const subscribeToMessages = () => {
    if (!selectedAgent || !userId) return;

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
        async (payload) => {
          console.log('New message received:', payload);
          
          let taskStatus = null;
          if (payload.new.task_id) {
            const { data: taskData } = await supabase
              .from('tasks')
              .select('status')
              .eq('id', payload.new.task_id)
              .single();
            taskStatus = taskData?.status;
          }

          const newMessage = {
            id: payload.new.id,
            message_text: payload.new.message_text,
            sender_type: payload.new.sender_type,
            created_at: payload.new.created_at,
            task_id: payload.new.task_id,
            task_status: taskStatus
          };

          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const subscribeToTasks = () => {
    if (!selectedAgent || !userId) return;

    const channel = supabase
      .channel(`tasks:${userId}:${selectedAgent.agent_id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${userId},agent_id=eq.${selectedAgent.agent_id}`
        },
        (payload) => {
          console.log('Task updated:', payload);
          
          setMessages((prev) =>
            prev.map((msg) =>
              msg.task_id === payload.new.id
                ? { ...msg, task_status: payload.new.status }
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

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputMessage(value);

    if (value.endsWith('#') && selectedAgent) {
      try {
        const response = await listTasks({
          user_id: userId,
          agent_id: selectedAgent.agent_id,
          limit: 10
        });
        
        setTasks(response.tasks);
        
        const inputRect = inputRef.current?.getBoundingClientRect();
        if (inputRect) {
          setDropdownPosition({
            top: inputRect.top - 320,
            left: inputRect.left
          });
        }
        
        setShowTaskDropdown(true);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    } else {
      setShowTaskDropdown(false);
    }
  };

  const handleTaskSelect = (task: Task) => {
    const messageWithoutHash = inputMessage.slice(0, -1);
    setInputMessage(`${messageWithoutHash}[Task: ${task.title}]`);
    setShowTaskDropdown(false);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedAgent || !userId || sending) return;

    const isTaskCreation = inputMessage.trim().startsWith('/create');

    try {
      setSending(true);

      if (isTaskCreation) {
        await createTask({
          user_id: userId,
          agent_id: selectedAgent.agent_id,
          message: inputMessage
        });
      } else {
        await sendChatMessage({
          user_id: userId,
          agent_id: selectedAgent.agent_id,
          message: inputMessage
        });
      }

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

      <div className="flex-1 flex flex-col bg-gray-50 relative">
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
              <div>
                <h3 className="font-semibold text-gray-900">
                  {selectedAgent.display_name}
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedAgent.role || 'AI Agent'}
                </p>
              </div>
            </div>

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
                    <p className="text-xs text-gray-400">
                      Type /create to assign a task
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
                  onChange={handleInputChange}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={`Message ${selectedAgent.display_name}... (type /create for tasks, # for task list)`}
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

        {showTaskDropdown && (
          <TaskDropdown
            tasks={tasks}
            onSelectTask={handleTaskSelect}
            position={dropdownPosition}
          />
        )}
      </div>
    </div>
  );
}
