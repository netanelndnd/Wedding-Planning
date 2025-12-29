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
    <header className="bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#BE185D] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4 animate-fadeIn">
            {couple?.photoURL && (
              <img
                src={couple.photoURL}
                alt={`${couple.partner1Name} ו${couple.partner2Name}`}
                className="w-20 h-20 rounded-full object-cover border-4 border-white/30 shadow-lg"
              />
            )}
            <div>
              <h1 className="text-4xl font-serif font-bold text-white mb-2 tracking-tight">
                {couple ? `החתונה של ${couple.partner1Name} ו${couple.partner2Name}` : 'דשבורד'}
              </h1>
              <p className="text-white/80 text-lg flex items-center gap-2 font-sans">
                {daysUntilWedding > 0
                  ? `עוד ${daysUntilWedding} ימים עד היום הגדול`
                  : 'היום הגדול הגיע!'}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onSettingsClick}
              className="px-6 py-3 bg-white/95 text-[#6D28D9] rounded-xl hover:bg-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              הגדרות
            </button>
            <button
              onClick={onLogoutClick}
              className="px-6 py-3 bg-white/95 text-[#6D28D9] rounded-xl hover:bg-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
              title="התנתק מהמערכת"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              התנתק
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default memo(DashboardHeader);

