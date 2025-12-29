'use client';

import { useDashboard } from '@/hooks/useDashboard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import StatsCards from '@/components/dashboard/StatsCards';
import ExpensesCard from '@/components/dashboard/ExpensesCard';
import ProgressBar from '@/components/dashboard/ProgressBar';
import EmptyStateBanner from '@/components/dashboard/EmptyStateBanner';
import NavigationCards from '@/components/dashboard/NavigationCards';
import DashboardFooter from '@/components/dashboard/DashboardFooter';
import { memo } from 'react';

/**
 * DashboardPage Component
 * ----------------------
 * Main dashboard page - orchestrates dashboard components
 * - Separated into reusable components for better maintainability
 * - Memoized for preventing unnecessary re-renders
 */
function DashboardPage() {
  const {
    loading,
    couple,
    tasks,
    daysUntilWedding,
    completedCount,
    pendingCount,
    expenses,
    navigateTo,
    handleLogout,
  } = useDashboard();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen wedding-bg">
      <DashboardHeader
        couple={couple}
        daysUntilWedding={daysUntilWedding}
        onSettingsClick={() => navigateTo('/settings')}
        onLogoutClick={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <StatsCards
          totalTasks={tasks.length}
          completedCount={completedCount}
          pendingCount={pendingCount}
        />

        <ExpensesCard
          totalExpenses={expenses.total}
          expensesByCategory={expenses.byCategory}
          vendorCount={expenses.vendorCount}
        />

        <ProgressBar
          completedCount={completedCount}
          totalTasks={tasks.length}
        />

        {tasks.length === 0 && (
          <EmptyStateBanner
            onSetupTasksClick={() => navigateTo('/setup-tasks')}
          />
        )}

        <NavigationCards onNavigate={navigateTo} />

        <DashboardFooter />
      </main>
    </div>
  );
}

// Export memoized version to prevent unnecessary re-renders
export default memo(DashboardPage);
