'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { isMockMode, mockLogin } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isMockMode && mockLogin) {
      // Simulate network delay
      setTimeout(() => {
        mockLogin();
      }, 1000);
      return;
    }

    try {
      // Import signInWithEmailAndPassword dynamically
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const { auth } = await import('@/lib/firebase');
      
      // Sign in directly on the client side
      await signInWithEmailAndPassword(auth, email, password);
      
      // Wait a bit for auth state to update
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
    } catch (err: any) {
      setError(err.message || 'שגיאה בהתחברות');
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-pink-100" dir="rtl">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-pink-600 mb-2">
          תכנון החתונה
        </h1>
        <p className="text-center text-gray-600 mb-6">כניסה לחשבון</p>

        {isMockMode && (
          <div className="p-4 mb-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
            <strong>מצב הדגמה (Mock Mode):</strong> המערכת פועלת ללא חיבור ל-Firebase.
            <br />
            לחץ על "כניסה" כדי להתחבר כמשתמש דמה.
          </div>
        )}

        {error && (
          <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              דוא״ל
            </label>
            <input
              type="email"
              id="email"
              value={isMockMode ? 'test@example.com' : email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="your@email.com"
              disabled={isMockMode}
              required={!isMockMode}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              סיסמה
            </label>
            <input
              type="password"
              id="password"
              value={isMockMode ? 'password' : password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="••••••••"
              disabled={isMockMode}
              required={!isMockMode}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 disabled:opacity-50 transition"
          >
            {loading ? 'מתחברים...' : 'כניסה'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          עדיין אין לך חשבון?{' '}
          <Link href="/signup" className="text-pink-600 font-semibold hover:underline">
            הירשם כאן
          </Link>
        </p>
      </div>
    </div>
  );
}
