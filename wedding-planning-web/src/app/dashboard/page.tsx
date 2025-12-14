'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { taskService } from '@/services/firestoreService';
import { Task } from '@/types';

export default function DashboardPage() {
  const { user, couple, isAuthenticated, loading } = useAuth();
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

  if (loading || tasksLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  const daysUntilWedding = couple
    ? Math.ceil((new Date(couple.weddingDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const pendingCount = tasks.filter((t) => t.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {couple ? `${couple.partner1Name} ו${couple.partner2Name}` : 'דשבורד'}
            </h1>
            <p className="text-gray-600 mt-1">
              {daysUntilWedding > 0
                ? `עוד ${daysUntilWedding} ימים עד החתונה! 🎉`
                : 'היום הגדול הגיע! 🎊'}
            </p>
          </div>
          <button
            onClick={() => router.push('/settings')}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
          >
            הגדרות
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm font-medium">סך הכל משימות</h3>
            <p className="text-3xl font-bold text-pink-600 mt-2">{tasks.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm font-medium">משימות הושלמו</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{completedCount}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm font-medium">משימות ממתינות</h3>
            <p className="text-3xl font-bold text-orange-600 mt-2">{pendingCount}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">התקדמות כללית</h2>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-pink-600 h-4 rounded-full transition-all"
              style={{
                width: tasks.length === 0 ? '0%' : `${(completedCount / tasks.length) * 100}%`,
              }}
            ></div>
          </div>
          <p className="text-gray-600 mt-2">
            {tasks.length === 0
              ? 'אין משימות עדיין'
              : `${completedCount} מתוך ${tasks.length} משימות הושלמו`}
          </p>
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => router.push('/tasks')}
            className="p-8 bg-white rounded-lg shadow hover:shadow-lg transition text-center"
          >
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-gray-900">משימות</h3>
            <p className="text-gray-600 text-sm mt-2">ניהול משימות וeпics</p>
          </button>

          <button
            onClick={() => router.push('/guests')}
            className="p-8 bg-white rounded-lg shadow hover:shadow-lg transition text-center"
          >
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-lg font-semibold text-gray-900">אורחים</h3>
            <p className="text-gray-600 text-sm mt-2">ניהול רשימת אורחים ו-RSVP</p>
          </button>

          <button
            onClick={() => router.push('/vendors')}
            className="p-8 bg-white rounded-lg shadow hover:shadow-lg transition text-center"
          >
            <div className="text-4xl mb-4">🎤</div>
            <h3 className="text-lg font-semibold text-gray-900">ספקים</h3>
            <p className="text-gray-600 text-sm mt-2">ניהול ספקים וקבלנים</p>
          </button>

          <button
            onClick={() => router.push('/timeline')}
            className="p-8 bg-white rounded-lg shadow hover:shadow-lg transition text-center"
          >
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-lg font-semibold text-gray-900">לוח זמנים</h3>
            <p className="text-gray-600 text-sm mt-2">תכנון זמנים ומילונים</p>
          </button>
        </div>
      </main>
    </div>
  );
}
