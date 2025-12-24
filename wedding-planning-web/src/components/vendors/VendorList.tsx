'use client';

import { useState, useMemo } from 'react';
import { Vendor } from '@/types';
import ContractUpload from './ContractUpload';

interface VendorListProps {
  vendors: Vendor[];
  onEdit: (vendor: Vendor) => void;
  onDelete: (vendorId: string) => Promise<void>;
  onUploadContract: (vendorId: string, file: File) => Promise<void>;
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              חיפוש
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="חפש לפי שם או קטגוריה..."
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              קטגוריה
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
      <div className="text-sm text-gray-600">
        נמצאו {filteredVendors.length} ספקים
      </div>

      {/* Vendor cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVendors.map((vendor) => (
          <div key={vendor.id} className="glass p-6 rounded-2xl shadow-modern hover:shadow-modern-hover transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{vendor.name}</h3>
                <p className="text-sm text-gray-600">{vendor.category}</p>
              </div>
              {vendor.isSelected && (
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-semibold">
                  נבחר
                </span>
              )}
            </div>

            <div className="space-y-2 mb-4">
              {vendor.phone && (
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">טלפון:</span> {vendor.phone}
                </p>
              )}
              {vendor.email && (
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">אימייל:</span> {vendor.email}
                </p>
              )}
              {(vendor.actualPrice ?? vendor.price) && (
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">מחיר:</span> ₪{(vendor.actualPrice ?? vendor.price)?.toLocaleString()}
                </p>
              )}
              {vendor.rating && (
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">דירוג:</span> {'⭐'.repeat(Math.round(vendor.rating))} ({vendor.rating})
                </p>
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
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
              >
                ערוך
              </button>
              <button
                onClick={() => handleDelete(vendor.id, vendor.name)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
              >
                מחק
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredVendors.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">לא נמצאו ספקים</p>
        </div>
      )}
    </div>
  );
}

