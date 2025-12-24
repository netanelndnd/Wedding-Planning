'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { epicService, taskService } from '@/services/firestoreService';
import { isMockMode } from '@/lib/firebase';
import type { Priority } from '@/types';

/**
 * Setup Tasks Page
 * ----------------
 * One-time page to add default tasks to existing users
 */
export default function SetupTasksPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const isOperationActiveRef = useRef(false);

  const handleSetupTasks = async () => {
    // Validation checks
    if (!user) {
      setError('אינך מחובר');
      return;
    }

    if (!user.uid) {
      setError('שגיאה: אין מזהה משתמש תקין');
      console.error('User object missing uid:', user);
      return;
    }

    setLoading(true);
    setError('');
    isOperationActiveRef.current = true;

    // Timeout mechanism - 30 seconds
    const timeoutId = setTimeout(() => {
      if (isOperationActiveRef.current) {
        isOperationActiveRef.current = false;
        setError('הפעולה לוקחת יותר מדי זמן. אנא נסה שוב או בדוק את החיבור לאינטרנט.');
        setLoading(false);
        console.error('Timeout: Task creation took longer than 30 seconds');
      }
    }, 30000);

    try {
      console.log('Starting tasks setup for user:', user.uid);
      console.log('Mock mode:', isMockMode);

      // Step 1: Create default Epic
      let epicId: string;
      try {
        console.log('Creating default epic...');
        epicId = await epicService.addEpic(user.uid, {
          title: 'משימות כלליות',
          description: 'משימות חשובות לתכנון החתונה',
          category: 'general',
          color: '#ec4899',
          order: 0,
        });
        console.log('✅ Epic created:', epicId);
      } catch (epicErr: any) {
        console.error('Error creating epic:', epicErr);
        isOperationActiveRef.current = false;
        clearTimeout(timeoutId);
        setError(`שגיאה ביצירת הנושא: ${epicErr.message || 'שגיאה לא ידועה'}`);
        setLoading(false);
        return;
      }

      // Step 2: Create default tasks
      const defaultTasks: Array<{
        title: string;
        description: string;
        priority: Priority;
        category: string;
        epicId: string;
        status: 'pending';
        coupleId: string;
      }> = [
        {
          title: '🏛️ הזמנת אולם',
          description: 'לבחור ולהזמין אולם לחתונה',
          priority: 'high',
          category: 'venue',
          epicId,
          status: 'pending',
          coupleId: user.uid,
        },
        {
          title: '📸 שכירת צלם',
          description: 'לבחור צלם מקצועי לחתונה',
          priority: 'high',
          category: 'photography',
          epicId,
          status: 'pending',
          coupleId: user.uid,
        },
        {
          title: '🎵 שכירת תקליטן או זמר',
          description: 'לבחור תקליטן או זמר לחתונה',
          priority: 'medium',
          category: 'entertainment',
          epicId,
          status: 'pending',
          coupleId: user.uid,
        },
        {
          title: '🕍 תיאום עם רב',
          description: 'לתאם פגישה עם רב לחתונה',
          priority: 'high',
          category: 'ceremony',
          epicId,
          status: 'pending',
          coupleId: user.uid,
        },
        {
          title: '👰 קניית שמלת כלה',
          description: 'לבחור ולהזמין שמלת כלה',
          priority: 'high',
          category: 'attire',
          epicId,
          status: 'pending',
          coupleId: user.uid,
        },
        {
          title: '🤵 קניית חליפת חתן',
          description: 'לבחור ולהזמין חליפה לחתן',
          priority: 'medium',
          category: 'attire',
          epicId,
          status: 'pending',
          coupleId: user.uid,
        },
      ];

      // Add all tasks with individual error handling
      console.log(`Creating ${defaultTasks.length} default tasks...`);
      const taskPromises = defaultTasks.map(async (task, index) => {
        try {
          console.log(`Creating task ${index + 1}/${defaultTasks.length}: ${task.title}`);
          const taskId = await taskService.addTask(user.uid, task);
          console.log(`✅ Task ${index + 1} created: ${taskId}`);
          return taskId;
        } catch (taskErr: any) {
          console.error(`Error creating task ${index + 1} (${task.title}):`, taskErr);
          throw new Error(`שגיאה ביצירת המשימה "${task.title}": ${taskErr.message || 'שגיאה לא ידועה'}`);
        }
      });

      try {
        await Promise.all(taskPromises);
        console.log('✅ All tasks created successfully!');
      } catch (tasksErr: any) {
        console.error('Error creating some tasks:', tasksErr);
        isOperationActiveRef.current = false;
        clearTimeout(timeoutId);
        setError(tasksErr.message || 'שגיאה ביצירת חלק מהמשימות');
        setLoading(false);
        return;
      }

      // Clear timeout on success
      isOperationActiveRef.current = false;
      clearTimeout(timeoutId);
      setSuccess(true);
      setLoading(false);

      // Redirect to tasks page after 2 seconds
      setTimeout(() => {
        router.push('/tasks');
      }, 2000);

    } catch (err: any) {
      console.error('Unexpected error creating tasks:', err);
      isOperationActiveRef.current = false;
      clearTimeout(timeoutId);
      setError(err.message || 'שגיאה ביצירת המשימות. אנא נסה שוב.');
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="glass p-8 rounded-2xl shadow-modern text-center max-w-md">
          <span className="text-6xl mb-4 inline-block">🔒</span>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">נדרש התחברות</h1>
          <p className="text-gray-600 mb-6">עליך להתחבר כדי להשתמש בדף זה</p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl font-bold hover:from-pink-700 hover:to-purple-700 transition-all duration-300"
          >
            התחבר
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50">
        <div className="glass p-8 rounded-2xl shadow-modern text-center max-w-md animate-scaleIn">
          <div className="text-6xl mb-4 animate-bounce">✅</div>
          <h1 className="text-3xl font-bold text-green-600 mb-4">הצלחה! 🎉</h1>
          <p className="text-gray-700 text-lg mb-2">
            6 משימות נוצרו בהצלחה!
          </p>
          <p className="text-gray-600 text-sm mb-6">
            מעביר אותך לדף המשימות...
          </p>
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
            <span className="text-gray-600">טוען...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="glass p-8 rounded-2xl shadow-modern">
          <div className="text-center mb-8">
            <span className="text-6xl mb-4 inline-block">📋</span>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              הוספת משימות ברירת מחדל
            </h1>
            <p className="text-gray-600">
              לחץ על הכפתור כדי להוסיף 6 משימות חשובות לתכנון החתונה
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 animate-fadeIn">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <h3 className="font-bold text-gray-900 mb-4">המשימות שיווצרו:</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-gray-700">
                <span className="text-2xl">🏛️</span>
                <div>
                  <strong>הזמנת אולם</strong>
                  <span className="text-sm text-gray-500 mr-2">(עדיפות גבוהה)</span>
                </div>
              </li>
              <li className="flex items-center gap-3 text-gray-700">
                <span className="text-2xl">📸</span>
                <div>
                  <strong>שכירת צלם</strong>
                  <span className="text-sm text-gray-500 mr-2">(עדיפות גבוהה)</span>
                </div>
              </li>
              <li className="flex items-center gap-3 text-gray-700">
                <span className="text-2xl">🎵</span>
                <div>
                  <strong>שכירת תקליטן או זמר</strong>
                  <span className="text-sm text-gray-500 mr-2">(עדיפות בינונית)</span>
                </div>
              </li>
              <li className="flex items-center gap-3 text-gray-700">
                <span className="text-2xl">🕍</span>
                <div>
                  <strong>תיאום עם רב</strong>
                  <span className="text-sm text-gray-500 mr-2">(עדיפות גבוהה)</span>
                </div>
              </li>
              <li className="flex items-center gap-3 text-gray-700">
                <span className="text-2xl">👰</span>
                <div>
                  <strong>קניית שמלת כלה</strong>
                  <span className="text-sm text-gray-500 mr-2">(עדיפות גבוהה)</span>
                </div>
              </li>
              <li className="flex items-center gap-3 text-gray-700">
                <span className="text-2xl">🤵</span>
                <div>
                  <strong>קניית חליפת חתן</strong>
                  <span className="text-sm text-gray-500 mr-2">(עדיפות בינונית)</span>
                </div>
              </li>
            </ul>
          </div>

          <button
            onClick={handleSetupTasks}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-pink-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                יוצר משימות...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                ✨ צור משימות
              </span>
            )}
          </button>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-600 hover:text-gray-900 font-semibold transition-colors"
            >
              ← חזור לדשבורד
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

