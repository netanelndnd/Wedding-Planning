'use client';

import { memo } from 'react';

interface EmptyStateBannerProps {
  onSetupTasksClick: () => void;
}

/**
 * EmptyStateBanner Component
 * --------------------------
 * Banner shown when there are no tasks, encouraging user to add default tasks
 */
function EmptyStateBanner({ onSetupTasksClick }: EmptyStateBannerProps) {
  return (
    <div className="glass p-6 rounded-2xl shadow-modern card-hover mb-8 animate-fadeIn border border-[#6D28D9]/20" style={{ animationDelay: '0.35s' }}>
      <div className="flex items-start gap-4">
        <div className="p-3 bg-[#D4AF37]/10 rounded-xl">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-serif font-bold text-[#2D2A32] mb-2">רוצה להתחיל מהר?</h3>
          <p className="text-[#6B6573] mb-3 font-sans">הוספנו עבורך רשימת משימות בסיסית לתכנון החתונה!</p>
          <button
            onClick={onSetupTasksClick}
            className="btn-primary flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            הוסף 6 משימות חשובות
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(EmptyStateBanner);

