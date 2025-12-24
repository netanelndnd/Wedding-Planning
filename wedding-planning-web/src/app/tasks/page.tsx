'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { taskService, epicService } from '@/services/firestoreService';
import { Task, Epic, Priority, TaskStatus } from '@/types';

type FilterType = 'all' | 'pending' | 'in-progress' | 'completed';
type SortType = 'priority' | 'dueDate' | 'created';

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
      const unsubscribeTasks = taskService.subscribeToTasks(user.uid, (fetchedTasks) => {
        setTasks(fetchedTasks);
      });

      const unsubscribeEpics = epicService.subscribeToEpics(user.uid, (fetchedEpics) => {
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
        epicIdToUse = await epicService.addEpic(user.uid, {
          title: 'כללי',
          category: 'general',
          order: 0,
          coupleId: user.uid
        });
      }

      if (!epicIdToUse) {
        alert('יש לבחור נושא למשימה');
        return;
      }

      await taskService.addTask(user.uid, {
        ...newTask,
        epicId: epicIdToUse,
        status: 'pending',
        coupleId: user.uid,
        dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined,
      });

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
      await taskService.updateTask(editingTask.id, {
        title: editingTask.title,
        description: editingTask.description,
        priority: editingTask.priority,
        status: editingTask.status,
        dueDate: editingTask.dueDate,
        epicId: editingTask.epicId,
        notes: editingTask.notes,
      });

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
      await taskService.changeTaskStatus(task.id, newStatus);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('האם את/ה בטוח/ה שברצונך למחוק משימה זו?')) {
      try {
        await taskService.deleteTask(taskId);
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const handleCreateEpic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await epicService.addEpic(user.uid, {
        ...newEpic,
        order: epics.length,
        coupleId: user.uid,
      });

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
        await epicService.deleteEpic(epicId);
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ניהול משימות</h1>
            <p className="text-gray-600 mt-1">{filteredTasks.length} משימות</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowManageEpicsModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              🗂️ נושאים
            </button>
            <button
              onClick={() => setShowAddTaskModal(true)}
              className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 flex items-center gap-2"
            >
              <span>+</span> משימה חדשה
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="🔍 חיפוש משימות..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
            />
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as FilterType)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
            >
              <option value="all">כל הסטטוסים</option>
              <option value="pending">ממתינות</option>
              <option value="in-progress">בתהליך</option>
              <option value="completed">הושלמו</option>
            </select>

            <select
              value={filterEpic}
              onChange={(e) => setFilterEpic(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
            >
              <option value="all">כל הנושאים</option>
              {epics.map(epic => (
                <option key={epic.id} value={epic.id}>{epic.title}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortType)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
            >
              <option value="priority">מיין לפי עדיפות</option>
              <option value="dueDate">מיין לפי תאריך יעד</option>
              <option value="created">מיין לפי תאריך יצירה</option>
            </select>
          </div>
        </div>

        {/* Tasks Grid */}
        <div className="grid gap-4">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-lg shadow text-gray-500">
              {searchQuery || filterStatus !== 'all' || filterEpic !== 'all' 
                ? 'לא נמצאו משימות תואמות 🔍'
                : 'אין משימות עדיין. הגיע הזמן להתחיל לתכנן! 🎉'
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
                            📅 {new Date(task.dueDate).toLocaleDateString('he-IL')}
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
                          🏷️ {epics.find(e => e.id === task.epicId)?.title || 'כללי'}
                          {tasks.filter(t => t.epicId === task.epicId).length > 1 && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                              ({tasks.filter(t => t.epicId === task.epicId).length})
                            </span>
                          )}
                        </button>
                        <span className="flex items-center gap-1">
                          {task.priority === 'high' && '🔴 גבוהה'}
                          {task.priority === 'medium' && '🟡 בינונית'}
                          {task.priority === 'low' && '🟢 נמוכה'}
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
                          const taskTitle = task.title.replace(/[📅📎]/g, '').trim(); // Remove emojis from title
                          const dateStr = new Date(task.dueDate).toLocaleDateString('he-IL', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          });
                          
                          // Build message parts
                          let messageParts: string[] = [];
                          messageParts.push(`📅 ${taskTitle}`);
                          if (task.description) {
                            messageParts.push(task.description);
                          }
                          messageParts.push(`תאריך: ${dateStr}`);
                          messageParts.push('');
                          messageParts.push(`📎 הוסף ליומן:`);
                          messageParts.push(icsUrl);
                          
                          const message = messageParts.join('\n');
                          
                          // Safely encode the message
                          let whatsappUrl: string;
                          try {
                            whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
                          } catch (encodeError) {
                            // Fallback: use a simpler message if encoding fails
                            const simpleMessage = `📅 ${taskTitle}\nתאריך: ${dateStr}\n\n📎 הוסף ליומן:\n${icsUrl}`;
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
                      📱
                    </button>
                    <button
                      onClick={() => {
                        setEditingTask(task);
                        setShowEditTaskModal(true);
                      }}
                      className="text-blue-500 hover:text-blue-700 p-2"
                      title="ערוך"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-red-500 hover:text-red-700 p-2"
                      title="מחק"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-900">הוספת משימה חדשה</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">כותרת *</label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                  placeholder="לדוגמה: לסגור אולם"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">תיאור</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                  rows={3}
                  placeholder="פרטים נוספים..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">נושא (Epic)</label>
                <select
                  value={newTask.epicId}
                  onChange={(e) => setNewTask({ ...newTask, epicId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">עדיפות</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Priority })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                >
                  <option value="low">🟢 נמוכה</option>
                  <option value="medium">🟡 בינונית</option>
                  <option value="high">🔴 גבוהה</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">תאריך יעד</label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-900">עריכת משימה</h2>
            <form onSubmit={handleUpdateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">כותרת *</label>
                <input
                  type="text"
                  required
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">תיאור</label>
                <textarea
                  value={editingTask.description || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">נושא</label>
                <select
                  value={editingTask.epicId}
                  onChange={(e) => setEditingTask({ ...editingTask, epicId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                >
                  {epics.map(epic => (
                    <option key={epic.id} value={epic.id}>{epic.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">עדיפות</label>
                <select
                  value={editingTask.priority}
                  onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as Priority })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                >
                  <option value="low">🟢 נמוכה</option>
                  <option value="medium">🟡 בינונית</option>
                  <option value="high">🔴 גבוהה</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">תאריך יעד</label>
                <input
                  type="date"
                  value={editingTask.dueDate ? new Date(editingTask.dueDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value ? new Date(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">סטטוס</label>
                <select
                  value={editingTask.status}
                  onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value as TaskStatus })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                >
                  <option value="pending">ממתינה</option>
                  <option value="in-progress">בתהליך</option>
                  <option value="completed">הושלמה</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">הערות</label>
                <textarea
                  value={editingTask.notes || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                  rows={3}
                  placeholder="הערות נוספות..."
                />
              </div>

              <div className="flex gap-2 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditTaskModal(false);
                    setEditingTask(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">ניהול נושאים (Epics)</h2>
              <button
                onClick={() => setShowAddEpicModal(true)}
                className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
              >
                + נושא חדש
              </button>
            </div>

            <div className="space-y-3">
              {epics.length === 0 ? (
                <p className="text-center text-gray-500 py-8">אין נושאים עדיין</p>
              ) : (
                epics.map(epic => {
                  const epicTasks = tasks.filter(t => t.epicId === epic.id);
                  return (
                    <div key={epic.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{epic.title}</h3>
                        {epic.description && <p className="text-sm text-gray-600 mt-1">{epic.description}</p>}
                        <p className="text-xs text-gray-500 mt-1">
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
                            className="text-purple-500 hover:text-purple-700 p-2"
                            title="צפה בכל המשימות"
                          >
                            👁️
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteEpic(epic.id)}
                          className="text-red-500 hover:text-red-700 p-2"
                          title="מחק נושא"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowManageEpicsModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                סגור
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Epic Modal */}
      {showAddEpicModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900">יצירת נושא חדש</h2>
            <form onSubmit={handleCreateEpic} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">שם הנושא *</label>
                <input
                  type="text"
                  required
                  value={newEpic.title}
                  onChange={(e) => setNewEpic({ ...newEpic, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="לדוגמה: אולם וקייטרינג"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">תיאור</label>
                <textarea
                  value={newEpic.description}
                  onChange={(e) => setNewEpic({ ...newEpic, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  rows={3}
                  placeholder="תיאור קצר של הנושא..."
                />
              </div>

              <div className="flex gap-2 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddEpicModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{viewingEpic.title}</h2>
                {viewingEpic.description && (
                  <p className="text-gray-600 mt-1">{viewingEpic.description}</p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  {tasks.filter(t => t.epicId === viewingEpic.id).length} משימות
                </p>
              </div>
              <button
                onClick={() => {
                  setShowEpicTasksModal(false);
                  setViewingEpic(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
                title="סגור"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 mt-6">
              {tasks.filter(t => t.epicId === viewingEpic.id).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
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
                              <p className="text-xs text-gray-500 mb-2 italic">💬 {task.notes}</p>
                            )}
                            
                            <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                              {task.dueDate && (
                                <span className="flex items-center gap-1">
                                  📅 {new Date(task.dueDate).toLocaleDateString('he-IL')}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                {task.priority === 'high' && '🔴 גבוהה'}
                                {task.priority === 'medium' && '🟡 בינונית'}
                                {task.priority === 'low' && '🟢 נמוכה'}
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
                                const taskTitle = task.title.replace(/[📅📎]/g, '').trim(); // Remove emojis from title
                                const dateStr = new Date(task.dueDate).toLocaleDateString('he-IL', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit'
                                });
                                
                                // Build message parts
                                let messageParts: string[] = [];
                                messageParts.push(`📅 ${taskTitle}`);
                                if (task.description) {
                                  messageParts.push(task.description);
                                }
                                messageParts.push(`תאריך: ${dateStr}`);
                                messageParts.push('');
                                messageParts.push(`📎 הוסף ליומן:`);
                                messageParts.push(icsUrl);
                                
                                const message = messageParts.join('\n');
                                
                                // Safely encode the message
                                let whatsappUrl: string;
                                try {
                                  whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
                                } catch (encodeError) {
                                  // Fallback: use a simpler message if encoding fails
                                  const simpleMessage = `📅 ${taskTitle}\nתאריך: ${dateStr}\n\n📎 הוסף ליומן:\n${icsUrl}`;
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
                            📱
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
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-red-500 hover:text-red-700 p-2"
                            title="מחק"
                          >
                            🗑️
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
    </div>
  );
}
