'use client';

import { useState, useEffect, useRef } from 'react';
import { Vendor } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { uploadContract } from '@/services/storageService';

interface VendorFormProps {
  vendor?: Vendor | null;
  onSubmit: (vendor: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt' | 'coupleId'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  onContractUpload?: (file: File) => Promise<{ url: string; fileName: string }>;
}

const VENDOR_CATEGORIES = [
  'אולם',
  'צלם',
  'וידאו',
  'DJ/תקליטן',
  'עיצוב פרחים',
  'עיצוב שולחנות',
  'קייטרינג',
  'עוגה',
  'הלבשה',
  'איפור וסלסול',
  'הסעות',
  'אחר',
];

/**
 * VendorForm Component
 * -------------------
 * Form for adding/editing vendors
 */
export default function VendorForm({ vendor, onSubmit, onCancel, loading, onContractUpload }: VendorFormProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingContract, setUploadingContract] = useState(false);
  const [contractError, setContractError] = useState('');
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [contractUrl, setContractUrl] = useState<string | null>(vendor?.contractUrl || null);
  const [contractFileName, setContractFileName] = useState<string | null>(vendor?.contractFileName || null);
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    price: '',
    actualPrice: '',
    rating: '',
    notes: '',
    isSelected: false,
  });

  useEffect(() => {
    if (vendor) {
      setFormData({
        name: vendor.name || '',
        category: vendor.category || '',
        phone: vendor.phone || '',
        email: vendor.email || '',
        website: vendor.website || '',
        address: vendor.address || '',
        price: vendor.price?.toString() || '',
        actualPrice: vendor.actualPrice?.toString() || '',
        rating: vendor.rating?.toString() || '',
        notes: vendor.notes || '',
        isSelected: vendor.isSelected || false,
      });
    }
  }, [vendor]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setContractError('');
    
    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setContractError('הקובץ גדול מדי. מקסימום 10MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setContractError('סוג קובץ לא נתמך. אנא העלה PDF, DOC, DOCX, JPG או PNG');
      return;
    }

    setContractFile(file);
    
    // If vendor exists, upload immediately
    if (vendor && user && onContractUpload) {
      try {
        setUploadingContract(true);
        const result = await onContractUpload(file);
        setContractUrl(result.url);
        setContractFileName(result.fileName);
      } catch (err: any) {
        setContractError(err.message || 'שגיאה בהעלאת הקובץ');
      } finally {
        setUploadingContract(false);
      }
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build vendor data object, only including fields that have values
    // Firestore doesn't allow undefined values
    const vendorData: any = {
      name: formData.name,
      category: formData.category,
      isSelected: formData.isSelected,
    };

    // Only add optional fields if they have values
    if (formData.phone) vendorData.phone = formData.phone;
    if (formData.email) vendorData.email = formData.email;
    if (formData.website) vendorData.website = formData.website;
    if (formData.address) vendorData.address = formData.address;
    if (formData.price) vendorData.price = parseFloat(formData.price);
    if (formData.actualPrice) vendorData.actualPrice = parseFloat(formData.actualPrice);
    if (formData.rating) vendorData.rating = parseFloat(formData.rating);
    if (formData.notes) vendorData.notes = formData.notes;
    
    // Add contract info if exists (for new vendors, will be uploaded after creation)
    if (contractUrl) vendorData.contractUrl = contractUrl;
    if (contractFileName) vendorData.contractFileName = contractFileName;

    await onSubmit(vendorData as Omit<Vendor, 'id' | 'createdAt' | 'updatedAt' | 'coupleId'>);
    
    // If new vendor and contract file exists, upload after creation
    if (!vendor && contractFile && user) {
      // Note: This will be handled by the parent component after vendor creation
      // The contract will be uploaded separately using the vendor ID
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass p-6 rounded-2xl shadow-modern">
      <h2 className="text-2xl font-bold mb-6 gradient-text">
        {vendor ? 'עריכת ספק' : 'הוספת ספק חדש'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-semibold text-[#2D2A32] mb-2">
            שם הספק *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border-2 border-[#6D28D9]/20 rounded-xl focus:ring-2 focus:ring-[#6D28D9]/30 focus:border-[#6D28D9] bg-white text-[#2D2A32] transition-all duration-300"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#2D2A32] mb-2">
            קטגוריה *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border-2 border-[#6D28D9]/20 rounded-xl focus:ring-2 focus:ring-[#6D28D9]/30 focus:border-[#6D28D9] bg-white text-[#2D2A32] transition-all duration-300"
          >
            <option value="">בחר קטגוריה</option>
            {VENDOR_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#2D2A32] mb-2">
            טלפון
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 border-2 border-[#6D28D9]/20 rounded-xl focus:ring-2 focus:ring-[#6D28D9]/30 focus:border-[#6D28D9] bg-white text-[#2D2A32] transition-all duration-300"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#2D2A32] mb-2">
            אימייל
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border-2 border-[#6D28D9]/20 rounded-xl focus:ring-2 focus:ring-[#6D28D9]/30 focus:border-[#6D28D9] bg-white text-[#2D2A32] transition-all duration-300"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#2D2A32] mb-2">
            אתר
          </label>
          <input
            type="url"
            name="website"
            value={formData.website}
            onChange={handleChange}
            className="w-full px-4 py-2 border-2 border-[#6D28D9]/20 rounded-xl focus:ring-2 focus:ring-[#6D28D9]/30 focus:border-[#6D28D9] bg-white text-[#2D2A32] transition-all duration-300"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#2D2A32] mb-2">
            כתובת
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full px-4 py-2 border-2 border-[#6D28D9]/20 rounded-xl focus:ring-2 focus:ring-[#6D28D9]/30 focus:border-[#6D28D9] bg-white text-[#2D2A32] transition-all duration-300"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#2D2A32] mb-2">
            מחיר משוער (₪)
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full px-4 py-2 border-2 border-[#6D28D9]/20 rounded-xl focus:ring-2 focus:ring-[#6D28D9]/30 focus:border-[#6D28D9] bg-white text-[#2D2A32] transition-all duration-300"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#2D2A32] mb-2">
            מחיר בפועל (₪)
          </label>
          <input
            type="number"
            name="actualPrice"
            value={formData.actualPrice}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full px-4 py-2 border-2 border-[#6D28D9]/20 rounded-xl focus:ring-2 focus:ring-[#6D28D9]/30 focus:border-[#6D28D9] bg-white text-[#2D2A32] transition-all duration-300"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#2D2A32] mb-2">
            דירוג (1-5)
          </label>
          <input
            type="number"
            name="rating"
            value={formData.rating}
            onChange={handleChange}
            min="1"
            max="5"
            step="0.1"
            className="w-full px-4 py-2 border-2 border-[#6D28D9]/20 rounded-xl focus:ring-2 focus:ring-[#6D28D9]/30 focus:border-[#6D28D9] bg-white text-[#2D2A32] transition-all duration-300"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="isSelected"
            checked={formData.isSelected}
            onChange={handleChange}
            className="w-5 h-5 text-[#6D28D9] border-[#6D28D9]/30 rounded focus:ring-[#6D28D9]"
          />
          <label className="mr-2 text-sm font-semibold text-[#2D2A32]">
            ספק נבחר
          </label>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold text-[#2D2A32] mb-2">
          הערות
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-2 border-2 border-[#6D28D9]/20 rounded-xl focus:ring-2 focus:ring-[#6D28D9]/30 focus:border-[#6D28D9] bg-white text-[#2D2A32] transition-all duration-300"
        />
      </div>

      {/* Contract Upload Section */}
      <div className="mb-4 p-4 bg-[#6D28D9]/5 rounded-xl border border-[#6D28D9]/20">
        <label className="block text-sm font-semibold text-[#2D2A32] mb-2">
          חוזה
        </label>
        
        {contractUrl ? (
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
              </svg>
              <div>
                <p className="font-semibold text-gray-900">{contractFileName || 'חוזה'}</p>
                <p className="text-sm text-gray-600">חוזה קיים</p>
              </div>
            </div>
            <a
              href={contractUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
            >
              צפה
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingContract}
              className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploadingContract ? (
                <>
                  <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>מעלה...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span>העלה חוזה</span>
                </>
              )}
            </button>
            {contractFile && !contractUrl && (
              <p className="text-sm text-gray-600 text-center">
                הקובץ {contractFile.name} יועלה לאחר שמירת הספק
              </p>
            )}
            <p className="text-xs text-[#6B6573] text-center">
              PDF, DOC, DOCX, JPG, PNG (מקסימום 10MB)
            </p>
          </div>
        )}
        
        {contractError && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{contractError}</p>
          </div>
        )}
      </div>

      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 bg-[#F5F3EF] text-[#2D2A32] rounded-xl font-bold hover:bg-[#E8E5E0] transition-all duration-300 border border-[#6D28D9]/10"
        >
          ביטול
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-gradient-to-r from-[#6D28D9] to-[#BE185D] text-white rounded-xl font-bold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'שומר...' : vendor ? 'עדכן' : 'הוסף'}
        </button>
      </div>
    </form>
  );
}

