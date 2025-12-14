// User/Couple
export interface Couple {
  id: string;
  partner1Name: string;
  partner2Name: string;
  weddingDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Epic (Parent Tasks)
export type Priority = 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

export interface Epic {
  id: string;
  coupleId: string;
  title: string;
  description?: string;
  category: string;
  color?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// Task
export interface Task {
  id: string;
  coupleId: string;
  epicId: string;
  title: string;
  description?: string;
  category: string;
  priority: Priority;
  status: TaskStatus;
  dueDate?: Date;
  completedAt?: Date;
  assignedTo?: string;
  attachments?: string[]; // Firebase Storage URLs
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Vendor
export interface Vendor {
  id: string;
  coupleId: string;
  name: string;
  category: string; // Photography, Catering, Venue, etc.
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  price?: number;
  rating?: number;
  notes?: string;
  isSelected: boolean;
  relatedTasks?: string[]; // Task IDs
  createdAt: Date;
  updatedAt: Date;
}

// Guest
export interface Guest {
  id: string;
  coupleId: string;
  name: string;
  email?: string;
  phone?: string;
  relationship?: string;
  plusOne?: number;
  rsvpStatus: 'invited' | 'accepted' | 'declined' | 'pending';
  mealPreference?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Activity Log
export interface ActivityLog {
  id: string;
  coupleId: string;
  action: string;
  entityType: 'task' | 'vendor' | 'guest' | 'epic';
  entityId: string;
  userId: string;
  changes?: Record<string, any>;
  createdAt: Date;
}

// Settings
export interface Settings {
  id: string;
  coupleId: string;
  theme: 'light' | 'dark';
  language: 'en' | 'he';
  notifications: {
    email: boolean;
    push: boolean;
    taskReminders: boolean;
  };
  updatedAt: Date;
}
