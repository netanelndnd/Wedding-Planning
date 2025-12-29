'use client';

import { memo } from 'react';

interface StatsCardsProps {
  totalTasks: number;
  completedCount: number;
  pendingCount: number;
}

/**
 * StatsCards Component
 * -------------------
 * Displays three statistics cards: total tasks, completed, and pending
 */
function StatsCards({ totalTasks, completedCount, pendingCount }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="glass p-6 rounded-2xl shadow-modern card-hover animate-fadeIn border-r-4 border-[#6D28D9]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[#6B6573] text-sm font-semibold mb-1 font-sans">סך הכל משימות</h3>
            <p className="text-4xl font-bold text-[#6D28D9] font-serif">{totalTasks}</p>
          </div>
          <div className="p-3 bg-[#6D28D9]/10 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#6D28D9]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="glass p-6 rounded-2xl shadow-modern card-hover animate-fadeIn border-r-4 border-[#87A878]" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[#6B6573] text-sm font-semibold mb-1 font-sans">משימות הושלמו</h3>
            <p className="text-4xl font-bold text-[#87A878] font-serif">{completedCount}</p>
          </div>
          <div className="p-3 bg-[#87A878]/10 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#87A878]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="glass p-6 rounded-2xl shadow-modern card-hover animate-fadeIn border-r-4 border-[#D4AF37]" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[#6B6573] text-sm font-semibold mb-1 font-sans">משימות ממתינות</h3>
            <p className="text-4xl font-bold text-[#D4AF37] font-serif">{pendingCount}</p>
          </div>
          <div className="p-3 bg-[#D4AF37]/10 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(StatsCards);

