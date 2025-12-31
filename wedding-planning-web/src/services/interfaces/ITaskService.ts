/**
 * Task Service Interface
 * ממשק לניהול משימות
 */

import { Task, TaskStatus } from '@/types';
import { IBaseService, ServiceResult } from './IBaseService';

export interface ITaskService extends IBaseService<Task> {
  // שינוי סטטוס משימה
  changeStatus(taskId: string, status: TaskStatus): Promise<ServiceResult<void>>;

  // קבלת משימות לפי Epic
  getByEpic(coupleId: string, epicId: string): Promise<ServiceResult<Task[]>>;

  // קבלת משימות לפי סטטוס
  getByStatus(coupleId: string, status: TaskStatus): Promise<ServiceResult<Task[]>>;

  // קבלת משימות באיחור
  getOverdue(coupleId: string): Promise<ServiceResult<Task[]>>;

  // עדכון סטטוס מרובה
  bulkUpdateStatus(taskIds: string[], status: TaskStatus): Promise<ServiceResult<void>>;
}
