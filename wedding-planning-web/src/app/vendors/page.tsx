'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useVendors } from '@/hooks/useVendors';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import VendorForm from '@/components/vendors/VendorForm';
import VendorList from '@/components/vendors/VendorList';
import { Vendor } from '@/types';

/**
 * Vendors Page
 * ------------
 * Manage wedding vendors with contract uploads
 */
export default function VendorsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const {
    vendors,
    loading,
    error,
    uploading,
    addVendor,
    updateVendor,
    deleteVendor,
    uploadVendorContract,
    removeVendorContract,
  } = useVendors();

  const [showForm, setShowForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  if (authLoading || loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  const handleAddVendor = async (vendorData: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt' | 'coupleId'>) => {
    await addVendor(vendorData);
    setShowForm(false);
  };
  
  const handleContractUpload = async (file: File): Promise<{ url: string; fileName: string }> => {
    if (!editingVendor?.id) {
      throw new Error('לא ניתן להעלות חוזה לפני יצירת הספק');
    }
    return await uploadVendorContract(editingVendor.id, file);
  };

  const handleUpdateVendor = async (vendorData: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt' | 'coupleId'>) => {
    if (!editingVendor) return;
    await updateVendor(editingVendor.id, vendorData);
    setEditingVendor(null);
  };

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingVendor(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <header className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 shadow-modern">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">🎤 ניהול ספקים</h1>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-white text-pink-600 rounded-xl hover:bg-pink-50 font-bold transition-all duration-300"
            >
              ← חזרה לדשבורד
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {showForm || editingVendor ? (
          <div className="mb-8">
            <VendorForm
              vendor={editingVendor}
              onSubmit={editingVendor ? handleUpdateVendor : handleAddVendor}
              onCancel={handleCancel}
              loading={loading}
              onContractUpload={editingVendor ? handleContractUpload : undefined}
            />
          </div>
        ) : (
          <div className="mb-6">
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl font-bold hover:from-pink-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              ➕ הוסף ספק חדש
            </button>
          </div>
        )}

        <VendorList
          vendors={vendors}
          onEdit={handleEdit}
          onDelete={deleteVendor}
          onUploadContract={uploadVendorContract}
          onDeleteContract={removeVendorContract}
          uploading={uploading}
        />
      </main>
    </div>
  );
}

