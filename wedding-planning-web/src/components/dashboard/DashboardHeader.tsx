'use client';

import { memo } from 'react';
import { Couple } from '@/types';

interface DashboardHeaderProps {
  couple: Couple | null;
  daysUntilWedding: number;
  onSettingsClick: () => void;
  onLogoutClick: () => void;
}

/**
 * DashboardHeader Component
 * ------------------------
 * Header component for the dashboard with couple info and action buttons
 */
function DashboardHeader({ couple, daysUntilWedding, onSettingsClick, onLogoutClick }: DashboardHeaderProps) {
  return (
    <header className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 shadow-modern">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4 animate-fadeIn">
            {couple?.photoURL && (
              <img
                src={couple.photoURL}
                alt={`${couple.partner1Name} ו${couple.partner2Name}`}
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
              />
            )}
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                {couple ? `💍 החתונה של ${couple.partner1Name} ו${couple.partner2Name}` : '💝 דשבורד'}
              </h1>
              <p className="text-pink-100 text-lg flex items-center gap-2">
                {daysUntilWedding > 0
                  ? `⏰ עוד ${daysUntilWedding} ימים עד החתונה! 🎉`
                  : '🎊 היום הגדול הגיע!'}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onSettingsClick}
              className="px-6 py-3 bg-white text-pink-600 rounded-xl hover:bg-pink-50 font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              ⚙️ הגדרות
            </button>
            <button
              onClick={onLogoutClick}
              className="px-6 py-3 bg-white bg-opacity-20 text-white border-2 border-white rounded-xl hover:bg-white hover:text-pink-600 font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 backdrop-blur-sm"
              title="התנתק מהמערכת"
            >
              🚪 התנתק
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default memo(DashboardHeader);

