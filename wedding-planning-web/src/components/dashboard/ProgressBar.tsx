'use client';

import { memo } from 'react';

interface ProgressBarProps {
  completedCount: number;
  totalTasks: number;
}

/**
 * ProgressBar Component
 * ---------------------
 * Displays overall progress with a visual animated progress bar
 */
function ProgressBar({ completedCount, totalTasks }: ProgressBarProps) {
  const percentage = totalTasks === 0 ? 0 : Math.round((completedCount / totalTasks) * 100);

  return (
    <div className="glass p-8 rounded-2xl shadow-modern card-hover mb-8 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-serif font-bold gradient-text">התקדמות כללית</h2>
        <span className="text-3xl font-bold text-[#6D28D9] font-serif">{percentage}%</span>
      </div>
      <div className="w-full bg-[#F5F3EF] rounded-full h-6 overflow-hidden shadow-inner border border-[#6D28D9]/10">
        <div
          className="h-6 rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-[#6D28D9] via-[#BE185D] to-[#D4AF37] relative overflow-hidden progress-glow"
          style={{
            width: `${percentage}%`,
          }}
        >
          <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
          {/* Shimmer effect */}
          <div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            style={{
              animation: 'shimmer 2s infinite',
              transform: 'skewX(-20deg)',
            }}
          />
        </div>
      </div>
      <p className="text-[#6B6573] mt-3 text-lg font-semibold font-sans">
        {totalTasks === 0
          ? 'התחל להוסיף משימות'
          : `${completedCount} מתוך ${totalTasks} משימות הושלמו`}
      </p>
    </div>
  );
}

export default memo(ProgressBar);

