import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { vendorService } from '@/services/firestoreService';
import { uploadContract, deleteContract } from '@/services/storageService';
import { Vendor } from '@/types';

/**
 * useVendors Hook
 * --------------
 * Handles vendor management with contract uploads and expense calculations
 */
export function useVendors() {
  const { user, couple } = useAuth();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  // Load vendors
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = vendorService.subscribeToVendors(user.uid, (newVendors) => {
      setVendors(newVendors);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Add vendor
  const addVendor = useCallback(async (vendorData: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt' | 'coupleId'>) => {
    if (!user?.uid) {
      setError('משתמש לא מחובר');
      return '';
    }

    try {
      setError('');
      const vendorId = await vendorService.addVendor(user.uid, {
        ...vendorData,
        coupleId: user.uid,
      });
      return vendorId;
    } catch (err: any) {
      console.error('Error adding vendor:', err);
      setError(err.message || 'שגיאה בהוספת ספק');
      throw err;
    }
  }, [user]);

  // Update vendor
  const updateVendor = useCallback(async (vendorId: string, updates: Partial<Vendor>) => {
    try {
      setError('');
      await vendorService.updateVendor(vendorId, updates);
    } catch (err: any) {
      console.error('Error updating vendor:', err);
      setError(err.message || 'שגיאה בעדכון ספק');
      throw err;
    }
  }, []);

  // Delete vendor
  const deleteVendor = useCallback(async (vendorId: string) => {
    if (!user?.uid) return;

    try {
      setError('');
      // Find vendor to delete contract if exists
      const vendor = vendors.find(v => v.id === vendorId);
      if (vendor?.contractUrl) {
        try {
          await deleteContract(vendor.contractUrl);
        } catch (err) {
          console.warn('Could not delete contract:', err);
        }
      }
      
      await vendorService.deleteVendor(vendorId);
    } catch (err: any) {
      console.error('Error deleting vendor:', err);
      setError(err.message || 'שגיאה במחיקת ספק');
      throw err;
    }
  }, [vendors, user]);

  // Upload contract
  const uploadVendorContract = useCallback(async (vendorId: string, file: File) => {
    if (!user?.uid) {
      setError('משתמש לא מחובר');
      return;
    }

    try {
      setUploading(true);
      setError('');
      
      // Delete old contract if exists
      const vendor = vendors.find(v => v.id === vendorId);
      if (vendor?.contractUrl) {
        try {
          await deleteContract(vendor.contractUrl);
        } catch (err) {
          console.warn('Could not delete old contract:', err);
        }
      }

      // Upload new contract
      const { url, fileName } = await uploadContract(user.uid, vendorId, file);
      
      // Update vendor with contract URL
      await vendorService.updateVendor(vendorId, {
        contractUrl: url,
        contractFileName: fileName,
      });

      return { url, fileName };
    } catch (err: any) {
      console.error('Error uploading contract:', err);
      setError(err.message || 'שגיאה בהעלאת חוזה');
      throw err;
    } finally {
      setUploading(false);
    }
  }, [vendors, user]);

  // Delete contract
  const removeVendorContract = useCallback(async (vendorId: string) => {
    const vendor = vendors.find(v => v.id === vendorId);
    if (!vendor?.contractUrl) return;

    try {
      setError('');
      await deleteContract(vendor.contractUrl);
      await vendorService.updateVendor(vendorId, {
        contractUrl: undefined,
        contractFileName: undefined,
      });
    } catch (err: any) {
      console.error('Error deleting contract:', err);
      setError(err.message || 'שגיאה במחיקת חוזה');
      throw err;
    }
  }, [vendors]);

  // Calculate expenses
  const expenses = useMemo(() => {
    const total = vendors.reduce((sum, vendor) => {
      // Use actualPrice if available, otherwise use price
      const amount = vendor.actualPrice ?? vendor.price ?? 0;
      return sum + amount;
    }, 0);

    // Group by category
    const byCategory: Record<string, number> = {};
    vendors.forEach((vendor) => {
      const amount = vendor.actualPrice ?? vendor.price ?? 0;
      if (amount > 0) {
        byCategory[vendor.category] = (byCategory[vendor.category] || 0) + amount;
      }
    });

    return {
      total,
      byCategory,
      count: vendors.length,
    };
  }, [vendors]);

  return {
    vendors,
    loading,
    error,
    uploading,
    expenses,
    addVendor,
    updateVendor,
    deleteVendor,
    uploadVendorContract,
    removeVendorContract,
  };
}

