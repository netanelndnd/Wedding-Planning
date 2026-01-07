'use client';

/**
 * GuestForm Component
 *
 * Modal form for creating and editing guests.
 * Includes validation and all guest fields.
 */

import React, { useState, useEffect } from 'react';
import { Guest, CreateGuestData, UpdateGuestData, RsvpStatus } from '@/types';
import { RSVP_STATUS_LABELS } from '@/lib/constants';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

/**
 * GuestForm component props
 */
export interface GuestFormProps {
  /** Editing mode - provide guest to edit, null for create */
  guest?: Guest | null;
  /** Called when form is submitted */
  onSubmit: (data: CreateGuestData | UpdateGuestData) => Promise<void>;
  /** Called when form is cancelled */
  onCancel: () => void;
  /** Show/hide modal */
  isOpen: boolean;
  /** Is this for self-registration (affects source field) */
  isSelfRegistration?: boolean;
}

/**
 * Guest form component for create/edit
 *
 * @example
 * ```tsx
 * <GuestForm
 *   guest={editingGuest}
 *   isOpen={isModalOpen}
 *   onSubmit={handleSubmit}
 *   onCancel={() => setIsModalOpen(false)}
 * />
 * ```
 */
export function GuestForm({
  guest,
  onSubmit,
  onCancel,
  isOpen,
  isSelfRegistration = false,
}: GuestFormProps): React.ReactElement | null {
  const isEditMode = !!guest;

  // Form state
  const [formData, setFormData] = useState<CreateGuestData>({
    name: '',
    phone: '',
    partySize: 1,
    notes: '',
    rsvp: 'pending',
    source: isSelfRegistration ? 'self-registration' : 'manual',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when guest changes
  useEffect(() => {
    if (guest) {
      setFormData({
        name: guest.name,
        phone: guest.phone || '',
        partySize: guest.partySize,
        notes: guest.notes || '',
        rsvp: guest.rsvp,
        source: guest.source,
      });
    } else {
      // Reset for new guest
      setFormData({
        name: '',
        phone: '',
        partySize: 1,
        notes: '',
        rsvp: isSelfRegistration ? 'attending' : 'pending',
        source: isSelfRegistration ? 'self-registration' : 'manual',
      });
    }
    setErrors({});
  }, [guest, isOpen, isSelfRegistration]);

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'נא להזין שם';
    }
    if (formData.partySize < 1 || formData.partySize > 20) {
      newErrors.partySize = 'מספר אנשים חייב להיות בין 1 ל-20';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // Clean up data - remove empty strings
      const cleanData: CreateGuestData | UpdateGuestData = {
        name: formData.name.trim(),
        phone: formData.phone?.trim() || undefined,
        partySize: formData.partySize,
        notes: formData.notes?.trim() || undefined,
        rsvp: formData.rsvp,
        source: formData.source,
      };

      await onSubmit(cleanData);
      onCancel(); // Close modal on success
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isSelfRegistration
              ? 'הרשמה לחתונה'
              : isEditMode
              ? 'עריכת אורח'
              : 'הוספת אורח'}
          </h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Name */}
          <Input
            label="שם מלא *"
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            error={errors.name}
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
            label="מספר אנשים *"
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
            error={errors.partySize}
          />

          {/* RSVP Status */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              {isSelfRegistration ? 'האם תגיעו?' : 'סטטוס אישור'}
            </label>
            <select
              value={formData.rsvp}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  rsvp: e.target.value as RsvpStatus,
                })
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(RSVP_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
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
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="הערות מיוחדות, דרישות תזונה וכו'"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            ביטול
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={isSubmitting}
          >
            {isSelfRegistration
              ? 'שלח אישור'
              : isEditMode
              ? 'שמור שינויים'
              : 'הוסף אורח'}
          </Button>
        </div>
      </div>
    </div>
  );
}

GuestForm.displayName = 'GuestForm';
