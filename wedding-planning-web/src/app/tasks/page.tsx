'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { taskService, epicService } from '@/services/crud';
import { Task, Epic, Priority, TaskStatus } from '@/types';
import { exportTasksToExcel } from '@/utils/excelExport';

type FilterType = 'all' | 'pending' | 'in-progress' | 'completed';
type SortType = 'priority' | 'dueDate' | 'created';
type ViewMode = 'list' | 'calendar';

export default function TasksPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [showAddEpicModal, setShowAddEpicModal] = useState(false);
  const [showManageEpicsModal, setShowManageEpicsModal] = useState(false);
  const [showEpicTasksModal, setShowEpicTasksModal] = useState(false);
  
  // Current task being edited
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  // Current epic for viewing tasks
  const [viewingEpic, setViewingEpic] = useState<Epic | null>(null);
  
  // Filters and Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterType>('all');
  const [filterEpic, setFilterEpic] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortType>('priority');
  
  // View mode and calendar state
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Export dropdown
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const exportButtonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  
  // New Task Form State
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    epicId: '',
    category: 'general',
    priority: 'medium' as Priority,
    dueDate: '',
  });

  // New Epic Form State
  const [newEpic, setNewEpic] = useState({
    title: '',
    description: '',
    category: 'general',
    color: '#ec4899',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      const unsubscribeTasks = taskService.subscribe(user.uid, (fetchedTasks) => {
        setTasks(fetchedTasks);
      });

      const unsubscribeEpics = epicService.subscribe(user.uid, (fetchedEpics) => {
        setEpics(fetchedEpics);
        if (fetchedEpics.length > 0 && !newTask.epicId) {
          setNewTask(prev => ({ ...prev, epicId: fetchedEpics[0].id }));
        }
        setLoading(false);
      });

      return () => {
        unsubscribeTasks();
        unsubscribeEpics();
      };
    }
  }, [user, authLoading, router]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      let epicIdToUse = newTask.epicId;

      if (!epicIdToUse && epics.length === 0) {
        const epicResult = await epicService.add(user.uid, {
          title: 'כללי',
          category: 'general',
          order: 0,
          coupleId: user.uid
        });
        if (epicResult.success && epicResult.data) {
          epicIdToUse = epicResult.data;
        }
      }

      if (!epicIdToUse) {
        alert('יש לבחור נושא למשימה');
        return;
      }

      const taskResult = await taskService.add(user.uid, {
        ...newTask,
        epicId: epicIdToUse,
        status: 'pending',
        coupleId: user.uid,
        dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined,
      });
      if (!taskResult.success) {
        throw new Error(taskResult.error);
      }

      setShowAddTaskModal(false);
      setNewTask({
        title: '',
        description: '',
        epicId: epics.length > 0 ? epics[0].id : '',
        category: 'general',
        priority: 'medium',
        dueDate: '',
      });
    } catch (error) {
      console.error('Error creating task:', error);
      alert('שגיאה ביצירת המשימה');
    }
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;

    try {
      const result = await taskService.update(editingTask.id, {
        title: editingTask.title,
        description: editingTask.description,
        priority: editingTask.priority,
        status: editingTask.status,
        dueDate: editingTask.dueDate,
        epicId: editingTask.epicId,
        notes: editingTask.notes,
      });
      if (!result.success) {
        throw new Error(result.error);
      }

      setShowEditTaskModal(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
      alert('שגיאה בעדכון המשימה');
    }
  };

  const handleToggleStatus = async (task: Task) => {
    try {
      let newStatus: TaskStatus;
      if (task.status === 'completed') {
        newStatus = 'pending';
      } else if (task.status === 'pending') {
        newStatus = 'in-progress';
      } else {
        newStatus = 'completed';
      }
      await taskService.changeStatus(task.id, newStatus);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('האם את/ה בטוח/ה שברצונך למחוק משימה זו?')) {
      try {
        await taskService.delete(taskId);
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const handleCreateEpic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const result = await epicService.add(user.uid, {
        ...newEpic,
        order: epics.length,
        coupleId: user.uid,
      });
      if (!result.success) {
        throw new Error(result.error);
      }

      setShowAddEpicModal(false);
      setNewEpic({
        title: '',
        description: '',
        category: 'general',
        color: '#ec4899',
      });
    } catch (error) {
      console.error('Error creating epic:', error);
      alert('שגיאה ביצירת הנושא');
    }
  };

  const handleDeleteEpic = async (epicId: string) => {
    if (window.confirm('האם למחוק נושא זה? כל המשימות בנושא ימחקו גם כן.')) {
      try {
        await epicService.deleteWithTasks(epicId);
      } catch (error) {
        console.error('Error deleting epic:', error);
      }
    }
  };

  // Filter and Sort Tasks
  const getFilteredAndSortedTasks = () => {
    let filtered = [...tasks];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(task => task.status === filterStatus);
    }

    // Epic filter
    if (filterEpic !== 'all') {
      filtered = filtered.filter(task => task.epicId === filterEpic);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'dueDate':
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  };

  const filteredTasks = getFilteredAndSortedTasks();

  // Calendar data - group tasks by date for the selected month
  const calendarData = useMemo(() => {
    const year = selectedYear;
    const month = selectedMonth;
    
    // Get first and last day of month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Get the day of week for first day (0 = Sunday, 6 = Saturday)
    // For Hebrew calendar, we want Saturday as first day
    const startDayOfWeek = firstDay.getDay();
    
    // Create calendar grid
    const days: { date: Date | null; tasks: Task[] }[] = [];
    
    // Add empty slots for days before the first of the month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ date: null, tasks: [] });
    }
    
    // Add days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayTasks = filteredTasks.filter(task => {
        if (!task.dueDate) return false;
        const taskDate = new Date(task.dueDate).toISOString().split('T')[0];
        return taskDate === dateStr;
      });
      
      days.push({ date, tasks: dayTasks });
    }
    
    return days;
  }, [filteredTasks, selectedMonth, selectedYear]);

  const goToPrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const goToToday = () => {
    const today = new Date();
    setSelectedMonth(today.getMonth());
    setSelectedYear(today.getFullYear());
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-green-500 bg-green-50';
    }
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: TaskStatus) => {
    switch (status) {
      case 'completed': return 'הושלמה';
      case 'in-progress': return 'בתהליך';
      case 'pending': return 'ממתינה';
      default: return status;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen wedding-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6D28D9]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen wedding-bg" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#BE185D] shadow-lg relative z-20 overflow-visible">
        <div className="max-w-6xl mx-auto px-4 py-6 overflow-visible">
          <div className="flex justify-between items-center overflow-visible">
            <div>
              <h1 className="text-3xl font-serif font-bold text-white">
                ניהול משימות
              </h1>
              <p className="text-white/80 mt-1 font-sans">{filteredTasks.length} משימות</p>
            </div>
            <div className="flex gap-3 overflow-visible">
              <div className="relative">
                <button
                  ref={exportButtonRef}
                  onClick={() => {
                    if (exportButtonRef.current) {
                      const rect = exportButtonRef.current.getBoundingClientRect();
                      setDropdownPosition({ top: rect.bottom + 8, left: rect.left });
                    }
                    setShowExportDropdown(!showExportDropdown);
                  }}
                  className="px-4 py-2.5 bg-white/20 backdrop-blur text-white rounded-xl hover:bg-white/30 font-semibold transition-all duration-300 flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  ייצוא
                  <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 transition-transform ${showExportDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              <button
                onClick={() => setShowManageEpicsModal(true)}
                className="px-4 py-2.5 bg-white/20 backdrop-blur text-white rounded-xl hover:bg-white/30 font-semibold transition-all duration-300"
              >
                נושאים
              </button>
              <button
                onClick={() => setShowAddTaskModal(true)}
                className="px-4 py-2.5 bg-white/95 text-[#6D28D9] rounded-xl hover:bg-white font-semibold transition-all duration-300 shadow-lg"
              >
                + משימה חדשה
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2.5 bg-white/95 text-[#6D28D9] rounded-xl hover:bg-white font-semibold transition-all duration-300 shadow-lg"
              >
                ← חזרה
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 relative">
        {/* Filters and Search */}
        <div className="glass rounded-2xl shadow-modern p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="חיפוש משימות..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-[#6D28D9]/20 rounded-xl focus:ring-2 focus:ring-[#6D28D9]/30 focus:border-[#6D28D9] outline-none transition-all duration-300 bg-white/70 text-[#2D2A32]"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as FilterType)}
              className="px-4 py-2.5 border-2 border-[#6D28D9]/20 rounded-xl focus:ring-2 focus:ring-[#6D28D9]/30 focus:border-[#6D28D9] outline-none transition-all duration-300 bg-white/70 text-[#2D2A32]"
            >
              <option value="all">כל הסטטוסים</option>
              <option value="pending">ממתינות</option>
              <option value="in-progress">בתהליך</option>
              <option value="completed">הושלמו</option>
            </select>

            <select
              value={filterEpic}
              onChange={(e) => setFilterEpic(e.target.value)}
              className="px-4 py-2.5 border-2 border-[#6D28D9]/20 rounded-xl focus:ring-2 focus:ring-[#6D28D9]/30 focus:border-[#6D28D9] outline-none transition-all duration-300 bg-white/70 text-[#2D2A32]"
            >
              <option value="all">כל הנושאים</option>
              {epics.map(epic => (
                <option key={epic.id} value={epic.id}>{epic.title}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortType)}
              className="px-4 py-2.5 border-2 border-[#6D28D9]/20 rounded-xl focus:ring-2 focus:ring-[#6D28D9]/30 focus:border-[#6D28D9] outline-none transition-all duration-300 bg-white/70 text-[#2D2A32]"
            >
              <option value="priority">מיין לפי עדיפות</option>
              <option value="dueDate">מיין לפי תאריך יעד</option>
              <option value="created">מיין לפי תאריך יצירה</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#6D28D9]/10">
            <span className="text-[#2D2A32] font-semibold font-sans">תצוגה:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                  viewMode === 'list'
                    ? 'bg-gradient-to-r from-[#6D28D9] to-[#BE185D] text-white shadow-lg'
                    : 'bg-white text-[#6B6573] hover:bg-[#6D28D9]/5 border border-[#6D28D9]/20'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                רשימה
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                  viewMode === 'calendar'
                    ? 'bg-gradient-to-r from-[#6D28D9] to-[#BE185D] text-white shadow-lg'
                    : 'bg-white text-[#6B6573] hover:bg-[#6D28D9]/5 border border-[#6D28D9]/20'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                לוח שנה
              </button>
            </div>
          </div>
        </div>

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <div className="glass rounded-2xl shadow-modern p-6 mb-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={goToPrevMonth}
                className="p-2 rounded-xl hover:bg-[#6D28D9]/10 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#6D28D9]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-serif font-bold text-[#2D2A32]">
                  {new Date(selectedYear, selectedMonth).toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}
                </h2>
                <button
                  onClick={goToToday}
                  className="px-3 py-1 text-sm bg-[#6D28D9]/10 text-[#6D28D9] rounded-lg hover:bg-[#6D28D9]/20 transition-colors font-semibold"
                >
                  היום
                </button>
              </div>
              
              <button
                onClick={goToNextMonth}
                className="p-2 rounded-xl hover:bg-[#6D28D9]/10 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#6D28D9]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>

            {/* Day Names */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'].map((day) => (
                <div key={day} className="text-center font-semibold text-[#6B6573] py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarData.map((day, index) => (
                <div
                  key={index}
                  className={`min-h-[100px] p-2 rounded-xl border-2 transition-all ${
                    day.date
                      ? isToday(day.date)
                        ? 'bg-gradient-to-br from-[#6D28D9]/10 to-[#BE185D]/10 border-[#6D28D9]'
                        : day.tasks.length > 0
                        ? 'bg-white border-[#6D28D9]/30 hover:border-[#6D28D9]'
                        : 'bg-white/50 border-transparent hover:border-[#6D28D9]/20'
                      : 'bg-gray-50/50 border-transparent'
                  }`}
                >
                  {day.date && (
                    <>
                      <div className={`text-sm font-semibold mb-1 ${isToday(day.date) ? 'text-[#6D28D9]' : 'text-[#2D2A32]'}`}>
                        {day.date.getDate()}
                      </div>
                      <div className="space-y-1">
                        {day.tasks.slice(0, 3).map((task) => (
                          <button
                            key={task.id}
                            onClick={() => {
                              setEditingTask(task);
                              setShowEditTaskModal(true);
                            }}
                            className={`w-full text-right text-xs p-1 rounded truncate transition-colors ${
                              task.status === 'completed'
                                ? 'bg-green-100 text-green-700 line-through'
                                : task.priority === 'high'
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : task.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                : 'bg-[#6D28D9]/10 text-[#6D28D9] hover:bg-[#6D28D9]/20'
                            }`}
                            title={task.title}
                          >
                            {task.title}
                          </button>
                        ))}
                        {day.tasks.length > 3 && (
                          <div className="text-xs text-[#6B6573] text-center">
                            +{day.tasks.length - 3} עוד
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-[#6D28D9]/10">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-100 border border-red-300"></div>
                <span className="text-sm text-[#6B6573]">עדיפות גבוהה</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-yellow-100 border border-yellow-300"></div>
                <span className="text-sm text-[#6B6573]">עדיפות בינונית</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-100 border border-green-300"></div>
                <span className="text-sm text-[#6B6573]">הושלמה</span>
              </div>
            </div>
          </div>
        )}

        {/* Tasks Grid - List View */}
        {viewMode === 'list' && (
        <div className="grid gap-4">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-lg shadow text-gray-500">
              {searchQuery || filterStatus !== 'all' || filterEpic !== 'all' 
                ? 'לא נמצאו משימות תואמות'
                : 'אין משימות עדיין. הגיע הזמן להתחיל לתכנן!'
              }
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`bg-white p-4 rounded-lg shadow border-r-4 ${getPriorityColor(task.priority)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <button
                      onClick={() => handleToggleStatus(task)}
                      className={`mt-1 w-6 h-6 rounded border-2 flex items-center justify-center cursor-pointer transition ${
                        task.status === 'completed' 
                          ? 'bg-green-500 border-green-500' 
                          : task.status === 'in-progress'
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-gray-300 hover:border-pink-500'
                      }`}
                    >
                      {task.status === 'completed' && <span className="text-white text-sm">✓</span>}
                      {task.status === 'in-progress' && <span className="text-white text-xs">⋯</span>}
                    </button>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-semibold text-lg ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                          {task.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(task.status)}`}>
                          {getStatusText(task.status)}
                        </span>
                      </div>
                      
                      {task.description && (
                        <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                        {task.dueDate && (
                          <span className="flex items-center gap-1">
                            {new Date(task.dueDate).toLocaleDateString('he-IL')}
                          </span>
                        )}
                        <button
                          onClick={() => {
                            const epic = epics.find(e => e.id === task.epicId);
                            if (epic) {
                              setViewingEpic(epic);
                              setShowEpicTasksModal(true);
                            }
                          }}
                          className="flex items-center gap-1 hover:text-purple-600 transition-colors"
                          title="צפה בכל המשימות בנושא זה"
                        >
                          {epics.find(e => e.id === task.epicId)?.title || 'כללי'}
                          {tasks.filter(t => t.epicId === task.epicId).length > 1 && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                              ({tasks.filter(t => t.epicId === task.epicId).length})
                            </span>
                          )}
                        </button>
                        <span className="flex items-center gap-1">
                          {task.priority === 'high' && <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>}
                          {task.priority === 'medium' && <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block"></span>}
                          {task.priority === 'low' && <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>}
                          {task.priority === 'high' && ' גבוהה'}
                          {task.priority === 'medium' && ' בינונית'}
                          {task.priority === 'low' && ' נמוכה'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        if (!task.dueDate) {
                          alert('אין תאריך יעד למשימה זו. לא ניתן ליצור קובץ יומן.');
                          return;
                        }
                        
                        try {
                          // Generate ICS file URL - only send dueDate to keep URL short
                          // Title and description will be fetched from Firestore if needed
                          const baseUrl = window.location.origin;
                          const icsParams = new URLSearchParams({
                            dueDate: new Date(task.dueDate).toISOString(),
                          });
                          const icsUrl = `${baseUrl}/api/tasks/${task.id}/ics?${icsParams.toString()}`;
                          
                          // Create clean WhatsApp message
                          const taskTitle = task.title.trim();
                          const dateStr = new Date(task.dueDate).toLocaleDateString('he-IL', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          });
                          
                          // Build message parts
                          let messageParts: string[] = [];
                          messageParts.push(taskTitle);
                          if (task.description) {
                            messageParts.push(task.description);
                          }
                          messageParts.push(`תאריך: ${dateStr}`);
                          messageParts.push('');
                          messageParts.push(`הוסף ליומן:`);
                          messageParts.push(icsUrl);
                          
                          const message = messageParts.join('\n');
                          
                          // Safely encode the message
                          let whatsappUrl: string;
                          try {
                            whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
                          } catch (encodeError) {
                            // Fallback: use a simpler message if encoding fails
                            const simpleMessage = `${taskTitle}\nתאריך: ${dateStr}\n\nהוסף ליומן:\n${icsUrl}`;
                            whatsappUrl = `https://wa.me/?text=${encodeURIComponent(simpleMessage)}`;
                          }
                          
                          window.open(whatsappUrl, '_blank');
                        } catch (error) {
                          console.error('Error generating ICS:', error);
                          alert('שגיאה ביצירת קובץ היומן');
                        }
                      }}
                      className="text-green-500 hover:text-green-700 p-2"
                      title="שלח לוואטסאפ עם קישור ליומן"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        setEditingTask(task);
                        setShowEditTaskModal(true);
                      }}
                      className="text-blue-500 hover:text-blue-700 p-2"
                      title="ערוך"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-red-500 hover:text-red-700 p-2"
                      title="מחק"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        )}
      </main>

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-[#6D28D9]/20 animate-modalIn">
            <h2 className="text-2xl font-serif font-bold mb-6 text-[#2D2A32] border-b border-[#6D28D9]/20 pb-4">הוספת משימה חדשה</h2>
            <form onSubmit={handleCreateTask} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[#2D2A32] mb-2">כותרת *</label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-[#6D28D9]/20 rounded-xl focus:ring-2 focus:ring-[#6D28D9]/30 focus:border-[#6D28D9] outline-none bg-white text-[#2D2A32] transition-all duration-300"
                  placeholder="לדוגמה: לסגור אולם"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2D2A32] mb-2">תיאור</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-[#6D28D9]/20 rounded-xl focus:ring-2 focus:ring-[#6D28D9]/30 focus:border-[#6D28D9] outline-none bg-white text-[#2D2A32] transition-all duration-300"
                  rows={3}
                  placeholder="פרטים נוספים..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2D2A32] mb-2">נושא (Epic)</label>
                <select
                  value={newTask.epicId}
                  onChange={(e) => setNewTask({ ...newTask, epicId: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-[#6D28D9]/20 rounded-xl focus:ring-2 focus:ring-[#6D28D9]/30 focus:border-[#6D28D9] outline-none bg-white text-[#2D2A32] transition-all duration-300"
                >
                  {epics.length === 0 ? (
                    <option value="">ייווצר נושא "כללי" אוטומטית</option>
                  ) : (
                    <>
                      <option value="">בחר נושא...</option>
                      {epics.map(epic => (
                        <option key={epic.id} value={epic.id}>{epic.title}</option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2D2A32] mb-2">עדיפות</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Priority })}
                  className="w-full px-4 py-3 border-2 border-[#6D28D9]/20 rounded-xl focus:ring-2 focus:ring-[#6D28D9]/30 focus:border-[#6D28D9] outline-none bg-white text-[#2D2A32] transition-all duration-300"
                >
                  <option value="low">נמוכה</option>
                  <option value="medium">בינונית</option>
                  <option value="high">גבוהה</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2D2A32] mb-2">תאריך יעד</label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-[#6D28D9]/20 rounded-xl focus:ring-2 focus:ring-[#6D28D9]/30 focus:border-[#6D28D9] outline-none bg-white text-[#2D2A32] transition-all duration-300"
                />
              </div>

              <div className="flex gap-3 justify-end mt-8 pt-4 border-t border-[#6D28D9]/20">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-6 py-3 text-[#2D2A32] bg-[#F5F3EF] hover:bg-[#E8E5E0] rounded-xl font-semibold transition-all duration-300"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-[#6D28D9] to-[#BE185D] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                >
                  צור משימה
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {showEditTaskModal && editingTask && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-[#6D28D9]/20 animate-modalIn">
            <h2 className="text-2xl font-serif font-bold mb-6 text-[#2D2A32] border-b border-[#6D28D9]/20 pb-4">עריכת משימה</h2>
            <form onSubmit={handleUpdateTask} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[#2D2A32] mb-2">כותרת *</label>
                <input
                  type="text"
                  required
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-[#6D28D9]/20 rounded-xl focus:ring-2 focus:ring-[#6D28D9]/30 focus:border-[#6D28D9] outline-none bg-white text-[#2D2A32] transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2D2A32] mb-2">תיאור</label>
                <textarea
                  value={editingTask.description || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-[#6D28D9]/20 rounded-xl focus:ring-2 focus:ring-[#6D28D9]/30 focus:border-[#6D28D9] outline-none bg-white text-[#2D2A32] transition-all duration-300"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2D2A32] mb-2">נושא</label>
                <select
                  value={editingTask.epicId}
                  onChange={(e) => setEditingTask({ ...editingTask, epicId: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-[#6D28D9]/20 rounded-xl focus:ring-2 focus:ring-[#6D28D9]/30 focus:border-[#6D28D9] outline-none bg-white text-[#2D2A32] transition-all duration-300"
                >
                  {epics.map(epic => (
                    <option key={epic.id} value={epic.id}>{epic.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2D2A32] mb-2">עדיפות</label>
                <select
                  value={editingTask.priority}
                  onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as Priority })}
                  className="w-full px-4 py-3 border-2 border-[#6D28D9]/20 rounded-xl focus:ring-2 focus:ring-[#6D28D9]/30 focus:border-[#6D28D9] outline-none bg-white text-[#2D2A32] transition-all duration-300"
                >
                  <option value="low">נמוכה</option>
                  <option value="medium">בינונית</option>
                  <option value="high">גבוהה</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2D2A32] mb-2">תאריך יעד</label>
                <input
                  type="date"
                  value={editingTask.dueDate ? new Date(editingTask.dueDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value ? new Date(e.target.value) : undefined })}
                  className="w-full px-4 py-3 border-2 border-[#6D28D9]/20 rounded-xl focus:ring-2 focus:ring-[#6D28D9]/30 focus:border-[#6D28D9] outline-none bg-white text-[#2D2A32] transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2D2A32] mb-2">סטטוס</label>
                <select
                  value={editingTask.status}
                  onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value as TaskStatus })}
                  className="w-full px-4 py-3 border-2 border-[#6D28D9]/20 rounded-xl focus:ring-2 focus:ring-[#6D28D9]/30 focus:border-[#6D28D9] outline-none bg-white text-[#2D2A32] transition-all duration-300"
                >
                  <option value="pending">ממתינה</option>
                  <option value="in-progress">בתהליך</option>
                  <option value="completed">הושלמה</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2D2A32] mb-2">הערות</label>
                <textarea
                  value={editingTask.notes || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, notes: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-[#6D28D9]/20 rounded-xl focus:ring-2 focus:ring-[#6D28D9]/30 focus:border-[#6D28D9] outline-none bg-white text-[#2D2A32] transition-all duration-300"
                  rows={3}
                  placeholder="הערות נוספות..."
                />
              </div>

              <div className="flex gap-3 justify-end mt-8 pt-4 border-t border-[#6D28D9]/20">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditTaskModal(false);
                    setEditingTask(null);
                  }}
                  className="px-6 py-3 text-[#2D2A32] bg-[#F5F3EF] hover:bg-[#E8E5E0] rounded-xl font-semibold transition-all duration-300"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-[#6D28D9] to-[#BE185D] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                >
                  שמור שינויים
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Epics Modal */}
      {showManageEpicsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-[#6D28D9]/20 animate-modalIn">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#2D2A32]">ניהול נושאים (Epics)</h2>
              <button
                onClick={() => setShowAddEpicModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-[#6D28D9] to-[#BE185D] text-white rounded-xl hover:shadow-lg text-sm font-semibold transition-all duration-300"
              >
                + נושא חדש
              </button>
            </div>

            <div className="space-y-3">
              {epics.length === 0 ? (
                <p className="text-center text-[#6B6573] py-8">אין נושאים עדיין</p>
              ) : (
                epics.map(epic => {
                  const epicTasks = tasks.filter(t => t.epicId === epic.id);
                  return (
                    <div key={epic.id} className="flex items-center justify-between p-4 border-2 border-[#6D28D9]/20 rounded-xl hover:bg-[#F5F3EF] transition-all duration-300">
                      <div className="flex-1">
                        <h3 className="font-semibold text-[#2D2A32]">{epic.title}</h3>
                        {epic.description && <p className="text-sm text-[#6B6573] mt-1">{epic.description}</p>}
                        <p className="text-xs text-[#6B6573] mt-1">
                          {epicTasks.length} משימות
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {epicTasks.length > 0 && (
                          <button
                            onClick={() => {
                              setViewingEpic(epic);
                              setShowEpicTasksModal(true);
                            }}
                            className="text-[#6D28D9] hover:text-[#BE185D] p-2 transition-colors duration-300"
                            title="צפה בכל המשימות"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteEpic(epic.id)}
                          className="text-red-500 hover:text-red-700 p-2"
                          title="מחק נושא"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex justify-end mt-8 pt-4 border-t border-[#6D28D9]/20">
              <button
                onClick={() => setShowManageEpicsModal(false)}
                className="px-6 py-3 text-[#2D2A32] bg-[#F5F3EF] hover:bg-[#E8E5E0] rounded-xl font-semibold transition-all duration-300"
              >
                סגור
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Epic Modal */}
      {showAddEpicModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl border border-[#6D28D9]/20 animate-modalIn">
            <h2 className="text-2xl font-bold mb-6 text-[#2D2A32]">יצירת נושא חדש</h2>
            <form onSubmit={handleCreateEpic} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[#2D2A32] mb-2">שם הנושא *</label>
                <input
                  type="text"
                  required
                  value={newEpic.title}
                  onChange={(e) => setNewEpic({ ...newEpic, title: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-[#6D28D9]/20 rounded-xl focus:ring-2 focus:ring-[#6D28D9]/30 focus:border-[#6D28D9] outline-none bg-white text-[#2D2A32] transition-all duration-300"
                  placeholder="לדוגמה: אולם וקייטרינג"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#2D2A32] mb-2">תיאור</label>
                <textarea
                  value={newEpic.description}
                  onChange={(e) => setNewEpic({ ...newEpic, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-[#6D28D9]/20 rounded-xl focus:ring-2 focus:ring-[#6D28D9]/30 focus:border-[#6D28D9] outline-none bg-white text-[#2D2A32] transition-all duration-300"
                  rows={3}
                  placeholder="תיאור קצר של הנושא..."
                />
              </div>

              <div className="flex gap-3 justify-end mt-8 pt-4 border-t border-[#6D28D9]/20">
                <button
                  type="button"
                  onClick={() => setShowAddEpicModal(false)}
                  className="px-6 py-3 text-[#2D2A32] bg-[#F5F3EF] hover:bg-[#E8E5E0] rounded-xl font-semibold transition-all duration-300"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-[#6D28D9] to-[#BE185D] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                >
                  צור נושא
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Epic Tasks Modal - Shows all tasks under an Epic */}
      {showEpicTasksModal && viewingEpic && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-[#6D28D9]/20 animate-modalIn">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[#2D2A32]">{viewingEpic.title}</h2>
                {viewingEpic.description && (
                  <p className="text-[#6B6573] mt-1">{viewingEpic.description}</p>
                )}
                <p className="text-sm text-[#6B6573] mt-2">
                  {tasks.filter(t => t.epicId === viewingEpic.id).length} משימות
                </p>
              </div>
              <button
                onClick={() => {
                  setShowEpicTasksModal(false);
                  setViewingEpic(null);
                }}
                className="text-[#6B6573] hover:text-[#2D2A32] text-2xl transition-colors duration-300"
                title="סגור"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 mt-6">
              {tasks.filter(t => t.epicId === viewingEpic.id).length === 0 ? (
                <div className="text-center py-8 text-[#6B6573]">
                  אין משימות בנושא זה עדיין
                </div>
              ) : (
                tasks
                  .filter(t => t.epicId === viewingEpic.id)
                  .sort((a, b) => {
                    const priorityOrder = { high: 0, medium: 1, low: 2 };
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                  })
                  .map((task) => (
                    <div
                      key={task.id}
                      className={`p-4 rounded-lg border-r-4 ${getPriorityColor(task.priority)} bg-white shadow-sm hover:shadow-md transition-shadow`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <button
                            onClick={() => handleToggleStatus(task)}
                            className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition ${
                              task.status === 'completed' 
                                ? 'bg-green-500 border-green-500' 
                                : task.status === 'in-progress'
                                ? 'bg-blue-500 border-blue-500'
                                : 'border-gray-300 hover:border-pink-500'
                            }`}
                          >
                            {task.status === 'completed' && <span className="text-white text-xs">✓</span>}
                            {task.status === 'in-progress' && <span className="text-white text-xs">⋯</span>}
                          </button>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`font-semibold ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                                {task.title}
                              </h3>
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(task.status)}`}>
                                {getStatusText(task.status)}
                              </span>
                            </div>
                            
                            {task.description && (
                              <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                            )}
                            
                            {task.notes && (
                              <p className="text-xs text-gray-500 mb-2 italic">{task.notes}</p>
                            )}
                            
                            <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                              {task.dueDate && (
                                <span className="flex items-center gap-1">
                                  {new Date(task.dueDate).toLocaleDateString('he-IL')}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                {task.priority === 'high' && <><span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span> גבוהה</>}
                                {task.priority === 'medium' && <><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block"></span> בינונית</>}
                                {task.priority === 'low' && <><span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span> נמוכה</>}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={async () => {
                              if (!task.dueDate) {
                                alert('אין תאריך יעד למשימה זו. לא ניתן ליצור קובץ יומן.');
                                return;
                              }
                              
                              try {
                                // Generate ICS file URL - only send dueDate to keep URL short
                                // Title and description will be fetched from Firestore if needed
                                const baseUrl = window.location.origin;
                                const icsParams = new URLSearchParams({
                                  dueDate: new Date(task.dueDate).toISOString(),
                                });
                                const icsUrl = `${baseUrl}/api/tasks/${task.id}/ics?${icsParams.toString()}`;
                                
                                // Create clean WhatsApp message
                                const taskTitle = task.title.trim();
                                const dateStr = new Date(task.dueDate).toLocaleDateString('he-IL', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit'
                                });
                                
                                // Build message parts
                                let messageParts: string[] = [];
                                messageParts.push(taskTitle);
                                if (task.description) {
                                  messageParts.push(task.description);
                                }
                                messageParts.push(`תאריך: ${dateStr}`);
                                messageParts.push('');
                                messageParts.push(`הוסף ליומן:`);
                                messageParts.push(icsUrl);
                                
                                const message = messageParts.join('\n');
                                
                                // Safely encode the message
                                let whatsappUrl: string;
                                try {
                                  whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
                                } catch (encodeError) {
                                  // Fallback: use a simpler message if encoding fails
                                  const simpleMessage = `${taskTitle}\nתאריך: ${dateStr}\n\nהוסף ליומן:\n${icsUrl}`;
                                  whatsappUrl = `https://wa.me/?text=${encodeURIComponent(simpleMessage)}`;
                                }
                                
                                window.open(whatsappUrl, '_blank');
                              } catch (error) {
                                console.error('Error generating ICS:', error);
                                alert('שגיאה ביצירת קובץ היומן');
                              }
                            }}
                            className="text-green-500 hover:text-green-700 p-2"
                            title="שלח לוואטסאפ עם קישור ליומן"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              setEditingTask(task);
                              setShowEditTaskModal(true);
                              setShowEpicTasksModal(false);
                            }}
                            className="text-blue-500 hover:text-blue-700 p-2"
                            title="ערוך"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-red-500 hover:text-red-700 p-2"
                            title="מחק"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  setShowEpicTasksModal(false);
                  setViewingEpic(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                סגור
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Dropdown Modal */}
      {showExportDropdown && (
        <>
          <div className="fixed inset-0 z-[9999]" onClick={() => setShowExportDropdown(false)} />
          <div 
            className="fixed w-48 bg-white rounded-xl shadow-2xl border border-[#6D28D9]/20 overflow-hidden z-[10000]"
            style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
          >
            <div className="p-2 bg-gradient-to-r from-[#6D28D9] to-[#BE185D] text-white text-center font-semibold text-sm">
              ייצוא משימות
            </div>
            <button
              onClick={() => {
                exportTasksToExcel(tasks, epics, 'xlsx');
                setShowExportDropdown(false);
              }}
              className="w-full px-4 py-3 text-right text-[#2D2A32] hover:bg-[#6D28D9]/10 transition-colors font-medium flex items-center gap-3 justify-end"
            >
              <span>Excel (.xlsx)</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
            <button
              onClick={() => {
                exportTasksToExcel(tasks, epics, 'csv');
                setShowExportDropdown(false);
              }}
              className="w-full px-4 py-3 text-right text-[#2D2A32] hover:bg-[#6D28D9]/10 transition-colors font-medium border-t border-gray-100 flex items-center gap-3 justify-end"
            >
              <span>CSV (.csv)</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
