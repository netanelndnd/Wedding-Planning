'use client';

/**
 * GuestStats Component
 *
 * Displays guest statistics including totals and RSVP breakdown.
 */

import React from 'react';
import { GuestStats as GuestStatsType } from '@/types';
import { Card } from '@/components/ui/Card';

/**
 * GuestStats component props
 */
export interface GuestStatsProps {
  /** Guest statistics data */
  stats: GuestStatsType;
  /** Loading state */
  loading?: boolean;
}

/**
 * Stat card item component
 */
interface StatItemProps {
  label: string;
  value: number;
  color: string;
}

function StatItem({ label, value, color }: StatItemProps): React.ReactElement {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    gray: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-gray-600">{label}</span>
      <span
        className={`px-3 py-1 rounded-full text-sm font-semibold ${
          colorClasses[color as keyof typeof colorClasses] || colorClasses.gray
        }`}
      >
        {value}
      </span>
    </div>
  );
}

/**
 * Guest statistics component with totals and RSVP breakdown
 *
 * @example
 * ```tsx
 * <GuestStats stats={guestStats} loading={loading} />
 * ```
 */
export function GuestStats({
  stats,
  loading,
}: GuestStatsProps): React.ReactElement {
  if (loading) {
    return (
      <Card>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-6 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="space-y-4">
        {/* Main Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">
              {stats.totalGuests}
            </div>
            <div className="text-sm text-gray-600">רשומות</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">
              {stats.totalHeadcount}
            </div>
            <div className="text-sm text-gray-600">סה״כ אנשים</div>
          </div>
        </div>

        {/* RSVP Breakdown */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="font-semibold text-gray-900 mb-3">פירוט אישורי הגעה</h4>
          <div className="divide-y divide-gray-100">
            <StatItem label="מגיעים" value={stats.attendingCount} color="green" />
            <StatItem label="לא מגיעים" value={stats.notAttendingCount} color="red" />
            <StatItem label="אולי" value={stats.maybeCount} color="yellow" />
            <StatItem label="ממתינים לאישור" value={stats.pendingCount} color="gray" />
          </div>
        </div>

        {/* Confirmed Percentage */}
        {stats.totalHeadcount > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">אחוז אישורים</span>
              <span className="text-lg font-semibold text-gray-900">
                {Math.round(
                  (stats.attendingCount / stats.totalHeadcount) * 100
                )}
                %
              </span>
            </div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-300"
                style={{
                  width: `${(stats.attendingCount / stats.totalHeadcount) * 100}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

GuestStats.displayName = 'GuestStats';
