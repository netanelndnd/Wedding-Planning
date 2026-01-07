/**
 * Epic Service Implementation
 *
 * Handles all CRUD operations for epics (categories) in Firestore.
 * Epics are stored in couples/{coupleId}/epics subcollection.
 */

import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { DEFAULT_EPICS } from '@/lib/constants';
import type { Epic, CreateEpicData, UpdateEpicData } from '@/types';
import type { IEpicService } from '@/services/interfaces/IEpicService';

/**
 * Epic Service Implementation
 */
export class EpicService implements IEpicService {
  /**
   * Create default epics for a new couple
   */
  async createDefaultEpics(coupleId: string): Promise<Epic[]> {
    try {
      logger.info('Creating default epics for couple', { coupleId });

      const epicsRef = collection(db, 'couples', coupleId, 'epics');
      const createdEpics: Epic[] = [];

      // Create each default epic with proper order
      for (let i = 0; i < DEFAULT_EPICS.length; i++) {
        const epicData = DEFAULT_EPICS[i];
        const docRef = await addDoc(epicsRef, {
          ...epicData,
          order: i + 1,
          createdAt: Timestamp.now(),
        });

        const epic: Epic = {
          id: docRef.id,
          ...epicData,
          isDefault: epicData.isDefault ?? true,
          order: i + 1,
          createdAt: Timestamp.now(),
        };

        createdEpics.push(epic);

        logger.debug('Created default epic', {
          coupleId,
          epicId: docRef.id,
          title: epicData.title,
        });
      }

      logger.info('Successfully created default epics', {
        coupleId,
        count: createdEpics.length,
      });

      return createdEpics;
    } catch (error) {
      logger.error('Failed to create default epics', {
        coupleId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('Failed to create default epics');
    }
  }

  /**
   * Get all epics for a couple, ordered by display order
   */
  async getEpics(coupleId: string): Promise<Epic[]> {
    try {
      logger.debug('Fetching epics for couple', { coupleId });

      const epicsRef = collection(db, 'couples', coupleId, 'epics');
      const q = query(epicsRef, orderBy('order', 'asc'));
      const snapshot = await getDocs(q);

      const epics: Epic[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Epic[];

      logger.info('Successfully fetched epics', {
        coupleId,
        count: epics.length,
      });

      return epics;
    } catch (error) {
      logger.error('Failed to fetch epics', {
        coupleId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('Failed to fetch epics');
    }
  }

  /**
   * Create a new custom epic
   */
  async createEpic(coupleId: string, data: CreateEpicData): Promise<Epic> {
    try {
      logger.info('Creating custom epic', {
        coupleId,
        title: data.title,
      });

      const epicsRef = collection(db, 'couples', coupleId, 'epics');
      const epicData = {
        ...data,
        isDefault: data.isDefault ?? false,
        createdAt: Timestamp.now(),
      };

      const docRef = await addDoc(epicsRef, epicData);

      const epic: Epic = {
        id: docRef.id,
        ...epicData,
      };

      logger.info('Successfully created custom epic', {
        coupleId,
        epicId: docRef.id,
        title: data.title,
      });

      return epic;
    } catch (error) {
      logger.error('Failed to create custom epic', {
        coupleId,
        title: data.title,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('Failed to create custom epic');
    }
  }

  /**
   * Update an existing epic
   */
  async updateEpic(
    coupleId: string,
    epicId: string,
    data: UpdateEpicData
  ): Promise<Epic> {
    try {
      logger.info('Updating epic', {
        coupleId,
        epicId,
      });

      const epicRef = doc(db, 'couples', coupleId, 'epics', epicId);
      await updateDoc(epicRef, data as Record<string, unknown>);

      // Fetch updated epic
      const epics = await this.getEpics(coupleId);
      const updatedEpic = epics.find((e) => e.id === epicId);

      if (!updatedEpic) {
        throw new Error('Epic not found after update');
      }

      logger.info('Successfully updated epic', {
        coupleId,
        epicId,
      });

      return updatedEpic;
    } catch (error) {
      logger.error('Failed to update epic', {
        coupleId,
        epicId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('Failed to update epic');
    }
  }
}

// Export singleton instance
export const epicService = new EpicService();
