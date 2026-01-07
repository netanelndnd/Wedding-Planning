/**
 * ITaskService Interface
 *
 * Service contract for managing tasks in Firestore.
 * Handles CRUD operations for task subcollections under couples.
 */

import { Task, CreateTaskData, UpdateTaskData, TaskFilters, AssignedTo } from '@/types';

/**
 * Task service interface
 */
export interface ITaskService {
  /**
   * Create a new task
   * @param coupleId Couple document ID
   * @param data Task data
   * @returns Promise resolving to the created task
   * @throws Error if creation fails or epicId is invalid
   */
  createTask(coupleId: string, data: CreateTaskData): Promise<Task>;

  /**
   * Get all tasks for a couple with optional filtering
   * @param coupleId Couple document ID
   * @param filters Optional filters (epicId, assignedTo, status)
   * @returns Promise resolving to array of tasks
   * @throws Error if retrieval fails
   */
  getTasks(coupleId: string, filters?: TaskFilters): Promise<Task[]>;

  /**
   * Update an existing task
   * @param coupleId Couple document ID
   * @param taskId Task document ID
   * @param data Partial task data to update
   * @returns Promise resolving to the updated task
   * @throws Error if update fails or task not found
   */
  updateTask(
    coupleId: string,
    taskId: string,
    data: UpdateTaskData
  ): Promise<Task>;

  /**
   * Delete a task
   * @param coupleId Couple document ID
   * @param taskId Task document ID
   * @returns Promise that resolves when deletion is complete
   * @throws Error if deletion fails or task not found
   */
  deleteTask(coupleId: string, taskId: string): Promise<void>;

  /**
   * Get tasks assigned to a specific partner or both
   * @param coupleId Couple document ID
   * @param partner Partner filter (partner1, partner2, or both)
   * @returns Promise resolving to array of tasks
   * @throws Error if retrieval fails
   */
  getTasksByPartner(coupleId: string, partner: AssignedTo): Promise<Task[]>;
}
