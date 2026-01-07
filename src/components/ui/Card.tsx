'use client';

/**
 * Card Component
 *
 * Flexible container component with header, body, and footer sections.
 * Provides consistent styling and elevation for content grouping.
 */

import React from 'react';

/**
 * Card component props
 */
export interface CardProps {
  /** Card header content */
  header?: React.ReactNode;
  /** Card body content */
  children: React.ReactNode;
  /** Card footer content */
  footer?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Disable default padding */
  noPadding?: boolean;
}

/**
 * Card container component with header, body, and footer slots
 *
 * @example
 * ```tsx
 * <Card
 *   header={<h2>כותרת</h2>}
 *   footer={<Button>שמור</Button>}
 * >
 *   <p>תוכן הכרטיס</p>
 * </Card>
 * ```
 */
export function Card({
  header,
  children,
  footer,
  className = '',
  noPadding = false,
}: CardProps): React.ReactElement {
  // Base card styles with elevation
  const baseStyles =
    'bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden';

  // Padding styles
  const paddingStyles = noPadding ? '' : 'p-6';

  return (
    <div className={`${baseStyles} ${className}`}>
      {header && (
        <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
          {header}
        </div>
      )}
      <div className={paddingStyles}>{children}</div>
      {footer && (
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          {footer}
        </div>
      )}
    </div>
  );
}

Card.displayName = 'Card';

/**
 * CardHeader sub-component for semantic markup
 */
export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({
  children,
  className = '',
}: CardHeaderProps): React.ReactElement {
  return <div className={`font-semibold text-lg ${className}`}>{children}</div>;
}

CardHeader.displayName = 'CardHeader';

/**
 * CardTitle sub-component for semantic markup
 */
export interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function CardTitle({
  children,
  className = '',
}: CardTitleProps): React.ReactElement {
  return (
    <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
      {children}
    </h3>
  );
}

CardTitle.displayName = 'CardTitle';

/**
 * CardDescription sub-component for semantic markup
 */
export interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function CardDescription({
  children,
  className = '',
}: CardDescriptionProps): React.ReactElement {
  return <p className={`text-sm text-gray-600 ${className}`}>{children}</p>;
}

CardDescription.displayName = 'CardDescription';
