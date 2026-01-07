'use client';

/**
 * CategoryList Component
 *
 * Displays list of all epics (categories) with task counts.
 * Includes ability to add custom categories.
 */

import React from 'react';
import { Epic, Task } from '@/types';
import { Button } from '@/components/ui/Button';

/**
 * CategoryList component props
 */
export interface CategoryListProps {
  /** Array of epics */
  epics: Epic[];
  /** Array of tasks for counting */
  tasks: Task[];
  /** Currently selected epic ID (optional) */
  selectedEpicId?: string | null;
  /** Called when epic is selected */
  onSelectEpic?: (epicId: string | null) => void;
  /** Called when add category is clicked */
  onAddCategory?: () => void;
}

/**
 * Category list component with task counts
 *
 * @example
 * ```tsx
 * <CategoryList
 *   epics={epics}
 *   tasks={tasks}
 *   selectedEpicId={selectedId}
 *   onSelectEpic={handleSelect}
 *   onAddCategory={handleAddCategory}
 * />
 * ```
 */
export function CategoryList({
  epics,
  tasks,
  selectedEpicId,
  onSelectEpic,
  onAddCategory,
}: CategoryListProps): React.ReactElement {
  // Count tasks per epic
  const getTaskCount = (epicId: string): number => {
    return tasks.filter((task) => task.epicId === epicId).length;
  };

  // Get completed tasks per epic
  const getCompletedCount = (epicId: string): number => {
    return tasks.filter(
      (task) => task.epicId === epicId && task.status === 'completed'
    ).length;
  };

  // Total task count
  const totalTasks = tasks.length;

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">קטגוריות</h3>
      </div>

      {/* All Tasks Filter */}
      <button
        onClick={() => onSelectEpic?.(null)}
        className={`w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100 ${
          selectedEpicId === null ? 'bg-blue-50' : ''
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">📋</span>
          <span className="font-medium text-gray-900">כל המשימות</span>
        </div>
        <span className="text-sm text-gray-600 font-medium">
          {totalTasks}
        </span>
      </button>

      {/* Epic List */}
      <div className="divide-y divide-gray-100">
        {epics.map((epic) => {
          const taskCount = getTaskCount(epic.id);
          const completedCount = getCompletedCount(epic.id);
          const isSelected = selectedEpicId === epic.id;

          return (
            <button
              key={epic.id}
              onClick={() => onSelectEpic?.(epic.id)}
              className={`w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                isSelected ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="text-lg flex-shrink-0">{epic.icon}</span>
                <div className="text-start flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {epic.title}
                  </div>
                  {taskCount > 0 && (
                    <div className="text-xs text-gray-500">
                      {completedCount} / {taskCount} הושלמו
                    </div>
                  )}
                </div>
              </div>
              <span className="text-sm text-gray-600 font-medium ms-2">
                {taskCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* Add Category Button */}
      {onAddCategory && (
        <div className="p-4 border-t border-gray-200">
          <Button
            variant="secondary"
            size="sm"
            fullWidth
            onClick={onAddCategory}
          >
            ➕ הוסף קטגוריה
          </Button>
        </div>
      )}
    </div>
  );
}

CategoryList.displayName = 'CategoryList';
