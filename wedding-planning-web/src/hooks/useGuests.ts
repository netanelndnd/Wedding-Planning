import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { GuestData, exportGuestsToExcel, importGuestsFromExcel } from '@/utils/excelExport';

/**
 * useGuests Hook
 * --------------
 * Handles guest management with Excel import/export
 */
export function useGuests() {
  const { user, couple } = useAuth();
  const router = useRouter();

  const [guests, setGuests] = useState<GuestData[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState('');

  // Download Excel template
  const handleDownloadTemplate = useCallback(() => {
    console.log('📥 Downloading Excel template...');
    const fileName = couple 
      ? `רשימת_אורחים_${couple.partner1Name}_${couple.partner2Name}.xlsx`
      : 'רשימת_אורחים.xlsx';
    exportGuestsToExcel(guests, fileName);
  }, [guests, couple]);

  // Upload and import Excel file
  const handleFileUpload = useCallback(async (file: File) => {
    if (!file) return;

    setLoading(true);
    setError('');
    setUploadSuccess(false);

    try {
      console.log('📤 Uploading Excel file:', file.name);
      const importedGuests = await importGuestsFromExcel(file);
      
      console.log('✅ Imported', importedGuests.length, 'guests');
      setGuests(importedGuests);
      setUploadSuccess(true);

      // TODO: Save to Firebase
      // if (user) {
      //   await saveGuestsToFirebase(user.uid, importedGuests);
      // }

    } catch (err: any) {
      console.error('❌ Import error:', err);
      setError(err.message || 'שגיאה בייבוא הקובץ');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const goToDashboard = useCallback(() => {
    router.push('/dashboard');
  }, [router]);

  return {
    guests,
    loading,
    uploadSuccess,
    error,
    handleDownloadTemplate,
    handleFileUpload,
    goToDashboard,
  };
}

