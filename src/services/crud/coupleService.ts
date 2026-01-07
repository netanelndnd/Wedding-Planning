/**
 * CoupleService Implementation
 *
 * Firestore service for managing couple profiles.
 * Handles CRUD operations for couple documents.
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { ICoupleService } from '@/services/interfaces/ICoupleService';
import { Couple, CreateCoupleData, UpdateCoupleData } from '@/types';

/**
 * Firestore Couple Service Implementation
 */
class CoupleService implements ICoupleService {
  private readonly collectionName = 'couples';

  /**
   * Create a new couple profile
   */
  async createCouple(
    userId: string,
    data: CreateCoupleData
  ): Promise<Couple> {
    try {
      logger.info('Creating couple profile', { userId });

      // Check if couple already exists
      const existing = await this.getCouple(userId);
      if (existing) {
        logger.warn('Couple profile already exists', { userId });
        throw new Error('Couple profile already exists for this user');
      }

      // Prepare document data
      const coupleDoc = {
        partner1Name: data.partner1Name,
        partner2Name: data.partner2Name,
        weddingDate: Timestamp.fromDate(data.weddingDate),
        targetBudget: data.targetBudget,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Create document with userId as document ID
      const coupleRef = doc(db, this.collectionName, userId);
      await setDoc(coupleRef, coupleDoc);

      logger.info('Couple profile created successfully', {
        userId,
        partner1Name: data.partner1Name,
        partner2Name: data.partner2Name,
      });

      // Fetch and return the created document
      const created = await this.getCouple(userId);
      if (!created) {
        throw new Error('Failed to retrieve created couple profile');
      }

      return created;
    } catch (error) {
      logger.error('Failed to create couple profile', {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Get a couple profile by ID
   */
  async getCouple(coupleId: string): Promise<Couple | null> {
    try {
      logger.debug('Fetching couple profile', { coupleId });

      const coupleRef = doc(db, this.collectionName, coupleId);
      const coupleSnap = await getDoc(coupleRef);

      if (!coupleSnap.exists()) {
        logger.debug('Couple profile not found', { coupleId });
        return null;
      }

      const data = coupleSnap.data();

      const couple: Couple = {
        id: coupleSnap.id,
        partner1Name: data.partner1Name,
        partner2Name: data.partner2Name,
        weddingDate: data.weddingDate as Timestamp,
        targetBudget: data.targetBudget,
        createdAt: data.createdAt as Timestamp,
        updatedAt: data.updatedAt as Timestamp,
      };

      logger.debug('Couple profile retrieved', {
        coupleId,
        partner1Name: couple.partner1Name,
        partner2Name: couple.partner2Name,
      });

      return couple;
    } catch (error) {
      logger.error('Failed to fetch couple profile', {
        coupleId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Update an existing couple profile
   */
  async updateCouple(
    coupleId: string,
    data: UpdateCoupleData
  ): Promise<Couple> {
    try {
      logger.info('Updating couple profile', { coupleId, updates: data });

      // Check if couple exists
      const existing = await this.getCouple(coupleId);
      if (!existing) {
        logger.warn('Couple profile not found for update', { coupleId });
        throw new Error('Couple profile not found');
      }

      // Prepare update data
      const updateData: Record<string, unknown> = {
        updatedAt: serverTimestamp(),
      };

      if (data.partner1Name !== undefined) {
        updateData.partner1Name = data.partner1Name;
      }
      if (data.partner2Name !== undefined) {
        updateData.partner2Name = data.partner2Name;
      }
      if (data.weddingDate !== undefined) {
        updateData.weddingDate = Timestamp.fromDate(data.weddingDate);
      }
      if (data.targetBudget !== undefined) {
        updateData.targetBudget = data.targetBudget;
      }

      // Update document
      const coupleRef = doc(db, this.collectionName, coupleId);
      await updateDoc(coupleRef, updateData);

      logger.info('Couple profile updated successfully', {
        coupleId,
        updatedFields: Object.keys(updateData),
      });

      // Fetch and return the updated document
      const updated = await this.getCouple(coupleId);
      if (!updated) {
        throw new Error('Failed to retrieve updated couple profile');
      }

      return updated;
    } catch (error) {
      logger.error('Failed to update couple profile', {
        coupleId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}

// Export singleton instance
export const coupleService = new CoupleService();
