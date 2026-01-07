'use client';

/**
 * useGuests Hook
 *
 * Custom hook for managing guests with real-time updates.
 * Provides CRUD operations and real-time synchronization with Firestore.
 */

import { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { guestService } from '@/services/crud/guestService';
import type {
  Guest,
  CreateGuestData,
  UpdateGuestData,
  GuestStats,
  RsvpStatus,
} from '@/types';

/**
 * Guests hook state and handlers
 */
export interface UseGuestsReturn {
  /** Array of guests */
  guests: Guest[];
  /** Loading state */
  loading: boolean;
  /** Error message */
  error: string | null;
  /** Guest statistics */
  stats: GuestStats;
  /** Create a new guest */
  createGuest: (data: CreateGuestData) => Promise<Guest | null>;
  /** Update a guest */
  updateGuest: (guestId: string, data: UpdateGuestData) => Promise<Guest | null>;
  /** Delete a guest */
  deleteGuest: (guestId: string) => Promise<boolean>;
  /** Get guests by RSVP status */
  getGuestsByRsvp: (rsvp: RsvpStatus) => Guest[];
  /** Refresh guests */
  refresh: () => void;
}

/**
 * Calculate guest statistics from guests array
 */
function calculateStats(guests: Guest[]): GuestStats {
  return {
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
}

/**
 * Hook for managing guests
 *
 * @param coupleId Couple document ID
 * @returns Guests state and operations
 *
 * @example
 * ```tsx
 * const { guests, loading, error, stats, createGuest, updateGuest, deleteGuest } = useGuests(coupleId);
 *
 * const handleCreate = async (data: CreateGuestData) => {
 *   const guest = await createGuest(data);
 *   if (guest) {
 *     console.log('Guest created:', guest);
 *   }
 * };
 * ```
 */
export function useGuests(coupleId: string | null): UseGuestsReturn {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<GuestStats>({
    totalGuests: 0,
    totalHeadcount: 0,
    attendingCount: 0,
    notAttendingCount: 0,
    maybeCount: 0,
    pendingCount: 0,
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load guests with real-time updates
  useEffect(() => {
    if (!coupleId) {
      setGuests([]);
      setStats(calculateStats([]));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    logger.debug('Setting up guests listener', { coupleId });

    const guestsRef = collection(db, 'couples', coupleId, 'guests');

    const unsubscribe = onSnapshot(
      guestsRef,
      (snapshot) => {
        const loadedGuests: Guest[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Guest[];

        setGuests(loadedGuests);
        setStats(calculateStats(loadedGuests));
        setLoading(false);
        logger.debug('Guests updated', {
          coupleId,
          count: loadedGuests.length,
        });
      },
      (err) => {
        logger.error('Failed to listen to guests', {
          coupleId,
          error: err.message,
        });
        setError('Failed to load guests');
        setLoading(false);
      }
    );

    return () => {
      logger.debug('Cleaning up guests listener', { coupleId });
      unsubscribe();
    };
  }, [coupleId, refreshTrigger]);

  /**
   * Create a new guest
   */
  const createGuest = useCallback(
    async (data: CreateGuestData): Promise<Guest | null> => {
      if (!coupleId) {
        logger.warn('Cannot create guest without coupleId');
        return null;
      }

      try {
        const guest = await guestService.createGuest(coupleId, data);
        logger.info('Guest created successfully', {
          coupleId,
          guestId: guest.id,
        });
        return guest;
      } catch (err) {
        logger.error('Failed to create guest', {
          coupleId,
          error: err instanceof Error ? err.message : String(err),
        });
        setError('Failed to create guest');
        return null;
      }
    },
    [coupleId]
  );

  /**
   * Update a guest
   */
  const updateGuest = useCallback(
    async (guestId: string, data: UpdateGuestData): Promise<Guest | null> => {
      if (!coupleId) {
        logger.warn('Cannot update guest without coupleId');
        return null;
      }

      try {
        const guest = await guestService.updateGuest(coupleId, guestId, data);
        logger.info('Guest updated successfully', {
          coupleId,
          guestId,
        });
        return guest;
      } catch (err) {
        logger.error('Failed to update guest', {
          coupleId,
          guestId,
          error: err instanceof Error ? err.message : String(err),
        });
        setError('Failed to update guest');
        return null;
      }
    },
    [coupleId]
  );

  /**
   * Delete a guest
   */
  const deleteGuest = useCallback(
    async (guestId: string): Promise<boolean> => {
      if (!coupleId) {
        logger.warn('Cannot delete guest without coupleId');
        return false;
      }

      try {
        await guestService.deleteGuest(coupleId, guestId);
        logger.info('Guest deleted successfully', {
          coupleId,
          guestId,
        });
        return true;
      } catch (err) {
        logger.error('Failed to delete guest', {
          coupleId,
          guestId,
          error: err instanceof Error ? err.message : String(err),
        });
        setError('Failed to delete guest');
        return false;
      }
    },
    [coupleId]
  );

  /**
   * Get guests by RSVP status (client-side filter)
   */
  const getGuestsByRsvp = useCallback(
    (rsvp: RsvpStatus): Guest[] => {
      return guests.filter((g) => g.rsvp === rsvp);
    },
    [guests]
  );

  /**
   * Refresh guests
   */
  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return {
    guests,
    loading,
    error,
    stats,
    createGuest,
    updateGuest,
    deleteGuest,
    getGuestsByRsvp,
    refresh,
  };
}
