/**
 * Guest Service
 * סרוויס לניהול אורחים
 */

import { Guest } from '@/types';
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
import { IGuestService, GuestStats, RsvpStatus } from '../interfaces/IGuestService';
import { ServiceResult, CreateEntity } from '../interfaces';

// מאגר נתונים מדומים
let mockGuests: Guest[] = [];

class GuestServiceImpl extends BaseFirestoreService<Guest> implements IGuestService {
  protected collectionName = 'guests';

  protected get mockData(): Guest[] {
    return mockGuests;
  }

  protected set mockData(data: Guest[]) {
    mockGuests = data;
  }

  /**
   * הוספת אורחים בכמות (מאקסל)
   * מחלק לקבוצות של 450 בגלל מגבלת Firestore
   */
  async addBatch(
    coupleId: string,
    guests: CreateEntity<Guest>[]
  ): Promise<ServiceResult<string[]>> {
    try {
      if (isMockMode) {
        const ids = guests.map((_, i) => `mock-guest-${Date.now()}-${i}`);
        guests.forEach((guest, i) => {
          mockGuests.push({
            ...guest,
            id: ids[i],
            coupleId,
            createdAt: new Date(),
            updatedAt: new Date(),
          } as Guest);
        });
        return { success: true, data: ids };
      }

      const guestsCollection = collection(db, 'guests');
      const addedIds: string[] = [];

      // Firestore מגביל ל-500 פעולות לכל batch
      const chunkSize = 450;
      for (let i = 0; i < guests.length; i += chunkSize) {
        const chunk = guests.slice(i, i + chunkSize);
        const batch = writeBatch(db);

        for (const guest of chunk) {
          const docRef = doc(guestsCollection);
          const prepared = prepareForFirestore(guest, false);
          prepared.coupleId = coupleId;
          prepared.createdAt = Timestamp.now();
          prepared.updatedAt = Timestamp.now();

          batch.set(docRef, prepared);
          addedIds.push(docRef.id);
        }

        await batch.commit();
      }

      return { success: true, data: addedIds };
    } catch (error) {
      console.error('Error adding guests batch:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * מחיקת כל האורחים של זוג
   */
  async deleteAll(coupleId: string): Promise<ServiceResult<void>> {
    try {
      if (isMockMode) {
        mockGuests = mockGuests.filter((g) => g.coupleId !== coupleId);
        return { success: true };
      }

      const q = query(
        collection(db, 'guests'),
        where('coupleId', '==', coupleId)
      );
      const snapshot = await getDocs(q);

      // מחלק למקבצים
      const chunkSize = 450;
      const docs = snapshot.docs;

      for (let i = 0; i < docs.length; i += chunkSize) {
        const chunk = docs.slice(i, i + chunkSize);
        const batch = writeBatch(db);
        chunk.forEach((d) => batch.delete(d.ref));
        await batch.commit();
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting all guests:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * קבלת אורחים לפי סטטוס RSVP
   */
  async getByRsvpStatus(
    coupleId: string,
    status: RsvpStatus
  ): Promise<ServiceResult<Guest[]>> {
    try {
      if (isMockMode) {
        const guests = mockGuests.filter(
          (g) => g.coupleId === coupleId && g.rsvpStatus === status
        );
        return { success: true, data: guests };
      }

      const q = query(
        collection(db, this.collectionName),
        where('coupleId', '==', coupleId),
        where('rsvpStatus', '==', status)
      );
      const snapshot = await getDocs(q);
      const guests = snapshot.docs.map((doc) =>
        convertTimestamps<Guest>(doc.data(), doc.id)
      );

      return { success: true, data: guests };
    } catch (error) {
      console.error('Error getting guests by RSVP status:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * עדכון סטטוס RSVP
   */
  async updateRsvpStatus(
    guestId: string,
    status: RsvpStatus
  ): Promise<ServiceResult<void>> {
    return this.update(guestId, { rsvpStatus: status });
  }

  /**
   * קבלת סטטיסטיקות אורחים
   */
  async getStats(coupleId: string): Promise<ServiceResult<GuestStats>> {
    try {
      const result = await this.getAll(coupleId);
      if (!result.success || !result.data) {
        return { success: false, error: result.error || 'שגיאה בקבלת אורחים' };
      }

      const guests = result.data;
      const stats: GuestStats = {
        total: guests.length,
        totalWithPlusOnes: guests.reduce(
          (sum, g) => sum + 1 + (g.plusOne || 0),
          0
        ),
        accepted: guests.filter((g) => g.rsvpStatus === 'accepted').length,
        declined: guests.filter((g) => g.rsvpStatus === 'declined').length,
        pending: guests.filter(
          (g) => g.rsvpStatus === 'pending' || g.rsvpStatus === 'invited'
        ).length,
      };

      return { success: true, data: stats };
    } catch (error) {
      console.error('Error getting guest stats:', error);
      return { success: false, error: (error as Error).message };
    }
  }
}

// ייצוא instance יחיד (Singleton)
export const guestService = new GuestServiceImpl();
