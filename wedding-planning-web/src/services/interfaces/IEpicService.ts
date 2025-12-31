/**
 * Epic Service Interface
 * ממשק לניהול אפיקים (קבוצות משימות)
 */

import { Epic, Task } from '@/types';
import { IBaseService, ServiceResult } from './IBaseService';

export interface EpicWithTasks {
  epic: Epic;
  tasks: Task[];
  taskCount: number;
  completedCount: number;
}

export interface IEpicService extends IBaseService<Epic> {
  // שינוי סדר
  reorder(epicId: string, newOrder: number): Promise<ServiceResult<void>>;

  // קבלת אפיק עם המשימות שלו
  getWithTasks(coupleId: string, epicId: string): Promise<ServiceResult<EpicWithTasks>>;

  // מחיקת אפיק עם כל המשימות שלו (cascade)
  deleteWithTasks(epicId: string): Promise<ServiceResult<void>>;
}
