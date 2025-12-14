'use client';

import { useDashboard } from '@/hooks/useDashboard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { memo } from 'react';

/**
 * DashboardPage Component
 * ----------------------
 * Main dashboard with performance optimizations:
 * - Separated loading component
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
    navigateTo,
    handleLogout,
  } = useDashboard();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Header with Gradient */}
      <header className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 shadow-modern">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center">
            <div className="animate-fadeIn">
              <h1 className="text-4xl font-bold text-white mb-2">
                {couple ? `💑 ${couple.partner1Name} ו${couple.partner2Name}` : '💝 דשבורד'}
              </h1>
              <p className="text-pink-100 text-lg flex items-center gap-2">
                {daysUntilWedding > 0
                  ? `⏰ עוד ${daysUntilWedding} ימים עד החתונה! 🎉`
                  : '🎊 היום הגדול הגיע!'}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigateTo('/settings')}
                className="px-6 py-3 bg-white text-pink-600 rounded-xl hover:bg-pink-50 font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                ⚙️ הגדרות
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-3 bg-white bg-opacity-20 text-white border-2 border-white rounded-xl hover:bg-white hover:text-pink-600 font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 backdrop-blur-sm"
                title="התנתק מהמערכת"
              >
                🚪 התנתק
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards with Modern Design */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass p-6 rounded-2xl shadow-modern hover:shadow-modern-hover transition-all duration-300 animate-fadeIn border-r-4 border-pink-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-600 text-sm font-semibold mb-1">📊 סך הכל משימות</h3>
                <p className="text-4xl font-bold text-pink-600">{tasks.length}</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl">
                <span className="text-3xl">📋</span>
              </div>
            </div>
          </div>
          
          <div className="glass p-6 rounded-2xl shadow-modern hover:shadow-modern-hover transition-all duration-300 animate-fadeIn border-r-4 border-green-500" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-600 text-sm font-semibold mb-1">✅ משימות הושלמו</h3>
                <p className="text-4xl font-bold text-green-600">{completedCount}</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-100 to-green-200 rounded-xl">
                <span className="text-3xl">🎯</span>
              </div>
            </div>
          </div>
          
          <div className="glass p-6 rounded-2xl shadow-modern hover:shadow-modern-hover transition-all duration-300 animate-fadeIn border-r-4 border-orange-500" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-600 text-sm font-semibold mb-1">⏳ משימות ממתינות</h3>
                <p className="text-4xl font-bold text-orange-600">{pendingCount}</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl">
                <span className="text-3xl">⏰</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Progress Bar */}
        <div className="glass p-8 rounded-2xl shadow-modern mb-8 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold gradient-text">🚀 התקדמות כללית</h2>
            <span className="text-3xl font-bold text-pink-600">
              {tasks.length === 0 ? '0%' : `${Math.round((completedCount / tasks.length) * 100)}%`}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden shadow-inner">
            <div
              className="h-6 rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 relative overflow-hidden"
              style={{
                width: tasks.length === 0 ? '0%' : `${(completedCount / tasks.length) * 100}%`,
              }}
            >
              <div className="absolute inset-0 bg-white opacity-30 animate-pulse"></div>
            </div>
          </div>
          <p className="text-gray-600 mt-3 text-lg font-semibold">
            {tasks.length === 0
              ? '🎯 התחל להוסיף משימות'
              : `✨ ${completedCount} מתוך ${tasks.length} משימות הושלמו - כל הכבוד!`}
          </p>
        </div>

        {/* Modern Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => navigateTo('/tasks')}
            className="group p-8 glass rounded-2xl shadow-modern hover:shadow-modern-hover transition-all duration-300 text-center border-2 border-transparent hover:border-pink-300 animate-fadeIn transform hover:-translate-y-1"
            style={{ animationDelay: '0.4s' }}
          >
            <div className="p-4 bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl inline-block mb-4 group-hover:scale-110 transition-transform duration-300">
              <span className="text-5xl">📋</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:gradient-text transition-all duration-300">משימות</h3>
            <p className="text-gray-600">ניהול משימות ו-Epics</p>
            <div className="mt-4 text-pink-600 font-semibold group-hover:text-purple-600 transition-colors duration-300">
              לחץ לניהול →
            </div>
          </button>

          <button
            onClick={() => navigateTo('/guests')}
            className="group p-8 glass rounded-2xl shadow-modern hover:shadow-modern-hover transition-all duration-300 text-center border-2 border-transparent hover:border-purple-300 animate-fadeIn transform hover:-translate-y-1"
            style={{ animationDelay: '0.5s' }}
          >
            <div className="p-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl inline-block mb-4 group-hover:scale-110 transition-transform duration-300">
              <span className="text-5xl">👥</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:gradient-text transition-all duration-300">אורחים</h3>
            <p className="text-gray-600">ניהול רשימת אורחים ו-RSVP</p>
            <div className="mt-4 text-purple-600 font-semibold group-hover:text-pink-600 transition-colors duration-300">
              לחץ לניהול →
            </div>
          </button>

          <button
            onClick={() => navigateTo('/vendors')}
            className="group p-8 glass rounded-2xl shadow-modern hover:shadow-modern-hover transition-all duration-300 text-center border-2 border-transparent hover:border-blue-300 animate-fadeIn transform hover:-translate-y-1"
            style={{ animationDelay: '0.6s' }}
          >
            <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl inline-block mb-4 group-hover:scale-110 transition-transform duration-300">
              <span className="text-5xl">🎤</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:gradient-text transition-all duration-300">ספקים</h3>
            <p className="text-gray-600">ניהול ספקים וקבלנים</p>
            <div className="mt-4 text-blue-600 font-semibold group-hover:text-indigo-600 transition-colors duration-300">
              לחץ לניהול →
            </div>
          </button>

          <button
            onClick={() => navigateTo('/timeline')}
            className="group p-8 glass rounded-2xl shadow-modern hover:shadow-modern-hover transition-all duration-300 text-center border-2 border-transparent hover:border-green-300 animate-fadeIn transform hover:-translate-y-1"
            style={{ animationDelay: '0.7s' }}
          >
            <div className="p-4 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl inline-block mb-4 group-hover:scale-110 transition-transform duration-300">
              <span className="text-5xl">📅</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:gradient-text transition-all duration-300">לוח זמנים</h3>
            <p className="text-gray-600">תכנון זמנים ומילונים</p>
            <div className="mt-4 text-green-600 font-semibold group-hover:text-teal-600 transition-colors duration-300">
              לחץ לניהול →
            </div>
          </button>
        </div>
        
        {/* Footer Badge */}
        <div className="text-center mt-12 animate-fadeIn" style={{ animationDelay: '0.8s' }}>
          <div className="inline-block px-6 py-3 glass rounded-full shadow-lg">
            <span className="text-gray-600 font-semibold">
              💝 תכנון חתונה בקלות ובסטייל
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}

// Export memoized version to prevent unnecessary re-renders
export default memo(DashboardPage);
