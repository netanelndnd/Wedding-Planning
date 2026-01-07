'use client';

/**
 * GuestList Component
 *
 * Displays a list of guests with RSVP status indicators.
 * Includes edit and delete functionality.
 */

import React from 'react';
import { Guest, RsvpStatus } from '@/types';
import { RSVP_STATUS_LABELS, RSVP_STATUS_COLORS } from '@/lib/constants';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';

/**
 * GuestList component props
 */
export interface GuestListProps {
  /** Array of guests to display */
  guests: Guest[];
  /** Loading state */
  loading?: boolean;
  /** Called when edit is clicked */
  onEdit: (guest: Guest) => void;
  /** Called when delete is clicked */
  onDelete: (guestId: string) => void;
  /** Called when RSVP status is changed */
  onRsvpChange: (guestId: string, rsvp: RsvpStatus) => void;
}

/**
 * Get badge color classes based on RSVP status
 */
function getRsvpBadgeClasses(rsvp: RsvpStatus): string {
  const color = RSVP_STATUS_COLORS[rsvp];
  const colorClasses = {
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    gray: 'bg-gray-100 text-gray-800',
  };
  return colorClasses[color] || colorClasses.gray;
}

/**
 * Guest list component with RSVP status indicators
 *
 * @example
 * ```tsx
 * <GuestList
 *   guests={guests}
 *   loading={loading}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   onRsvpChange={handleRsvpChange}
 * />
 * ```
 */
export function GuestList({
  guests,
  loading,
  onEdit,
  onDelete,
  onRsvpChange,
}: GuestListProps): React.ReactElement {
  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Empty state
  if (guests.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">אין אורחים ברשימה</p>
        <p className="text-sm text-gray-500">
          הוסף אורחים ידנית או שתף את קישור ההרשמה
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-start px-4 py-3 text-sm font-semibold text-gray-900">
              שם
            </th>
            <th className="text-start px-4 py-3 text-sm font-semibold text-gray-900">
              טלפון
            </th>
            <th className="text-start px-4 py-3 text-sm font-semibold text-gray-900">
              מספר אנשים
            </th>
            <th className="text-start px-4 py-3 text-sm font-semibold text-gray-900">
              סטטוס
            </th>
            <th className="text-start px-4 py-3 text-sm font-semibold text-gray-900">
              מקור
            </th>
            <th className="text-start px-4 py-3 text-sm font-semibold text-gray-900">
              פעולות
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {guests.map((guest) => (
            <tr key={guest.id} className="hover:bg-gray-50">
              {/* Name */}
              <td className="px-4 py-3">
                <div className="font-medium text-gray-900">{guest.name}</div>
                {guest.notes && (
                  <div className="text-sm text-gray-500 truncate max-w-xs">
                    {guest.notes}
                  </div>
                )}
              </td>

              {/* Phone */}
              <td className="px-4 py-3 text-gray-600">
                {guest.phone || '-'}
              </td>

              {/* Party Size */}
              <td className="px-4 py-3 text-gray-600">
                {guest.partySize}
              </td>

              {/* RSVP Status */}
              <td className="px-4 py-3">
                <select
                  value={guest.rsvp}
                  onChange={(e) => onRsvpChange(guest.id, e.target.value as RsvpStatus)}
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getRsvpBadgeClasses(guest.rsvp)} border-0 cursor-pointer`}
                >
                  {Object.entries(RSVP_STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </td>

              {/* Source */}
              <td className="px-4 py-3 text-gray-600 text-sm">
                {guest.source === 'self-registration' ? 'הרשמה עצמית' : 'ידני'}
              </td>

              {/* Actions */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onEdit(guest)}
                  >
                    ערוך
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(guest.id)}
                  >
                    מחק
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

GuestList.displayName = 'GuestList';
