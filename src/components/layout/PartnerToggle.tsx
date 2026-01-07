'use client';

/**
 * PartnerToggle Component
 *
 * Toggle button for switching between partner views.
 * Displays current selection and allows toggling between partner1, partner2, and both.
 */

import React from 'react';
import { AssignedTo } from '@/types';
import { Button } from '@/components/ui/Button';

/**
 * PartnerToggle component props
 */
export interface PartnerToggleProps {
  /** Currently selected partner */
  selectedPartner: AssignedTo;
  /** Partner 1 name */
  partner1Name: string;
  /** Partner 2 name */
  partner2Name: string;
  /** Toggle handler */
  onToggle: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Partner toggle button component
 *
 * @example
 * ```tsx
 * const { selectedPartner, togglePartner } = usePartner();
 * const couple = { partner1Name: 'דני', partner2Name: 'מיכל' };
 *
 * <PartnerToggle
 *   selectedPartner={selectedPartner}
 *   partner1Name={couple.partner1Name}
 *   partner2Name={couple.partner2Name}
 *   onToggle={togglePartner}
 * />
 * ```
 */
export function PartnerToggle({
  selectedPartner,
  partner1Name,
  partner2Name,
  onToggle,
  className = '',
}: PartnerToggleProps): React.ReactElement {
  /**
   * Get display text for current selection
   */
  const getDisplayText = (): string => {
    switch (selectedPartner) {
      case 'both':
        return 'שניהם';
      case 'partner1':
        return partner1Name;
      case 'partner2':
        return partner2Name;
      default:
        return 'שניהם';
    }
  };

  /**
   * Get icon for current selection
   */
  const getIcon = (): string => {
    switch (selectedPartner) {
      case 'both':
        return '👥';
      case 'partner1':
        return '👤';
      case 'partner2':
        return '👤';
      default:
        return '👥';
    }
  };

  /**
   * Get color variant based on selection
   */
  const getVariant = (): 'primary' | 'secondary' => {
    return selectedPartner === 'both' ? 'secondary' : 'primary';
  };

  return (
    <Button
      variant={getVariant()}
      size="md"
      onClick={onToggle}
      className={className}
      aria-label={`מציג משימות עבור: ${getDisplayText()}`}
      title="לחץ להחלפת תצוגה"
    >
      <span className="text-lg" role="img" aria-hidden="true">
        {getIcon()}
      </span>
      <span>{getDisplayText()}</span>
    </Button>
  );
}

PartnerToggle.displayName = 'PartnerToggle';
