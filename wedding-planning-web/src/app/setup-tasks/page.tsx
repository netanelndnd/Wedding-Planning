'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { epicService, taskService } from '@/services/crud';
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
        const epicResult = await epicService.add(user.uid, {
          title: 'משימות כלליות',
          description: 'משימות חשובות לתכנון החתונה',
          category: 'general',
          color: '#ec4899',
          order: 0,
          coupleId: user.uid,
        });
        if (!epicResult.success || !epicResult.data) {
          throw new Error(epicResult.error || 'שגיאה ביצירת הנושא');
        }
        epicId = epicResult.data;
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
          title: 'הזמנת אולם',
          description: 'לבחור ולהזמין אולם לחתונה',
          priority: 'high',
          category: 'venue',
          epicId,
          status: 'pending',
          coupleId: user.uid,
        },
        {
          title: 'שכירת צלם',
          description: 'לבחור צלם מקצועי לחתונה',
          priority: 'high',
          category: 'photography',
          epicId,
          status: 'pending',
          coupleId: user.uid,
        },
        {
          title: 'שכירת תקליטן או זמר',
          description: 'לבחור תקליטן או זמר לחתונה',
          priority: 'medium',
          category: 'entertainment',
          epicId,
          status: 'pending',
          coupleId: user.uid,
        },
        {
          title: 'תיאום עם רב',
          description: 'לתאם פגישה עם רב לחתונה',
          priority: 'high',
          category: 'ceremony',
          epicId,
          status: 'pending',
          coupleId: user.uid,
        },
        {
          title: 'קניית שמלת כלה',
          description: 'לבחור ולהזמין שמלת כלה',
          priority: 'high',
          category: 'attire',
          epicId,
          status: 'pending',
          coupleId: user.uid,
        },
        {
          title: 'קניית חליפת חתן',
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
          const taskResult = await taskService.add(user.uid, task);
          if (!taskResult.success || !taskResult.data) {
            throw new Error(taskResult.error || 'שגיאה ביצירת המשימה');
          }
          console.log(`✅ Task ${index + 1} created: ${taskResult.data}`);
          return taskResult.data;
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
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#6D28D9]/10 to-[#BE185D]/10 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-[#6D28D9]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
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
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center animate-bounce">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-green-600 mb-4">הצלחה!</h1>
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
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#6D28D9]/10 to-[#BE185D]/10 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-[#6D28D9]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
            </div>
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
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <h3 className="font-bold text-gray-900 mb-4">המשימות שיווצרו:</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-gray-700">
                <div className="w-8 h-8 bg-[#6D28D9]/10 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#6D28D9]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                  </svg>
                </div>
                <div>
                  <strong>הזמנת אולם</strong>
                  <span className="text-sm text-gray-500 mr-2">(עדיפות גבוהה)</span>
                </div>
              </li>
              <li className="flex items-center gap-3 text-gray-700">
                <div className="w-8 h-8 bg-[#6D28D9]/10 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#6D28D9]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                  </svg>
                </div>
                <div>
                  <strong>שכירת צלם</strong>
                  <span className="text-sm text-gray-500 mr-2">(עדיפות גבוהה)</span>
                </div>
              </li>
              <li className="flex items-center gap-3 text-gray-700">
                <div className="w-8 h-8 bg-[#D4AF37]/10 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
                  </svg>
                </div>
                <div>
                  <strong>שכירת תקליטן או זמר</strong>
                  <span className="text-sm text-gray-500 mr-2">(עדיפות בינונית)</span>
                </div>
              </li>
              <li className="flex items-center gap-3 text-gray-700">
                <div className="w-8 h-8 bg-[#6D28D9]/10 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#6D28D9]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                  </svg>
                </div>
                <div>
                  <strong>תיאום עם רב</strong>
                  <span className="text-sm text-gray-500 mr-2">(עדיפות גבוהה)</span>
                </div>
              </li>
              <li className="flex items-center gap-3 text-gray-700">
                <div className="w-8 h-8 bg-[#BE185D]/10 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#BE185D]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <div>
                  <strong>קניית שמלת כלה</strong>
                  <span className="text-sm text-gray-500 mr-2">(עדיפות גבוהה)</span>
                </div>
              </li>
              <li className="flex items-center gap-3 text-gray-700">
                <div className="w-8 h-8 bg-[#D4AF37]/10 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
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
            className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-pink-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none flex items-center justify-center gap-2"
          >
            {loading ? 'יוצר משימות...' : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </svg>
                <span>צור משימות</span>
              </>
            )}
          </button>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-600 hover:text-gray-900 font-semibold transition-colors"
            >
              ← חזרה
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

