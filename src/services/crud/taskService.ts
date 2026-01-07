/**
 * Task Service Implementation
 *
 * Handles all CRUD operations for tasks in Firestore.
 * Tasks are stored in couples/{coupleId}/tasks subcollection.
 */

import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import type {
  Task,
  CreateTaskData,
  UpdateTaskData,
  TaskFilters,
  AssignedTo,
} from '@/types';
import type { ITaskService } from '@/services/interfaces/ITaskService';

/**
 * Task Service Implementation
 */
export class TaskService implements ITaskService {
  /**
   * Create a new task
   */
  async createTask(coupleId: string, data: CreateTaskData): Promise<Task> {
    try {
      logger.info('Creating task', {
        coupleId,
        title: data.title,
        epicId: data.epicId,
      });

      const tasksRef = collection(db, 'couples', coupleId, 'tasks');
      const now = Timestamp.now();

      // Convert Date to Timestamp if dueDate is provided
      const taskData = {
        epicId: data.epicId,
        title: data.title,
        description: data.description,
        dueDate: data.dueDate ? Timestamp.fromDate(data.dueDate) : undefined,
        assignedTo: data.assignedTo,
        estimatedCost: data.estimatedCost,
        actualCost: data.actualCost,
        status: data.status ?? 'pending',
        notes: data.notes,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(tasksRef, taskData);

      const task: Task = {
        id: docRef.id,
        ...taskData,
      };

      logger.info('Successfully created task', {
        coupleId,
        taskId: docRef.id,
        title: data.title,
      });

      return task;
    } catch (error) {
      logger.error('Failed to create task', {
        coupleId,
        title: data.title,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('Failed to create task');
    }
  }

  /**
   * Get all tasks for a couple with optional filtering
   */
  async getTasks(coupleId: string, filters?: TaskFilters): Promise<Task[]> {
    try {
      logger.debug('Fetching tasks for couple', { coupleId, filters });

      const tasksRef = collection(db, 'couples', coupleId, 'tasks');
      let q = query(tasksRef);

      // Apply filters
      if (filters?.epicId) {
        q = query(q, where('epicId', '==', filters.epicId));
      }
      if (filters?.assignedTo) {
        q = query(q, where('assignedTo', '==', filters.assignedTo));
      }
      if (filters?.status) {
        q = query(q, where('status', '==', filters.status));
      }

      const snapshot = await getDocs(q);

      const tasks: Task[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Task[];

      logger.info('Successfully fetched tasks', {
        coupleId,
        count: tasks.length,
        filters,
      });

      return tasks;
    } catch (error) {
      logger.error('Failed to fetch tasks', {
        coupleId,
        filters,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('Failed to fetch tasks');
    }
  }

  /**
   * Update an existing task
   */
  async updateTask(
    coupleId: string,
    taskId: string,
    data: UpdateTaskData
  ): Promise<Task> {
    try {
      logger.info('Updating task', {
        coupleId,
        taskId,
      });

      const taskRef = doc(db, 'couples', coupleId, 'tasks', taskId);

      // Convert Date to Timestamp if dueDate is provided
      const updateData: Record<string, unknown> = {
        ...data,
        updatedAt: Timestamp.now(),
      };

      if (data.dueDate !== undefined) {
        updateData.dueDate = data.dueDate
          ? Timestamp.fromDate(data.dueDate)
          : null;
      }

      await updateDoc(taskRef, updateData);

      // Fetch updated task
      const tasks = await this.getTasks(coupleId);
      const updatedTask = tasks.find((t) => t.id === taskId);

      if (!updatedTask) {
        throw new Error('Task not found after update');
      }

      logger.info('Successfully updated task', {
        coupleId,
        taskId,
      });

      return updatedTask;
    } catch (error) {
      logger.error('Failed to update task', {
        coupleId,
        taskId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('Failed to update task');
    }
  }

  /**
   * Delete a task
   */
  async deleteTask(coupleId: string, taskId: string): Promise<void> {
    try {
      logger.info('Deleting task', {
        coupleId,
        taskId,
      });

      const taskRef = doc(db, 'couples', coupleId, 'tasks', taskId);
      await deleteDoc(taskRef);

      logger.info('Successfully deleted task', {
        coupleId,
        taskId,
      });
    } catch (error) {
      logger.error('Failed to delete task', {
        coupleId,
        taskId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('Failed to delete task');
    }
  }

  /**
   * Get tasks assigned to a specific partner or both
   */
  async getTasksByPartner(
    coupleId: string,
    partner: AssignedTo
  ): Promise<Task[]> {
    try {
      logger.debug('Fetching tasks by partner', { coupleId, partner });

      // If 'both' is selected, return all tasks
      if (partner === 'both') {
        return this.getTasks(coupleId);
      }

      // Get tasks assigned to specific partner OR to both
      const tasksRef = collection(db, 'couples', coupleId, 'tasks');
      const q1 = query(tasksRef, where('assignedTo', '==', partner));
      const q2 = query(tasksRef, where('assignedTo', '==', 'both'));

      const [snapshot1, snapshot2] = await Promise.all([
        getDocs(q1),
        getDocs(q2),
      ]);

      const tasks: Task[] = [
        ...snapshot1.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })),
        ...snapshot2.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })),
      ] as Task[];

      logger.info('Successfully fetched tasks by partner', {
        coupleId,
        partner,
        count: tasks.length,
      });

      return tasks;
    } catch (error) {
      logger.error('Failed to fetch tasks by partner', {
        coupleId,
        partner,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('Failed to fetch tasks by partner');
    }
  }
}

// Export singleton instance
export const taskService = new TaskService();
