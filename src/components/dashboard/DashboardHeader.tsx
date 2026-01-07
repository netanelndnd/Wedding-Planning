'use client';

/**
 * DashboardHeader Component
 *
 * Displays welcome message with partner names, wedding date,
 * and countdown to the wedding day.
 */

import React from 'react';

/**
 * DashboardHeader component props
 */
export interface DashboardHeaderProps {
  /** First partner name */
  partner1Name: string;
  /** Second partner name */
  partner2Name: string;
  /** Wedding date */
  weddingDate: Date;
  /** Days until wedding */
  daysUntilWedding: number;
}

/**
 * Format date in Hebrew locale
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('he-IL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * DashboardHeader component
 *
 * @example
 * ```tsx
 * <DashboardHeader
 *   partner1Name="דוד"
 *   partner2Name="שרה"
 *   weddingDate={new Date('2026-06-15')}
 *   daysUntilWedding={180}
 * />
 * ```
 */
export function DashboardHeader({
  partner1Name,
  partner2Name,
  weddingDate,
  daysUntilWedding,
}: DashboardHeaderProps): React.ReactElement {
  // Determine countdown message
  let countdownMessage = '';
  let countdownColor = 'text-purple-600';

  if (daysUntilWedding > 0) {
    countdownMessage = `עוד ${daysUntilWedding} ימים עד היום הגדול!`;
    if (daysUntilWedding <= 7) {
      countdownColor = 'text-red-600';
      countdownMessage = `⏰ ${countdownMessage}`;
    } else if (daysUntilWedding <= 30) {
      countdownColor = 'text-yellow-600';
      countdownMessage = `⏰ ${countdownMessage}`;
    }
  } else if (daysUntilWedding === 0) {
    countdownMessage = '💒 היום הגדול הגיע! מזל טוב!';
    countdownColor = 'text-pink-600';
  } else {
    countdownMessage = `החתונה התקיימה לפני ${Math.abs(daysUntilWedding)} ימים`;
    countdownColor = 'text-gray-500';
  }

  return (
    <div className="space-y-2">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          ברוכים הבאים, {partner1Name} ו{partner2Name}! 💕
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          תכנון החתונה שלכם ליום {formatDate(weddingDate)}
        </p>
      </div>

      <div className="pt-2">
        <p className={`text-xl font-semibold ${countdownColor}`}>
          {countdownMessage}
        </p>
      </div>
    </div>
  );
}
