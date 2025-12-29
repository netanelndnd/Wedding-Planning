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
    <div className="min-h-screen wedding-bg">
      <header className="bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#BE185D] shadow-lg relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-serif font-bold text-white">
              הגדרות
            </h1>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-white/95 text-[#6D28D9] rounded-xl hover:bg-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              ← חזרה לדשבורד
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        {/* Profile Photo Section */}
        <div className="glass p-8 rounded-2xl shadow-modern mb-8">
          <h2 className="text-2xl font-serif font-bold mb-6 gradient-text">
            תמונת הזוג
          </h2>
          
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              {couple?.photoURL ? (
                <img
                  src={couple.photoURL}
                  alt={`${couple.partner1Name} ו${couple.partner2Name}`}
                  className="w-32 h-32 rounded-full object-cover border-4 border-[#6D28D9]/30 shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#6D28D9]/10 to-[#BE185D]/10 flex items-center justify-center border-4 border-[#6D28D9]/30 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-[#6D28D9]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
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
                className="w-full md:w-auto btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingPhoto ? 'מעלה...' : (couple?.photoURL ? 'עדכן תמונה' : 'העלה תמונה')}
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
                  <p className="text-sm text-green-600">התמונה עודכנה בהצלחה!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Change Password Section */}
        <div className="glass p-8 rounded-2xl shadow-modern">
          <h2 className="text-2xl font-serif font-bold mb-6 gradient-text">
            שינוי סיסמה
          </h2>
          
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#2D2A32] mb-2">
                סיסמה נוכחית *
              </label>
              <input
                type="password"
                required
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full px-4 py-3 border-2 border-[#6D28D9]/20 rounded-xl focus:ring-2 focus:ring-[#6D28D9]/30 focus:border-[#6D28D9] transition-all duration-300 bg-white/70"
                placeholder="הזן סיסמה נוכחית"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#2D2A32] mb-2">
                סיסמה חדשה *
              </label>
              <input
                type="password"
                required
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full px-4 py-3 border-2 border-[#6D28D9]/20 rounded-xl focus:ring-2 focus:ring-[#6D28D9]/30 focus:border-[#6D28D9] transition-all duration-300 bg-white/70"
                placeholder="הזן סיסמה חדשה (מינימום 6 תווים)"
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#2D2A32] mb-2">
                אימות סיסמה חדשה *
              </label>
              <input
                type="password"
                required
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 border-2 border-[#6D28D9]/20 rounded-xl focus:ring-2 focus:ring-[#6D28D9]/30 focus:border-[#6D28D9] transition-all duration-300 bg-white/70"
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
              <div className="p-3 bg-[#87A878]/20 border border-[#87A878]/50 rounded-lg">
                <p className="text-sm text-[#87A878] font-medium">הסיסמה שונתה בהצלחה!</p>
              </div>
            )}

            <div className="flex gap-3 justify-end mt-6">
              <button
                type="submit"
                disabled={changingPassword}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
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

