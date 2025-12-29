'use client';

import { useState, useMemo } from 'react';
import { Vendor } from '@/types';
import ContractUpload from './ContractUpload';

interface VendorListProps {
  vendors: Vendor[];
  onEdit: (vendor: Vendor) => void;
  onDelete: (vendorId: string) => Promise<void>;
  onUploadContract: (vendorId: string, file: File) => Promise<{ url: string; fileName: string } | undefined>;
  onDeleteContract: (vendorId: string) => Promise<void>;
  uploading?: boolean;
}

/**
 * VendorList Component
 * --------------------
 * Displays list of vendors with filtering and search
 */
export default function VendorList({
  vendors,
  onEdit,
  onDelete,
  onUploadContract,
  onDeleteContract,
  uploading,
}: VendorListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Get unique categories
  const categories = useMemo(() => {
    const cats = vendors.map(v => v.category).filter(Boolean);
    return Array.from(new Set(cats)).sort();
  }, [vendors]);

  // Filter vendors
  const filteredVendors = useMemo(() => {
    return vendors.filter(vendor => {
      const matchesSearch = !searchTerm || 
        vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || vendor.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [vendors, searchTerm, selectedCategory]);

  const handleDelete = async (vendorId: string, vendorName: string) => {
    if (!confirm(`האם אתה בטוח שברצונך למחוק את הספק "${vendorName}"?`)) {
      return;
    }
    await onDelete(vendorId);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="glass p-4 rounded-xl shadow-modern">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#2D2A32] mb-2">
              חיפוש
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="חפש לפי שם או קטגוריה..."
              className="w-full px-4 py-2 border-2 border-[#6D28D9]/20 rounded-xl focus:ring-2 focus:ring-[#6D28D9]/30 focus:border-[#6D28D9] bg-white text-[#2D2A32] placeholder-[#6B6573] transition-all duration-300"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#2D2A32] mb-2">
              קטגוריה
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border-2 border-[#6D28D9]/20 rounded-xl focus:ring-2 focus:ring-[#6D28D9]/30 focus:border-[#6D28D9] bg-white text-[#2D2A32] transition-all duration-300 appearance-none cursor-pointer"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236D28D9' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "left 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em", paddingLeft: "2.5rem" }}
            >
              <option value="">כל הקטגוריות</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-[#6B6573] font-sans">
        נמצאו {filteredVendors.length} ספקים
      </div>

      {/* Vendor cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVendors.map((vendor) => (
          <div key={vendor.id} className="glass p-6 rounded-2xl shadow-modern hover:shadow-modern-hover transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-[#2D2A32] mb-1">{vendor.name}</h3>
                <p className="text-sm text-[#6B6573]">{vendor.category}</p>
              </div>
              {vendor.isSelected && (
                <span className="px-2 py-1 bg-[#87A878]/20 text-[#87A878] rounded-lg text-xs font-semibold border border-[#87A878]/30">
                  נבחר
                </span>
              )}
            </div>

            <div className="space-y-2 mb-4">
              {vendor.phone && (
                <p className="text-sm text-[#2D2A32]">
                  <span className="font-semibold">טלפון:</span> {vendor.phone}
                </p>
              )}
              {vendor.email && (
                <p className="text-sm text-[#2D2A32]">
                  <span className="font-semibold">אימייל:</span> {vendor.email}
                </p>
              )}
              {(vendor.actualPrice ?? vendor.price) && (
                <p className="text-sm text-[#2D2A32]">
                  <span className="font-semibold">מחיר:</span> ₪{(vendor.actualPrice ?? vendor.price)?.toLocaleString()}
                </p>
              )}
              {vendor.rating && (
                <div className="text-sm text-gray-700 flex items-center gap-1">
                  <span className="font-semibold">דירוג:</span>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        className={`w-4 h-4 ${i < Math.round(vendor.rating!) ? 'text-[#D4AF37]' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-[#6B6573]">({vendor.rating})</span>
                </div>
              )}
            </div>

            <ContractUpload
              vendor={vendor}
              onUpload={(file) => onUploadContract(vendor.id, file)}
              onDelete={() => onDeleteContract(vendor.id)}
              uploading={uploading}
            />

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => onEdit(vendor)}
                className="flex-1 px-4 py-2 bg-[#6D28D9] text-white rounded-lg hover:bg-[#5B21B6] transition-colors text-sm font-semibold"
              >
                ערוך
              </button>
              <button
                onClick={() => handleDelete(vendor.id, vendor.name)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-semibold"
              >
                מחק
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredVendors.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[#6B6573] text-lg">לא נמצאו ספקים</p>
        </div>
      )}
    </div>
  );
}

