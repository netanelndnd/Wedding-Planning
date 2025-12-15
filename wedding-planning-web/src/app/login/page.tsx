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
  } = useLoginForm();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-pink-50 relative overflow-hidden" dir="rtl">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-custom"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-custom" style={{ animationDelay: '1s' }}></div>
      
      <div className="w-full max-w-md p-8 glass rounded-2xl shadow-modern animate-scaleIn relative z-10">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl shadow-lg mb-4">
            <span className="text-4xl">💝</span>
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-2">
            תכנון החתונה
          </h1>
          <p className="text-gray-600">כניסה לחשבון</p>
        </div>

        {successMessage && (
          <div className="p-4 mb-6 bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 rounded-xl text-green-700 text-sm animate-fadeIn shadow-sm">
            <div className="flex items-start gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <strong className="font-semibold">הצלחה!</strong>
                <p className="mt-1">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {isMockMode && (
          <div className="p-4 mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl text-yellow-800 text-sm animate-fadeIn shadow-sm">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <strong className="font-semibold">מצב הדגמה</strong>
                <p className="mt-1">המערכת פועלת ללא חיבור ל-Firebase. לחץ על "כניסה" כדי להתחבר כמשתמש דמה.</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 mb-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl text-red-600 text-sm animate-fadeIn shadow-sm">
            <div className="flex items-start gap-3">
              <span className="text-xl">⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="group">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              📧 דוא״ל
            </label>
            <input
              type="email"
              id="email"
              value={isMockMode ? 'test@example.com' : email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300 hover:border-pink-300"
              placeholder="your@email.com"
              disabled={isMockMode}
              required={!isMockMode}
            />
          </div>

          <div className="group">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              🔒 סיסמה
            </label>
            <input
              type="password"
              id="password"
              value={isMockMode ? 'password' : password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300 hover:border-pink-300"
              placeholder="••••••••"
              disabled={isMockMode}
              required={!isMockMode}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl font-bold hover:from-pink-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                מתחברים...
              </span>
            ) : '✨ כניסה'}
          </button>
        </form>

        <div className="text-center text-sm mt-6">
          <Link href="/forgot-password" className="text-pink-600 hover:text-purple-600 font-semibold transition-colors duration-200">
            שכחתי סיסמה 🔑
          </Link>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">או</span>
          </div>
        </div>

        <p className="text-center text-sm text-gray-600">
          עדיין אין לך חשבון?{' '}
          <Link href="/signup" className="text-pink-600 font-bold hover:text-purple-600 transition-colors duration-200">
            הירשם כאן →
          </Link>
        </p>
      </div>
    </div>
  );
}
