import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { insertMockData, MockDataInsertResult } from '@/services/mockData';

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
  const [insertingMockData, setInsertingMockData] = useState(false);
  const [mockDataResult, setMockDataResult] = useState<MockDataInsertResult | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isMockMode, mockLogin, user } = useAuth();

  // Check if user just registered
  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccessMessage('ההרשמה הושלמה בהצלחה! כעת תוכל להתחבר עם המייל והסיסמה שלך');
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

  // Insert mock data handler
  const handleInsertMockData = useCallback(async () => {
    if (!user?.uid) {
      setError('יש להתחבר תחילה כדי להכניס נתוני דוגמה');
      return;
    }

    setInsertingMockData(true);
    setError('');
    setMockDataResult(null);

    try {
      const result = await insertMockData(user.uid, {
        guestCount: 50,
        vendorCount: 8,
        taskCount: 12,
        epicCount: 4,
      });

      if (result.success && result.data) {
        setMockDataResult(result.data);
        setSuccessMessage(`נתוני דוגמה הוכנסו בהצלחה! ${result.data.guestsInserted} אורחים, ${result.data.vendorsInserted} ספקים, ${result.data.tasksInserted} משימות`);
      } else {
        setError(result.error || 'שגיאה בהכנסת נתוני דוגמה');
      }
    } catch (err: any) {
      setError(err.message || 'שגיאה בהכנסת נתוני דוגמה');
    } finally {
      setInsertingMockData(false);
    }
  }, [user]);

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
    // Mock data
    insertingMockData,
    mockDataResult,
    handleInsertMockData,
    isLoggedIn: !!user,
  };
}

