'use client';

/**
 * Header Component
 *
 * Application header with navigation, partner toggle, and user menu.
 * Displayed on all authenticated pages.
 */

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Couple } from '@/types';
import { PartnerToggle } from './PartnerToggle';
import { Button } from '@/components/ui/Button';
import { usePartner } from '@/hooks/usePartner';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/lib/logger';

/**
 * Header component props
 */
export interface HeaderProps {
  /** Couple profile data */
  couple: Couple;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Application header component
 *
 * @example
 * ```tsx
 * const couple = { partner1Name: 'דני', partner2Name: 'מיכל', ... };
 * <Header couple={couple} />
 * ```
 */
export function Header({ couple, className = '' }: HeaderProps): React.ReactElement {
  const { selectedPartner, togglePartner } = usePartner();
  const { signOut } = useAuth();
  const router = useRouter();

  /**
   * Handle logout
   */
  const handleLogout = async (): Promise<void> => {
    try {
      logger.info('User initiated logout');
      await signOut();
      router.push('/login');
    } catch (error) {
      logger.error('Logout failed', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  return (
    <header
      className={`bg-white border-b border-gray-200 shadow-sm ${className}`}
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center gap-8">
            <Link
              href="/dashboard"
              className="text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              aria-label="תכנון חתונה - דף הבית"
            >
              תכנון חתונה
            </Link>

            <nav className="hidden md:flex items-center gap-4" aria-label="ניווט ראשי">
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
              >
                לוח בקרה
              </Link>
              <Link
                href="/tasks"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
              >
                משימות
              </Link>
              <Link
                href="/guests"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
              >
                אורחים
              </Link>
              <Link
                href="/settings"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
              >
                הגדרות
              </Link>
            </nav>
          </div>

          {/* Partner Toggle and User Menu */}
          <div className="flex items-center gap-4">
            <PartnerToggle
              selectedPartner={selectedPartner}
              partner1Name={couple.partner1Name}
              partner2Name={couple.partner2Name}
              onToggle={togglePartner}
            />

            <Button
              variant="secondary"
              size="sm"
              onClick={handleLogout}
              aria-label="התנתק"
            >
              התנתק
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200 px-4 py-3">
        <nav className="flex items-center justify-around gap-2" aria-label="ניווט למובייל">
          <Link
            href="/dashboard"
            className="text-sm text-gray-700 hover:text-blue-600 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
          >
            לוח בקרה
          </Link>
          <Link
            href="/tasks"
            className="text-sm text-gray-700 hover:text-blue-600 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
          >
            משימות
          </Link>
          <Link
            href="/guests"
            className="text-sm text-gray-700 hover:text-blue-600 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
          >
            אורחים
          </Link>
          <Link
            href="/settings"
            className="text-sm text-gray-700 hover:text-blue-600 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
          >
            הגדרות
          </Link>
        </nav>
      </div>
    </header>
  );
}

Header.displayName = 'Header';
