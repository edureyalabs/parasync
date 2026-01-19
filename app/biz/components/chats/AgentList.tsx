// app/biz/components/chats/AgentList.tsx
import { Bot, MessageSquare } from 'lucide-react';
import { Agent } from '../Chats';

interface AgentListProps {
  agents: Agent[];
  selectedAgent: Agent | null;
  onSelectAgent: (agent: Agent) => void;
}

export default function AgentList({ agents, selectedAgent, onSelectAgent }: AgentListProps) {
  if (agents.length === 0) {
    return (
      <div className="w-80 border-r border-gray-200 bg-gray-50 flex flex-col items-center justify-center p-8">
        <MessageSquare size={64} className="text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No agents yet</h3>
        <p className="text-gray-600 text-sm text-center">
          Create an agent in the Agents section to start chatting
        </p>
      </div>
    );
  }

  return (
    <div className="w-80 border-r border-gray-200 bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-bold text-gray-800">Your Agents</h2>
        <p className="text-xs text-gray-500 mt-1">{agents.length} agent{agents.length !== 1 ? 's' : ''} available</p>
      </div>

      {/* Agent List */}
      <div className="flex-1 overflow-y-auto">
        {agents.map((agent) => (
          <button
            key={agent.id}
            onClick={() => onSelectAgent(agent)}
            className={`w-full p-4 flex items-center gap-3 border-b border-gray-200 transition-colors ${
              selectedAgent?.id === agent.id
                ? 'bg-blue-50 border-l-4 border-l-blue-600'
                : 'hover:bg-gray-100 border-l-4 border-l-transparent'
            }`}
          >
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden flex-shrink-0">
              {agent.avatar_url ? (
                <img
                  src={agent.avatar_url}
                  alt={agent.display_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Bot size={24} className="text-white" />
              )}
            </div>

            {/* Agent Info */}
            <div className="flex-1 min-w-0 text-left">
              <h3 className="font-semibold text-gray-800 truncate">
                {agent.display_name}
              </h3>
              <p className="text-sm text-gray-500 truncate">
                @{agent.username}
              </p>
            </div>

            {/* Selected Indicator */}
            {selectedAgent?.id === agent.id && (
              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}