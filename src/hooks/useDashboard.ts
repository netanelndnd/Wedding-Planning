'use client';

/**
 * useDashboard Hook
 *
 * Custom hook for computing dashboard statistics and budget breakdowns.
 * Aggregates data from tasks, epics, and couple profile to provide
 * real-time KPIs and metrics for the dashboard.
 */

import { useMemo } from 'react';
import { logger } from '@/lib/logger';
import type {
  DashboardStats,
  CategoryBudget,
  Task,
  Epic,
  Couple,
  BudgetStatus,
} from '@/types';

/**
 * Dashboard hook state and data
 */
export interface UseDashboardReturn {
  /** Overall dashboard statistics */
  stats: DashboardStats | null;
  /** Budget breakdown by category */
  categoryBudgets: CategoryBudget[];
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: string | null;
}

/**
 * Hook for dashboard statistics and budget tracking
 *
 * @param couple Couple profile data
 * @param tasks Array of all tasks
 * @param epics Array of all epics (categories)
 * @param loading Loading state from data sources
 * @param error Error state from data sources
 * @returns Dashboard statistics and category budgets
 *
 * @example
 * ```tsx
 * const { user } = useAuth();
 * const { couple, loading: coupleLoading } = useCouple(user?.uid);
 * const { tasks, loading: tasksLoading } = useTasks(user?.uid);
 * const { epics, loading: epicsLoading } = useEpics(user?.uid);
 *
 * const { stats, categoryBudgets, loading, error } = useDashboard(
 *   couple,
 *   tasks,
 *   epics,
 *   coupleLoading || tasksLoading || epicsLoading,
 *   null
 * );
 * ```
 */
export function useDashboard(
  couple: Couple | null,
  tasks: Task[],
  epics: Epic[],
  loading: boolean,
  error: string | null
): UseDashboardReturn {
  /**
   * Compute overall dashboard statistics
   */
  const stats = useMemo((): DashboardStats | null => {
    if (!couple) {
      return null;
    }

    logger.debug('Computing dashboard stats', {
      coupleId: couple.id,
      taskCount: tasks.length,
      epicCount: epics.length,
    });

    // Count total and completed tasks
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'completed').length;

    // Calculate completion percentage
    const completionPercentage =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Sum estimated and actual costs
    const estimatedTotal = tasks.reduce(
      (sum, task) => sum + (task.estimatedCost ?? 0),
      0
    );
    const actualTotal = tasks.reduce(
      (sum, task) => sum + (task.actualCost ?? 0),
      0
    );

    // Determine budget status
    let budgetStatus: BudgetStatus = 'under';
    const targetBudget = couple.targetBudget;

    if (actualTotal > targetBudget) {
      budgetStatus = 'over';
    } else if (actualTotal >= targetBudget * 0.9) {
      // Within 10% of target
      budgetStatus = 'at';
    } else {
      budgetStatus = 'under';
    }

    const dashboardStats: DashboardStats = {
      totalTasks,
      completedTasks,
      completionPercentage,
      targetBudget,
      estimatedTotal,
      actualTotal,
      budgetStatus,
    };

    logger.debug('Dashboard stats computed', {
      coupleId: couple.id,
      stats: dashboardStats,
    });

    return dashboardStats;
  }, [couple, tasks, epics]);

  /**
   * Compute budget breakdown by category
   */
  const categoryBudgets = useMemo((): CategoryBudget[] => {
    if (epics.length === 0) {
      return [];
    }

    logger.debug('Computing category budgets', {
      epicCount: epics.length,
      taskCount: tasks.length,
    });

    const budgets: CategoryBudget[] = epics.map((epic) => {
      // Filter tasks for this epic
      const epicTasks = tasks.filter((t) => t.epicId === epic.id);

      // Calculate sums
      const estimatedTotal = epicTasks.reduce(
        (sum, task) => sum + (task.estimatedCost ?? 0),
        0
      );
      const actualTotal = epicTasks.reduce(
        (sum, task) => sum + (task.actualCost ?? 0),
        0
      );

      // Count tasks
      const taskCount = epicTasks.length;
      const completedCount = epicTasks.filter(
        (t) => t.status === 'completed'
      ).length;

      return {
        epicId: epic.id,
        epicTitle: epic.title,
        targetBudget: epic.targetBudget,
        estimatedTotal,
        actualTotal,
        taskCount,
        completedCount,
      };
    });

    logger.debug('Category budgets computed', {
      count: budgets.length,
    });

    return budgets;
  }, [tasks, epics]);

  return {
    stats,
    categoryBudgets,
    loading,
    error,
  };
}
