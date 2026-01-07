'use client';

/**
 * BudgetCard Component
 *
 * Displays budget comparison with target vs actual costs.
 * Shows warning indicators when over budget.
 * Uses ILS currency formatting with thousands separator.
 */

import React from 'react';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import type { BudgetStatus } from '@/types';

/**
 * BudgetCard component props
 */
export interface BudgetCardProps {
  /** Target budget from couple profile */
  targetBudget: number;
  /** Sum of all estimated costs */
  estimatedTotal: number;
  /** Sum of all actual costs */
  actualTotal: number;
  /** Budget status indicator */
  budgetStatus: BudgetStatus;
}

/**
 * Format number as ILS currency with thousands separator
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * BudgetCard component
 *
 * @example
 * ```tsx
 * <BudgetCard
 *   targetBudget={100000}
 *   estimatedTotal={95000}
 *   actualTotal={85000}
 *   budgetStatus="under"
 * />
 * ```
 */
export function BudgetCard({
  targetBudget,
  estimatedTotal,
  actualTotal,
  budgetStatus,
}: BudgetCardProps): React.ReactElement {
  // Calculate remaining budget
  const remainingBudget = targetBudget - actualTotal;
  const budgetUtilization =
    targetBudget > 0 ? Math.round((actualTotal / targetBudget) * 100) : 0;

  // Determine status color and message
  let statusColor = 'text-green-600';
  let statusBg = 'bg-green-50';
  let statusBorder = 'border-green-200';
  let statusMessage = 'תקציב תקין';

  if (budgetStatus === 'over') {
    statusColor = 'text-red-600';
    statusBg = 'bg-red-50';
    statusBorder = 'border-red-200';
    statusMessage = 'חריגה בתקציב';
  } else if (budgetStatus === 'at') {
    statusColor = 'text-yellow-600';
    statusBg = 'bg-yellow-50';
    statusBorder = 'border-yellow-200';
    statusMessage = 'קרוב לתקציב';
  }

  // Determine progress bar color
  let progressColor = 'bg-green-600';
  if (budgetStatus === 'over') {
    progressColor = 'bg-red-600';
  } else if (budgetStatus === 'at') {
    progressColor = 'bg-yellow-500';
  }

  return (
    <Card>
      <div className="space-y-4">
        <div>
          <CardTitle>מעקב תקציב</CardTitle>
          <CardDescription>השוואת תקציב יעד מול עלויות בפועל</CardDescription>
        </div>

        {/* Budget amounts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">תקציב יעד</p>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(targetBudget)}
            </p>
          </div>

          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">עלות משוערת</p>
            <p className="text-xl font-bold text-blue-700">
              {formatCurrency(estimatedTotal)}
            </p>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">עלות בפועל</p>
            <p className="text-xl font-bold text-purple-700">
              {formatCurrency(actualTotal)}
            </p>
          </div>
        </div>

        {/* Budget utilization bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">ניצול תקציב</span>
            <span className={`text-sm font-medium ${statusColor}`}>
              {budgetUtilization}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full ${progressColor} transition-all duration-500 ease-out`}
              style={{ width: `${Math.min(100, budgetUtilization)}%` }}
              role="progressbar"
              aria-valuenow={budgetUtilization}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="אחוז ניצול תקציב"
            />
          </div>
        </div>

        {/* Status message */}
        <div className={`p-3 ${statusBg} border ${statusBorder} rounded-lg`}>
          <div className="flex items-center justify-between">
            <p className={`text-sm font-medium ${statusColor}`}>
              {statusMessage}
            </p>
            <p className={`text-sm font-bold ${statusColor}`}>
              {remainingBudget >= 0 ? 'נותר: ' : 'חריגה: '}
              {formatCurrency(Math.abs(remainingBudget))}
            </p>
          </div>
        </div>

        {/* Warning for over budget */}
        {budgetStatus === 'over' && (
          <div className="p-3 bg-red-50 border border-red-300 rounded-lg">
            <p className="text-sm text-red-800 font-medium text-center">
              ⚠️ שימו לב: העלויות בפועל חורגות מהתקציב המתוכנן
            </p>
          </div>
        )}

        {/* Warning for approaching budget */}
        {budgetStatus === 'at' && (
          <div className="p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
            <p className="text-sm text-yellow-800 font-medium text-center">
              ⚠️ שימו לב: אתם מתקרבים לתקציב המתוכנן
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
