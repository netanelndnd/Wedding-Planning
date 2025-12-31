/**
 * Task Service
 * סרוויס לניהול משימות
 */

import { Task, TaskStatus } from '@/types';
import {
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  doc,
  Timestamp,
} from 'firebase/firestore';
import { db, isMockMode } from '@/lib/firebase';
import { BaseFirestoreService, prepareForFirestore, convertTimestamps } from './baseService';
import { ITaskService } from '../interfaces/ITaskService';
import { ServiceResult } from '../interfaces';

// מאגר נתונים מדומים
let mockTasks: Task[] = [];

class TaskServiceImpl extends BaseFirestoreService<Task> implements ITaskService {
  protected collectionName = 'tasks';

  protected get mockData(): Task[] {
    return mockTasks;
  }

  protected set mockData(data: Task[]) {
    mockTasks = data;
  }

  /**
   * שינוי סטטוס משימה
   */
  async changeStatus(taskId: string, status: TaskStatus): Promise<ServiceResult<void>> {
    try {
      const updates: Partial<Task> = { status };
      if (status === 'completed') {
        updates.completedAt = new Date();
      }
      return this.update(taskId, updates);
    } catch (error) {
      console.error('Error changing task status:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * קבלת משימות לפי Epic
   */
  async getByEpic(coupleId: string, epicId: string): Promise<ServiceResult<Task[]>> {
    try {
      if (isMockMode) {
        const tasks = mockTasks.filter(
          (t) => t.coupleId === coupleId && t.epicId === epicId
        );
        return { success: true, data: tasks };
      }

      const q = query(
        collection(db, this.collectionName),
        where('coupleId', '==', coupleId),
        where('epicId', '==', epicId)
      );
      const snapshot = await getDocs(q);
      const tasks = snapshot.docs.map((doc) =>
        convertTimestamps<Task>(doc.data(), doc.id)
      );

      return { success: true, data: tasks };
    } catch (error) {
      console.error('Error getting tasks by epic:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * קבלת משימות לפי סטטוס
   */
  async getByStatus(coupleId: string, status: TaskStatus): Promise<ServiceResult<Task[]>> {
    try {
      if (isMockMode) {
        const tasks = mockTasks.filter(
          (t) => t.coupleId === coupleId && t.status === status
        );
        return { success: true, data: tasks };
      }

      const q = query(
        collection(db, this.collectionName),
        where('coupleId', '==', coupleId),
        where('status', '==', status)
      );
      const snapshot = await getDocs(q);
      const tasks = snapshot.docs.map((doc) =>
        convertTimestamps<Task>(doc.data(), doc.id)
      );

      return { success: true, data: tasks };
    } catch (error) {
      console.error('Error getting tasks by status:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * קבלת משימות באיחור
   */
  async getOverdue(coupleId: string): Promise<ServiceResult<Task[]>> {
    try {
      const result = await this.getAll(coupleId);
      if (!result.success || !result.data) {
        return result;
      }

      const now = new Date();
      const overdueTasks = result.data.filter(
        (task) =>
          task.dueDate &&
          new Date(task.dueDate) < now &&
          task.status !== 'completed' &&
          task.status !== 'cancelled'
      );

      return { success: true, data: overdueTasks };
    } catch (error) {
      console.error('Error getting overdue tasks:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * עדכון סטטוס מרובה
   */
  async bulkUpdateStatus(
    taskIds: string[],
    status: TaskStatus
  ): Promise<ServiceResult<void>> {
    try {
      if (isMockMode) {
        mockTasks = mockTasks.map((t) =>
          taskIds.includes(t.id)
            ? {
                ...t,
                status,
                updatedAt: new Date(),
                ...(status === 'completed' && { completedAt: new Date() }),
              }
            : t
        );
        return { success: true };
      }

      const batch = writeBatch(db);
      const updates = prepareForFirestore({ status });
      if (status === 'completed') {
        updates.completedAt = Timestamp.now();
      }

      taskIds.forEach((id) => {
        batch.update(doc(db, this.collectionName, id), updates);
      });

      await batch.commit();
      return { success: true };
    } catch (error) {
      console.error('Error bulk updating task status:', error);
      return { success: false, error: (error as Error).message };
    }
  }
}

// ייצוא instance יחיד (Singleton)
export const taskService = new TaskServiceImpl();
