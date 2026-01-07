'use client';

/**
 * Public Guest Registration Page
 *
 * Public page for guest self-registration (no auth required).
 * Guests can access this via a shared link and register for the wedding.
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { guestService } from '@/services/crud/guestService';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { RSVP_STATUS_LABELS } from '@/lib/constants';
import type { CreateGuestData, RsvpStatus } from '@/types';
import type { Timestamp } from 'firebase/firestore';

/**
 * Couple info state
 */
interface CoupleInfo {
  partner1Name: string;
  partner2Name: string;
  weddingDate: Timestamp;
}

/**
 * Public guest registration page component
 */
export default function GuestRegistrationPage(): React.ReactElement {
  const params = useParams();
  const coupleId = params.coupleId as string;

  // State
  const [coupleInfo, setCoupleInfo] = useState<CoupleInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateGuestData>({
    name: '',
    phone: '',
    partySize: 1,
    notes: '',
    rsvp: 'attending',
    source: 'self-registration',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch couple info on mount
  useEffect(() => {
    const fetchCoupleInfo = async () => {
      if (!coupleId) {
        setError('קישור לא תקין');
        setLoading(false);
        return;
      }

      try {
        logger.debug('Fetching couple info for registration', { coupleId });

        const coupleRef = doc(db, 'couples', coupleId);
        const coupleSnap = await getDoc(coupleRef);

        if (!coupleSnap.exists()) {
          logger.warn('Couple not found for registration', { coupleId });
          setError('לא נמצאה חתונה בקישור זה');
          setLoading(false);
          return;
        }

        const data = coupleSnap.data();
        setCoupleInfo({
          partner1Name: data.partner1Name,
          partner2Name: data.partner2Name,
          weddingDate: data.weddingDate,
        });

        logger.info('Couple info loaded for registration', {
          coupleId,
          partner1Name: data.partner1Name,
          partner2Name: data.partner2Name,
        });
      } catch (err) {
        logger.error('Failed to fetch couple info', {
          coupleId,
          error: err instanceof Error ? err.message : String(err),
        });
        setError('שגיאה בטעינת פרטי החתונה');
      } finally {
        setLoading(false);
      }
    };

    fetchCoupleInfo();
  }, [coupleId]);

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'נא להזין שם';
    }
    if (formData.partySize < 1 || formData.partySize > 20) {
      newErrors.partySize = 'מספר אנשים חייב להיות בין 1 ל-20';
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      await guestService.createGuest(coupleId, {
        name: formData.name.trim(),
        phone: formData.phone?.trim() || undefined,
        partySize: formData.partySize,
        notes: formData.notes?.trim() || undefined,
        rsvp: formData.rsvp,
        source: 'self-registration',
      });

      logger.info('Guest registered successfully', {
        coupleId,
        name: formData.name,
        rsvp: formData.rsvp,
      });

      setSubmitted(true);
    } catch (err) {
      logger.error('Failed to register guest', {
        coupleId,
        error: err instanceof Error ? err.message : String(err),
      });
      setError('שגיאה בשליחת האישור. נא לנסות שוב.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format wedding date
  const formatWeddingDate = (timestamp: Timestamp): string => {
    const date = timestamp.toDate();
    return date.toLocaleDateString('he-IL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Error state
  if (error && !coupleInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white p-4">
        <Card className="max-w-md w-full text-center">
          <div className="py-8">
            <div className="text-6xl mb-4">:(</div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">אופס!</h1>
            <p className="text-gray-600">{error}</p>
          </div>
        </Card>
      </div>
    );
  }

  // Success state
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white p-4">
        <Card className="max-w-md w-full text-center">
          <div className="py-8">
            <div className="text-6xl mb-4">
              {formData.rsvp === 'attending' ? '💕' : '💌'}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              תודה רבה!
            </h1>
            <p className="text-gray-600 mb-4">
              {formData.rsvp === 'attending'
                ? 'נרשמתם בהצלחה! נשמח לראותכם בחתונה.'
                : formData.rsvp === 'not-attending'
                ? 'תודה על העדכון. מקווים לראותכם באירועים הבאים!'
                : 'תודה על העדכון. נשמח אם תעדכנו אותנו בהמשך.'}
            </p>
            <div className="text-sm text-gray-500">
              <p>{coupleInfo?.partner1Name} & {coupleInfo?.partner2Name}</p>
              {coupleInfo?.weddingDate && (
                <p>{formatWeddingDate(coupleInfo.weddingDate)}</p>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Registration form
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">💍</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            הוזמנתם לחתונה של
          </h1>
          <p className="text-xl text-pink-600 font-semibold">
            {coupleInfo?.partner1Name} & {coupleInfo?.partner2Name}
          </p>
          {coupleInfo?.weddingDate && (
            <p className="text-gray-600 mt-2">
              {formatWeddingDate(coupleInfo.weddingDate)}
            </p>
          )}
        </div>

        {/* Registration Form */}
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              אישור הגעה
            </h2>

            {/* Error message */}
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Name */}
            <Input
              label="שם מלא *"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              error={formErrors.name}
              placeholder="לדוגמה: ישראל ישראלי"
            />

            {/* Phone */}
            <Input
              label="טלפון"
              type="tel"
              value={formData.phone || ''}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="050-1234567"
            />

            {/* Party Size */}
            <Input
              label="כמה אנשים תהיו? *"
              type="number"
              min="1"
              max="20"
              value={formData.partySize}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  partySize: parseInt(e.target.value) || 1,
                })
              }
              error={formErrors.partySize}
            />

            {/* RSVP Status */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                האם תגיעו? *
              </label>
              <div className="space-y-2">
                {Object.entries(RSVP_STATUS_LABELS).map(([value, label]) => (
                  <label
                    key={value}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.rsvp === value
                        ? 'border-pink-500 bg-pink-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="rsvp"
                      value={value}
                      checked={formData.rsvp === value}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          rsvp: e.target.value as RsvpStatus,
                        })
                      }
                      className="sr-only"
                    />
                    <span
                      className={`w-4 h-4 rounded-full border-2 me-3 flex items-center justify-center ${
                        formData.rsvp === value
                          ? 'border-pink-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {formData.rsvp === value && (
                        <span className="w-2 h-2 rounded-full bg-pink-500" />
                      )}
                    </span>
                    <span className="text-gray-900">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                הערות
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="הערות מיוחדות, דרישות תזונה, הגבלות נגישות וכו'"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={isSubmitting}
              className="bg-pink-600 hover:bg-pink-700 focus:ring-pink-500"
            >
              שלח אישור הגעה
            </Button>
          </form>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          בברכה, {coupleInfo?.partner1Name} ו{coupleInfo?.partner2Name}
        </p>
      </div>
    </div>
  );
}
