/**
 * Base Service - Firestore Utilities
 * פונקציות עזר ומחלקת בסיס לכל הסרוויסים
 */

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  getDoc,
  onSnapshot,
  Timestamp,
  DocumentData,
} from 'firebase/firestore';
import { db, isMockMode } from '@/lib/firebase';
import { ServiceResult, BaseEntity, CreateEntity, UpdateEntity } from '../interfaces';

/**
 * המרת Timestamp של Firestore ל-Date
 */
export function convertTimestamps<T extends BaseEntity>(data: DocumentData, id: string): T {
  const result: Record<string, unknown> = { ...data, id };

  // המרת שדות תאריך נפוצים
  const dateFields = ['createdAt', 'updatedAt', 'dueDate', 'completedAt', 'weddingDate'];

  dateFields.forEach((field) => {
    if (data[field]) {
      result[field] = data[field]?.toDate?.() || data[field];
    }
  });

  return result as T;
}

/**
 * הכנת נתונים לשמירה ב-Firestore
 * מסיר ערכי undefined וממיר Date ל-Timestamp
 */
export function prepareForFirestore<T>(
  data: T,
  includeUpdatedAt: boolean = true
): Record<string, unknown> {
  const prepared: Record<string, unknown> = {};

  if (includeUpdatedAt) {
    prepared.updatedAt = Timestamp.now();
  }

  Object.entries(data as Record<string, unknown>).forEach(([key, value]) => {
    // לא לכלול undefined
    if (value === undefined) return;

    // המרת Date ל-Timestamp
    if (value instanceof Date) {
      prepared[key] = Timestamp.fromDate(value);
    } else {
      prepared[key] = value;
    }
  });

  return prepared;
}

/**
 * מחלקת בסיס לסרוויסים
 * מספקת פעולות CRUD בסיסיות
 */
export abstract class BaseFirestoreService<T extends BaseEntity> {
  protected abstract collectionName: string;
  protected abstract mockData: T[];

  /**
   * הוספת ישות חדשה
   */
  async add(coupleId: string, entity: CreateEntity<T>): Promise<ServiceResult<string>> {
    try {
      if (isMockMode) {
        const id = `mock-${this.collectionName}-${Date.now()}`;
        const newEntity = {
          ...entity,
          id,
          coupleId,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as unknown as T;
        this.mockData.push(newEntity);
        return { success: true, data: id };
      }

      const prepared = prepareForFirestore(entity);
      prepared.coupleId = coupleId;
      prepared.createdAt = Timestamp.now();

      const docRef = await addDoc(collection(db, this.collectionName), prepared);
      return { success: true, data: docRef.id };
    } catch (error) {
      console.error(`Error adding ${this.collectionName}:`, error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * קבלת ישות לפי ID
   */
  async getById(id: string): Promise<ServiceResult<T>> {
    try {
      if (isMockMode) {
        const entity = this.mockData.find((e) => e.id === id);
        return entity
          ? { success: true, data: entity }
          : { success: false, error: 'לא נמצא' };
      }

      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return { success: false, error: 'לא נמצא' };
      }

      return { success: true, data: convertTimestamps<T>(docSnap.data(), docSnap.id) };
    } catch (error) {
      console.error(`Error getting ${this.collectionName}:`, error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * קבלת כל הישויות של זוג
   */
  async getAll(coupleId: string): Promise<ServiceResult<T[]>> {
    try {
      if (isMockMode) {
        return { success: true, data: this.mockData.filter((e) => e.coupleId === coupleId) };
      }

      const q = query(
        collection(db, this.collectionName),
        where('coupleId', '==', coupleId)
      );
      const snapshot = await getDocs(q);
      const entities = snapshot.docs.map((doc) =>
        convertTimestamps<T>(doc.data(), doc.id)
      );

      return { success: true, data: entities };
    } catch (error) {
      console.error(`Error getting all ${this.collectionName}:`, error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * עדכון ישות
   */
  async update(id: string, updates: UpdateEntity<T>): Promise<ServiceResult<void>> {
    try {
      if (isMockMode) {
        const index = this.mockData.findIndex((e) => e.id === id);
        if (index !== -1) {
          this.mockData[index] = {
            ...this.mockData[index],
            ...updates,
            updatedAt: new Date(),
          } as T;
        }
        return { success: true };
      }

      const prepared = prepareForFirestore(updates);
      await updateDoc(doc(db, this.collectionName, id), prepared);

      return { success: true };
    } catch (error) {
      console.error(`Error updating ${this.collectionName}:`, error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * מחיקת ישות
   */
  async delete(id: string): Promise<ServiceResult<void>> {
    try {
      if (isMockMode) {
        const index = this.mockData.findIndex((e) => e.id === id);
        if (index !== -1) {
          this.mockData.splice(index, 1);
        }
        return { success: true };
      }

      await deleteDoc(doc(db, this.collectionName, id));
      return { success: true };
    } catch (error) {
      console.error(`Error deleting ${this.collectionName}:`, error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * האזנה לשינויים בזמן אמת
   */
  subscribe(coupleId: string, callback: (entities: T[]) => void): () => void {
    if (isMockMode) {
      callback(this.mockData.filter((e) => e.coupleId === coupleId));
      return () => {};
    }

    const q = query(
      collection(db, this.collectionName),
      where('coupleId', '==', coupleId)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const entities = snapshot.docs.map((doc) =>
          convertTimestamps<T>(doc.data(), doc.id)
        );
        callback(entities);
      },
      (error) => {
        console.error(`Error in ${this.collectionName} subscription:`, error);
        callback([]);
      }
    );
  }
}
