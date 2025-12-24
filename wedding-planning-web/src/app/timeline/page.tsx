'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { taskService } from '@/services/firestoreService';
import { Task, Priority } from '@/types';
import { LoadingSpinner } from '@/components/LoadingSpinner';

type ViewMode = 'month' | 'week' | 'list';

export default function TimelinePage() {
  const { user, couple, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      const unsubscribe = taskService.subscribeToTasks(user.uid, (fetchedTasks) => {
        setTasks(fetchedTasks);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [user, authLoading, router]);

  // Group tasks by date
  const tasksByDate = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    
    tasks.forEach((task) => {
      if (task.dueDate) {
        const dateKey = new Date(task.dueDate).toISOString().split('T')[0];
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(task);
      } else {
        // Tasks without due date go to "unscheduled"
        if (!grouped['unscheduled']) {
          grouped['unscheduled'] = [];
        }
        grouped['unscheduled'].push(task);
      }
    });

    // Sort dates
    const sortedDates = Object.keys(grouped).sort((a, b) => {
      if (a === 'unscheduled') return 1;
      if (b === 'unscheduled') return -1;
      return new Date(a).getTime() - new Date(b).getTime();
    });

    return { grouped, sortedDates };
  }, [tasks]);

  // Filter tasks by selected month/year
  const filteredTasks = useMemo(() => {
    if (viewMode !== 'month') return tasksByDate;
    
    const filtered: Record<string, Task[]> = {};
    const sortedDates: string[] = [];
    
    Object.keys(tasksByDate.grouped).forEach((dateKey) => {
      if (dateKey === 'unscheduled') {
        filtered[dateKey] = tasksByDate.grouped[dateKey];
        sortedDates.push(dateKey);
        return;
      }
      
      const date = new Date(dateKey);
      if (date.getMonth() === selectedMonth && date.getFullYear() === selectedYear) {
        filtered[dateKey] = tasksByDate.grouped[dateKey];
        sortedDates.push(dateKey);
      }
    });

    sortedDates.sort((a, b) => {
      if (a === 'unscheduled') return 1;
      if (b === 'unscheduled') return -1;
      return new Date(a).getTime() - new Date(b).getTime();
    });

    return { grouped: filtered, sortedDates };
  }, [tasksByDate, viewMode, selectedMonth, selectedYear]);

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-blue-500';
      case 'pending':
        return 'bg-orange-500';
      case 'cancelled':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    if (dateString === 'unscheduled') return 'ללא תאריך';
    
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dateStr = date.toLocaleDateString('he-IL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    if (date.toDateString() === today.toDateString()) {
      return `היום - ${dateStr}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `מחר - ${dateStr}`;
    }
    
    return dateStr;
  };

  const isPastDate = (dateString: string) => {
    if (dateString === 'unscheduled') return false;
    return new Date(dateString) < new Date();
  };

  if (loading || authLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 shadow-modern">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">📅 לוח זמנים</h1>
              {couple && (
                <p className="text-green-100">
                  תכנון זמנים ומילונים - {couple.partner1Name} ו{couple.partner2Name}
                </p>
              )}
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-white text-green-600 rounded-xl hover:bg-green-50 font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              ← חזור לדשבורד
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* View Mode Selector */}
        <div className="glass p-4 rounded-2xl shadow-modern mb-6">
          <div className="flex items-center gap-4">
            <span className="text-gray-700 font-semibold">תצוגה:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                  viewMode === 'list'
                    ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                📋 רשימה
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                  viewMode === 'month'
                    ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                📅 חודש
              </button>
            </div>
          </div>

          {viewMode === 'month' && (
            <div className="flex items-center gap-4 mt-4">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i}>
                    {new Date(2000, i).toLocaleDateString('he-IL', { month: 'long' })}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none"
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - 1 + i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>
          )}
        </div>

        {/* Timeline Content */}
        {filteredTasks.sortedDates.length === 0 ? (
          <div className="glass p-12 rounded-2xl shadow-modern text-center">
            <div className="text-6xl mb-4">📅</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">אין משימות מתוזמנות</h2>
            <p className="text-gray-600 mb-6">הוסף תאריכי יעד למשימות כדי לראות אותן כאן</p>
            <button
              onClick={() => router.push('/tasks')}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              ← לניהול משימות
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredTasks.sortedDates.map((dateKey) => {
              const dateTasks = filteredTasks.grouped[dateKey];
              const isPast = isPastDate(dateKey);
              
              return (
                <div
                  key={dateKey}
                  className={`glass rounded-2xl shadow-modern overflow-hidden ${
                    isPast ? 'opacity-75 border-2 border-red-200' : 'border-2 border-transparent'
                  }`}
                >
                  {/* Date Header */}
                  <div
                    className={`p-4 ${
                      isPast
                        ? 'bg-gradient-to-r from-red-100 to-orange-100'
                        : 'bg-gradient-to-r from-green-100 to-teal-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-gray-900">
                        {formatDate(dateKey)}
                      </h2>
                      <span className="px-3 py-1 bg-white rounded-full text-sm font-semibold text-gray-700">
                        {dateTasks.length} משימות
                      </span>
                    </div>
                  </div>

                  {/* Tasks List */}
                  <div className="p-4 space-y-3">
                    {dateTasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-4 bg-white rounded-xl border-2 border-gray-100 hover:border-green-300 transition-all duration-300 hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold text-gray-900">{task.title}</h3>
                              <span
                                className={`px-2 py-1 rounded-lg text-xs font-semibold border ${getPriorityColor(
                                  task.priority
                                )}`}
                              >
                                {task.priority === 'high' ? '🔴 גבוה' : task.priority === 'medium' ? '🟡 בינוני' : '🟢 נמוך'}
                              </span>
                              <span
                                className={`w-3 h-3 rounded-full ${getStatusColor(task.status)}`}
                                title={task.status}
                              ></span>
                            </div>
                            {task.description && (
                              <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                            )}
                            {task.category && (
                              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs font-semibold">
                                {task.category}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => router.push('/tasks')}
                            className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-teal-700 transition-all duration-300 text-sm"
                          >
                            צפה →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass p-6 rounded-2xl shadow-modern text-center">
            <div className="text-3xl mb-2">📋</div>
            <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
            <p className="text-gray-600 text-sm">סה"כ משימות</p>
          </div>
          <div className="glass p-6 rounded-2xl shadow-modern text-center">
            <div className="text-3xl mb-2">📅</div>
            <p className="text-2xl font-bold text-gray-900">
              {tasks.filter((t) => t.dueDate).length}
            </p>
            <p className="text-gray-600 text-sm">משימות מתוזמנות</p>
          </div>
          <div className="glass p-6 rounded-2xl shadow-modern text-center">
            <div className="text-3xl mb-2">✅</div>
            <p className="text-2xl font-bold text-gray-900">
              {tasks.filter((t) => t.status === 'completed').length}
            </p>
            <p className="text-gray-600 text-sm">הושלמו</p>
          </div>
        </div>
      </main>
    </div>
  );
}

