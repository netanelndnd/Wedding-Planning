/**
 * Application Constants
 *
 * Centralized constants for default values, configurations, and enums.
 */

import { CreateEpicData } from '@/types';

/**
 * Default Epic Categories
 * 10 predefined Hebrew categories for wedding planning tasks
 */
export const DEFAULT_EPICS: Omit<CreateEpicData, 'order'>[] = [
  {
    title: 'צילום ווידאו',
    icon: '📸',
    color: '#3B82F6',
    isDefault: true,
  },
  {
    title: 'קייטרינג',
    icon: '🍽️',
    color: '#EF4444',
    isDefault: true,
  },
  {
    title: 'אולם/מקום',
    icon: '🏛️',
    color: '#8B5CF6',
    isDefault: true,
  },
  {
    title: 'מוזיקה ודי-ג\'יי',
    icon: '🎵',
    color: '#EC4899',
    isDefault: true,
  },
  {
    title: 'שמלת כלה',
    icon: '👗',
    color: '#F472B6',
    isDefault: true,
  },
  {
    title: 'חליפת חתן',
    icon: '🤵',
    color: '#6366F1',
    isDefault: true,
  },
  {
    title: 'פרחים ועיצוב',
    icon: '💐',
    color: '#10B981',
    isDefault: true,
  },
  {
    title: 'הזמנות',
    icon: '💌',
    color: '#F59E0B',
    isDefault: true,
  },
  {
    title: 'רבנות ואישורים',
    icon: '📋',
    color: '#6B7280',
    isDefault: true,
  },
  {
    title: 'אחר',
    icon: '📦',
    color: '#9CA3AF',
    isDefault: true,
  },
];

/**
 * Task Status Labels (Hebrew)
 */
export const TASK_STATUS_LABELS = {
  pending: 'ממתין',
  'in-progress': 'בתהליך',
  completed: 'הושלם',
  cancelled: 'בוטל',
} as const;

/**
 * Task Status Colors
 */
export const TASK_STATUS_COLORS = {
  pending: 'gray',
  'in-progress': 'blue',
  completed: 'green',
  cancelled: 'red',
} as const;

/**
 * RSVP Status Labels (Hebrew)
 */
export const RSVP_STATUS_LABELS = {
  attending: 'מגיע',
  'not-attending': 'לא מגיע',
  maybe: 'אולי',
  pending: 'ממתין לאישור',
} as const;

/**
 * RSVP Status Colors
 */
export const RSVP_STATUS_COLORS = {
  attending: 'green',
  'not-attending': 'red',
  maybe: 'yellow',
  pending: 'gray',
} as const;

/**
 * Partner Assignment Labels (Hebrew)
 */
export const ASSIGNED_TO_LABELS = {
  partner1: 'בן/בת זוג 1',
  partner2: 'בן/בת זוג 2',
  both: 'שניהם',
} as const;
