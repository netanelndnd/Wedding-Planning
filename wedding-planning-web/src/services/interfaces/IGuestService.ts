/**
 * Guest Service Interface
 * ממשק לניהול אורחים
 */

import { Guest } from '@/types';
import { IBaseService, ServiceResult, CreateEntity } from './IBaseService';

export type RsvpStatus = 'invited' | 'accepted' | 'declined' | 'pending';

export interface GuestStats {
  total: number;
  totalWithPlusOnes: number;
  accepted: number;
  declined: number;
  pending: number;
}

export interface IGuestService extends IBaseService<Guest> {
  // הוספת אורחים בכמות (מאקסל)
  addBatch(coupleId: string, guests: CreateEntity<Guest>[]): Promise<ServiceResult<string[]>>;

  // מחיקת כל האורחים
  deleteAll(coupleId: string): Promise<ServiceResult<void>>;

  // קבלת אורחים לפי סטטוס RSVP
  getByRsvpStatus(coupleId: string, status: RsvpStatus): Promise<ServiceResult<Guest[]>>;

  // עדכון סטטוס RSVP
  updateRsvpStatus(guestId: string, status: RsvpStatus): Promise<ServiceResult<void>>;

  // קבלת סטטיסטיקות אורחים
  getStats(coupleId: string): Promise<ServiceResult<GuestStats>>;
}
