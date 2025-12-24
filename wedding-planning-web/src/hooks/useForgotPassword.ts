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
      // Using getAuth() and sendPasswordResetEmail as per Firebase official documentation
      const [{ getAuth, sendPasswordResetEmail }, firebaseModule] = await Promise.all([
        import('firebase/auth'),
        import('@/lib/firebase')
      ]);
      
      // Initialize auth instance (following Firebase official pattern)
      // Option 1: Use getAuth() without parameter (uses default app)
      // Option 2: Use getAuth(app) if app is available
      // We'll use getAuth() which automatically uses the default Firebase app
      const auth = getAuth();
      
      console.log('Sending password reset email to:', email);
      
      // Send password reset email
      // Password reset email sent successfully!
      await sendPasswordResetEmail(auth, email);
      console.log('Password reset email sent successfully');
      setSuccess(true);
    } catch (error: any) {
      // Handle errors
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error('Error sending password reset email:', {
        code: errorCode,
        message: errorMessage
      });
      
      let userFriendlyMessage = 'שגיאה בשליחת המייל';
      
      // Firebase error handling
      if (errorCode === 'auth/user-not-found') {
        userFriendlyMessage = 'כתובת מייל זו לא רשומה במערכת';
      } else if (errorCode === 'auth/invalid-email') {
        userFriendlyMessage = 'כתובת מייל לא תקינה';
      } else if (errorCode === 'auth/too-many-requests') {
        userFriendlyMessage = 'יותר מדי בקשות. אנא נסה שוב מאוחר יותר';
      } else if (errorMessage) {
        userFriendlyMessage = errorMessage;
      }
      
      setError(userFriendlyMessage);
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

