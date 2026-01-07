'use client';

/**
 * useTasks Hook
 *
 * Custom hook for managing tasks with real-time updates.
 * Provides CRUD operations and real-time synchronization with Firestore.
 */

import { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { taskService } from '@/services/crud/taskService';
import type {
  Task,
  CreateTaskData,
  UpdateTaskData,
  TaskFilters,
  AssignedTo,
} from '@/types';

/**
 * Tasks hook state and handlers
 */
export interface UseTasksReturn {
  /** Array of tasks */
  tasks: Task[];
  /** Loading state */
  loading: boolean;
  /** Error message */
  error: string | null;
  /** Create a new task */
  createTask: (data: CreateTaskData) => Promise<Task | null>;
  /** Update a task */
  updateTask: (taskId: string, data: UpdateTaskData) => Promise<Task | null>;
  /** Delete a task */
  deleteTask: (taskId: string) => Promise<boolean>;
  /** Get tasks by partner */
  getTasksByPartner: (partner: AssignedTo) => Task[];
  /** Get tasks by epic */
  getTasksByEpic: (epicId: string) => Task[];
  /** Refresh tasks */
  refresh: () => void;
}

/**
 * Hook for managing tasks
 *
 * @param coupleId Couple document ID
 * @param filters Optional task filters
 * @returns Tasks state and operations
 *
 * @example
 * ```tsx
 * const { tasks, loading, error, createTask, updateTask, deleteTask } = useTasks(coupleId);
 *
 * const handleCreate = async (data: CreateTaskData) => {
 *   const task = await createTask(data);
 *   if (task) {
 *     console.log('Task created:', task);
 *   }
 * };
 * ```
 */
export function useTasks(
  coupleId: string | null,
  filters?: TaskFilters
): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load tasks with real-time updates
  useEffect(() => {
    if (!coupleId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    logger.debug('Setting up tasks listener', { coupleId, filters });

    const tasksRef = collection(db, 'couples', coupleId, 'tasks');
    const q = query(tasksRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let loadedTasks: Task[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Task[];

        // Apply filters client-side (for complex filters like partner + both)
        if (filters?.epicId) {
          loadedTasks = loadedTasks.filter((t) => t.epicId === filters.epicId);
        }
        if (filters?.assignedTo) {
          if (filters.assignedTo !== 'both') {
            loadedTasks = loadedTasks.filter(
              (t) =>
                t.assignedTo === filters.assignedTo || t.assignedTo === 'both'
            );
          }
        }
        if (filters?.status) {
          loadedTasks = loadedTasks.filter((t) => t.status === filters.status);
        }

        setTasks(loadedTasks);
        setLoading(false);
        logger.debug('Tasks updated', {
          coupleId,
          count: loadedTasks.length,
        });
      },
      (err) => {
        logger.error('Failed to listen to tasks', {
          coupleId,
          error: err.message,
        });
        setError('Failed to load tasks');
        setLoading(false);
      }
    );

    return () => {
      logger.debug('Cleaning up tasks listener', { coupleId });
      unsubscribe();
    };
  }, [coupleId, refreshTrigger, filters]);

  /**
   * Create a new task
   */
  const createTask = useCallback(
    async (data: CreateTaskData): Promise<Task | null> => {
      if (!coupleId) {
        logger.warn('Cannot create task without coupleId');
        return null;
      }

      try {
        const task = await taskService.createTask(coupleId, data);
        logger.info('Task created successfully', {
          coupleId,
          taskId: task.id,
        });
        return task;
      } catch (err) {
        logger.error('Failed to create task', {
          coupleId,
          error: err instanceof Error ? err.message : String(err),
        });
        setError('Failed to create task');
        return null;
      }
    },
    [coupleId]
  );

  /**
   * Update a task
   */
  const updateTask = useCallback(
    async (taskId: string, data: UpdateTaskData): Promise<Task | null> => {
      if (!coupleId) {
        logger.warn('Cannot update task without coupleId');
        return null;
      }

      try {
        const task = await taskService.updateTask(coupleId, taskId, data);
        logger.info('Task updated successfully', {
          coupleId,
          taskId,
        });
        return task;
      } catch (err) {
        logger.error('Failed to update task', {
          coupleId,
          taskId,
          error: err instanceof Error ? err.message : String(err),
        });
        setError('Failed to update task');
        return null;
      }
    },
    [coupleId]
  );

  /**
   * Delete a task
   */
  const deleteTask = useCallback(
    async (taskId: string): Promise<boolean> => {
      if (!coupleId) {
        logger.warn('Cannot delete task without coupleId');
        return false;
      }

      try {
        await taskService.deleteTask(coupleId, taskId);
        logger.info('Task deleted successfully', {
          coupleId,
          taskId,
        });
        return true;
      } catch (err) {
        logger.error('Failed to delete task', {
          coupleId,
          taskId,
          error: err instanceof Error ? err.message : String(err),
        });
        setError('Failed to delete task');
        return false;
      }
    },
    [coupleId]
  );

  /**
   * Get tasks by partner (client-side filter)
   */
  const getTasksByPartner = useCallback(
    (partner: AssignedTo): Task[] => {
      if (partner === 'both') {
        return tasks;
      }
      return tasks.filter((t) => t.assignedTo === partner || t.assignedTo === 'both');
    },
    [tasks]
  );

  /**
   * Get tasks by epic (client-side filter)
   */
  const getTasksByEpic = useCallback(
    (epicId: string): Task[] => {
      return tasks.filter((t) => t.epicId === epicId);
    },
    [tasks]
  );

  /**
   * Refresh tasks
   */
  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    getTasksByPartner,
    getTasksByEpic,
    refresh,
  };
}
