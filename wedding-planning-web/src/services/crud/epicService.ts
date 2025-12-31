/**
 * Epic Service
 * סרוויס לניהול אפיקים (קבוצות משימות)
 */

import { Epic, Task } from '@/types';
import {
  collection,
  query,
  where,
  getDocs,
  writeBatch,
  doc,
  onSnapshot,
} from 'firebase/firestore';
import { db, isMockMode } from '@/lib/firebase';
import { BaseFirestoreService, convertTimestamps } from './baseService';
import { IEpicService, EpicWithTasks } from '../interfaces/IEpicService';
import { ServiceResult } from '../interfaces';

// מאגר נתונים מדומים
let mockEpics: Epic[] = [];

class EpicServiceImpl extends BaseFirestoreService<Epic> implements IEpicService {
  protected collectionName = 'epics';

  protected get mockData(): Epic[] {
    return mockEpics;
  }

  protected set mockData(data: Epic[]) {
    mockEpics = data;
  }

  /**
   * Override subscribe לסדר לפי order
   */
  subscribe(coupleId: string, callback: (entities: Epic[]) => void): () => void {
    if (isMockMode) {
      const sorted = mockEpics
        .filter((e) => e.coupleId === coupleId)
        .sort((a, b) => a.order - b.order);
      callback(sorted);
      return () => {};
    }

    const q = query(
      collection(db, this.collectionName),
      where('coupleId', '==', coupleId)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const epics = snapshot.docs
          .map((doc) => convertTimestamps<Epic>(doc.data(), doc.id))
          .sort((a, b) => a.order - b.order);
        callback(epics);
      },
      (error) => {
        console.error('Error in epics subscription:', error);
        callback([]);
      }
    );
  }

  /**
   * שינוי סדר אפיק
   */
  async reorder(epicId: string, newOrder: number): Promise<ServiceResult<void>> {
    return this.update(epicId, { order: newOrder });
  }

  /**
   * קבלת אפיק עם המשימות שלו
   */
  async getWithTasks(
    coupleId: string,
    epicId: string
  ): Promise<ServiceResult<EpicWithTasks>> {
    try {
      // קבלת האפיק
      const epicResult = await this.getById(epicId);
      if (!epicResult.success || !epicResult.data) {
        return { success: false, error: epicResult.error || 'אפיק לא נמצא' };
      }

      // קבלת המשימות
      let tasks: Task[] = [];
      if (isMockMode) {
        // במצב mock, נצטרך לגשת למשימות דרך import דינמי או להחזיר ריק
        tasks = [];
      } else {
        const q = query(
          collection(db, 'tasks'),
          where('coupleId', '==', coupleId),
          where('epicId', '==', epicId)
        );
        const snapshot = await getDocs(q);
        tasks = snapshot.docs.map((doc) =>
          convertTimestamps<Task>(doc.data(), doc.id)
        );
      }

      const completedCount = tasks.filter((t) => t.status === 'completed').length;

      return {
        success: true,
        data: {
          epic: epicResult.data,
          tasks,
          taskCount: tasks.length,
          completedCount,
        },
      };
    } catch (error) {
      console.error('Error getting epic with tasks:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * מחיקת אפיק עם כל המשימות שלו (cascade)
   */
  async deleteWithTasks(epicId: string): Promise<ServiceResult<void>> {
    try {
      if (isMockMode) {
        mockEpics = mockEpics.filter((e) => e.id !== epicId);
        return { success: true };
      }

      const batch = writeBatch(db);

      // מחיקת האפיק
      batch.delete(doc(db, 'epics', epicId));

      // מחיקת כל המשימות של האפיק
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('epicId', '==', epicId)
      );
      const taskDocs = await getDocs(tasksQuery);
      taskDocs.forEach((taskDoc) => batch.delete(taskDoc.ref));

      await batch.commit();
      return { success: true };
    } catch (error) {
      console.error('Error deleting epic with tasks:', error);
      return { success: false, error: (error as Error).message };
    }
  }
}

// ייצוא instance יחיד (Singleton)
export const epicService = new EpicServiceImpl();
