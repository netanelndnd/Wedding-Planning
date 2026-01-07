/**
 * TypeScript Type Definitions for Cloud Functions
 *
 * Mirrors the types from the main application for Firestore documents.
 */

import { Timestamp } from 'firebase-admin/firestore';

/**
 * Task status types
 */
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

/**
 * Task assignment types
 */
export type AssignedTo = 'partner1' | 'partner2' | 'both';

/**
 * Notification preferences for email reminders
 */
export interface NotificationPreferences {
  /** Enable weekly summary emails */
  weeklyReminder: boolean;
  /** Enable day-before task reminders */
  dayBeforeReminder: boolean;
  /** Email address for notifications (uses auth email if not set) */
  notificationEmail?: string;
}

/**
 * Couple entity from Firestore
 */
export interface Couple {
  /** Document ID (same as Firebase Auth UID) */
  id: string;
  /** First partner name */
  partner1Name: string;
  /** Second partner name */
  partner2Name: string;
  /** Wedding date */
  weddingDate: Timestamp;
  /** Total target budget in ILS */
  targetBudget: number;
  /** Notification preferences */
  notificationPreferences?: NotificationPreferences;
  /** Document creation time */
  createdAt: Timestamp;
  /** Last update time */
  updatedAt: Timestamp;
}

/**
 * Task entity from Firestore
 */
export interface Task {
  /** Document ID */
  id: string;
  /** Reference to epic (category) */
  epicId: string;
  /** Task title */
  title: string;
  /** Task description (optional) */
  description?: string;
  /** Due date (optional) */
  dueDate?: Timestamp;
  /** Who is responsible for this task */
  assignedTo: AssignedTo;
  /** Estimated cost in ILS (optional) */
  estimatedCost?: number;
  /** Actual cost in ILS (optional) */
  actualCost?: number;
  /** Current task status */
  status: TaskStatus;
  /** Additional notes (optional) */
  notes?: string;
  /** Creation time */
  createdAt: Timestamp;
  /** Last update time */
  updatedAt: Timestamp;
}

/**
 * Epic (Category) entity from Firestore
 */
export interface Epic {
  /** Document ID */
  id: string;
  /** Category name */
  title: string;
  /** Emoji icon */
  icon: string;
  /** Display order */
  order: number;
}

/**
 * Task summary for emails
 */
export interface TaskSummary {
  title: string;
  dueDate: Date;
  status: TaskStatus;
  assignedTo: AssignedTo;
  epicTitle: string;
}

/**
 * Weekly summary data
 */
export interface WeeklySummaryData {
  partnerNames: {
    partner1: string;
    partner2: string;
  };
  weddingDate: Date;
  daysUntilWedding: number;
  tasksThisWeek: TaskSummary[];
  tasksDueSoon: TaskSummary[];
  completedThisWeek: number;
  totalPendingTasks: number;
}

/**
 * Day-before reminder data
 */
export interface DayBeforeReminderData {
  partnerNames: {
    partner1: string;
    partner2: string;
  };
  tasksDueTomorrow: TaskSummary[];
}
