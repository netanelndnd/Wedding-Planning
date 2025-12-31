'use client';

import Link from 'next/link';
import { useLoginForm } from '@/hooks/useLoginForm';

export default function LoginPage() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    loading,
    successMessage,
    handleLogin,
    isMockMode,
    insertingMockData,
    mockDataResult,
    handleInsertMockData,
    isLoggedIn,
  } = useLoginForm();

  return (
    <div className="flex items-center justify-center min-h-screen auth-bg relative overflow-hidden" dir="rtl">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#6D28D9] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse-custom"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#BE185D] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse-custom" style={{ animationDelay: '1s' }}></div>
      
      <div className="w-full max-w-md p-8 glass rounded-2xl shadow-modern animate-scaleIn relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold gradient-text mb-2">
            תכנון החתונה
          </h1>
          <p className="text-[#6B6573] font-sans">כניסה לחשבון</p>
        </div>

        {successMessage && (
          <div className="p-4 mb-6 bg-gradient-to-r from-[#87A878]/10 to-[#87A878]/5 border border-[#87A878]/30 rounded-xl text-[#87A878] text-sm animate-fadeIn shadow-sm">
            <strong className="font-semibold">הצלחה!</strong>
            <p className="mt-1">{successMessage}</p>
          </div>
        )}

        {isMockMode && (
          <div className="p-4 mb-6 bg-gradient-to-r from-[#D4AF37]/10 to-[#D4AF37]/5 border border-[#D4AF37]/30 rounded-xl text-[#D4AF37] text-sm animate-fadeIn shadow-sm">
            <strong className="font-semibold">מצב הדגמה</strong>
            <p className="mt-1">המערכת פועלת ללא חיבור ל-Firebase. לחץ על "כניסה" כדי להתחבר כמשתמש דמה.</p>
          </div>
        )}

        {error && (
          <div className="p-4 mb-6 bg-gradient-to-r from-red-50 to-red-50/50 border border-red-200 rounded-xl text-red-600 text-sm animate-fadeIn shadow-sm">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="group">
            <label htmlFor="email" className="block text-sm font-semibold text-[#2D2A32] mb-2 font-sans">
              דוא״ל
            </label>
            <input
              type="email"
              id="email"
              value={isMockMode ? 'test@example.com' : email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-[#6D28D9]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D28D9] focus:border-transparent transition-all duration-300 hover:border-[#6D28D9]/40 bg-white/80 font-sans"
              placeholder="your@email.com"
              disabled={isMockMode}
              required={!isMockMode}
            />
          </div>

          <div className="group">
            <label htmlFor="password" className="block text-sm font-semibold text-[#2D2A32] mb-2 font-sans">
              סיסמה
            </label>
            <input
              type="password"
              id="password"
              value={isMockMode ? 'password' : password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-[#6D28D9]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D28D9] focus:border-transparent transition-all duration-300 hover:border-[#6D28D9]/40 bg-white/80 font-sans"
              placeholder="••••••••"
              disabled={isMockMode}
              required={!isMockMode}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 btn-primary disabled:opacity-50 disabled:transform-none"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                מתחברים...
              </span>
            ) : 'כניסה'}
          </button>
        </form>

        <div className="text-center text-sm mt-6">
          <Link href="/forgot-password" className="text-[#6D28D9] hover:text-[#BE185D] font-semibold transition-colors duration-200">
            שכחתי סיסמה
          </Link>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#6D28D9]/10"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-[#FDFBF7] text-[#6B6573]">או</span>
          </div>
        </div>

        <p className="text-center text-sm text-[#6B6573] font-sans">
          עדיין אין לך חשבון?{' '}
          <Link href="/signup" className="text-[#6D28D9] font-bold hover:text-[#BE185D] transition-colors duration-200">
            הירשם כאן
          </Link>
        </p>

        {/* Developer Tools - Mock Data */}
        {process.env.NODE_ENV === 'development' && isLoggedIn && (
          <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl animate-fadeIn">
            <h3 className="text-sm font-bold text-yellow-800 mb-2 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              כלי פיתוח
            </h3>
            <p className="text-xs text-yellow-700 mb-3">הכנס נתוני דוגמה לבסיס הנתונים (אורחים, ספקים, משימות)</p>
            <button
              onClick={handleInsertMockData}
              disabled={insertingMockData}
              className="w-full py-2.5 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-xl font-semibold hover:from-yellow-600 hover:to-amber-600 disabled:opacity-50 transition-all duration-300 flex items-center justify-center gap-2"
            >
              {insertingMockData ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  מכניס נתונים...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                  </svg>
                  הכנס נתוני דוגמה
                </>
              )}
            </button>
            {mockDataResult && (
              <div className="mt-3 p-2 bg-green-100 border border-green-200 rounded-lg text-xs text-green-700">
                <div className="font-semibold mb-1">נתונים הוכנסו בהצלחה:</div>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>{mockDataResult.guestsInserted} אורחים</li>
                  <li>{mockDataResult.vendorsInserted} ספקים</li>
                  <li>{mockDataResult.tasksInserted} משימות</li>
                  <li>{mockDataResult.epicsInserted} נושאים</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
