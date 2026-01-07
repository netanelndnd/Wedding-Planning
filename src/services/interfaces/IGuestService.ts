/**
 * IGuestService Interface
 *
 * Service contract for managing guests in Firestore.
 * Handles CRUD operations for guest subcollections under couples
 * and supports both manual and self-registration flows.
 */

import { Guest, CreateGuestData, UpdateGuestData, GuestStats } from '@/types';

/**
 * Guest service interface
 */
export interface IGuestService {
  /**
   * Create a new guest entry
   * Used for both manual entry by couple and self-registration
   * @param coupleId Couple document ID
   * @param data Guest data
   * @returns Promise resolving to the created guest
   * @throws Error if creation fails or validation errors
   */
  createGuest(coupleId: string, data: CreateGuestData): Promise<Guest>;

  /**
   * Get all guests for a couple
   * @param coupleId Couple document ID
   * @returns Promise resolving to array of guests
   * @throws Error if retrieval fails
   */
  getGuests(coupleId: string): Promise<Guest[]>;

  /**
   * Update an existing guest entry
   * @param coupleId Couple document ID
   * @param guestId Guest document ID
   * @param data Partial guest data to update
   * @returns Promise resolving to the updated guest
   * @throws Error if update fails or guest not found
   */
  updateGuest(
    coupleId: string,
    guestId: string,
    data: UpdateGuestData
  ): Promise<Guest>;

  /**
   * Delete a guest entry
   * @param coupleId Couple document ID
   * @param guestId Guest document ID
   * @returns Promise that resolves when deletion is complete
   * @throws Error if deletion fails or guest not found
   */
  deleteGuest(coupleId: string, guestId: string): Promise<void>;

  /**
   * Get aggregated guest statistics
   * Calculates totals for guests, headcount, and RSVP statuses
   * @param coupleId Couple document ID
   * @returns Promise resolving to guest statistics
   * @throws Error if calculation fails
   */
  getGuestStats(coupleId: string): Promise<GuestStats>;
}
