'use client';

import Link from 'next/link';
import { useSignupForm } from '@/hooks/useSignupForm';

export default function SignupPage() {
  const {
    formData,
    handleChange,
    error,
    loading,
    handleSignup,
    isMockMode,
  } = useSignupForm();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-purple-50 p-4 relative overflow-hidden" dir="rtl">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-custom"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-custom" style={{ animationDelay: '1s' }}></div>
      
      <div className="w-full max-w-md p-8 glass rounded-2xl shadow-modern animate-scaleIn relative z-10">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg mb-4">
            <span className="text-4xl">💍</span>
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-2">
            תכנון החתונה
          </h1>
          <p className="text-gray-600">רישום למשתמש חדש</p>
        </div>

        {isMockMode && (
          <div className="p-4 mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl text-yellow-800 text-sm animate-fadeIn shadow-sm">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <strong className="font-semibold">מצב הדגמה</strong>
                <p className="mt-1">ההרשמה היא וירטואלית ותכניס אותך למערכת כמשתמש דמה.</p>
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

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="partner1Name" className="block text-sm font-semibold text-gray-700 mb-2">
                👰 בן/בת זוג 1
              </label>
              <input
                type="text"
                id="partner1Name"
                name="partner1Name"
                value={formData.partner1Name}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-300"
                required
              />
            </div>

            <div>
              <label htmlFor="partner2Name" className="block text-sm font-semibold text-gray-700 mb-2">
                🤵 בן/בת זוג 2
              </label>
              <input
                type="text"
                id="partner2Name"
                name="partner2Name"
                value={formData.partner2Name}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-300"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              📧 דוא״ל
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-300"
              required
            />
          </div>

          <div>
            <label htmlFor="weddingDate" className="block text-sm font-semibold text-gray-700 mb-2">
              📅 תאריך החתונה
            </label>
            <input
              type="date"
              id="weddingDate"
              name="weddingDate"
              value={formData.weddingDate}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-300"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              🔒 סיסמה
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-300"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
              ✅ אישור סיסמה
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-300"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                רושמים...
              </span>
            ) : '💍 רישום'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">או</span>
          </div>
        </div>

        <p className="text-center text-sm text-gray-600">
          יש לך כבר חשבון?{' '}
          <Link href="/login" className="text-purple-600 font-bold hover:text-pink-600 transition-colors duration-200">
            כנס כאן →
          </Link>
        </p>
      </div>
    </div>
  );
}
