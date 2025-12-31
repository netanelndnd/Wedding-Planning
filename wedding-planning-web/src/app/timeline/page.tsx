'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { taskService } from '@/services/crud';
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
      const unsubscribe = taskService.subscribe(user.uid, (fetchedTasks) => {
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
    <div className="min-h-screen wedding-bg" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#BE185D] shadow-lg relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-serif font-bold text-white mb-2">
                לוח זמנים
              </h1>
              {couple && (
                <p className="text-white/80 font-sans">
                  תכנון זמנים - {couple.partner1Name} ו{couple.partner2Name}
                </p>
              )}
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2.5 bg-white/95 text-[#6D28D9] rounded-xl hover:bg-white font-semibold transition-all duration-300 shadow-lg"
            >
              ← חזרה
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {/* View Mode Selector */}
        <div className="glass p-4 rounded-2xl shadow-modern mb-6">
          <div className="flex items-center gap-4">
            <span className="text-[#2D2A32] font-semibold font-sans">תצוגה:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                  viewMode === 'list'
                    ? 'bg-gradient-to-r from-[#6D28D9] to-[#BE185D] text-white shadow-lg'
                    : 'bg-white text-[#6B6573] hover:bg-[#6D28D9]/5'
                }`}
              >
                רשימה
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                  viewMode === 'month'
                    ? 'bg-gradient-to-r from-[#6D28D9] to-[#BE185D] text-white shadow-lg'
                    : 'bg-white text-[#6B6573] hover:bg-[#6D28D9]/5'
                }`}
              >
                חודש
              </button>
            </div>
          </div>

          {viewMode === 'month' && (
            <div className="flex items-center gap-4 mt-4">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="px-4 py-2 rounded-xl border-2 border-[#6D28D9]/20 focus:border-[#6D28D9] focus:outline-none bg-white text-[#2D2A32] font-sans"
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
                className="px-4 py-2 rounded-xl border-2 border-[#6D28D9]/20 focus:border-[#6D28D9] focus:outline-none bg-white text-[#2D2A32] font-sans"
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
            <h2 className="text-2xl font-serif font-bold text-[#2D2A32] mb-2">אין משימות מתוזמנות</h2>
            <p className="text-[#6B6573] mb-6">הוסף תאריכי יעד למשימות כדי לראות אותן כאן</p>
            <button
              onClick={() => router.push('/tasks')}
              className="btn-primary mx-auto"
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
                        ? 'bg-gradient-to-r from-red-50 to-orange-50'
                        : 'bg-gradient-to-r from-[#6D28D9]/10 to-[#BE185D]/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-serif font-bold text-[#2D2A32]">
                        {formatDate(dateKey)}
                      </h2>
                      <span className="px-3 py-1 bg-white rounded-full text-sm font-semibold text-[#6D28D9]">
                        {dateTasks.length} משימות
                      </span>
                    </div>
                  </div>

                  {/* Tasks List */}
                  <div className="p-4 space-y-3">
                    {dateTasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-4 bg-white rounded-xl border-2 border-[#6D28D9]/10 hover:border-[#6D28D9]/30 transition-all duration-300 hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold text-[#2D2A32]">{task.title}</h3>
                              <span
                                className={`px-2 py-1 rounded-lg text-xs font-semibold border ${getPriorityColor(
                                  task.priority
                                )}`}
                              >
                                {task.priority === 'high' ? 'גבוה' : task.priority === 'medium' ? 'בינוני' : 'נמוך'}
                              </span>
                              <span
                                className={`w-3 h-3 rounded-full ${getStatusColor(task.status)}`}
                                title={task.status}
                              ></span>
                            </div>
                            {task.description && (
                              <p className="text-[#6B6573] text-sm mb-2">{task.description}</p>
                            )}
                            {task.category && (
                              <span className="inline-block px-2 py-1 bg-[#6D28D9]/10 text-[#6D28D9] rounded-lg text-xs font-semibold">
                                {task.category}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => router.push('/tasks')}
                            className="px-4 py-2 bg-gradient-to-r from-[#6D28D9] to-[#BE185D] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 text-sm"
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
          <div className="glass p-6 rounded-2xl shadow-modern text-center card-hover">
            <p className="text-2xl font-bold text-[#6D28D9]">{tasks.length}</p>
            <p className="text-[#6B6573] text-sm">סה"כ משימות</p>
          </div>
          <div className="glass p-6 rounded-2xl shadow-modern text-center card-hover">
            <p className="text-2xl font-bold text-[#D4AF37]">
              {tasks.filter((t) => t.dueDate).length}
            </p>
            <p className="text-[#6B6573] text-sm">משימות מתוזמנות</p>
          </div>
          <div className="glass p-6 rounded-2xl shadow-modern text-center card-hover">
            <p className="text-2xl font-bold text-[#87A878]">
              {tasks.filter((t) => t.status === 'completed').length}
            </p>
            <p className="text-[#6B6573] text-sm">הושלמו</p>
          </div>
        </div>
      </main>
    </div>
  );
}

