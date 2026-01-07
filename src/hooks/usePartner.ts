'use client';

/**
 * usePartner Hook
 *
 * Custom hook for managing partner toggle state.
 * Handles partner selection (partner1/partner2/both) with localStorage persistence.
 */

import { useState, useEffect } from 'react';
import { AssignedTo } from '@/types';
import { logger } from '@/lib/logger';

/**
 * Partner toggle state and handlers
 */
export interface UsePartnerReturn {
  /** Currently selected partner */
  selectedPartner: AssignedTo;
  /** Set selected partner */
  setSelectedPartner: (partner: AssignedTo) => void;
  /** Toggle to next partner option */
  togglePartner: () => void;
}

const STORAGE_KEY = 'wedding-planning-selected-partner';
const DEFAULT_PARTNER: AssignedTo = 'both';

/**
 * Hook for partner toggle state management
 *
 * @example
 * ```tsx
 * const { selectedPartner, setSelectedPartner, togglePartner } = usePartner();
 *
 * <button onClick={togglePartner}>
 *   {selectedPartner === 'both' ? 'שניהם' : selectedPartner === 'partner1' ? 'בן/בת זוג 1' : 'בן/בת זוג 2'}
 * </button>
 * ```
 */
export function usePartner(): UsePartnerReturn {
  const [selectedPartner, setSelectedPartnerState] = useState<AssignedTo>(DEFAULT_PARTNER);
  const [isClient, setIsClient] = useState(false);

  // Mark as client-side after mount to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load from localStorage on mount
  useEffect(() => {
    if (!isClient) return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && isValidPartner(stored)) {
        setSelectedPartnerState(stored as AssignedTo);
        logger.debug('Loaded partner selection from localStorage', {
          partner: stored,
        });
      }
    } catch (error) {
      logger.warn('Failed to load partner selection from localStorage', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }, [isClient]);

  /**
   * Set selected partner and persist to localStorage
   */
  const setSelectedPartner = (partner: AssignedTo): void => {
    if (!isValidPartner(partner)) {
      logger.warn('Invalid partner value', { partner });
      return;
    }

    setSelectedPartnerState(partner);

    // Persist to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, partner);
      logger.debug('Saved partner selection to localStorage', { partner });
    } catch (error) {
      logger.warn('Failed to save partner selection to localStorage', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  /**
   * Toggle to next partner option (both -> partner1 -> partner2 -> both)
   */
  const togglePartner = (): void => {
    const nextPartner = getNextPartner(selectedPartner);
    setSelectedPartner(nextPartner);
    logger.debug('Toggled partner selection', {
      from: selectedPartner,
      to: nextPartner,
    });
  };

  return {
    selectedPartner,
    setSelectedPartner,
    togglePartner,
  };
}

/**
 * Validate partner value
 */
function isValidPartner(value: string): boolean {
  return value === 'partner1' || value === 'partner2' || value === 'both';
}

/**
 * Get next partner in cycle
 */
function getNextPartner(current: AssignedTo): AssignedTo {
  switch (current) {
    case 'both':
      return 'partner1';
    case 'partner1':
      return 'partner2';
    case 'partner2':
      return 'both';
    default:
      return 'both';
  }
}
