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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 shadow-modern">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center">
            <div className="animate-fadeIn">
              <h1 className="text-4xl font-bold text-white mb-2">
                👥 ניהול אורחים
              </h1>
              <p className="text-pink-100 text-lg">
                {couple ? `לחתונה של ${couple.partner1Name} ו${couple.partner2Name}` : 'ניהול רשימת אורחים'}
              </p>
            </div>
            <button
              onClick={goToDashboard}
              className="px-6 py-3 bg-white text-pink-600 rounded-xl hover:bg-pink-50 font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              ← חזור לדשבורד
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Success Message */}
        {uploadSuccess && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-xl text-green-700 animate-fadeIn shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <strong className="font-semibold">הצלחה!</strong>
                <p className="mt-1">ייבאנו {guests.length} אורחים מהקובץ</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl text-red-600 animate-fadeIn shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Download Template */}
          <div className="glass p-8 rounded-2xl shadow-modern hover:shadow-modern-hover transition-all duration-300 animate-fadeIn">
            <div className="text-center">
              <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl inline-block mb-4">
                <span className="text-6xl">📥</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">הורדת תבנית Excel</h2>
              <p className="text-gray-600 mb-6">
                הורד קובץ Excel עם טופס מוכן למילוי רשימת אורחים. הקובץ כולל הוראות מפורטות ודוגמאות.
              </p>
              <button
                onClick={handleDownloadTemplate}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                📥 הורד תבנית Excel
              </button>
              <div className="mt-4 text-sm text-gray-500">
                💡 הקובץ כולל דף הוראות מפורט
              </div>
            </div>
          </div>

          {/* Upload File */}
          <div className="glass p-8 rounded-2xl shadow-modern hover:shadow-modern-hover transition-all duration-300 animate-fadeIn">
            <div className="text-center">
              <div className="p-4 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl inline-block mb-4">
                <span className="text-6xl">📤</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">העלאת קובץ אורחים</h2>
              <p className="text-gray-600 mb-6">
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
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-teal-700 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    מייבא...
                  </span>
                ) : (
                  '📤 העלה קובץ Excel'
                )}
              </button>
              <div className="mt-4 text-sm text-gray-500">
                📁 קבצים נתמכים: .xlsx, .xls
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="glass p-8 rounded-2xl shadow-modern mb-8 animate-fadeIn">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <span className="text-3xl">📖</span>
            הוראות שימוש
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
              <div className="text-4xl mb-3">1️⃣</div>
              <h4 className="font-bold text-gray-900 mb-2">הורד תבנית</h4>
              <p className="text-sm text-gray-600">לחץ על "הורד תבנית Excel" כדי לקבל את הקובץ</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
              <div className="text-4xl mb-3">2️⃣</div>
              <h4 className="font-bold text-gray-900 mb-2">מלא פרטים</h4>
              <p className="text-sm text-gray-600">פתח את הקובץ ב-Excel ומלא את פרטי האורחים</p>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-teal-50 rounded-xl">
              <div className="text-4xl mb-3">3️⃣</div>
              <h4 className="font-bold text-gray-900 mb-2">העלה חזרה</h4>
              <p className="text-sm text-gray-600">שמור את הקובץ והעלה אותו למערכת</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div className="text-sm text-gray-700">
                <strong className="font-semibold">טיפ:</strong> הקובץ כולל דף "הוראות" עם הסבר מפורט על כל עמודה ודוגמאות למילוי
              </div>
            </div>
          </div>
        </div>

        {/* Guests Preview */}
        {guests.length > 0 && (
          <div className="glass p-8 rounded-2xl shadow-modern animate-fadeIn">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-3xl">👥</span>
              תצוגה מקדימה ({guests.length} אורחים)
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-gradient-to-r from-pink-100 to-purple-100">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-gray-900">שם</th>
                    <th className="px-4 py-3 font-semibold text-gray-900">טלפון</th>
                    <th className="px-4 py-3 font-semibold text-gray-900">צד</th>
                    <th className="px-4 py-3 font-semibold text-gray-900">אישור</th>
                    <th className="px-4 py-3 font-semibold text-gray-900">אורחים</th>
                  </tr>
                </thead>
                <tbody>
                  {guests.slice(0, 10).map((guest, index) => (
                    <tr key={index} className="border-b border-gray-200 hover:bg-pink-50 transition-colors">
                      <td className="px-4 py-3">{guest.name}</td>
                      <td className="px-4 py-3 text-gray-600">{guest.phone || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          guest.side === 'partner1' ? 'bg-blue-100 text-blue-700' :
                          guest.side === 'partner2' ? 'bg-pink-100 text-pink-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {guest.side === 'partner1' ? 'צד א' : guest.side === 'partner2' ? 'צד ב' : 'משותף'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {guest.confirmed ? '✅ אישר' : guest.confirmed === false ? '❌ לא אישר' : '⏳ ממתין'}
                      </td>
                      <td className="px-4 py-3 font-semibold">{guest.guests || 1}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {guests.length > 10 && (
                <p className="text-center text-gray-500 mt-4 text-sm">
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

