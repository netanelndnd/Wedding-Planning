'use client';

/**
 * ProgressBar Component
 *
 * Displays task completion progress with a visual bar and statistics.
 * Shows completion percentage (0-100%) and completed/total task count.
 */

import React from 'react';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';

/**
 * ProgressBar component props
 */
export interface ProgressBarProps {
  /** Total number of tasks */
  totalTasks: number;
  /** Number of completed tasks */
  completedTasks: number;
  /** Completion percentage (0-100) */
  completionPercentage: number;
}

/**
 * ProgressBar component
 *
 * @example
 * ```tsx
 * <ProgressBar
 *   totalTasks={30}
 *   completedTasks={15}
 *   completionPercentage={50}
 * />
 * ```
 */
export function ProgressBar({
  totalTasks,
  completedTasks,
  completionPercentage,
}: ProgressBarProps): React.ReactElement {
  // Ensure percentage is between 0-100
  const normalizedPercentage = Math.min(100, Math.max(0, completionPercentage));

  // Determine color based on completion percentage
  let barColor = 'bg-blue-600';
  if (normalizedPercentage >= 100) {
    barColor = 'bg-green-600';
  } else if (normalizedPercentage >= 75) {
    barColor = 'bg-blue-600';
  } else if (normalizedPercentage >= 50) {
    barColor = 'bg-yellow-500';
  } else {
    barColor = 'bg-gray-400';
  }

  return (
    <Card>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle>השלמת משימות</CardTitle>
          <span className="text-2xl font-bold text-gray-900">
            {normalizedPercentage}%
          </span>
        </div>

        <div className="space-y-2">
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className={`h-full ${barColor} transition-all duration-500 ease-out`}
              style={{ width: `${normalizedPercentage}%` }}
              role="progressbar"
              aria-valuenow={normalizedPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="אחוז השלמת משימות"
            />
          </div>

          {/* Task count description */}
          <CardDescription className="text-center">
            {completedTasks} מתוך {totalTasks} משימות הושלמו
          </CardDescription>
        </div>

        {/* Milestone messages */}
        {normalizedPercentage === 100 && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 text-center font-medium">
              מעולה! כל המשימות הושלמו!
            </p>
          </div>
        )}

        {normalizedPercentage >= 75 && normalizedPercentage < 100 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 text-center font-medium">
              כמעט סיימתם! עוד קצת...
            </p>
          </div>
        )}

        {totalTasks === 0 && (
          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600 text-center">
              טרם נוספו משימות. התחילו על ידי הוספת משימות בעמוד המשימות.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
