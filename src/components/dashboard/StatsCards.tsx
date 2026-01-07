'use client';

/**
 * StatsCards Component
 *
 * Displays quick metric cards in a grid layout.
 * Shows total tasks, completed tasks, pending tasks, and days until wedding.
 */

import React from 'react';
import { Card } from '@/components/ui/Card';

/**
 * StatsCards component props
 */
export interface StatsCardsProps {
  /** Total number of tasks */
  totalTasks: number;
  /** Number of completed tasks */
  completedTasks: number;
  /** Number of pending tasks */
  pendingTasks: number;
  /** Days until wedding (can be negative if wedding passed) */
  daysUntilWedding: number;
}

/**
 * Individual stat card component
 */
interface StatCardProps {
  /** Card icon (emoji) */
  icon: string;
  /** Card label in Hebrew */
  label: string;
  /** Card value */
  value: number | string;
  /** Optional color for the icon background */
  color?: string;
}

/**
 * Individual stat card
 */
function StatCard({
  icon,
  label,
  value,
  color = 'bg-blue-50',
}: StatCardProps): React.ReactElement {
  return (
    <Card>
      <div className="flex items-center gap-4">
        <div
          className={`flex-shrink-0 w-14 h-14 ${color} rounded-lg flex items-center justify-center`}
        >
          <span className="text-2xl" aria-hidden="true">
            {icon}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </Card>
  );
}

/**
 * StatsCards component
 *
 * @example
 * ```tsx
 * <StatsCards
 *   totalTasks={30}
 *   completedTasks={15}
 *   pendingTasks={10}
 *   daysUntilWedding={180}
 * />
 * ```
 */
export function StatsCards({
  totalTasks,
  completedTasks,
  pendingTasks,
  daysUntilWedding,
}: StatsCardsProps): React.ReactElement {
  // Format days until wedding
  const daysLabel =
    daysUntilWedding > 0
      ? `${daysUntilWedding} ימים`
      : daysUntilWedding === 0
        ? 'היום!'
        : `לפני ${Math.abs(daysUntilWedding)} ימים`;

  // Determine color based on days
  let daysColor = 'bg-purple-50';
  if (daysUntilWedding === 0) {
    daysColor = 'bg-pink-50';
  } else if (daysUntilWedding > 0 && daysUntilWedding <= 30) {
    daysColor = 'bg-yellow-50';
  } else if (daysUntilWedding < 0) {
    daysColor = 'bg-gray-50';
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon="📋"
        label="סך משימות"
        value={totalTasks}
        color="bg-blue-50"
      />
      <StatCard
        icon="✅"
        label="משימות שהושלמו"
        value={completedTasks}
        color="bg-green-50"
      />
      <StatCard
        icon="⏳"
        label="משימות ממתינות"
        value={pendingTasks}
        color="bg-orange-50"
      />
      <StatCard
        icon="💒"
        label="ימים עד החתונה"
        value={daysLabel}
        color={daysColor}
      />
    </div>
  );
}
