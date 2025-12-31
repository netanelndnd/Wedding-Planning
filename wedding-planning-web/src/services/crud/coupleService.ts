/**
 * Couple Service
 * סרוויס לניהול נתוני הזוג
 */

import { Couple } from '@/types';
import { doc, getDoc, setDoc, onSnapshot, Timestamp } from 'firebase/firestore';
import { db, isMockMode } from '@/lib/firebase';
import { ICoupleService, CreateCouple, UpdateCouple } from '../interfaces/ICoupleService';
import { ServiceResult } from '../interfaces';
import { prepareForFirestore, convertTimestamps } from './baseService';

// מאגר נתונים מדומים
let mockCouples: Map<string, Couple> = new Map();

class CoupleServiceImpl implements ICoupleService {
  /**
   * יצירת זוג חדש
   */
  async create(userId: string, couple: CreateCouple): Promise<ServiceResult<void>> {
    try {
      if (isMockMode) {
        mockCouples.set(userId, {
          ...couple,
          id: userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Couple);
        return { success: true };
      }

      const prepared = prepareForFirestore(couple, false);
      prepared.createdAt = Timestamp.now();
      prepared.updatedAt = Timestamp.now();

      await setDoc(doc(db, 'couples', userId), prepared);
      return { success: true };
    } catch (error) {
      console.error('Error creating couple:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * קבלת נתוני הזוג
   */
  async get(userId: string): Promise<ServiceResult<Couple | null>> {
    try {
      if (isMockMode) {
        const couple = mockCouples.get(userId) || null;
        return { success: true, data: couple };
      }

      const docRef = doc(db, 'couples', userId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return { success: true, data: null };
      }

      return {
        success: true,
        data: convertTimestamps<Couple>(docSnap.data(), docSnap.id),
      };
    } catch (error) {
      console.error('Error getting couple:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * עדכון נתוני הזוג
   */
  async update(userId: string, updates: UpdateCouple): Promise<ServiceResult<void>> {
    try {
      if (isMockMode) {
        const existing = mockCouples.get(userId);
        if (existing) {
          mockCouples.set(userId, {
            ...existing,
            ...updates,
            updatedAt: new Date(),
          });
        }
        return { success: true };
      }

      const prepared = prepareForFirestore(updates);
      await setDoc(doc(db, 'couples', userId), prepared, { merge: true });

      return { success: true };
    } catch (error) {
      console.error('Error updating couple:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * עדכון תמונת הזוג
   */
  async updatePhoto(userId: string, photoURL: string): Promise<ServiceResult<void>> {
    return this.update(userId, { photoURL });
  }

  /**
   * האזנה לשינויים בזמן אמת
   */
  subscribe(userId: string, callback: (couple: Couple | null) => void): () => void {
    if (isMockMode) {
      callback(mockCouples.get(userId) || null);
      return () => {};
    }

    const docRef = doc(db, 'couples', userId);

    return onSnapshot(
      docRef,
      (docSnap) => {
        if (!docSnap.exists()) {
          callback(null);
          return;
        }
        callback(convertTimestamps<Couple>(docSnap.data(), docSnap.id));
      },
      (error) => {
        console.error('Error in couple subscription:', error);
        callback(null);
      }
    );
  }
}

// ייצוא instance יחיד (Singleton)
export const coupleService = new CoupleServiceImpl();
