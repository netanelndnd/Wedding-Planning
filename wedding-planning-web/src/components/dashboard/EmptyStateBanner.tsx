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
    <div className="glass p-6 rounded-2xl shadow-modern mb-8 animate-fadeIn border-2 border-purple-300" style={{ animationDelay: '0.35s' }}>
      <div className="flex items-center gap-4">
        <div className="text-5xl">💡</div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-2">רוצה להתחיל מהר?</h3>
          <p className="text-gray-600 mb-3">הוספנו עבורך רשימת משימות בסיסית לתכנון החתונה!</p>
          <button
            onClick={onSetupTasksClick}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            ✨ הוסף 6 משימות חשובות
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(EmptyStateBanner);

