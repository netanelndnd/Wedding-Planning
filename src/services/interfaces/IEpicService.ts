/**
 * IEpicService Interface
 *
 * Service contract for managing epics (categories) in Firestore.
 * Handles CRUD operations for epic subcollections under couples.
 */

import { Epic, CreateEpicData, UpdateEpicData } from '@/types';

/**
 * Epic service interface
 */
export interface IEpicService {
  /**
   * Create default epics for a new couple
   * Creates 10 predefined Hebrew categories (צילום ווידאו, קייטרינג, etc.)
   * @param coupleId Couple document ID
   * @returns Promise resolving to array of created epics
   * @throws Error if creation fails
   */
  createDefaultEpics(coupleId: string): Promise<Epic[]>;

  /**
   * Get all epics for a couple, ordered by display order
   * @param coupleId Couple document ID
   * @returns Promise resolving to array of epics
   * @throws Error if retrieval fails
   */
  getEpics(coupleId: string): Promise<Epic[]>;

  /**
   * Create a new custom epic
   * @param coupleId Couple document ID
   * @param data Epic data
   * @returns Promise resolving to the created epic
   * @throws Error if creation fails
   */
  createEpic(coupleId: string, data: CreateEpicData): Promise<Epic>;

  /**
   * Update an existing epic
   * @param coupleId Couple document ID
   * @param epicId Epic document ID
   * @param data Partial epic data to update
   * @returns Promise resolving to the updated epic
   * @throws Error if update fails or epic not found
   */
  updateEpic(
    coupleId: string,
    epicId: string,
    data: UpdateEpicData
  ): Promise<Epic>;
}
