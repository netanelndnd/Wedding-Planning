/**
 * Service Contracts - Wedding Planning MVP
 *
 * These interfaces define the contract between UI components and business logic.
 * All implementations must conform to these interfaces.
 */

import { Timestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';
export type AssignedTo = 'partner1' | 'partner2' | 'both';
export type RsvpStatus = 'attending' | 'not-attending' | 'maybe' | 'pending';
export type GuestSource = 'self-registration' | 'manual';

// =============================================================================
// ENTITY INTERFACES
// =============================================================================

export interface Couple {
  id: string;
  partner1Name: string;
  partner2Name: string;
  weddingDate: Timestamp;
  targetBudget: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Epic {
  id: string;
  title: string;
  icon: string;
  color: string;
  targetBudget?: number;
  order: number;
  isDefault: boolean;
  createdAt: Timestamp;
}

export interface Task {
  id: string;
  epicId: string;
  title: string;
  description?: string;
  dueDate?: Timestamp;
  assignedTo: AssignedTo;
  estimatedCost?: number;
  actualCost?: number;
  status: TaskStatus;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Guest {
  id: string;
  name: string;
  phone?: string;
  partySize: number;
  notes?: string;
  rsvp: RsvpStatus;
  source: GuestSource;
  createdAt: Timestamp;
}

// =============================================================================
// INPUT TYPES (for create/update operations)
// =============================================================================

export interface CreateCoupleInput {
  partner1Name: string;
  partner2Name: string;
  weddingDate: Date;
  targetBudget: number;
}

export interface UpdateCoupleInput {
  partner1Name?: string;
  partner2Name?: string;
  weddingDate?: Date;
  targetBudget?: number;
}

export interface CreateEpicInput {
  title: string;
  icon: string;
  color: string;
  targetBudget?: number;
  order?: number;
}

export interface UpdateEpicInput {
  title?: string;
  icon?: string;
  color?: string;
  targetBudget?: number;
  order?: number;
}

export interface CreateTaskInput {
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

export interface UpdateTaskInput {
  epicId?: string;
  title?: string;
  description?: string;
  dueDate?: Date | null;
  assignedTo?: AssignedTo;
  estimatedCost?: number | null;
  actualCost?: number | null;
  status?: TaskStatus;
  notes?: string;
}

export interface CreateGuestInput {
  name: string;
  phone?: string;
  partySize: number;
  notes?: string;
  rsvp: RsvpStatus;
  source: GuestSource;
}

export interface UpdateGuestInput {
  name?: string;
  phone?: string;
  partySize?: number;
  notes?: string;
  rsvp?: RsvpStatus;
}

// =============================================================================
// FILTER TYPES
// =============================================================================

export interface TaskFilters {
  epicId?: string;
  assignedTo?: AssignedTo;
  status?: TaskStatus;
  dueBefore?: Date;
  dueAfter?: Date;
}

export interface GuestFilters {
  rsvp?: RsvpStatus;
  source?: GuestSource;
}

// =============================================================================
// AGGREGATION TYPES
// =============================================================================

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  completionPercentage: number;
  targetBudget: number;
  estimatedTotal: number;
  actualTotal: number;
  budgetVariance: number;
  daysUntilWedding: number;
}

export interface CategoryStats {
  epicId: string;
  epicTitle: string;
  epicIcon: string;
  epicColor: string;
  targetBudget?: number;
  estimatedTotal: number;
  actualTotal: number;
  taskCount: number;
  completedCount: number;
}

export interface GuestStats {
  totalGuests: number;
  totalHeadcount: number;
  attendingCount: number;
  attendingHeadcount: number;
  notAttendingCount: number;
  maybeCount: number;
  maybeHeadcount: number;
  pendingCount: number;
  pendingHeadcount: number;
}

// =============================================================================
// SERVICE INTERFACES
// =============================================================================

/**
 * Authentication Service
 * Handles user authentication operations
 */
export interface IAuthService {
  /**
   * Register a new user with email and password
   * Sends verification email upon successful registration
   */
  signUp(email: string, password: string): Promise<User>;

  /**
   * Sign in with email and password
   * Throws error if email not verified
   */
  signIn(email: string, password: string): Promise<User>;

  /**
   * Sign out the current user
   */
  signOut(): Promise<void>;

  /**
   * Send password reset email
   */
  sendPasswordReset(email: string): Promise<void>;

  /**
   * Resend email verification
   */
  resendVerificationEmail(user: User): Promise<void>;

  /**
   * Get current authenticated user
   */
  getCurrentUser(): User | null;

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChanged(callback: (user: User | null) => void): () => void;
}

/**
 * Couple Service
 * Handles couple profile operations
 */
export interface ICoupleService {
  /**
   * Create a new couple profile
   * @param userId - Firebase Auth UID
   */
  create(userId: string, data: CreateCoupleInput): Promise<Couple>;

  /**
   * Get couple by ID
   */
  get(coupleId: string): Promise<Couple | null>;

  /**
   * Update couple profile
   */
  update(coupleId: string, data: UpdateCoupleInput): Promise<Couple>;

  /**
   * Delete couple and all associated data
   * WARNING: Destructive operation
   */
  delete(coupleId: string): Promise<void>;

  /**
   * Check if couple profile exists
   */
  exists(coupleId: string): Promise<boolean>;
}

/**
 * Epic (Category) Service
 * Handles category operations
 */
export interface IEpicService {
  /**
   * Create default epics for a new couple
   */
  createDefaults(coupleId: string): Promise<Epic[]>;

  /**
   * Create a custom epic
   */
  create(coupleId: string, data: CreateEpicInput): Promise<Epic>;

  /**
   * Get all epics for a couple
   */
  getAll(coupleId: string): Promise<Epic[]>;

  /**
   * Get single epic
   */
  get(coupleId: string, epicId: string): Promise<Epic | null>;

  /**
   * Update epic
   */
  update(coupleId: string, epicId: string, data: UpdateEpicInput): Promise<Epic>;

  /**
   * Delete epic (only if no tasks)
   */
  delete(coupleId: string, epicId: string): Promise<void>;

  /**
   * Reorder epics
   */
  reorder(coupleId: string, epicIds: string[]): Promise<void>;
}

/**
 * Task Service
 * Handles task CRUD operations
 */
export interface ITaskService {
  /**
   * Create a new task
   */
  create(coupleId: string, data: CreateTaskInput): Promise<Task>;

  /**
   * Get all tasks for a couple
   */
  getAll(coupleId: string, filters?: TaskFilters): Promise<Task[]>;

  /**
   * Get single task
   */
  get(coupleId: string, taskId: string): Promise<Task | null>;

  /**
   * Update task
   */
  update(coupleId: string, taskId: string, data: UpdateTaskInput): Promise<Task>;

  /**
   * Delete task
   */
  delete(coupleId: string, taskId: string): Promise<void>;

  /**
   * Update task status only
   */
  updateStatus(coupleId: string, taskId: string, status: TaskStatus): Promise<Task>;

  /**
   * Get tasks by epic
   */
  getByEpic(coupleId: string, epicId: string): Promise<Task[]>;

  /**
   * Get upcoming tasks (for reminders)
   */
  getUpcoming(coupleId: string, days: number): Promise<Task[]>;

  /**
   * Get overdue tasks
   */
  getOverdue(coupleId: string): Promise<Task[]>;
}

/**
 * Guest Service
 * Handles guest management
 */
export interface IGuestService {
  /**
   * Create a guest (self-registration or manual)
   */
  create(coupleId: string, data: CreateGuestInput): Promise<Guest>;

  /**
   * Get all guests for a couple
   */
  getAll(coupleId: string, filters?: GuestFilters): Promise<Guest[]>;

  /**
   * Get single guest
   */
  get(coupleId: string, guestId: string): Promise<Guest | null>;

  /**
   * Update guest
   */
  update(coupleId: string, guestId: string, data: UpdateGuestInput): Promise<Guest>;

  /**
   * Delete guest
   */
  delete(coupleId: string, guestId: string): Promise<void>;

  /**
   * Get guest statistics
   */
  getStats(coupleId: string): Promise<GuestStats>;

  /**
   * Generate shareable invite link
   */
  generateInviteLink(coupleId: string): string;
}

/**
 * Dashboard Service
 * Handles aggregated statistics
 */
export interface IDashboardService {
  /**
   * Get all dashboard statistics
   */
  getStats(coupleId: string): Promise<DashboardStats>;

  /**
   * Get statistics per category
   */
  getCategoryStats(coupleId: string): Promise<CategoryStats[]>;

  /**
   * Get guest statistics
   */
  getGuestStats(coupleId: string): Promise<GuestStats>;
}

// =============================================================================
// UTILITY INTERFACES
// =============================================================================

/**
 * ICS Generator for calendar export
 */
export interface ICalendarService {
  /**
   * Generate ICS content for a task
   */
  generateTaskIcs(task: Task, couple: Couple): string;

  /**
   * Generate ICS content for wedding date
   */
  generateWeddingIcs(couple: Couple): string;

  /**
   * Trigger ICS file download
   */
  downloadIcs(content: string, filename: string): void;
}

/**
 * WhatsApp sharing service
 */
export interface IShareService {
  /**
   * Generate WhatsApp share link for a task
   */
  generateTaskShareLink(task: Task, epic: Epic): string;

  /**
   * Generate WhatsApp share link for guest invite
   */
  generateGuestInviteLink(couple: Couple, inviteUrl: string): string;
}
