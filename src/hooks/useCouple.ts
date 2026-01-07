'use client';

/**
 * useCouple Hook
 *
 * Custom hook for managing couple profile data with real-time updates.
 * Provides read access to couple profile from Firestore.
 */

import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import type { Couple } from '@/types';

/**
 * Couple hook state and data
 */
export interface UseCoupleReturn {
  /** Couple profile data */
  couple: Couple | null;
  /** Loading state */
  loading: boolean;
  /** Error message */
  error: string | null;
}

/**
 * Hook for accessing couple profile
 *
 * @param coupleId Couple document ID (usually same as user UID)
 * @returns Couple profile state
 *
 * @example
 * ```tsx
 * const { user } = useAuth();
 * const { couple, loading, error } = useCouple(user?.uid);
 *
 * if (loading) return <LoadingSpinner />;
 * if (!couple) return <SetupProfile />;
 *
 * return <div>{couple.partner1Name} & {couple.partner2Name}</div>;
 * ```
 */
export function useCouple(coupleId: string | null | undefined): UseCoupleReturn {
  const [couple, setCouple] = useState<Couple | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load couple with real-time updates
  useEffect(() => {
    if (!coupleId) {
      setCouple(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    logger.debug('Setting up couple listener', { coupleId });

    const coupleRef = doc(db, 'couples', coupleId);

    const unsubscribe = onSnapshot(
      coupleRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          logger.debug('Couple profile not found', { coupleId });
          setCouple(null);
          setLoading(false);
          return;
        }

        const data = snapshot.data();
        const coupleData: Couple = {
          id: snapshot.id,
          partner1Name: data.partner1Name,
          partner2Name: data.partner2Name,
          weddingDate: data.weddingDate,
          targetBudget: data.targetBudget,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };

        setCouple(coupleData);
        setLoading(false);
        logger.debug('Couple profile updated', {
          coupleId,
          partner1Name: coupleData.partner1Name,
          partner2Name: coupleData.partner2Name,
        });
      },
      (err) => {
        logger.error('Failed to listen to couple profile', {
          coupleId,
          error: err.message,
        });
        setError('Failed to load couple profile');
        setLoading(false);
      }
    );

    return () => {
      logger.debug('Cleaning up couple listener', { coupleId });
      unsubscribe();
    };
  }, [coupleId]);

  return {
    couple,
    loading,
    error,
  };
}
