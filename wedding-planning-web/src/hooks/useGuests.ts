import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { GuestData, exportGuestsToExcel, importGuestsFromExcel } from '@/utils/excelExport';
import { guestService } from '@/services/crud';
import { Guest } from '@/types';

/**
 * Mapping functions between GuestData (Excel) and Guest (Firestore)
 */
const guestDataToFirestore = (data: GuestData): Omit<Guest, 'id' | 'createdAt' | 'updatedAt' | 'coupleId'> => {
  return {
    name: data.name,
    phone: data.phone,
    email: data.email,
    relationship: data.side === 'partner1' ? 'צד א' : data.side === 'partner2' ? 'צד ב' : 'משותף',
    plusOne: (data.guests || 1) - 1,
    rsvpStatus: data.confirmed === true ? 'accepted' : data.confirmed === false ? 'declined' : data.invited ? 'invited' : 'pending',
    mealPreference: undefined,
    notes: data.notes,
  };
};

const firestoreToGuestData = (guest: Guest): GuestData => {
  return {
    name: guest.name,
    phone: guest.phone,
    email: guest.email,
    side: guest.relationship === 'צד א' ? 'partner1' : guest.relationship === 'צד ב' ? 'partner2' : 'both',
    invited: guest.rsvpStatus !== 'pending',
    confirmed: guest.rsvpStatus === 'accepted' ? true : guest.rsvpStatus === 'declined' ? false : undefined,
    guests: (guest.plusOne || 0) + 1,
    tableNumber: undefined,
    notes: guest.notes,
  };
};

/**
 * useGuests Hook
 * --------------
 * Handles guest management with Excel import/export and Firebase sync
 */
export function useGuests() {
  const { user, couple } = useAuth();
  const router = useRouter();

  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState('');

  // Subscribe to guests from Firebase
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = guestService.subscribe(user.uid, (fetchedGuests) => {
      setGuests(fetchedGuests);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Convert Firestore guests to GuestData for display/export
  const guestsAsGuestData = guests.map(firestoreToGuestData);

  // Download Excel with current guests data
  const handleDownloadTemplate = useCallback(() => {
    console.log('📥 Downloading Excel with', guests.length, 'guests...');
    const fileName = couple 
      ? `רשימת_אורחים_${couple.partner1Name}_${couple.partner2Name}.xlsx`
      : 'רשימת_אורחים.xlsx';
    
    exportGuestsToExcel(guestsAsGuestData, fileName);
  }, [guests, guestsAsGuestData, couple]);

  // Upload and import Excel file, save to Firebase (MERGE with existing)
  const handleFileUpload = useCallback(async (file: File) => {
    if (!file || !user?.uid) return;

    setLoading(true);
    setSaving(true);
    setError('');
    setUploadSuccess(false);

    try {
      console.log('📤 Uploading Excel file:', file.name);
      const importedGuestData = await importGuestsFromExcel(file);
      
      console.log('✅ Parsed', importedGuestData.length, 'guests from Excel');
      
      const firestoreGuests = importedGuestData.map(guestDataToFirestore);
      
      // MERGE: Add new guests without deleting existing ones
      console.log('💾 Adding', firestoreGuests.length, 'guests to Firebase (merging)...');
      await guestService.addBatch(user.uid, firestoreGuests.map(g => ({ ...g, coupleId: user.uid })));
      
      console.log('✅ Import complete!');
      setUploadSuccess(true);

    } catch (err: any) {
      console.error('❌ Import error:', err);
      setError(err.message || 'שגיאה בייבוא הקובץ');
    } finally {
      setLoading(false);
      setSaving(false);
    }
  }, [user?.uid]);

  // Add single guest from form data
  const addGuestFromForm = useCallback(async (guestData: Omit<Guest, 'id' | 'createdAt' | 'updatedAt' | 'coupleId'>) => {
    if (!user?.uid) return;

    setSaving(true);
    setError('');
    try {
      const result = await guestService.add(user.uid, { ...guestData, coupleId: user.uid });
      if (!result.success) {
        setError(result.error || 'שגיאה בהוספת אורח');
      }
    } catch (err: any) {
      console.error('Error adding guest:', err);
      setError(err.message || 'שגיאה בהוספת אורח');
    } finally {
      setSaving(false);
    }
  }, [user?.uid]);

  // Update guest
  const updateGuest = useCallback(async (guestId: string, updates: Partial<Guest>) => {
    setSaving(true);
    setError('');
    try {
      const result = await guestService.update(guestId, updates);
      if (!result.success) {
        setError(result.error || 'שגיאה בעדכון אורח');
      }
    } catch (err: any) {
      console.error('Error updating guest:', err);
      setError(err.message || 'שגיאה בעדכון אורח');
    } finally {
      setSaving(false);
    }
  }, []);

  // Delete guest
  const deleteGuest = useCallback(async (guestId: string) => {
    try {
      const result = await guestService.delete(guestId);
      if (!result.success) {
        setError(result.error || 'שגיאה במחיקת אורח');
      }
    } catch (err: any) {
      console.error('Error deleting guest:', err);
      setError(err.message || 'שגיאה במחיקת אורח');
    }
  }, []);

  const goToDashboard = useCallback(() => {
    router.push('/dashboard');
  }, [router]);

  // Calculate stats
  const stats = {
    total: guests.length,
    totalWithPlusOnes: guests.reduce((sum, g) => sum + 1 + (g.plusOne || 0), 0),
    accepted: guests.filter(g => g.rsvpStatus === 'accepted').length,
    declined: guests.filter(g => g.rsvpStatus === 'declined').length,
    pending: guests.filter(g => g.rsvpStatus === 'pending' || g.rsvpStatus === 'invited').length,
  };

  return {
    guests,
    guestsAsGuestData,
    loading,
    saving,
    uploadSuccess,
    error,
    stats,
    handleDownloadTemplate,
    handleFileUpload,
    addGuestFromForm,
    updateGuest,
    deleteGuest,
    goToDashboard,
  };
}

