'use client';

/**
 * StatusBadge Component
 *
 * Displays task status with appropriate color and Hebrew text.
 * Small badge style for use in task cards and lists.
 */

import React from 'react';
import { TaskStatus } from '@/types';
import { TASK_STATUS_LABELS, TASK_STATUS_COLORS } from '@/lib/constants';

/**
 * StatusBadge component props
 */
export interface StatusBadgeProps {
  /** Task status */
  status: TaskStatus;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Status badge component with color-coded display
 *
 * @example
 * ```tsx
 * <StatusBadge status="completed" />
 * <StatusBadge status="in-progress" />
 * ```
 */
export function StatusBadge({
  status,
  className = '',
}: StatusBadgeProps): React.ReactElement {
  // Get status label and color
  const label = TASK_STATUS_LABELS[status];
  const color = TASK_STATUS_COLORS[status];

  // Color styles based on status
  const colorStyles = {
    gray: 'bg-gray-100 text-gray-800 border-gray-300',
    blue: 'bg-blue-100 text-blue-800 border-blue-300',
    green: 'bg-green-100 text-green-800 border-green-300',
    red: 'bg-red-100 text-red-800 border-red-300',
  };

  const baseStyles =
    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border';

  return (
    <span className={`${baseStyles} ${colorStyles[color]} ${className}`}>
      {label}
    </span>
  );
}

StatusBadge.displayName = 'StatusBadge';
