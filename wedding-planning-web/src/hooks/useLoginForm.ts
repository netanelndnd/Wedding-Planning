import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

/**
 * useLoginForm Hook
 * ----------------
 * Handles login form logic with performance optimizations:
 * - Dynamic imports for Firebase (code splitting)
 * - useCallback for memoized functions
 * - Success message after registration
 */
export function useLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isMockMode, mockLogin } = useAuth();

  // Check if user just registered
  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccessMessage('ההרשמה הושלמה בהצלחה! 🎉 כעת תוכל להתחבר עם המייל והסיסמה שלך');
      // Clear the URL parameter
      window.history.replaceState({}, '', '/login');
    }
  }, [searchParams]);

  // Memoize the login handler to prevent unnecessary re-creation
  const handleLogin = useCallback(async (e: React.FormEvent) => {
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
      // Dynamic import - loads Firebase only when needed (Code Splitting)
      const [{ signInWithEmailAndPassword }, { auth }] = await Promise.all([
        import('firebase/auth'),
        import('@/lib/firebase')
      ]);
      
      // Sign in directly on the client side
      await signInWithEmailAndPassword(auth, email, password);
      
      // Navigate to dashboard
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
    } catch (err: any) {
      setError(err.message || 'שגיאה בהתחברות');
      setLoading(false);
    }
  }, [email, password, isMockMode, mockLogin, router]);

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    loading,
    successMessage,
    handleLogin,
    isMockMode,
  };
}

