'use client';

/**
 * Offline Indicator Component
 *
 * Displays a banner when the user is offline.
 * Uses the Navigator.onLine API to detect network status.
 * Supports RTL layout and Hebrew text.
 */

import React, { useState, useEffect } from 'react';

/**
 * Offline indicator props
 */
export interface OfflineIndicatorProps {
  /** Custom offline message */
  message?: string;
  /** Position of the indicator */
  position?: 'top' | 'bottom';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Offline Indicator Component
 *
 * Shows a non-intrusive banner when the user loses internet connection.
 * Automatically hides when connection is restored.
 *
 * @example
 * ```tsx
 * // In your layout
 * <OfflineIndicator />
 *
 * // With custom message
 * <OfflineIndicator message="אין חיבור - שינויים יישמרו כשהחיבור יחזור" />
 * ```
 */
export function OfflineIndicator({
  message = 'אין חיבור לאינטרנט',
  position = 'bottom',
  className = '',
}: OfflineIndicatorProps): React.ReactElement | null {
  const [isOnline, setIsOnline] = useState(true);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    // Check initial state
    setIsOnline(navigator.onLine);
    setShowIndicator(!navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      // Keep showing briefly to indicate reconnection
      setTimeout(() => setShowIndicator(false), 2000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Don't render if online and indicator should be hidden
  if (!showIndicator) {
    return null;
  }

  const positionStyles = position === 'top' ? 'top-0' : 'bottom-0';
  const bgColor = isOnline ? 'bg-green-600' : 'bg-amber-600';
  const displayMessage = isOnline ? 'החיבור חזר!' : message;

  return (
    <div
      className={`
        fixed start-0 end-0 z-50
        ${positionStyles}
        transition-transform duration-300 ease-in-out
        ${showIndicator ? 'translate-y-0' : position === 'top' ? '-translate-y-full' : 'translate-y-full'}
      `}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        className={`
          ${bgColor} text-white
          px-4 py-2
          flex items-center justify-center gap-2
          text-sm font-medium
          shadow-lg
          ${className}
        `}
      >
        {/* Offline icon */}
        {!isOnline ? (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
            />
          </svg>
        ) : (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
            />
          </svg>
        )}
        <span>{displayMessage}</span>
      </div>
    </div>
  );
}

/**
 * Hook to check online status
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const isOnline = useOnlineStatus();
 *
 *   return (
 *     <button disabled={!isOnline}>
 *       {isOnline ? 'שמור' : 'אין חיבור'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

OfflineIndicator.displayName = 'OfflineIndicator';

export default OfflineIndicator;
