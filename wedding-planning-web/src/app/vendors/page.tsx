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
    const result = await uploadVendorContract(editingVendor.id, file);
    if (!result) {
      throw new Error('שגיאה בהעלאת החוזה');
    }
    return result;
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
    <div className="min-h-screen wedding-bg">
      <header className="bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#BE185D] shadow-lg relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-serif font-bold text-white">
              ניהול ספקים
            </h1>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-white/95 text-[#6D28D9] rounded-xl hover:bg-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              ← חזרה לדשבורד
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-red-50/50 border border-red-200 rounded-xl">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Add New Vendor Button - only show when not in add mode */}
        {!showForm && !editingVendor && (
          <div className="mb-6">
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              + הוסף ספק חדש
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

      {/* Modal Overlay for Add/Edit Vendor Form */}
      {(showForm || editingVendor) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-[#6D28D9]/20 animate-modalIn">
            <div className="flex justify-between items-center mb-6 border-b border-[#6D28D9]/20 pb-4">
              <h2 className="text-2xl font-serif font-bold text-[#2D2A32]">
                {editingVendor ? 'עריכת ספק' : 'הוספת ספק חדש'}
              </h2>
              <button
                onClick={handleCancel}
                className="text-[#6B6573] hover:text-[#2D2A32] text-2xl transition-colors duration-300"
                title="סגור"
              >
                ×
              </button>
            </div>
            <VendorForm
              vendor={editingVendor}
              onSubmit={editingVendor ? handleUpdateVendor : handleAddVendor}
              onCancel={handleCancel}
              loading={loading}
              onContractUpload={editingVendor ? handleContractUpload : undefined}
            />
          </div>
        </div>
      )}
    </div>
  );
}

