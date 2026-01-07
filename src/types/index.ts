/**
 * TypeScript Type Definitions - Wedding Planning MVP
 *
 * Centralized type definitions for all entities and DTOs.
 * Uses Firebase Timestamp for Firestore compatibility.
 */

import { Timestamp } from 'firebase/firestore';

// ============================================================================
// Enums and Literal Types
// ============================================================================

/**
 * Task status types
 */
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

/**
 * Task assignment types
 */
export type AssignedTo = 'partner1' | 'partner2' | 'both';

/**
 * Guest RSVP status types
 */
export type RsvpStatus = 'attending' | 'not-attending' | 'maybe' | 'pending';

/**
 * Guest source types
 */
export type GuestSource = 'self-registration' | 'manual';

/**
 * Budget status indicator
 */
export type BudgetStatus = 'under' | 'at' | 'over';

// ============================================================================
// Notification Preferences
// ============================================================================

/**
 * Notification preferences for email reminders
 */
export interface NotificationPreferences {
  /** Enable weekly summary emails (sent every Sunday) */
  weeklyReminder: boolean;
  /** Enable day-before task reminders (sent daily at 6 PM) */
  dayBeforeReminder: boolean;
  /** Custom email address for notifications (uses auth email if not set) */
  notificationEmail?: string;
}

// ============================================================================
// Core Entity Interfaces (Firestore Documents)
// ============================================================================

/**
 * Couple entity
 * Collection: couples/{coupleId}
 * Document ID: Firebase Auth UID
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
  /** Notification preferences for email reminders */
  notificationPreferences?: NotificationPreferences;
  /** Document creation time */
  createdAt: Timestamp;
  /** Last update time */
  updatedAt: Timestamp;
}

/**
 * Epic (Category) entity
 * Collection: couples/{coupleId}/epics
 */
export interface Epic {
  /** Document ID */
  id: string;
  /** Category name */
  title: string;
  /** Emoji icon (1-4 characters) */
  icon: string;
  /** Hex color code (#RRGGBB) */
  color: string;
  /** Optional budget limit for this category */
  targetBudget?: number;
  /** Display order (1-100) */
  order: number;
  /** Is this a default category */
  isDefault: boolean;
  /** Creation time */
  createdAt: Timestamp;
}

/**
 * Task entity
 * Collection: couples/{coupleId}/tasks
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
 * Guest entity
 * Collection: couples/{coupleId}/guests
 */
export interface Guest {
  /** Document ID */
  id: string;
  /** Guest full name */
  name: string;
  /** Phone number (optional) */
  phone?: string;
  /** Number of people in party (1-20) */
  partySize: number;
  /** Special notes (optional) */
  notes?: string;
  /** RSVP status */
  rsvp: RsvpStatus;
  /** How the guest was added */
  source: GuestSource;
  /** Registration time */
  createdAt: Timestamp;
}

// ============================================================================
// DTO Interfaces (API/UI Usage with Date objects)
// ============================================================================

/**
 * Couple DTO for API/UI usage
 * Converts Timestamp fields to Date objects
 */
export interface CoupleDTO {
  id: string;
  partner1Name: string;
  partner2Name: string;
  weddingDate: Date;
  targetBudget: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Aggregation Interfaces (Computed/Derived Data)
// ============================================================================

/**
 * Dashboard statistics
 * Computed from tasks and couple data
 */
export interface DashboardStats {
  /** Total number of tasks */
  totalTasks: number;
  /** Number of completed tasks */
  completedTasks: number;
  /** Task completion percentage (0-100) */
  completionPercentage: number;
  /** Target budget from couple profile */
  targetBudget: number;
  /** Sum of all estimated costs */
  estimatedTotal: number;
  /** Sum of all actual costs */
  actualTotal: number;
  /** Budget status indicator */
  budgetStatus: BudgetStatus;
}

/**
 * Guest statistics
 * Computed from guests collection
 */
export interface GuestStats {
  /** Total number of guest entries */
  totalGuests: number;
  /** Total headcount (sum of all partySize) */
  totalHeadcount: number;
  /** Number of guests attending */
  attendingCount: number;
  /** Number of guests not attending */
  notAttendingCount: number;
  /** Number of maybe responses */
  maybeCount: number;
  /** Number of pending responses */
  pendingCount: number;
}

/**
 * Category budget breakdown
 * Computed per epic with task aggregations
 */
export interface CategoryBudget {
  /** Epic document ID */
  epicId: string;
  /** Epic title */
  epicTitle: string;
  /** Target budget for this category (optional) */
  targetBudget?: number;
  /** Sum of estimated costs for tasks in this category */
  estimatedTotal: number;
  /** Sum of actual costs for tasks in this category */
  actualTotal: number;
  /** Total number of tasks in this category */
  taskCount: number;
  /** Number of completed tasks in this category */
  completedCount: number;
}

// ============================================================================
// Input/Create Interfaces (For service methods)
// ============================================================================

/**
 * Data required to create a new couple
 */
export interface CreateCoupleData {
  partner1Name: string;
  partner2Name: string;
  weddingDate: Date;
  targetBudget: number;
}

/**
 * Data for updating a couple
 */
export interface UpdateCoupleData {
  partner1Name?: string;
  partner2Name?: string;
  weddingDate?: Date;
  targetBudget?: number;
  notificationPreferences?: NotificationPreferences;
}

/**
 * Data required to create a new epic
 */
export interface CreateEpicData {
  title: string;
  icon: string;
  color: string;
  targetBudget?: number;
  order: number;
  isDefault?: boolean;
}

/**
 * Data for updating an epic
 */
export interface UpdateEpicData {
  title?: string;
  icon?: string;
  color?: string;
  targetBudget?: number;
  order?: number;
}

/**
 * Data required to create a new task
 */
export interface CreateTaskData {
  epicId: string;
  title: string;
  description?: string;
  dueDate?: Date;
  assignedTo: AssignedTo;
  estimatedCost?: number;
  actualCost?: number;
  status?: TaskStatus;
  notes?: string;
}

/**
 * Data for updating a task
 */
export interface UpdateTaskData {
  epicId?: string;
  title?: string;
  description?: string;
  dueDate?: Date;
  assignedTo?: AssignedTo;
  estimatedCost?: number;
  actualCost?: number;
  status?: TaskStatus;
  notes?: string;
}

/**
 * Task filtering options
 */
export interface TaskFilters {
  epicId?: string;
  assignedTo?: AssignedTo;
  status?: TaskStatus;
}

/**
 * Data required to create a new guest
 */
export interface CreateGuestData {
  name: string;
  phone?: string;
  partySize: number;
  notes?: string;
  rsvp?: RsvpStatus;
  source: GuestSource;
}

/**
 * Data for updating a guest
 */
export interface UpdateGuestData {
  name?: string;
  phone?: string;
  partySize?: number;
  notes?: string;
  rsvp?: RsvpStatus;
}
