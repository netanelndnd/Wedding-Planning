'use client';

import Link from 'next/link';
import { useForgotPassword } from '@/hooks/useForgotPassword';

export default function ForgotPasswordPage() {
  const {
    email,
    setEmail,
    loading,
    success,
    error,
    handleResetPassword,
    goToLogin,
  } = useForgotPassword();

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-100 via-teal-50 to-blue-50 relative overflow-hidden" dir="rtl">
        <div className="absolute top-0 left-0 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-custom"></div>
        
        <div className="w-full max-w-md p-8 glass rounded-2xl shadow-modern text-center animate-scaleIn relative z-10">
          <div className="inline-block p-4 bg-gradient-to-br from-green-400 to-teal-500 rounded-full shadow-lg mb-6 animate-pulse-custom">
            <span className="text-6xl">✉️</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            המייל נשלח בהצלחה! 🎉
          </h1>
          <p className="text-gray-600 mb-6">
            שלחנו לינק לאיפוס סיסמה לכתובת:
            <br />
            <strong className="text-lg text-teal-600">{email}</strong>
          </p>
          <div className="bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-700">
              💡 <strong>טיפ:</strong> אם לא קיבלת את המייל, בדוק גם בתיקיית הספאם
            </p>
          </div>
          <button
            onClick={goToLogin}
            className="w-full py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-xl font-bold hover:from-teal-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            ← חזור לכניסה
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-50 relative overflow-hidden" dir="rtl">
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-custom"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-custom" style={{ animationDelay: '1s' }}></div>
      
      <div className="w-full max-w-md p-8 glass rounded-2xl shadow-modern animate-scaleIn relative z-10">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-4">
            <span className="text-4xl">🔑</span>
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-2">
            שכחתי סיסמה
          </h1>
          <p className="text-gray-600">
            הזן את כתובת המייל שלך ונשלח לך קישור לאיפוס הסיסמה
          </p>
        </div>

        {error && (
          <div className="p-4 mb-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl text-red-600 text-sm animate-fadeIn shadow-sm">
            <div className="flex items-start gap-3">
              <span className="text-xl">⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              📧 דוא״ל
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:border-blue-300"
              placeholder="your@email.com"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                שולח...
              </span>
            ) : '📮 שלח קישור לאיפוס'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
        </div>

        <p className="text-center text-sm text-gray-600">
          <Link href="/login" className="text-blue-600 font-bold hover:text-indigo-600 transition-colors duration-200">
            ← חזור לכניסה
          </Link>
        </p>
      </div>
    </div>
  );
}

