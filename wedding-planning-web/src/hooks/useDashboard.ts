import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useVendors } from '@/hooks/useVendors';
import { taskService } from '@/services/firestoreService';
import { Task } from '@/types';

/**
 * useDashboard Hook
 * ----------------
 * Handles dashboard logic with performance optimizations:
 * - useMemo for expensive calculations
 * - useCallback for memoized functions
 */
export function useDashboard() {
  const { user, couple, isAuthenticated, loading, logout } = useAuth();
  const { expenses, vendors } = useVendors();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    console.log('Dashboard auth check:', { loading, isAuthenticated, user: user?.uid });
    
    // Wait a bit to ensure auth is fully loaded
    if (!loading) {
      const timer = setTimeout(() => {
        setAuthChecked(true);
        if (!isAuthenticated) {
          console.log('Redirecting to login...');
          router.push('/login');
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, loading, router, user]);

  useEffect(() => {
    if (!user) return;

    setTasksLoading(true);
    const unsubscribe = taskService.subscribeToTasks(user.uid, (newTasks) => {
      setTasks(newTasks);
      setTasksLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Memoize expensive calculations - only recalculate when couple changes
  const daysUntilWedding = useMemo(() => {
    if (!couple) return 0;
    return Math.ceil((new Date(couple.weddingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  }, [couple]);

  // Memoize task counts - only recalculate when tasks array changes
  const { completedCount, pendingCount } = useMemo(() => {
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const pending = tasks.filter((t) => t.status === 'pending').length;
    return { completedCount: completed, pendingCount: pending };
  }, [tasks]);

  // Memoize navigation function
  const navigateTo = useCallback((path: string) => {
    router.push(path);
  }, [router]);

  // Memoize logout function
  const handleLogout = useCallback(async () => {
    if (logout) {
      await logout();
    }
  }, [logout]);

  return {
    loading: loading || tasksLoading,
    couple,
    tasks,
    daysUntilWedding,
    completedCount,
    pendingCount,
    expenses: {
      total: expenses.total,
      byCategory: expenses.byCategory,
      vendorCount: expenses.count,
    },
    navigateTo,
    handleLogout,
  };
}

