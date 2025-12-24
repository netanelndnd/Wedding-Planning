'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { uploadContract } from '@/services/storageService';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { db, auth, isMockMode } from '@/lib/firebase';

/**
 * Settings Page
 * -------------
 * User settings page with profile photo upload and password change
 */
export default function SettingsPage() {
  const { user, couple, loading: authLoading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [photoSuccess, setPhotoSuccess] = useState(false);
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  if (authLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError('');
    setPhotoSuccess(false);
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('התמונה גדולה מדי. מקסימום 5MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setPhotoError('סוג קובץ לא נתמך. אנא העלה JPG, PNG או WEBP');
      return;
    }

    try {
      setUploadingPhoto(true);
      
      // Upload to Firebase Storage
      const { url } = await uploadContract(user.uid, 'couple-photo', file);
      
      // Update couple document
      if (!isMockMode && couple) {
        const coupleRef = doc(db, 'couples', user.uid);
        await updateDoc(coupleRef, {
          photoURL: url,
          updatedAt: Timestamp.now(),
        });
      }
      
      setPhotoSuccess(true);
      setTimeout(() => setPhotoSuccess(false), 3000);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      console.error('Error uploading photo:', err);
      setPhotoError(err.message || 'שגיאה בהעלאת התמונה');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('הסיסמאות החדשות לא תואמות');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('הסיסמה החדשה חייבת להכיל לפחות 6 תווים');
      return;
    }

    if (isMockMode) {
      setPasswordSuccess(true);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSuccess(false), 3000);
      return;
    }

    try {
      setChangingPassword(true);
      setPasswordError('');
      setPasswordSuccess(false);

      if (!auth?.currentUser || !auth.currentUser.email) {
        throw new Error('משתמש לא מחובר');
      }

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        passwordData.currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Update password
      await updatePassword(auth.currentUser, passwordData.newPassword);

      setPasswordSuccess(true);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error changing password:', err);
      if (err.code === 'auth/wrong-password') {
        setPasswordError('סיסמה נוכחית שגויה');
      } else if (err.code === 'auth/weak-password') {
        setPasswordError('הסיסמה החדשה חלשה מדי');
      } else {
        setPasswordError(err.message || 'שגיאה בשינוי הסיסמה');
      }
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <header className="bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 shadow-modern">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">⚙️ הגדרות</h1>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-white text-pink-600 rounded-xl hover:bg-pink-50 font-bold transition-all duration-300"
            >
              ← חזרה לדשבורד
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Photo Section */}
        <div className="glass p-8 rounded-2xl shadow-modern mb-8">
          <h2 className="text-2xl font-bold mb-6 gradient-text">📸 תמונת הזוג</h2>
          
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              {couple?.photoURL ? (
                <img
                  src={couple.photoURL}
                  alt={`${couple.partner1Name} ו${couple.partner2Name}`}
                  className="w-32 h-32 rounded-full object-cover border-4 border-pink-300 shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center border-4 border-pink-300 shadow-lg">
                  <span className="text-5xl">💑</span>
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handlePhotoSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploadingPhoto ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>מעלה...</span>
                  </>
                ) : (
                  <>
                    <span>📤</span>
                    <span>{couple?.photoURL ? 'עדכן תמונה' : 'העלה תמונה'}</span>
                  </>
                )}
              </button>
              <p className="text-xs text-gray-500">
                JPG, PNG, WEBP (מקסימום 5MB)
              </p>
              
              {photoError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{photoError}</p>
                </div>
              )}
              
              {photoSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-600">✅ התמונה עודכנה בהצלחה!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Change Password Section */}
        <div className="glass p-8 rounded-2xl shadow-modern">
          <h2 className="text-2xl font-bold mb-6 gradient-text">🔒 שינוי סיסמה</h2>
          
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                סיסמה נוכחית *
              </label>
              <input
                type="password"
                required
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="הזן סיסמה נוכחית"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                סיסמה חדשה *
              </label>
              <input
                type="password"
                required
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="הזן סיסמה חדשה (מינימום 6 תווים)"
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                אימות סיסמה חדשה *
              </label>
              <input
                type="password"
                required
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="הזן שוב את הסיסמה החדשה"
                minLength={6}
              />
            </div>

            {passwordError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{passwordError}</p>
              </div>
            )}

            {passwordSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-600">✅ הסיסמה שונתה בהצלחה!</p>
              </div>
            )}

            <div className="flex gap-3 justify-end mt-6">
              <button
                type="submit"
                disabled={changingPassword}
                className="px-6 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl font-bold hover:from-pink-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {changingPassword ? 'משנה...' : 'שנה סיסמה'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

