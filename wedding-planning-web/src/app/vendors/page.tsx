'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useVendors } from '@/hooks/useVendors';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import VendorForm from '@/components/vendors/VendorForm';
import VendorList from '@/components/vendors/VendorList';
import { Vendor } from '@/types';
import { exportVendorsToExcel } from '@/utils/excelExport';

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
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const exportButtonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

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
      <header className="bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#BE185D] shadow-lg relative z-20 overflow-visible">
        <div className="max-w-7xl mx-auto px-4 py-6 overflow-visible">
          <div className="flex justify-between items-center overflow-visible">
            <h1 className="text-3xl font-serif font-bold text-white">
              ניהול ספקים
            </h1>
            <div className="flex gap-3">
              <div className="relative">
                <button
                  ref={exportButtonRef}
                  onClick={() => {
                    if (exportButtonRef.current) {
                      const rect = exportButtonRef.current.getBoundingClientRect();
                      setDropdownPosition({ top: rect.bottom + 8, left: rect.left });
                    }
                    setShowExportDropdown(!showExportDropdown);
                  }}
                  className="px-4 py-2.5 bg-white/20 backdrop-blur text-white rounded-xl hover:bg-white/30 font-semibold transition-all duration-300 flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  ייצוא
                  <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 transition-transform ${showExportDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2.5 bg-white/95 text-[#6D28D9] rounded-xl hover:bg-white font-semibold transition-all duration-300 shadow-lg"
              >
                ← חזרה
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 relative">
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

      {/* Export Dropdown Modal */}
      {showExportDropdown && (
        <>
          <div className="fixed inset-0 z-[9999]" onClick={() => setShowExportDropdown(false)} />
          <div 
            className="fixed w-48 bg-white rounded-xl shadow-2xl border border-[#6D28D9]/20 overflow-hidden z-[10000]"
            style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
          >
            <div className="p-2 bg-gradient-to-r from-[#6D28D9] to-[#BE185D] text-white text-center font-semibold text-sm">
              ייצוא ספקים
            </div>
            <button
              onClick={() => {
                exportVendorsToExcel(vendors, 'xlsx');
                setShowExportDropdown(false);
              }}
              className="w-full px-4 py-3 text-right text-[#2D2A32] hover:bg-[#6D28D9]/10 transition-colors font-medium flex items-center gap-3 justify-end"
            >
              <span>Excel (.xlsx)</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
            <button
              onClick={() => {
                exportVendorsToExcel(vendors, 'csv');
                setShowExportDropdown(false);
              }}
              className="w-full px-4 py-3 text-right text-[#2D2A32] hover:bg-[#6D28D9]/10 transition-colors font-medium border-t border-gray-100 flex items-center gap-3 justify-end"
            >
              <span>CSV (.csv)</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

