'use client';

/**
 * Empty State Components
 *
 * Provides consistent empty state UI for various scenarios:
 * - No data
 * - Search no results
 * - Error states
 * - Loading complete with no data
 *
 * Supports RTL layout and Hebrew text.
 */

import React from 'react';
import { Button } from './Button';

/**
 * Empty state variant types
 */
export type EmptyStateVariant = 'no-data' | 'no-results' | 'error' | 'no-access';

/**
 * Empty state props
 */
export interface EmptyStateProps {
  /** Title text */
  title: string;
  /** Description text */
  description?: string;
  /** Visual variant */
  variant?: EmptyStateVariant;
  /** Custom icon (overrides variant icon) */
  icon?: React.ReactNode;
  /** Primary action button */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Secondary action button */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  /** Additional CSS classes */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Variant-specific icons
 */
const variantIcons: Record<EmptyStateVariant, React.ReactNode> = {
  'no-data': (
    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  ),
  'no-results': (
    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  'error': (
    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  'no-access': (
    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
};

/**
 * Variant-specific colors
 */
const variantColors: Record<EmptyStateVariant, string> = {
  'no-data': 'text-gray-400 bg-gray-100',
  'no-results': 'text-blue-400 bg-blue-50',
  'error': 'text-red-400 bg-red-50',
  'no-access': 'text-amber-400 bg-amber-50',
};

/**
 * Size-specific styles
 */
const sizeStyles = {
  sm: {
    container: 'py-6 px-4',
    icon: 'w-10 h-10',
    iconWrapper: 'w-16 h-16 mb-3',
    title: 'text-base',
    description: 'text-sm',
  },
  md: {
    container: 'py-10 px-6',
    icon: 'w-12 h-12',
    iconWrapper: 'w-20 h-20 mb-4',
    title: 'text-lg',
    description: 'text-base',
  },
  lg: {
    container: 'py-16 px-8',
    icon: 'w-16 h-16',
    iconWrapper: 'w-28 h-28 mb-6',
    title: 'text-xl',
    description: 'text-lg',
  },
};

/**
 * Empty State Component
 *
 * @example
 * ```tsx
 * // Basic empty state
 * <EmptyState
 *   title="אין משימות"
 *   description="צרו משימה חדשה כדי להתחיל"
 *   action={{ label: 'צור משימה', onClick: handleCreate }}
 * />
 *
 * // No search results
 * <EmptyState
 *   variant="no-results"
 *   title="לא נמצאו תוצאות"
 *   description="נסו לחפש מונח אחר"
 * />
 * ```
 */
export function EmptyState({
  title,
  description,
  variant = 'no-data',
  icon,
  action,
  secondaryAction,
  className = '',
  size = 'md',
}: EmptyStateProps): React.ReactElement {
  const styles = sizeStyles[size];

  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${styles.container} ${className}`}
      role="status"
      aria-label={title}
    >
      {/* Icon */}
      <div
        className={`
          ${styles.iconWrapper}
          rounded-full flex items-center justify-center
          ${variantColors[variant]}
        `}
      >
        <div className={styles.icon}>
          {icon || variantIcons[variant]}
        </div>
      </div>

      {/* Title */}
      <h3 className={`font-semibold text-gray-900 ${styles.title}`}>
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className={`mt-1 text-gray-500 max-w-sm ${styles.description}`}>
          {description}
        </p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          {action && (
            <Button
              variant="primary"
              onClick={action.onClick}
              size={size === 'sm' ? 'sm' : 'md'}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="secondary"
              onClick={secondaryAction.onClick}
              size={size === 'sm' ? 'sm' : 'md'}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

EmptyState.displayName = 'EmptyState';

/**
 * Pre-configured empty states for common scenarios
 */

/**
 * Empty tasks state
 */
export function EmptyTasks({
  onCreateTask,
}: {
  onCreateTask?: () => void;
}): React.ReactElement {
  return (
    <EmptyState
      variant="no-data"
      title="אין משימות עדיין"
      description="התחילו לתכנן את החתונה על ידי יצירת משימות חדשות"
      action={onCreateTask ? { label: 'צור משימה חדשה', onClick: onCreateTask } : undefined}
    />
  );
}

EmptyTasks.displayName = 'EmptyTasks';

/**
 * Empty guests state
 */
export function EmptyGuests({
  onAddGuest,
  onShareLink,
}: {
  onAddGuest?: () => void;
  onShareLink?: () => void;
}): React.ReactElement {
  return (
    <EmptyState
      variant="no-data"
      title="אין אורחים ברשימה"
      description="הוסיפו אורחים ידנית או שתפו קישור להרשמה עצמית"
      action={onAddGuest ? { label: 'הוסף אורח', onClick: onAddGuest } : undefined}
      secondaryAction={onShareLink ? { label: 'שתף קישור', onClick: onShareLink } : undefined}
    />
  );
}

EmptyGuests.displayName = 'EmptyGuests';

/**
 * Empty search results state
 */
export function EmptySearchResults({
  onClearSearch,
}: {
  onClearSearch?: () => void;
}): React.ReactElement {
  return (
    <EmptyState
      variant="no-results"
      title="לא נמצאו תוצאות"
      description="נסו לשנות את מונחי החיפוש או לבטל את הסינון"
      action={onClearSearch ? { label: 'נקה חיפוש', onClick: onClearSearch } : undefined}
    />
  );
}

EmptySearchResults.displayName = 'EmptySearchResults';

/**
 * Error state
 */
export function ErrorState({
  message,
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}): React.ReactElement {
  return (
    <EmptyState
      variant="error"
      title="אירעה שגיאה"
      description={message || 'משהו השתבש. אנא נסו שוב.'}
      action={onRetry ? { label: 'נסה שוב', onClick: onRetry } : undefined}
    />
  );
}

ErrorState.displayName = 'ErrorState';

export default EmptyState;
