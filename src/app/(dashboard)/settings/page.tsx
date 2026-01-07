'use client';

/**
 * Settings Page
 *
 * User settings page for updating couple profile.
 * Allows editing partner names, wedding date, target budget, and notification preferences.
 */

import React, { useState, useEffect, FormEvent } from 'react';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { coupleService } from '@/services/crud/coupleService';
import { Couple, NotificationPreferences } from '@/types';
import { logger } from '@/lib/logger';
import { CalendarExportButton } from '@/components/sharing';

/**
 * Default notification preferences
 */
const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  weeklyReminder: true,
  dayBeforeReminder: true,
  notificationEmail: undefined,
};

/**
 * Settings page component
 */
export default function SettingsPage(): React.ReactElement {
  const [couple, setCouple] = useState<Couple | null>(null);
  const [partner1Name, setPartner1Name] = useState('');
  const [partner2Name, setPartner2Name] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [targetBudget, setTargetBudget] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Notification preferences state
  const [weeklyReminder, setWeeklyReminder] = useState(true);
  const [dayBeforeReminder, setDayBeforeReminder] = useState(true);
  const [notificationEmail, setNotificationEmail] = useState('');
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [notificationSuccess, setNotificationSuccess] = useState<string | null>(null);
  const [notificationError, setNotificationError] = useState<string | null>(null);

  const { user } = useAuth();

  /**
   * Load couple profile on mount
   */
  useEffect(() => {
    const loadProfile = async (): Promise<void> => {
      if (!user) return;

      try {
        setLoading(true);
        logger.debug('Loading couple profile for settings', { userId: user.uid });

        const coupleData = await coupleService.getCouple(user.uid);
        if (coupleData) {
          setCouple(coupleData);
          setPartner1Name(coupleData.partner1Name);
          setPartner2Name(coupleData.partner2Name);

          // Convert Timestamp to date string for input
          const date = coupleData.weddingDate.toDate();
          const dateString = date.toISOString().split('T')[0];
          setWeddingDate(dateString);

          setTargetBudget(coupleData.targetBudget.toString());

          // Load notification preferences
          const prefs = coupleData.notificationPreferences || DEFAULT_NOTIFICATION_PREFERENCES;
          setWeeklyReminder(prefs.weeklyReminder);
          setDayBeforeReminder(prefs.dayBeforeReminder);
          setNotificationEmail(prefs.notificationEmail || '');
        }
      } catch (err) {
        logger.error('Failed to load couple profile in settings', {
          userId: user.uid,
          error: err instanceof Error ? err.message : String(err),
        });
        setError('שגיאה בטעינת הפרופיל');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

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
    setSuccess(null);

    if (!user || !couple) {
      setError('משתמש לא מחובר');
      return;
    }

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      logger.info('Updating couple profile', { userId: user.uid });

      await coupleService.updateCouple(user.uid, {
        partner1Name: partner1Name.trim(),
        partner2Name: partner2Name.trim(),
        weddingDate: new Date(weddingDate),
        targetBudget: parseFloat(targetBudget),
      });

      logger.info('Couple profile updated successfully', { userId: user.uid });
      setSuccess('הפרופיל עודכן בהצלחה!');

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);

      // Reload profile to get updated data
      const updatedCouple = await coupleService.getCouple(user.uid);
      if (updatedCouple) {
        setCouple(updatedCouple);
      }
    } catch (err) {
      logger.error('Failed to update couple profile', {
        userId: user.uid,
        error: err instanceof Error ? err.message : String(err),
      });

      if (err instanceof Error) {
        setError(err.message || 'שגיאה בעדכון הפרופיל');
      } else {
        setError('שגיאה בעדכון הפרופיל');
      }
    } finally {
      setSaving(false);
    }
  };

  /**
   * Handle notification preferences save
   */
  const handleSaveNotifications = async (): Promise<void> => {
    if (!user || !couple) {
      setNotificationError('משתמש לא מחובר');
      return;
    }

    // Validate email if provided
    if (notificationEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(notificationEmail)) {
      setNotificationError('כתובת אימייל לא תקינה');
      return;
    }

    try {
      setSavingNotifications(true);
      setNotificationError(null);
      setNotificationSuccess(null);

      logger.info('Updating notification preferences', { userId: user.uid });

      const preferences: NotificationPreferences = {
        weeklyReminder,
        dayBeforeReminder,
        notificationEmail: notificationEmail.trim() || undefined,
      };

      await coupleService.updateCouple(user.uid, {
        notificationPreferences: preferences,
      });

      logger.info('Notification preferences updated successfully', { userId: user.uid });
      setNotificationSuccess('הגדרות ההתראות עודכנו בהצלחה!');

      // Clear success message after 3 seconds
      setTimeout(() => {
        setNotificationSuccess(null);
      }, 3000);

      // Update local couple state
      const updatedCouple = await coupleService.getCouple(user.uid);
      if (updatedCouple) {
        setCouple(updatedCouple);
      }
    } catch (err) {
      logger.error('Failed to update notification preferences', {
        userId: user.uid,
        error: err instanceof Error ? err.message : String(err),
      });

      if (err instanceof Error) {
        setNotificationError(err.message || 'שגיאה בעדכון הגדרות ההתראות');
      } else {
        setNotificationError('שגיאה בעדכון הגדרות ההתראות');
      }
    } finally {
      setSavingNotifications(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">הגדרות</h1>
          <p className="mt-2 text-gray-600">נהל את פרטי החתונה שלך</p>
        </div>
        <Card>
          <div className="text-center py-12 text-gray-500">טוען...</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">הגדרות</h1>
        <p className="mt-2 text-gray-600">נהל את פרטי החתונה שלך</p>
      </div>

      <Card>
        <div className="space-y-6">
          <div>
            <CardTitle>פרטי הפרופיל</CardTitle>
            <CardDescription>
              עדכן את פרטי החתונה והתקציב שלך
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
                  disabled={saving}
                />

                <Input
                  label="בן/בת זוג שני"
                  type="text"
                  value={partner2Name}
                  onChange={(e) => setPartner2Name(e.target.value)}
                  placeholder="שם מלא"
                  required
                  disabled={saving}
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
                disabled={saving}
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
                disabled={saving}
              />
            </div>

            {/* Success Message */}
            {success && (
              <div
                className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm"
                role="alert"
              >
                {success}
              </div>
            )}

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
              loading={saving}
            >
              שמור שינויים
            </Button>
          </form>
        </div>
      </Card>

      {/* Notification Preferences Section */}
      <Card>
        <div className="space-y-6">
          <div>
            <CardTitle>הגדרות התראות</CardTitle>
            <CardDescription>
              קבל תזכורות במייל על משימות קרובות וסיכום שבועי
            </CardDescription>
          </div>

          <div className="space-y-4">
            {/* Weekly Summary Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1 me-4">
                <p className="font-medium text-gray-900">סיכום שבועי</p>
                <p className="text-sm text-gray-600">
                  קבל מייל כל יום ראשון עם סיכום המשימות לשבוע הקרוב
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={weeklyReminder}
                  onChange={(e) => setWeeklyReminder(e.target.checked)}
                  disabled={savingNotifications}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
              </label>
            </div>

            {/* Day-Before Reminder Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1 me-4">
                <p className="font-medium text-gray-900">תזכורת יום לפני</p>
                <p className="text-sm text-gray-600">
                  קבל מייל בשעה 18:00 על משימות שמועד היעד שלהן מחר
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={dayBeforeReminder}
                  onChange={(e) => setDayBeforeReminder(e.target.checked)}
                  disabled={savingNotifications}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
              </label>
            </div>

            {/* Custom Email */}
            <div className="pt-4 border-t border-gray-200 space-y-2">
              <Input
                label="כתובת מייל להתראות (אופציונלי)"
                type="email"
                value={notificationEmail}
                onChange={(e) => setNotificationEmail(e.target.value)}
                placeholder={user?.email || 'your@email.com'}
                disabled={savingNotifications}
              />
              <p className="text-sm text-gray-500">
                השאר ריק כדי לקבל התראות לכתובת המייל של החשבון
              </p>
            </div>
          </div>

          {/* Notification Success Message */}
          {notificationSuccess && (
            <div
              className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm"
              role="alert"
            >
              {notificationSuccess}
            </div>
          )}

          {/* Notification Error Message */}
          {notificationError && (
            <div
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
              role="alert"
            >
              {notificationError}
            </div>
          )}

          {/* Save Notifications Button */}
          <Button
            type="button"
            variant="primary"
            fullWidth
            loading={savingNotifications}
            onClick={handleSaveNotifications}
          >
            שמור הגדרות התראות
          </Button>

          {/* Info Note */}
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
            <p className="font-medium mb-1">שים לב:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>הסיכום השבועי נשלח כל יום ראשון בשעה 09:00</li>
              <li>תזכורות יום לפני נשלחות בשעה 18:00</li>
              <li>ההתראות נשלחות רק על משימות עם תאריך יעד</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Calendar Export Section */}
      {couple && partner1Name && partner2Name && weddingDate && (
        <Card>
          <div className="space-y-4">
            <div>
              <CardTitle>ייצוא ליומן</CardTitle>
              <CardDescription>
                הוסף את תאריך החתונה ליומן שלך
              </CardDescription>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    החתונה של {partner1Name} ו{partner2Name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(weddingDate).toLocaleDateString('he-IL', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      weekday: 'long',
                    })}
                  </p>
                </div>
                <CalendarExportButton
                  type="wedding"
                  weddingDate={new Date(weddingDate)}
                  partnerNames={{
                    partner1: partner1Name,
                    partner2: partner2Name,
                  }}
                  size="md"
                />
              </div>
            </div>

            <p className="text-sm text-gray-500">
              לחץ על &quot;הוסף ליומן&quot; להורדת קובץ ICS שניתן לייבא ליומן Google, Outlook, Apple Calendar ועוד.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
