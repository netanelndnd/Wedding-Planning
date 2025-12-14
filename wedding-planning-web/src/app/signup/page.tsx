'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    partner1Name: '',
    partner2Name: '',
    email: '',
    password: '',
    confirmPassword: '',
    weddingDate: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { isMockMode, mockLogin } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('הסיסמאות לא תואמות');
      return;
    }

    setLoading(true);

    if (isMockMode && mockLogin) {
      // In Mock Mode, signup just logs you in with mock credentials
      setTimeout(() => {
        mockLogin();
      }, 1000);
      return;
    }

    try {
      // Import Firebase functions
      const { createUserWithEmailAndPassword } = await import('firebase/auth');
      const { setDoc, doc, Timestamp } = await import('firebase/firestore');
      const { auth, db } = await import('@/lib/firebase');
      
      // Create user
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Create couple document
      await setDoc(doc(db, 'couples', user.uid), {
        id: user.uid,
        partner1Name: formData.partner1Name,
        partner2Name: formData.partner2Name,
        weddingDate: formData.weddingDate ? Timestamp.fromDate(new Date(formData.weddingDate)) : null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // Wait for auth state to update
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
    } catch (err: any) {
      setError(err.message || 'שגיאה ברישום');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-pink-100 p-4" dir="rtl">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-pink-600 mb-2">
          תכנון החתונה
        </h1>
        <p className="text-center text-gray-600 mb-6">רישום למשתמש חדש</p>

        {isMockMode && (
          <div className="p-4 mb-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
            <strong>מצב הדגמה (Mock Mode):</strong> המערכת פועלת ללא חיבור ל-Firebase.
            <br />
            ההרשמה היא וירטואלית ותכניס אותך למערכת כמשתמש דמה.
          </div>
        )}

        {error && (
          <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label htmlFor="partner1Name" className="block text-sm font-medium text-gray-700 mb-1">
              שם בן/בת הזוג הראשון/ה
            </label>
            <input
              type="text"
              id="partner1Name"
              name="partner1Name"
              value={formData.partner1Name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>

          <div>
            <label htmlFor="partner2Name" className="block text-sm font-medium text-gray-700 mb-1">
              שם בן/בת הזוג השני/ה
            </label>
            <input
              type="text"
              id="partner2Name"
              name="partner2Name"
              value={formData.partner2Name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              דוא״ל
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>

          <div>
            <label htmlFor="weddingDate" className="block text-sm font-medium text-gray-700 mb-1">
              תאריך החתונה
            </label>
            <input
              type="date"
              id="weddingDate"
              name="weddingDate"
              value={formData.weddingDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              סיסמה
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              אישור סיסמה
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 disabled:opacity-50 transition"
          >
            {loading ? 'רושמים...' : 'רישום'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          יש לך כבר חשבון?{' '}
          <Link href="/login" className="text-pink-600 font-semibold hover:underline">
            כנס כאן
          </Link>
        </p>
      </div>
    </div>
  );
}
