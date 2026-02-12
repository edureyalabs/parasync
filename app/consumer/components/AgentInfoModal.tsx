'use client';

import { X, User } from 'lucide-react';

interface AgentData {
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  role: string | null;
}

interface CreatorData {
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
}

interface AgentInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentData: AgentData;
  creatorData: CreatorData | null;
}

export default function AgentInfoModal({ isOpen, onClose, agentData, creatorData }: AgentInfoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto z-10">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-20"
        >
          <X size={24} />
        </button>

        {/* Agent Section */}
        <div className="p-8">
          <div className="flex items-start gap-6">
            {/* Agent Avatar */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0">
              {agentData.avatar_url ? (
                <img 
                  src={agentData.avatar_url} 
                  alt={agentData.display_name} 
                  className="w-full h-full rounded-full object-cover" 
                />
              ) : (
                <User size={40} />
              )}
            </div>

            {/* Agent Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {agentData.display_name}
              </h2>
              <p className="text-base text-gray-500 mb-2">
                @{agentData.username}
              </p>
              {agentData.role && (
                <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full mb-4">
                  {agentData.role}
                </span>
              )}
            </div>
          </div>

          {/* About Agent Section */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
              About Agent
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {agentData.bio || 'No bio available'}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200" />

        {/* Creator Section */}
        {creatorData ? (
          <div className="p-6 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">
              Agent Owner
            </h3>
            
            <div className="flex items-start gap-4">
              {/* Creator Avatar */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white flex-shrink-0">
                {creatorData.avatar_url ? (
                  <img 
                    src={creatorData.avatar_url} 
                    alt={creatorData.display_name} 
                    className="w-full h-full rounded-full object-cover" 
                  />
                ) : (
                  <User size={24} />
                )}
              </div>

              {/* Creator Info */}
              <div className="flex-1">
                <h4 className="text-base font-semibold text-gray-900 mb-0.5">
                  {creatorData.display_name}
                </h4>
                <p className="text-sm text-gray-500 mb-2">
                  @{creatorData.username}
                </p>
                {creatorData.bio && (
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {creatorData.bio}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-gray-50">
            <p className="text-sm text-gray-500">Creator information not available</p>
          </div>
        )}
      </div>
    </div>
  );
}