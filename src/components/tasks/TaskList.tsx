'use client';

/**
 * TaskList Component
 *
 * Displays tasks grouped by epic (category).
 * Includes collapse/expand functionality and empty states.
 */

import React, { useState } from 'react';
import { Task, Epic, TaskStatus } from '@/types';
import { TaskCard } from './TaskCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

/**
 * TaskList component props
 */
export interface TaskListProps {
  /** Array of tasks to display */
  tasks: Task[];
  /** Array of epics for grouping */
  epics: Epic[];
  /** Loading state */
  loading?: boolean;
  /** Called when edit is clicked */
  onEdit: (task: Task) => void;
  /** Called when delete is clicked */
  onDelete: (taskId: string) => void;
  /** Called when status is changed */
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

/**
 * Task list component with category grouping
 *
 * @example
 * ```tsx
 * <TaskList
 *   tasks={tasks}
 *   epics={epics}
 *   loading={loading}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   onStatusChange={handleStatusChange}
 * />
 * ```
 */
export function TaskList({
  tasks,
  epics,
  loading,
  onEdit,
  onDelete,
  onStatusChange,
}: TaskListProps): React.ReactElement {
  // Track collapsed state for each epic
  const [collapsedEpics, setCollapsedEpics] = useState<Set<string>>(new Set());

  // Toggle collapse for an epic
  const toggleCollapse = (epicId: string) => {
    setCollapsedEpics((prev) => {
      const next = new Set(prev);
      if (next.has(epicId)) {
        next.delete(epicId);
      } else {
        next.add(epicId);
      }
      return next;
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Empty state - no epics
  if (epics.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">לא נמצאו קטגוריות</p>
        <p className="text-sm text-gray-500">
          צור קטגוריות כדי להתחיל לנהל משימות
        </p>
      </div>
    );
  }

  // Group tasks by epic
  const tasksByEpic = epics.map((epic) => ({
    epic,
    tasks: tasks.filter((task) => task.epicId === epic.id),
  }));

  // Empty state - no tasks
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">אין משימות</p>
        <p className="text-sm text-gray-500">
          הוסף משימות כדי להתחיל לנהל את החתונה שלך
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {tasksByEpic.map(({ epic, tasks: epicTasks }) => {
        const isCollapsed = collapsedEpics.has(epic.id);
        const taskCount = epicTasks.length;

        // Skip epics with no tasks
        if (taskCount === 0) return null;

        return (
          <div key={epic.id} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Epic Header */}
            <button
              onClick={() => toggleCollapse(epic.id)}
              className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{epic.icon}</span>
                <div className="text-start">
                  <h3 className="font-semibold text-gray-900">{epic.title}</h3>
                  <p className="text-sm text-gray-600">
                    {taskCount} {taskCount === 1 ? 'משימה' : 'משימות'}
                  </p>
                </div>
              </div>
              <span className="text-gray-400 text-xl">
                {isCollapsed ? '▼' : '▲'}
              </span>
            </button>

            {/* Tasks */}
            {!isCollapsed && (
              <div className="p-4 space-y-3 bg-white">
                {epicTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    epicTitle={epic.title}
                    epicIcon={epic.icon}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onStatusChange={onStatusChange}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

TaskList.displayName = 'TaskList';
