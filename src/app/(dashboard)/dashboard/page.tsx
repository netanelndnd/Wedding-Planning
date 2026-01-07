'use client';

/**
 * Dashboard Page
 *
 * Main dashboard page showing wedding planning overview.
 * Displays KPIs including task completion, budget tracking, and category breakdown.
 */

import React, { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCouple } from '@/hooks/useCouple';
import { useTasks } from '@/hooks/useTasks';
import { useEpics } from '@/hooks/useEpics';
import { useDashboard } from '@/hooks/useDashboard';
import {
  DashboardHeader,
  StatsCards,
  ProgressBar,
  BudgetCard,
  CategoryBreakdown,
} from '@/components/dashboard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';

/**
 * Dashboard page component
 */
export default function DashboardPage(): React.ReactElement {
  const { user } = useAuth();
  const { couple, loading: coupleLoading, error: coupleError } = useCouple(user?.uid);
  const { tasks, loading: tasksLoading, error: tasksError } = useTasks(user?.uid ?? null);
  const { epics, loading: epicsLoading, error: epicsError } = useEpics(user?.uid ?? null);

  // Compute dashboard statistics
  const { stats, categoryBudgets, loading: dashboardLoading, error: dashboardError } = useDashboard(
    couple,
    tasks,
    epics,
    coupleLoading || tasksLoading || epicsLoading,
    coupleError || tasksError || epicsError
  );

  // Create epic color and icon maps
  const epicColors = useMemo(() => {
    const map = new Map<string, string>();
    epics.forEach((epic) => {
      map.set(epic.id, epic.color);
    });
    return map;
  }, [epics]);

  const epicIcons = useMemo(() => {
    const map = new Map<string, string>();
    epics.forEach((epic) => {
      map.set(epic.id, epic.icon);
    });
    return map;
  }, [epics]);

  // Calculate days until wedding
  const daysUntilWedding = useMemo(() => {
    if (!couple) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weddingDate = couple.weddingDate.toDate();
    weddingDate.setHours(0, 0, 0, 0);
    const diffTime = weddingDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, [couple]);

  // Calculate pending tasks
  const pendingTasks = useMemo(() => {
    return tasks.filter((t) => t.status === 'pending' || t.status === 'in-progress').length;
  }, [tasks]);

  // Loading state
  if (coupleLoading || tasksLoading || epicsLoading || dashboardLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Error state
  if (coupleError || tasksError || epicsError || dashboardError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">לוח בקרה</h1>
          <p className="mt-2 text-gray-600">סקירה כללית של תכנון החתונה</p>
        </div>
        <Card>
          <div className="text-center py-12">
            <CardTitle className="text-red-600">שגיאה בטעינת הנתונים</CardTitle>
            <CardDescription className="mt-2">
              {coupleError || tasksError || epicsError || dashboardError}
            </CardDescription>
          </div>
        </Card>
      </div>
    );
  }

  // No couple profile state
  if (!couple) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">לוח בקרה</h1>
          <p className="mt-2 text-gray-600">סקירה כללית של תכנון החתונה</p>
        </div>
        <Card>
          <div className="text-center py-12">
            <CardTitle>לא נמצא פרופיל זוג</CardTitle>
            <CardDescription className="mt-2">
              אנא השלימו את הגדרת הפרופיל בדף ההגדרות.
            </CardDescription>
          </div>
        </Card>
      </div>
    );
  }

  // No stats state (shouldn't happen if couple exists, but defensive)
  if (!stats) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">לוח בקרה</h1>
          <p className="mt-2 text-gray-600">סקירה כללית של תכנון החתונה</p>
        </div>
        <Card>
          <div className="text-center py-12">
            <CardTitle>טוען נתונים...</CardTitle>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <DashboardHeader
        partner1Name={couple.partner1Name}
        partner2Name={couple.partner2Name}
        weddingDate={couple.weddingDate.toDate()}
        daysUntilWedding={daysUntilWedding}
      />

      {/* Stats Cards */}
      <StatsCards
        totalTasks={stats.totalTasks}
        completedTasks={stats.completedTasks}
        pendingTasks={pendingTasks}
        daysUntilWedding={daysUntilWedding}
      />

      {/* Progress and Budget Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProgressBar
          totalTasks={stats.totalTasks}
          completedTasks={stats.completedTasks}
          completionPercentage={stats.completionPercentage}
        />
        <BudgetCard
          targetBudget={stats.targetBudget}
          estimatedTotal={stats.estimatedTotal}
          actualTotal={stats.actualTotal}
          budgetStatus={stats.budgetStatus}
        />
      </div>

      {/* Category Breakdown */}
      <CategoryBreakdown
        categoryBudgets={categoryBudgets}
        epicColors={epicColors}
        epicIcons={epicIcons}
      />
    </div>
  );
}
