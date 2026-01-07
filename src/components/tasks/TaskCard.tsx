'use client';

/**
 * TaskCard Component
 *
 * Displays a single task with actions and status.
 * Shows task title, status, due date, assignee, costs, and action buttons.
 */

import React, { useState } from 'react';
import { Task, TaskStatus } from '@/types';
import { ASSIGNED_TO_LABELS } from '@/lib/constants';
import { StatusBadge } from './StatusBadge';
import { Button } from '@/components/ui/Button';
import { WhatsAppShareButton, CalendarExportButton } from '@/components/sharing';

/**
 * TaskCard component props
 */
export interface TaskCardProps {
  /** Task data */
  task: Task;
  /** Epic title for display */
  epicTitle?: string;
  /** Epic icon for display */
  epicIcon?: string;
  /** Called when edit is clicked */
  onEdit: (task: Task) => void;
  /** Called when delete is clicked */
  onDelete: (taskId: string) => void;
  /** Called when status is changed */
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

/**
 * Task card component with actions
 *
 * @example
 * ```tsx
 * <TaskCard
 *   task={task}
 *   epicTitle="צילום ווידאו"
 *   epicIcon="📸"
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   onStatusChange={handleStatusChange}
 * />
 * ```
 */
export function TaskCard({
  task,
  epicTitle,
  epicIcon,
  onEdit,
  onDelete,
  onStatusChange,
}: TaskCardProps): React.ReactElement {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Format date
  const formatDate = (timestamp: { toDate: () => Date } | undefined): string => {
    if (!timestamp) return '';
    try {
      return timestamp.toDate().toLocaleDateString('he-IL');
    } catch {
      return '';
    }
  };

  // Format currency
  const formatCurrency = (amount: number | undefined): string => {
    if (!amount) return '';
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
    }).format(amount);
  };

  // Handle delete with confirmation
  const handleDeleteClick = () => {
    if (showDeleteConfirm) {
      onDelete(task.id);
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
      // Auto-cancel after 3 seconds
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  // Quick status change options
  const statusOptions: TaskStatus[] = [
    'pending',
    'in-progress',
    'completed',
    'cancelled',
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {epicIcon && <span className="text-lg">{epicIcon}</span>}
            <h3 className="text-base font-semibold text-gray-900 truncate">
              {task.title}
            </h3>
          </div>
          {task.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {task.description}
            </p>
          )}
        </div>
        <StatusBadge status={task.status} />
      </div>

      {/* Details */}
      <div className="space-y-1.5 mb-3 text-sm text-gray-600">
        {epicTitle && (
          <div className="flex items-center gap-2">
            <span className="font-medium">קטגוריה:</span>
            <span>{epicTitle}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="font-medium">אחראי:</span>
          <span>{ASSIGNED_TO_LABELS[task.assignedTo]}</span>
        </div>
        {task.dueDate && (
          <div className="flex items-center gap-2">
            <span className="font-medium">תאריך יעד:</span>
            <span>{formatDate(task.dueDate)}</span>
          </div>
        )}
        {(task.estimatedCost || task.actualCost) && (
          <div className="flex items-center gap-2">
            <span className="font-medium">עלות:</span>
            <span>
              {task.actualCost
                ? formatCurrency(task.actualCost)
                : task.estimatedCost
                ? `~${formatCurrency(task.estimatedCost)}`
                : ''}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
        {/* Quick status change */}
        <div className="flex-1 flex gap-1">
          {statusOptions
            .filter((s) => s !== task.status)
            .slice(0, 2)
            .map((status) => (
              <button
                key={status}
                onClick={() => onStatusChange(task.id, status)}
                className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              >
                {status === 'pending' && 'ממתין'}
                {status === 'in-progress' && 'בתהליך'}
                {status === 'completed' && 'הושלם'}
                {status === 'cancelled' && 'בטל'}
              </button>
            ))}
        </div>

        {/* Share buttons */}
        <WhatsAppShareButton
          task={task}
          epicTitle={epicTitle}
          iconOnly
        />
        <CalendarExportButton
          type="task"
          task={task}
          epicTitle={epicTitle}
          iconOnly
        />

        {/* Edit and Delete */}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onEdit(task)}
        >
          ✏️ ערוך
        </Button>
        <Button
          variant={showDeleteConfirm ? 'danger' : 'secondary'}
          size="sm"
          onClick={handleDeleteClick}
        >
          {showDeleteConfirm ? '✓ אשר מחיקה' : '🗑️'}
        </Button>
      </div>
    </div>
  );
}

TaskCard.displayName = 'TaskCard';
