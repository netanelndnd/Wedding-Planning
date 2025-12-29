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
    <div className="flex items-center justify-center min-h-screen auth-bg p-4 relative overflow-hidden" dir="rtl">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#6D28D9] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse-custom"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#BE185D] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse-custom" style={{ animationDelay: '1s' }}></div>
      
      <div className="w-full max-w-md p-8 glass rounded-2xl shadow-modern animate-scaleIn relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold gradient-text mb-2">
            תכנון החתונה
          </h1>
          <p className="text-[#6B6573] font-sans">רישום למשתמש חדש</p>
        </div>

        {isMockMode && (
          <div className="p-4 mb-6 bg-gradient-to-r from-[#D4AF37]/10 to-[#D4AF37]/5 border border-[#D4AF37]/30 rounded-xl text-[#D4AF37] text-sm animate-fadeIn shadow-sm">
            <strong className="font-semibold">מצב הדגמה</strong>
            <p className="mt-1">ההרשמה היא וירטואלית ותכניס אותך למערכת כמשתמש דמה.</p>
          </div>
        )}

        {error && (
          <div className="p-4 mb-6 bg-gradient-to-r from-red-50 to-red-50/50 border border-red-200 rounded-xl text-red-600 text-sm animate-fadeIn shadow-sm">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="partner1Name" className="block text-sm font-semibold text-[#2D2A32] mb-2 font-sans">
                שם הכלה 
              </label>
              <input
                type="text"
                id="partner1Name"
                name="partner1Name"
                value={formData.partner1Name}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-[#6D28D9]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D28D9] focus:border-transparent transition-all duration-300 hover:border-[#6D28D9]/40 bg-white/80 font-sans"
                required
              />
            </div>

            <div>
              <label htmlFor="partner2Name" className="block text-sm font-semibold text-[#2D2A32] mb-2 font-sans">
                שם החתן 
              </label>
              <input
                type="text"
                id="partner2Name"
                name="partner2Name"
                value={formData.partner2Name}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-[#6D28D9]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D28D9] focus:border-transparent transition-all duration-300 hover:border-[#6D28D9]/40 bg-white/80 font-sans"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-[#2D2A32] mb-2 font-sans">
              דוא״ל
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-[#6D28D9]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D28D9] focus:border-transparent transition-all duration-300 hover:border-[#6D28D9]/40 bg-white/80 font-sans"
              required
            />
          </div>

          <div>
            <label htmlFor="weddingDate" className="block text-sm font-semibold text-[#2D2A32] mb-2 font-sans">
              תאריך החתונה
            </label>
            <input
              type="date"
              id="weddingDate"
              name="weddingDate"
              value={formData.weddingDate}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-[#6D28D9]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D28D9] focus:border-transparent transition-all duration-300 hover:border-[#6D28D9]/40 bg-white/80 font-sans"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-[#2D2A32] mb-2 font-sans">
              סיסמה
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-[#6D28D9]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D28D9] focus:border-transparent transition-all duration-300 hover:border-[#6D28D9]/40 bg-white/80 font-sans"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-[#2D2A32] mb-2 font-sans">
              אישור סיסמה
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-[#6D28D9]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D28D9] focus:border-transparent transition-all duration-300 hover:border-[#6D28D9]/40 bg-white/80 font-sans"
              required
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
                רושמים...
              </span>
            ) : 'רישום'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#6D28D9]/10"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-[#FDFBF7] text-[#6B6573]">או</span>
          </div>
        </div>

        <p className="text-center text-sm text-[#6B6573] font-sans">
          יש לך כבר חשבון?{' '}
          <Link href="/login" className="text-[#6D28D9] font-bold hover:text-[#BE185D] transition-colors duration-200">
            כנס כאן
          </Link>
        </p>
      </div>
    </div>
  );
}
