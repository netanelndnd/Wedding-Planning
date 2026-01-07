/**
 * Guest Service Implementation
 *
 * Handles all CRUD operations for guests in Firestore.
 * Guests are stored in couples/{coupleId}/guests subcollection.
 * Supports both manual entry by couple and self-registration by guests.
 */

import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import type {
  Guest,
  CreateGuestData,
  UpdateGuestData,
  GuestStats,
} from '@/types';
import type { IGuestService } from '@/services/interfaces/IGuestService';

/**
 * Guest Service Implementation
 */
export class GuestService implements IGuestService {
  /**
   * Create a new guest entry
   * Used for both manual entry by couple and self-registration
   */
  async createGuest(coupleId: string, data: CreateGuestData): Promise<Guest> {
    try {
      logger.info('Creating guest', {
        coupleId,
        name: data.name,
        source: data.source,
      });

      const guestsRef = collection(db, 'couples', coupleId, 'guests');
      const now = Timestamp.now();

      const guestData = {
        name: data.name,
        phone: data.phone,
        partySize: data.partySize,
        notes: data.notes,
        rsvp: data.rsvp ?? 'pending',
        source: data.source,
        createdAt: now,
      };

      const docRef = await addDoc(guestsRef, guestData);

      const guest: Guest = {
        id: docRef.id,
        ...guestData,
      };

      logger.info('Successfully created guest', {
        coupleId,
        guestId: docRef.id,
        name: data.name,
      });

      return guest;
    } catch (error) {
      logger.error('Failed to create guest', {
        coupleId,
        name: data.name,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('Failed to create guest');
    }
  }

  /**
   * Get all guests for a couple
   */
  async getGuests(coupleId: string): Promise<Guest[]> {
    try {
      logger.debug('Fetching guests for couple', { coupleId });

      const guestsRef = collection(db, 'couples', coupleId, 'guests');
      const snapshot = await getDocs(guestsRef);

      const guests: Guest[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Guest[];

      logger.info('Successfully fetched guests', {
        coupleId,
        count: guests.length,
      });

      return guests;
    } catch (error) {
      logger.error('Failed to fetch guests', {
        coupleId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('Failed to fetch guests');
    }
  }

  /**
   * Update an existing guest entry
   */
  async updateGuest(
    coupleId: string,
    guestId: string,
    data: UpdateGuestData
  ): Promise<Guest> {
    try {
      logger.info('Updating guest', {
        coupleId,
        guestId,
      });

      const guestRef = doc(db, 'couples', coupleId, 'guests', guestId);

      const updateData: Record<string, unknown> = {};

      if (data.name !== undefined) {
        updateData.name = data.name;
      }
      if (data.phone !== undefined) {
        updateData.phone = data.phone;
      }
      if (data.partySize !== undefined) {
        updateData.partySize = data.partySize;
      }
      if (data.notes !== undefined) {
        updateData.notes = data.notes;
      }
      if (data.rsvp !== undefined) {
        updateData.rsvp = data.rsvp;
      }

      await updateDoc(guestRef, updateData);

      // Fetch updated guest
      const guests = await this.getGuests(coupleId);
      const updatedGuest = guests.find((g) => g.id === guestId);

      if (!updatedGuest) {
        throw new Error('Guest not found after update');
      }

      logger.info('Successfully updated guest', {
        coupleId,
        guestId,
      });

      return updatedGuest;
    } catch (error) {
      logger.error('Failed to update guest', {
        coupleId,
        guestId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('Failed to update guest');
    }
  }

  /**
   * Delete a guest entry
   */
  async deleteGuest(coupleId: string, guestId: string): Promise<void> {
    try {
      logger.info('Deleting guest', {
        coupleId,
        guestId,
      });

      const guestRef = doc(db, 'couples', coupleId, 'guests', guestId);
      await deleteDoc(guestRef);

      logger.info('Successfully deleted guest', {
        coupleId,
        guestId,
      });
    } catch (error) {
      logger.error('Failed to delete guest', {
        coupleId,
        guestId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('Failed to delete guest');
    }
  }

  /**
   * Get aggregated guest statistics
   * Calculates totals for guests, headcount, and RSVP statuses
   */
  async getGuestStats(coupleId: string): Promise<GuestStats> {
    try {
      logger.debug('Calculating guest stats', { coupleId });

      const guests = await this.getGuests(coupleId);

      const stats: GuestStats = {
        totalGuests: guests.length,
        totalHeadcount: guests.reduce((sum, g) => sum + g.partySize, 0),
        attendingCount: guests
          .filter((g) => g.rsvp === 'attending')
          .reduce((sum, g) => sum + g.partySize, 0),
        notAttendingCount: guests
          .filter((g) => g.rsvp === 'not-attending')
          .reduce((sum, g) => sum + g.partySize, 0),
        maybeCount: guests
          .filter((g) => g.rsvp === 'maybe')
          .reduce((sum, g) => sum + g.partySize, 0),
        pendingCount: guests
          .filter((g) => g.rsvp === 'pending')
          .reduce((sum, g) => sum + g.partySize, 0),
      };

      logger.info('Successfully calculated guest stats', {
        coupleId,
        totalGuests: stats.totalGuests,
        totalHeadcount: stats.totalHeadcount,
      });

      return stats;
    } catch (error) {
      logger.error('Failed to calculate guest stats', {
        coupleId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('Failed to calculate guest stats');
    }
  }
}

// Export singleton instance
export const guestService = new GuestService();
