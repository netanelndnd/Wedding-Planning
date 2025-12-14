import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

/**
 * useForgotPassword Hook
 * ---------------------
 * Handles password reset logic with performance optimizations
 */
export function useForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleResetPassword = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Dynamic imports - load Firebase only when needed
      const [{ sendPasswordResetEmail }, { auth }] = await Promise.all([
        import('firebase/auth'),
        import('@/lib/firebase')
      ]);
      
      console.log('Sending password reset email to:', email);
      await sendPasswordResetEmail(auth, email);
      console.log('Password reset email sent successfully');
      setSuccess(true);
    } catch (err: any) {
      console.error('Error sending password reset email:', err);
      let errorMessage = 'שגיאה בשליחת המייל';
      
      // Firebase error handling
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'כתובת מייל זו לא רשומה במערכת';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'כתובת מייל לא תקינה';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'יותר מדי בקשות. אנא נסה שוב מאוחר יותר';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [email]);

  const goToLogin = useCallback(() => {
    router.push('/login');
  }, [router]);

  return {
    email,
    setEmail,
    loading,
    success,
    error,
    handleResetPassword,
    goToLogin,
  };
}

