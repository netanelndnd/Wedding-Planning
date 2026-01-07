'use client';

/**
 * LoadingSpinner Component
 *
 * Animated circular spinner for indicating loading states.
 * Uses CSS animations for smooth rotation and supports multiple sizes.
 */

import React from 'react';

/**
 * LoadingSpinner component props
 */
export interface LoadingSpinnerProps {
  /** Size variant - affects width and height */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Animated loading spinner component
 *
 * @example
 * ```tsx
 * <LoadingSpinner size="md" />
 * <LoadingSpinner size="lg" className="text-primary" />
 * ```
 */
export function LoadingSpinner({
  size = 'md',
  className = '',
}: LoadingSpinnerProps): React.ReactElement {
  // Size classes using logical properties
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div
      className={`inline-block animate-spin rounded-full border-solid border-current border-e-transparent ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label="טוען..."
    >
      <span className="sr-only">טוען...</span>
    </div>
  );
}

LoadingSpinner.displayName = 'LoadingSpinner';
