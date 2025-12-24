'use client';

import { memo } from 'react';

/**
 * DashboardFooter Component
 * -------------------------
 * Footer component with a simple message
 */
function DashboardFooter() {
  return (
    <div className="text-center mt-12 animate-fadeIn" style={{ animationDelay: '0.8s' }}>
      <div className="inline-block px-6 py-3 glass rounded-full shadow-lg">
        <span className="text-gray-600 font-semibold">
          💝 תכנון חתונה בקלות ובסטייל
        </span>
      </div>
    </div>
  );
}

export default memo(DashboardFooter);

