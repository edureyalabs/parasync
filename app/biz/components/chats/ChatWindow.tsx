// app/biz/components/chats/ChatWindow.tsx
import { useState } from 'react';
import { Bot, Send, MessageSquare } from 'lucide-react';
import { Agent } from '../Chats';

interface ChatWindowProps {
  selectedAgent: Agent | null;
  userId: string;
}

export default function ChatWindow({ selectedAgent, userId }: ChatWindowProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!message.trim() || !selectedAgent) return;
    
    // TODO: Implement API call to backend agent orchestration
    console.log('Sending message to agent:', selectedAgent.id, 'Message:', message);
    
    // Clear input after sending
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!selectedAgent) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
        <MessageSquare size={80} className="text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Select an agent to start chatting
        </h3>
        <p className="text-gray-600 text-sm">
          Choose an agent from the list to begin your conversation
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          {/* Agent Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
            {selectedAgent.avatar_url ? (
              <img
                src={selectedAgent.avatar_url}
                alt={selectedAgent.display_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Bot size={20} className="text-white" />
            )}
          </div>

          {/* Agent Info */}
          <div className="flex-1">
            <h2 className="font-bold text-gray-800">{selectedAgent.display_name}</h2>
            <p className="text-xs text-gray-500">@{selectedAgent.username}</p>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-500">Active</span>
          </div>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
        {/* Empty State */}
        <div className="flex flex-col items-center justify-center h-full">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
            {selectedAgent.avatar_url ? (
              <img
                src={selectedAgent.avatar_url}
                alt={selectedAgent.display_name}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <Bot size={32} className="text-white" />
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            Chat with {selectedAgent.display_name}
          </h3>
          <p className="text-sm text-gray-600 text-center max-w-md">
            Start a conversation with your AI agent. Messages will appear here.
          </p>
        </div>

        {/* TODO: Message bubbles will be rendered here */}
      </div>

      {/* Message Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${selectedAgent.display_name}...`}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none min-h-[52px] max-h-32"
              rows={1}
              style={{
                height: 'auto',
                minHeight: '52px',
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
              }}
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-400">
              Press Enter to send, Shift+Enter for new line
            </div>
          </div>

          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center gap-2 h-[52px]"
          >
            <Send size={18} />
            Send
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-2 text-center">
          Your conversation with {selectedAgent.display_name} is private and secure
        </p>
      </div>
    </div>
  );
}