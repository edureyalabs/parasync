'use client';

interface AgentStatusIndicatorProps {
  status: 'sleeping' | 'awake' | 'working' | 'inactive';
  activeTaskCount?: number;
}

export default function AgentStatusIndicator({ status, activeTaskCount = 0 }: AgentStatusIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'awake':
        return {
          color: 'bg-green-500',
          text: 'Active',
          textColor: 'text-green-700'
        };
      case 'working':
        return {
          color: 'bg-blue-500',
          text: `Working (${activeTaskCount} ${activeTaskCount === 1 ? 'task' : 'tasks'})`,
          textColor: 'text-blue-700',
          pulse: true
        };
      case 'sleeping':
        return {
          color: 'bg-gray-400',
          text: 'Idle',
          textColor: 'text-gray-600'
        };
      case 'inactive':
        return {
          color: 'bg-red-500',
          text: 'Offline',
          textColor: 'text-red-700'
        };
      default:
        return {
          color: 'bg-gray-400',
          text: 'Unknown',
          textColor: 'text-gray-600'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className={`w-2 h-2 rounded-full ${config.color}`} />
        {config.pulse && (
          <div className={`absolute inset-0 w-2 h-2 rounded-full ${config.color} animate-ping opacity-75`} />
        )}
      </div>
      <span className={`text-xs font-medium ${config.textColor}`}>
        {config.text}
      </span>
    </div>
  );
}