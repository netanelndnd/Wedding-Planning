'use client';

import { useState, useRef } from 'react';
import { Vendor } from '@/types';

interface ContractUploadProps {
  vendor: Vendor;
  onUpload: (file: File) => Promise<void>;
  onDelete: () => Promise<void>;
  uploading?: boolean;
}

/**
 * ContractUpload Component
 * -------------------------
 * Component for uploading and managing vendor contracts
 */
export default function ContractUpload({ vendor, onUpload, onDelete, uploading }: ContractUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    
    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('הקובץ גדול מדי. מקסימום 10MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setError('סוג קובץ לא נתמך. אנא העלה PDF, DOC, DOCX, JPG או PNG');
      return;
    }

    try {
      await onUpload(file);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      setError(err.message || 'שגיאה בהעלאת הקובץ');
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDelete = async () => {
    if (!confirm('האם אתה בטוח שברצונך למחוק את החוזה?')) {
      return;
    }

    try {
      await onDelete();
    } catch (err: any) {
      setError(err.message || 'שגיאה במחיקת הקובץ');
    }
  };

  return (
    <div className="glass p-4 rounded-xl shadow-modern">
      <h3 className="text-lg font-bold mb-3 gradient-text">📄 חוזה</h3>
      
      {vendor.contractUrl ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📎</span>
              <div>
                <p className="font-semibold text-gray-900">{vendor.contractFileName || 'חוזה'}</p>
                <p className="text-sm text-gray-600">חוזה קיים</p>
              </div>
            </div>
            <div className="flex gap-2">
              <a
                href={vendor.contractUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
              >
                צפה
              </a>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
              >
                מחק
              </button>
            </div>
          </div>
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
            onClick={handleUploadClick}
            disabled={uploading}
            className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>מעלה...</span>
              </>
            ) : (
              <>
                <span>📤</span>
                <span>העלה חוזה</span>
              </>
            )}
          </button>
          <p className="text-xs text-gray-500 text-center">
            PDF, DOC, DOCX, JPG, PNG (מקסימום 10MB)
          </p>
        </div>
      )}

      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}

