'use client';

/**
 * useEpics Hook
 *
 * Custom hook for managing epics (categories) with real-time updates.
 * Provides CRUD operations and real-time synchronization with Firestore.
 */

import { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { epicService } from '@/services/crud/epicService';
import type { Epic, CreateEpicData, UpdateEpicData } from '@/types';

/**
 * Epics hook state and handlers
 */
export interface UseEpicsReturn {
  /** Array of epics */
  epics: Epic[];
  /** Loading state */
  loading: boolean;
  /** Error message */
  error: string | null;
  /** Create default epics */
  createDefaultEpics: () => Promise<Epic[] | null>;
  /** Create a custom epic */
  createEpic: (data: CreateEpicData) => Promise<Epic | null>;
  /** Update an epic */
  updateEpic: (epicId: string, data: UpdateEpicData) => Promise<Epic | null>;
  /** Get epic by ID */
  getEpicById: (epicId: string) => Epic | undefined;
  /** Refresh epics */
  refresh: () => void;
}

/**
 * Hook for managing epics
 *
 * @param coupleId Couple document ID
 * @returns Epics state and operations
 *
 * @example
 * ```tsx
 * const { epics, loading, error, createDefaultEpics, createEpic, updateEpic } = useEpics(coupleId);
 *
 * const handleCreateDefaults = async () => {
 *   const epics = await createDefaultEpics();
 *   if (epics) {
 *     console.log('Default epics created:', epics.length);
 *   }
 * };
 * ```
 */
export function useEpics(coupleId: string | null): UseEpicsReturn {
  const [epics, setEpics] = useState<Epic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load epics with real-time updates
  useEffect(() => {
    if (!coupleId) {
      setEpics([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    logger.debug('Setting up epics listener', { coupleId });

    const epicsRef = collection(db, 'couples', coupleId, 'epics');
    const q = query(epicsRef, orderBy('order', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loadedEpics: Epic[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Epic[];

        setEpics(loadedEpics);
        setLoading(false);
        logger.debug('Epics updated', {
          coupleId,
          count: loadedEpics.length,
        });
      },
      (err) => {
        logger.error('Failed to listen to epics', {
          coupleId,
          error: err.message,
        });
        setError('Failed to load epics');
        setLoading(false);
      }
    );

    return () => {
      logger.debug('Cleaning up epics listener', { coupleId });
      unsubscribe();
    };
  }, [coupleId, refreshTrigger]);

  /**
   * Create default epics for a new couple
   */
  const createDefaultEpics = useCallback(async (): Promise<Epic[] | null> => {
    if (!coupleId) {
      logger.warn('Cannot create default epics without coupleId');
      return null;
    }

    try {
      const createdEpics = await epicService.createDefaultEpics(coupleId);
      logger.info('Default epics created successfully', {
        coupleId,
        count: createdEpics.length,
      });
      return createdEpics;
    } catch (err) {
      logger.error('Failed to create default epics', {
        coupleId,
        error: err instanceof Error ? err.message : String(err),
      });
      setError('Failed to create default epics');
      return null;
    }
  }, [coupleId]);

  /**
   * Create a custom epic
   */
  const createEpic = useCallback(
    async (data: CreateEpicData): Promise<Epic | null> => {
      if (!coupleId) {
        logger.warn('Cannot create epic without coupleId');
        return null;
      }

      try {
        const epic = await epicService.createEpic(coupleId, data);
        logger.info('Epic created successfully', {
          coupleId,
          epicId: epic.id,
        });
        return epic;
      } catch (err) {
        logger.error('Failed to create epic', {
          coupleId,
          error: err instanceof Error ? err.message : String(err),
        });
        setError('Failed to create epic');
        return null;
      }
    },
    [coupleId]
  );

  /**
   * Update an epic
   */
  const updateEpic = useCallback(
    async (epicId: string, data: UpdateEpicData): Promise<Epic | null> => {
      if (!coupleId) {
        logger.warn('Cannot update epic without coupleId');
        return null;
      }

      try {
        const epic = await epicService.updateEpic(coupleId, epicId, data);
        logger.info('Epic updated successfully', {
          coupleId,
          epicId,
        });
        return epic;
      } catch (err) {
        logger.error('Failed to update epic', {
          coupleId,
          epicId,
          error: err instanceof Error ? err.message : String(err),
        });
        setError('Failed to update epic');
        return null;
      }
    },
    [coupleId]
  );

  /**
   * Get epic by ID (client-side lookup)
   */
  const getEpicById = useCallback(
    (epicId: string): Epic | undefined => {
      return epics.find((e) => e.id === epicId);
    },
    [epics]
  );

  /**
   * Refresh epics
   */
  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return {
    epics,
    loading,
    error,
    createDefaultEpics,
    createEpic,
    updateEpic,
    getEpicById,
    refresh,
  };
}
