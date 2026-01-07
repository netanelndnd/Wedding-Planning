'use client';

/**
 * CategoryBreakdown Component
 *
 * Displays budget breakdown by category (epic).
 * Shows progress, estimated vs actual costs for each category.
 * Color-coded by epic color and sorted by order.
 */

import React from 'react';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import type { CategoryBudget } from '@/types';

/**
 * CategoryBreakdown component props
 */
export interface CategoryBreakdownProps {
  /** Array of category budget data */
  categoryBudgets: CategoryBudget[];
  /** Epic color mapping */
  epicColors: Map<string, string>;
  /** Epic icon mapping */
  epicIcons: Map<string, string>;
}

/**
 * Format number as ILS currency
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
 * CategoryBreakdown component
 *
 * @example
 * ```tsx
 * <CategoryBreakdown
 *   categoryBudgets={categoryBudgets}
 *   epicColors={epicColors}
 *   epicIcons={epicIcons}
 * />
 * ```
 */
export function CategoryBreakdown({
  categoryBudgets,
  epicColors,
  epicIcons,
}: CategoryBreakdownProps): React.ReactElement {
  if (categoryBudgets.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <CardTitle className="mb-2">פירוט תקציב לפי קטגוריות</CardTitle>
          <CardDescription>
            טרם נוספו קטגוריות או משימות.
            <br />
            התחילו על ידי הוספת משימות בעמוד המשימות.
          </CardDescription>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="space-y-6">
        <div>
          <CardTitle>פירוט תקציב לפי קטגוריות</CardTitle>
          <CardDescription>
            סיכום עלויות והתקדמות עבור כל קטגוריה
          </CardDescription>
        </div>

        <div className="space-y-4">
          {categoryBudgets.map((category) => {
            const color = epicColors.get(category.epicId) || '#6B7280';
            const icon = epicIcons.get(category.epicId) || '📦';
            const completionPercentage =
              category.taskCount > 0
                ? Math.round((category.completedCount / category.taskCount) * 100)
                : 0;

            // Check if over budget (if target budget is set)
            const isOverBudget =
              category.targetBudget &&
              category.actualTotal > category.targetBudget;

            return (
              <div
                key={category.epicId}
                className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <div className="space-y-3">
                  {/* Category header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl" aria-hidden="true">
                        {icon}
                      </span>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {category.epicTitle}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {category.completedCount} מתוך {category.taskCount} משימות
                        </p>
                      </div>
                    </div>
                    <div className="text-end">
                      <p className="text-sm text-gray-600 mb-1">עלות בפועל</p>
                      <p
                        className={`text-lg font-bold ${
                          isOverBudget ? 'text-red-600' : 'text-gray-900'
                        }`}
                      >
                        {formatCurrency(category.actualTotal)}
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        התקדמות משימות
                      </span>
                      <span className="text-xs font-medium text-gray-700">
                        {completionPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full transition-all duration-500 ease-out"
                        style={{
                          width: `${completionPercentage}%`,
                          backgroundColor: color,
                        }}
                        role="progressbar"
                        aria-valuenow={completionPercentage}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`אחוז השלמת משימות ${category.epicTitle}`}
                      />
                    </div>
                  </div>

                  {/* Budget details */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <p className="text-xs text-gray-600 mb-1">משוער</p>
                      <p className="text-sm font-semibold text-blue-700">
                        {formatCurrency(category.estimatedTotal)}
                      </p>
                    </div>
                    {category.targetBudget && (
                      <div
                        className={`text-center p-2 rounded ${
                          isOverBudget ? 'bg-red-50' : 'bg-gray-50'
                        }`}
                      >
                        <p className="text-xs text-gray-600 mb-1">יעד</p>
                        <p
                          className={`text-sm font-semibold ${
                            isOverBudget ? 'text-red-700' : 'text-gray-700'
                          }`}
                        >
                          {formatCurrency(category.targetBudget)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Over budget warning */}
                  {isOverBudget && (
                    <div className="pt-2">
                      <div className="p-2 bg-red-50 border border-red-200 rounded">
                        <p className="text-xs text-red-700 font-medium text-center">
                          ⚠️ חריגה מתקציב היעד לקטגוריה
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
