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
      <div className="glass p-6 rounded-2xl shadow-modern hover:shadow-modern-hover transition-all duration-300 animate-fadeIn border-r-4 border-pink-500">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-gray-600 text-sm font-semibold mb-1">📊 סך הכל משימות</h3>
            <p className="text-4xl font-bold text-pink-600">{totalTasks}</p>
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
  );
}

export default memo(StatsCards);

