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
      <div className="flex items-center justify-center min-h-screen auth-bg relative overflow-hidden" dir="rtl">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#87A878] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-custom"></div>
        
        <div className="w-full max-w-md p-8 glass rounded-2xl shadow-modern text-center animate-scaleIn relative z-10">
          <h1 className="text-3xl font-serif font-bold text-[#2D2A32] mb-4">
            המייל נשלח בהצלחה!
          </h1>
          <p className="text-[#6B6573] mb-6">
            שלחנו לינק לאיפוס סיסמה לכתובת:
            <br />
            <strong className="text-lg text-[#6D28D9]">{email}</strong>
          </p>
          <div className="bg-gradient-to-r from-[#6D28D9]/5 to-[#BE185D]/5 border border-[#6D28D9]/20 rounded-xl p-4 mb-6">
            <p className="text-sm text-[#2D2A32]">
              <strong>טיפ:</strong> אם לא קיבלת את המייל, בדוק גם בתיקיית הספאם
            </p>
          </div>
          <button
            onClick={goToLogin}
            className="w-full btn-primary"
          >
            חזור לכניסה
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen auth-bg relative overflow-hidden" dir="rtl">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#6D28D9] rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse-custom"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#BE185D] rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse-custom" style={{ animationDelay: '1s' }}></div>
      
      <div className="w-full max-w-md p-8 glass rounded-2xl shadow-modern animate-scaleIn relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold gradient-text mb-2">
            שכחתי סיסמה
          </h1>
          <p className="text-[#6B6573]">
            הזן את כתובת המייל שלך ונשלח לך קישור לאיפוס הסיסמה
          </p>
        </div>

        {error && (
          <div className="p-4 mb-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl text-red-600 text-sm animate-fadeIn shadow-sm">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-[#2D2A32] mb-2">
              דוא״ל
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-[#6D28D9]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/30 focus:border-[#6D28D9] transition-all duration-300 hover:border-[#6D28D9]/40 bg-white/70"
              placeholder="your@email.com"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50 disabled:transform-none"
          >
            {loading ? 'שולח...' : 'שלח קישור לאיפוס'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#6D28D9]/20"></div>
          </div>
        </div>

        <p className="text-center text-sm text-[#6B6573]">
          <Link href="/login" className="text-[#6D28D9] font-bold hover:text-[#BE185D] transition-colors duration-200">
            ← חזור לכניסה
          </Link>
        </p>
      </div>
    </div>
  );
}

