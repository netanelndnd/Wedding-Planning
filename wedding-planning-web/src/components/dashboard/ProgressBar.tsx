'use client';

import { memo } from 'react';

interface ProgressBarProps {
  completedCount: number;
  totalTasks: number;
}

/**
 * ProgressBar Component
 * ---------------------
 * Displays overall progress with a visual progress bar
 */
function ProgressBar({ completedCount, totalTasks }: ProgressBarProps) {
  const percentage = totalTasks === 0 ? 0 : Math.round((completedCount / totalTasks) * 100);

  return (
    <div className="glass p-8 rounded-2xl shadow-modern mb-8 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold gradient-text">🚀 התקדמות כללית</h2>
        <span className="text-3xl font-bold text-pink-600">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden shadow-inner">
        <div
          className="h-6 rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 relative overflow-hidden"
          style={{
            width: `${percentage}%`,
          }}
        >
          <div className="absolute inset-0 bg-white opacity-30 animate-pulse"></div>
        </div>
      </div>
      <p className="text-gray-600 mt-3 text-lg font-semibold">
        {totalTasks === 0
          ? '🎯 התחל להוסיף משימות'
          : `✨ ${completedCount} מתוך ${totalTasks} משימות הושלמו - כל הכבוד!`}
      </p>
    </div>
  );
}

export default memo(ProgressBar);

