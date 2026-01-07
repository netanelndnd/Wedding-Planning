'use client';

/**
 * Profile Setup Page
 *
 * Initial profile setup page for new users.
 * Collects partner names, wedding date, and target budget.
 */

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { coupleService } from '@/services/crud/coupleService';
import { logger } from '@/lib/logger';

/**
 * Profile setup page component
 */
export default function SetupPage(): React.ReactElement {
  const [partner1Name, setPartner1Name] = useState('');
  const [partner2Name, setPartner2Name] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [targetBudget, setTargetBudget] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const router = useRouter();

  /**
   * Validate form fields
   */
  const validateForm = (): boolean => {
    if (!partner1Name.trim()) {
      setError('נא להזין שם בן/בת זוג ראשון');
      return false;
    }

    if (!partner2Name.trim()) {
      setError('נא להזין שם בן/בת זוג שני');
      return false;
    }

    if (!weddingDate) {
      setError('נא לבחור תאריך חתונה');
      return false;
    }

    // Validate future date
    const selectedDate = new Date(weddingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setError('תאריך החתונה חייב להיות בעתיד');
      return false;
    }

    if (!targetBudget) {
      setError('נא להזין תקציב יעד');
      return false;
    }

    const budgetNumber = parseFloat(targetBudget);
    if (isNaN(budgetNumber) || budgetNumber < 0) {
      setError('תקציב לא תקין');
      return false;
    }

    if (budgetNumber > 10000000) {
      setError('התקציב גבוה מדי (מקסימום: 10,000,000)');
      return false;
    }

    return true;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError('משתמש לא מחובר');
      return;
    }

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      logger.info('Creating couple profile', { userId: user.uid });

      await coupleService.createCouple(user.uid, {
        partner1Name: partner1Name.trim(),
        partner2Name: partner2Name.trim(),
        weddingDate: new Date(weddingDate),
        targetBudget: parseFloat(targetBudget),
      });

      logger.info('Couple profile created, redirecting to dashboard', {
        userId: user.uid,
      });

      router.push('/dashboard');
    } catch (err) {
      logger.error('Failed to create couple profile', {
        userId: user.uid,
        error: err instanceof Error ? err.message : String(err),
      });

      if (err instanceof Error) {
        setError(err.message || 'שגיאה ביצירת פרופיל');
      } else {
        setError('שגיאה ביצירת פרופיל');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">תכנון חתונה</h1>
          <p className="mt-2 text-gray-600">בואו נתחיל להכיר אתכם</p>
        </div>

        {/* Setup Form Card */}
        <Card>
          <div className="space-y-6">
            <div>
              <CardTitle>הגדרת פרופיל</CardTitle>
              <CardDescription>
                מלא את הפרטים הבאים כדי להתחיל לתכנן את החתונה
              </CardDescription>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Partner Names Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  שמות בני הזוג
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="בן/בת זוג ראשון"
                    type="text"
                    value={partner1Name}
                    onChange={(e) => setPartner1Name(e.target.value)}
                    placeholder="שם מלא"
                    required
                    disabled={loading}
                  />

                  <Input
                    label="בן/בת זוג שני"
                    type="text"
                    value={partner2Name}
                    onChange={(e) => setPartner2Name(e.target.value)}
                    placeholder="שם מלא"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Wedding Details Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  פרטי החתונה
                </h3>

                <Input
                  label="תאריך החתונה"
                  type="date"
                  value={weddingDate}
                  onChange={(e) => setWeddingDate(e.target.value)}
                  required
                  disabled={loading}
                />

                <Input
                  label="תקציב יעד (₪)"
                  type="number"
                  value={targetBudget}
                  onChange={(e) => setTargetBudget(e.target.value)}
                  placeholder="לדוגמה: 150000"
                  required
                  min="0"
                  step="1000"
                  disabled={loading}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
                  role="alert"
                >
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
              >
                התחל לתכנן
              </Button>
            </form>
          </div>
        </Card>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-2">💡 טיפ:</p>
            <p>
              תוכל לערוך את הפרטים האלה בכל עת דרך עמוד ההגדרות. אל תדאג אם אתה
              לא בטוח בתקציב או בתאריך - תמיד ניתן לעדכן מאוחר יותר.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
