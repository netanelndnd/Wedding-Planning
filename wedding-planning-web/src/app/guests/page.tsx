'use client';

import { useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useGuests } from '@/hooks/useGuests';
import { LoadingSpinner } from '@/components/LoadingSpinner';

/**
 * Guests Page
 * -----------
 * Manage wedding guests with Excel import/export
 */
export default function GuestsPage() {
  const { user, loading: authLoading, couple } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    guests,
    loading,
    uploadSuccess,
    error,
    handleDownloadTemplate,
    handleFileUpload,
    goToDashboard,
  } = useGuests();

  if (authLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    goToDashboard();
    return null;
  }

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen wedding-bg">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#BE185D] shadow-lg relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center">
            <div className="animate-fadeIn">
              <h1 className="text-4xl font-serif font-bold text-white mb-2">
                ניהול אורחים
              </h1>
              <p className="text-white/80 text-lg font-sans">
                {couple ? `לחתונה של ${couple.partner1Name} ו${couple.partner2Name}` : 'ניהול רשימת אורחים'}
              </p>
            </div>
            <button
              onClick={goToDashboard}
              className="px-6 py-3 bg-white/95 text-[#6D28D9] rounded-xl hover:bg-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              ← חזור לדשבורד
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {/* Success Message */}
        {uploadSuccess && (
          <div className="mb-6 p-4 bg-gradient-to-r from-[#87A878]/10 to-[#87A878]/5 border border-[#87A878]/30 rounded-xl text-[#87A878] animate-fadeIn shadow-sm">
            <div>
              <strong className="font-semibold">הצלחה!</strong>
              <p className="mt-1">ייבאנו {guests.length} אורחים מהקובץ</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-red-50/50 border border-red-200 rounded-xl text-red-600 animate-fadeIn shadow-sm">
            <span>{error}</span>
          </div>
        )}

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Download Template */}
          <div className="glass p-8 rounded-2xl shadow-modern card-hover animate-fadeIn">
            <div className="text-center">
              <div className="p-4 bg-gradient-to-br from-[#6D28D9]/10 to-[#6D28D9]/20 rounded-2xl inline-block mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-[#6D28D9]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <h2 className="text-2xl font-serif font-bold text-[#2D2A32] mb-3">הורדת תבנית Excel</h2>
              <p className="text-[#6B6573] mb-6 font-sans">
                הורד קובץ Excel עם טופס מוכן למילוי רשימת אורחים. הקובץ כולל הוראות מפורטות ודוגמאות.
              </p>
              <button
                onClick={handleDownloadTemplate}
                className="btn-primary mx-auto"
              >
                הורד תבנית Excel
              </button>
              <div className="mt-4 text-sm text-[#6B6573] font-sans">
                הקובץ כולל דף הוראות מפורט
              </div>
            </div>
          </div>

          {/* Upload File */}
          <div className="glass p-8 rounded-2xl shadow-modern card-hover animate-fadeIn">
            <div className="text-center">
              <div className="p-4 bg-gradient-to-br from-[#87A878]/10 to-[#87A878]/20 rounded-2xl inline-block mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-[#87A878]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <h2 className="text-2xl font-serif font-bold text-[#2D2A32] mb-3">העלאת קובץ אורחים</h2>
              <p className="text-[#6B6573] mb-6 font-sans">
                אחרי שמילאת את הטופס, העלה את הקובץ חזרה למערכת. המערכת תייבא את כל הנתונים אוטומטית.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls"
                onChange={onFileChange}
                className="hidden"
              />
              <button
                onClick={handleUploadClick}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-[#87A878] to-[#6B8E5E] text-white rounded-xl font-semibold hover:from-[#6B8E5E] hover:to-[#5A7D4E] disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none mx-auto"
              >
                {loading ? 'מייבא...' : 'העלה קובץ Excel'}
              </button>
              <div className="mt-4 text-sm text-[#6B6573] font-sans">
                קבצים נתמכים: .xlsx, .xls
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="glass p-8 rounded-2xl shadow-modern mb-8 animate-fadeIn">
          <h3 className="text-2xl font-serif font-bold text-[#2D2A32] mb-6">
            הוראות שימוש
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-[#6D28D9]/5 to-[#6D28D9]/10 rounded-xl border border-[#6D28D9]/10">
              <div className="w-12 h-12 bg-[#6D28D9] text-white rounded-full flex items-center justify-center mx-auto mb-3 font-serif font-bold text-xl">1</div>
              <h4 className="font-serif font-bold text-[#2D2A32] mb-2">הורד תבנית</h4>
              <p className="text-sm text-[#6B6573] font-sans">לחץ על "הורד תבנית Excel" כדי לקבל את הקובץ</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-[#BE185D]/5 to-[#BE185D]/10 rounded-xl border border-[#BE185D]/10">
              <div className="w-12 h-12 bg-[#BE185D] text-white rounded-full flex items-center justify-center mx-auto mb-3 font-serif font-bold text-xl">2</div>
              <h4 className="font-serif font-bold text-[#2D2A32] mb-2">מלא פרטים</h4>
              <p className="text-sm text-[#6B6573] font-sans">פתח את הקובץ ב-Excel ומלא את פרטי האורחים</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-[#87A878]/5 to-[#87A878]/10 rounded-xl border border-[#87A878]/10">
              <div className="w-12 h-12 bg-[#87A878] text-white rounded-full flex items-center justify-center mx-auto mb-3 font-serif font-bold text-xl">3</div>
              <h4 className="font-serif font-bold text-[#2D2A32] mb-2">העלה חזרה</h4>
              <p className="text-sm text-[#6B6573] font-sans">שמור את הקובץ והעלה אותו למערכת</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-[#D4AF37]/10 to-[#D4AF37]/5 rounded-xl border border-[#D4AF37]/20">
            <div className="text-sm text-[#6B6573] font-sans">
              <strong className="font-semibold text-[#D4AF37]">טיפ:</strong> הקובץ כולל דף "הוראות" עם הסבר מפורט על כל עמודה ודוגמאות למילוי
            </div>
          </div>
        </div>

        {/* Guests Preview */}
        {guests.length > 0 && (
          <div className="glass p-8 rounded-2xl shadow-modern animate-fadeIn">
            <h3 className="text-2xl font-serif font-bold text-[#2D2A32] mb-6">
              תצוגה מקדימה ({guests.length} אורחים)
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-gradient-to-r from-[#6D28D9]/10 to-[#BE185D]/10">
                  <tr>
                    <th className="px-4 py-3 font-serif font-semibold text-[#2D2A32]">שם</th>
                    <th className="px-4 py-3 font-serif font-semibold text-[#2D2A32]">טלפון</th>
                    <th className="px-4 py-3 font-serif font-semibold text-[#2D2A32]">צד</th>
                    <th className="px-4 py-3 font-serif font-semibold text-[#2D2A32]">אישור</th>
                    <th className="px-4 py-3 font-serif font-semibold text-[#2D2A32]">אורחים</th>
                  </tr>
                </thead>
                <tbody>
                  {guests.slice(0, 10).map((guest, index) => (
                    <tr key={index} className="border-b border-[#6D28D9]/10 hover:bg-[#6D28D9]/5 transition-colors">
                      <td className="px-4 py-3 font-sans">{guest.name}</td>
                      <td className="px-4 py-3 text-[#6B6573] font-sans">{guest.phone || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          guest.side === 'partner1' ? 'bg-[#6D28D9]/10 text-[#6D28D9]' :
                          guest.side === 'partner2' ? 'bg-[#BE185D]/10 text-[#BE185D]' :
                          'bg-[#D4AF37]/10 text-[#D4AF37]'
                        }`}>
                          {guest.side === 'partner1' ? 'צד א' : guest.side === 'partner2' ? 'צד ב' : 'משותף'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {guest.confirmed ? (
                          <span className="text-[#87A878]">אישר</span>
                        ) : guest.confirmed === false ? (
                          <span className="text-red-500">לא אישר</span>
                        ) : (
                          <span className="text-[#D4AF37]">ממתין</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#6D28D9]">{guest.guests || 1}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {guests.length > 10 && (
                <p className="text-center text-[#6B6573] mt-4 text-sm font-sans">
                  ועוד {guests.length - 10} אורחים נוספים...
                </p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

