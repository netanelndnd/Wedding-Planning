'use client';

/**
 * Guests Page
 *
 * Main page for guest management with list view, statistics,
 * and shareable registration link.
 */

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCouple } from '@/hooks/useCouple';
import { useGuests } from '@/hooks/useGuests';
import {
  GuestList,
  GuestForm,
  GuestStats,
  ShareLinkGenerator,
} from '@/components/guests';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { Guest, CreateGuestData, UpdateGuestData, RsvpStatus } from '@/types';

/**
 * Guests page component
 */
export default function GuestsPage(): React.ReactElement {
  const { user } = useAuth();
  const coupleId = user?.uid || null;
  const { couple, loading: coupleLoading } = useCouple(coupleId);

  // Hooks
  const { guests, stats, loading: guestsLoading, createGuest, updateGuest, deleteGuest } =
    useGuests(coupleId);

  // Local state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);

  // Handle open create form
  const handleOpenCreateForm = () => {
    setEditingGuest(null);
    setIsFormOpen(true);
  };

  // Handle open edit form
  const handleEdit = (guest: Guest) => {
    setEditingGuest(guest);
    setIsFormOpen(true);
  };

  // Handle form submit
  const handleFormSubmit = async (data: CreateGuestData | UpdateGuestData) => {
    if (editingGuest) {
      // Update existing guest
      await updateGuest(editingGuest.id, data as UpdateGuestData);
    } else {
      // Create new guest
      await createGuest(data as CreateGuestData);
    }
    setIsFormOpen(false);
    setEditingGuest(null);
  };

  // Handle delete
  const handleDelete = async (guestId: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק אורח זה?')) {
      await deleteGuest(guestId);
    }
  };

  // Handle RSVP change
  const handleRsvpChange = async (guestId: string, rsvp: RsvpStatus) => {
    await updateGuest(guestId, { rsvp });
  };

  // Loading state
  if (guestsLoading || coupleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Get wedding date for share link
  const weddingDate = couple?.weddingDate?.toDate();

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ניהול אורחים</h1>
          <p className="text-gray-600 mt-1">
            נהל את רשימת האורחים ושתף קישור הרשמה
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenCreateForm}>
          + הוסף אורח
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Guest Stats */}
          <GuestStats stats={stats} loading={guestsLoading} />

          {/* Share Link Generator */}
          {coupleId && (
            <ShareLinkGenerator
              coupleId={coupleId}
              partnerNames={
                couple
                  ? {
                      partner1: couple.partner1Name,
                      partner2: couple.partner2Name,
                    }
                  : undefined
              }
              weddingDate={weddingDate}
            />
          )}
        </div>

        {/* Main - Guest List */}
        <div className="lg:col-span-2">
          <Card noPadding>
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-900">רשימת אורחים</h3>
              <p className="text-sm text-gray-600">
                {guests.length} רשומות | {stats.totalHeadcount} אנשים סה״כ
              </p>
            </div>
            <GuestList
              guests={guests}
              loading={guestsLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onRsvpChange={handleRsvpChange}
            />
          </Card>
        </div>
      </div>

      {/* Guest Form Modal */}
      <GuestForm
        guest={editingGuest}
        isOpen={isFormOpen}
        onSubmit={handleFormSubmit}
        onCancel={() => {
          setIsFormOpen(false);
          setEditingGuest(null);
        }}
      />
    </div>
  );
}
