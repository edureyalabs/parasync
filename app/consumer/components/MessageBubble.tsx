'use client';

import { CheckCircle, Clock, XCircle, Loader } from 'lucide-react';

interface Message {
  id: string;
  message_text: string;
  sender_type: 'user' | 'agent';
  created_at: string;
  status?: string;
  error_message?: string;
  metadata?: any;
}

interface MessageBubbleProps {
  message: Message;
}

const getStatusBadge = (status?: string, senderType?: string) => {
  // Only show status for user messages
  if (senderType !== 'user' || !status) return null;

  const badges = {
    pending: { icon: Clock, text: 'Sending...', color: 'bg-yellow-100 text-yellow-700' },
    processing: { icon: Loader, text: 'Agent thinking...', color: 'bg-blue-100 text-blue-700' },
    completed: { icon: CheckCircle, text: 'Delivered', color: 'bg-green-100 text-green-700' },
    failed: { icon: XCircle, text: 'Failed', color: 'bg-red-100 text-red-700' },
  };

  const badge = badges[status as keyof typeof badges];
  if (!badge) return null;

  const Icon = badge.icon;

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${badge.color} mb-1`}>
      <Icon size={12} className={status === 'processing' ? 'animate-spin' : ''} />
      <span>{badge.text}</span>
    </div>
  );
};

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender_type === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md ${isUser ? 'text-right' : 'text-left'}`}>
        {getStatusBadge(message.status, message.sender_type)}
        <div
          className={`px-4 py-2 rounded-lg ${
            isUser
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-900 border border-gray-200'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.message_text}</p>
          {message.error_message && (
            <p className="text-xs text-red-300 mt-1">{message.error_message}</p>
          )}
        </div>
        <div className="text-xs text-gray-400 mt-1">
          {new Date(message.created_at).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );
}