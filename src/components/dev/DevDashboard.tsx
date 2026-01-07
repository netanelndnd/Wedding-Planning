'use client';

/**
 * DevDashboard Component
 *
 * Development-only dashboard for testing credentials and database seeding.
 * Only visible when NODE_ENV === 'development'.
 */

import React, { useState } from 'react';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { logger } from '@/lib/logger';

/**
 * DevDashboard component props
 */
export interface DevDashboardProps {
  /** Additional CSS classes */
  className?: string;
}

/**
 * Development dashboard component
 * Provides test credentials and database seeding functionality
 *
 * @example
 * ```tsx
 * {process.env.NODE_ENV === 'development' && <DevDashboard />}
 * ```
 */
export function DevDashboard({ className = '' }: DevDashboardProps): React.ReactElement | null {
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [seedLoading, setSeedLoading] = useState(false);

  // Only render in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  /**
   * Test credentials
   */
  const testCredentials = {
    email: 'test@example.com',
    password: 'password123',
  };

  /**
   * Copy text to clipboard
   */
  const copyToClipboard = async (text: string, label: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(label);
      logger.debug('Copied to clipboard', { label });

      // Clear success message after 2 seconds
      setTimeout(() => {
        setCopySuccess(null);
      }, 2000);
    } catch (error) {
      logger.error('Failed to copy to clipboard', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  /**
   * Seed database with mock data
   */
  const handleSeedDatabase = async (): Promise<void> => {
    try {
      setSeedLoading(true);
      logger.info('Seeding database with mock data');

      // TODO: Implement mock data seeding when mockDataService is created
      // For now, just simulate the operation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      logger.info('Database seeded successfully');
      alert('בסיס נתונים אוכלס בהצלחה (פונקציונליות תיושם בעתיד)');
    } catch (error) {
      logger.error('Failed to seed database', {
        error: error instanceof Error ? error.message : String(error),
      });
      alert('שגיאה באכלוס בסיס נתונים');
    } finally {
      setSeedLoading(false);
    }
  };

  return (
    <Card className={`bg-yellow-50 border-yellow-200 ${className}`}>
      <div className="space-y-4">
        <div>
          <CardTitle className="text-yellow-800">
            🔧 לוח בקרה למפתחים
          </CardTitle>
          <CardDescription className="text-yellow-700">
            כלים לפיתוח ובדיקה (זמין רק בסביבת פיתוח)
          </CardDescription>
        </div>

        {/* Test Credentials Section */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-yellow-900">
            פרטי התחברות לבדיקה:
          </h4>
          <div className="bg-white rounded-lg p-4 border border-yellow-300 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                {testCredentials.email}
              </code>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => copyToClipboard(testCredentials.email, 'email')}
              >
                {copySuccess === 'email' ? '✓ הועתק' : 'העתק'}
              </Button>
            </div>
            <div className="flex items-center justify-between gap-2">
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                {testCredentials.password}
              </code>
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  copyToClipboard(testCredentials.password, 'password')
                }
              >
                {copySuccess === 'password' ? '✓ הועתק' : 'העתק'}
              </Button>
            </div>
          </div>
        </div>

        {/* Database Actions Section */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-yellow-900">
            פעולות בסיס נתונים:
          </h4>
          <Button
            variant="secondary"
            size="sm"
            fullWidth
            onClick={handleSeedDatabase}
            loading={seedLoading}
          >
            אכלס בסיס נתונים בנתוני דמה
          </Button>
        </div>

        {/* Info Section */}
        <div className="text-xs text-yellow-700 bg-yellow-100 rounded p-2">
          <strong>הערה:</strong> לוח זה מוצג רק בסביבת פיתוח. בייצור, הוא לא יופיע.
        </div>
      </div>
    </Card>
  );
}

DevDashboard.displayName = 'DevDashboard';
