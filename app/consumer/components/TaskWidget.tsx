'use client';

import { Clock, CheckCircle, XCircle, AlertCircle, Loader, Play } from 'lucide-react';

interface Task {
  id: string;
  task_name: string;
  status: 'created' | 'ongoing' | 'submitted' | 'reattempt' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  created_at: string;
  tool_name: string;
  error_message?: string;
}

interface TaskWidgetProps {
  tasks: Task[];
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'ongoing':
      return <Play className="text-blue-500 animate-pulse" size={16} />;
    case 'submitted':
      return <Clock className="text-yellow-500" size={16} />;
    case 'reattempt':
      return <AlertCircle className="text-orange-500" size={16} />;
    case 'completed':
      return <CheckCircle className="text-green-500" size={16} />;
    case 'failed':
      return <XCircle className="text-red-500" size={16} />;
    case 'cancelled':
      return <XCircle className="text-gray-500" size={16} />;
    default:
      return <Clock className="text-gray-400" size={16} />;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'created':
      return 'Starting...';
    case 'ongoing':
      return 'In Progress';
    case 'submitted':
      return 'Reviewing';
    case 'reattempt':
      return 'Retrying';
    case 'completed':
      return 'Completed';
    case 'failed':
      return 'Failed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'ongoing':
      return 'bg-blue-50 border-blue-200';
    case 'submitted':
      return 'bg-yellow-50 border-yellow-200';
    case 'reattempt':
      return 'bg-orange-50 border-orange-200';
    case 'completed':
      return 'bg-green-50 border-green-200';
    case 'failed':
      return 'bg-red-50 border-red-200';
    default:
      return 'bg-gray-50 border-gray-200';
  }
};

export default function TaskWidget({ tasks }: TaskWidgetProps) {
  if (tasks.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="px-4 py-3">
        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
          Active Tasks ({tasks.length})
        </h4>
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`rounded-lg border p-3 transition-all ${getStatusColor(task.status)}`}
            >
              <div className="flex items-start gap-2">
                <div className="mt-0.5">
                  {getStatusIcon(task.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {task.task_name}
                    </p>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {getStatusText(task.status)}
                    </span>
                  </div>
                  
                  {task.status === 'ongoing' && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{task.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {task.error_message && (
                    <p className="text-xs text-red-600 mt-1">
                      {task.error_message}
                    </p>
                  )}

                  <p className="text-xs text-gray-500 mt-1">
                    Tool: {task.tool_name}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}