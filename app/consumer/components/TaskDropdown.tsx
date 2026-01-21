'use client';

import { useState, useEffect, useRef } from 'react';
import { Task } from '@/lib/api';
import { CheckCircle, Clock, XCircle, Loader } from 'lucide-react';

interface TaskDropdownProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  position: { top: number; left: number };
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle size={14} className="text-green-500" />;
    case 'running':
      return <Loader size={14} className="text-blue-500 animate-spin" />;
    case 'pending':
      return <Clock size={14} className="text-yellow-500" />;
    case 'failed':
      return <XCircle size={14} className="text-red-500" />;
    default:
      return null;
  }
};

export default function TaskDropdown({ tasks, onSelectTask, position }: TaskDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  if (tasks.length === 0) {
    return (
      <div
        ref={dropdownRef}
        style={{ top: position.top, left: position.left }}
        className="absolute z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-2 min-w-[300px]"
      >
        <div className="text-sm text-gray-500 p-2">No tasks found</div>
      </div>
    );
  }

  return (
    <div
      ref={dropdownRef}
      style={{ top: position.top, left: position.left }}
      className="absolute z-50 bg-white border border-gray-300 rounded-lg shadow-lg max-h-[300px] overflow-y-auto min-w-[300px]"
    >
      {tasks.map((task) => (
        <button
          key={task.id}
          onClick={() => onSelectTask(task)}
          className="w-full text-left px-3 py-2 hover:bg-gray-100 transition-colors flex items-center gap-2 border-b border-gray-100 last:border-b-0"
        >
          {getStatusIcon(task.status)}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">
              {task.title}
            </div>
            <div className="text-xs text-gray-500 capitalize">
              {task.status}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}