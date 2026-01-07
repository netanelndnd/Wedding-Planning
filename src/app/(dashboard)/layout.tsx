'use client';

/**
 * Dashboard Layout
 *
 * Protected layout for authenticated pages.
 * Includes auth guard, couple profile check, and header component.
 */

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { coupleService } from '@/services/crud/coupleService';
import { Couple } from '@/types';
import { logger } from '@/lib/logger';

/**
 * Dashboard layout props
 */
interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * Protected dashboard layout component
 * Enforces authentication and couple profile existence
 */
export default function DashboardLayout({
  children,
}: DashboardLayoutProps): React.ReactElement {
  const [couple, setCouple] = useState<Couple | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  /**
   * Check authentication and load couple profile
   */
  useEffect(() => {
    const checkAuthAndProfile = async (): Promise<void> => {
      // Wait for auth to initialize
      if (authLoading) {
        return;
      }

      // Redirect to login if not authenticated
      if (!user) {
        logger.info('User not authenticated, redirecting to login', {
          attemptedPath: pathname,
        });
        router.push('/login');
        return;
      }

      // Check if email is verified
      if (!user.emailVerified) {
        logger.warn('User email not verified', {
          userId: user.uid,
          email: user.email,
        });
        // Allow access but show warning in UI (could be improved)
        // For now, we'll allow unverified users to proceed
      }

      try {
        // Load couple profile
        logger.debug('Loading couple profile', { userId: user.uid });
        const coupleData = await coupleService.getCouple(user.uid);

        if (!coupleData) {
          // No couple profile exists, redirect to setup
          logger.info('No couple profile found, redirecting to setup', {
            userId: user.uid,
          });
          router.push('/setup');
          return;
        }

        logger.debug('Couple profile loaded', {
          userId: user.uid,
          coupleId: coupleData.id,
        });

        setCouple(coupleData);
        setLoading(false);
      } catch (error) {
        logger.error('Failed to load couple profile', {
          userId: user.uid,
          error: error instanceof Error ? error.message : String(error),
        });
        setLoading(false);
      }
    };

    checkAuthAndProfile();
  }, [user, authLoading, router, pathname]);

  // Show loading spinner while checking auth and profile
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600">טוען...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if redirecting
  if (!user || !couple) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Render protected content with header
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skip link for keyboard navigation */}
      <a href="#main-content" className="skip-link">
        דלג לתוכן הראשי
      </a>

      <Header couple={couple} />
      <main
        id="main-content"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        role="main"
        tabIndex={-1}
      >
        {children}
      </main>
    </div>
  );
}
