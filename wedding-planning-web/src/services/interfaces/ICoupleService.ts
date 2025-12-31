/**
 * Couple Service Interface
 * ממשק לניהול נתוני הזוג
 * הערה: Couple משויך ל-userId ולא ל-coupleId כמו שאר הישויות
 */

import { Couple } from '@/types';
import { ServiceResult } from './IBaseService';

export type CreateCouple = Omit<Couple, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateCouple = Partial<Omit<Couple, 'id' | 'createdAt'>>;

export interface ICoupleService {
  // יצירת זוג חדש
  create(userId: string, couple: CreateCouple): Promise<ServiceResult<void>>;

  // קבלת נתוני הזוג
  get(userId: string): Promise<ServiceResult<Couple | null>>;

  // עדכון נתוני הזוג
  update(userId: string, updates: UpdateCouple): Promise<ServiceResult<void>>;

  // עדכון תמונת הזוג
  updatePhoto(userId: string, photoURL: string): Promise<ServiceResult<void>>;

  // האזנה לשינויים בזמן אמת
  subscribe(userId: string, callback: (couple: Couple | null) => void): () => void;
}
