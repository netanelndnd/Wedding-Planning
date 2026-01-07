/**
 * ICoupleService Interface
 *
 * Service contract for managing couple profiles in Firestore.
 * Handles CRUD operations for couple documents.
 */

import { Couple, CreateCoupleData, UpdateCoupleData } from '@/types';

/**
 * Couple service interface
 */
export interface ICoupleService {
  /**
   * Create a new couple profile
   * @param userId Firebase Auth UID to use as couple document ID
   * @param data Couple profile data
   * @returns Promise resolving to the created couple
   * @throws Error if creation fails or user already has a profile
   */
  createCouple(userId: string, data: CreateCoupleData): Promise<Couple>;

  /**
   * Get a couple profile by ID
   * @param coupleId Couple document ID (same as user UID)
   * @returns Promise resolving to the couple or null if not found
   * @throws Error if retrieval fails
   */
  getCouple(coupleId: string): Promise<Couple | null>;

  /**
   * Update an existing couple profile
   * @param coupleId Couple document ID
   * @param data Partial couple data to update
   * @returns Promise resolving to the updated couple
   * @throws Error if update fails or couple not found
   */
  updateCouple(coupleId: string, data: UpdateCoupleData): Promise<Couple>;
}
