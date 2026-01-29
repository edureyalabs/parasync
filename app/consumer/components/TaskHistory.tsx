'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { CheckCircle, XCircle, Clock, PlayCircle, Ban } from 'lucide-react';

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

interface TaskHistoryProps {
  userId: string;
  agentId: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export default function TaskHistory({ userId, agentId }: TaskHistoryProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 5000);
    return () => clearInterval(interval);
  }, [userId, agentId]);

  const fetchTasks = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/tasks/${userId}/${agentId}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setTasks(data.all_tasks || []);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
            <PlayCircle size={12} className="animate-pulse" />
            Running
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
            <CheckCircle size={12} />
            Completed
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
            <XCircle size={12} />
            Failed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
            <Ban size={12} />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">
            <Clock size={12} />
            Pending
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No tasks yet</p>
        </div>
      ) : (
        tasks.map((task) => (
          <div key={task.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{task.task_name}</h4>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(task.created_at).toLocaleString()}
                </p>
              </div>
              {getStatusBadge(task.status)}
            </div>
            
            {task.result && (
              <div className="mt-2 p-2 bg-green-50 rounded text-sm">
                <span className="font-medium text-green-700">Result: </span>
                <span className="text-green-600">
                  {JSON.stringify(task.result)}
                </span>
              </div>
            )}
            
            {task.error_message && (
              <div className="mt-2 p-2 bg-red-50 rounded text-sm">
                <span className="font-medium text-red-700">Error: </span>
                <span className="text-red-600">{task.error_message}</span>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}