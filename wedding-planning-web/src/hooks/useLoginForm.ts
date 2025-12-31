import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { insertMockData, deleteAllData, MockDataInsertResult, DeleteDataResult } from '@/services/mockData';

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
  const [deletingData, setDeletingData] = useState(false);
  const [deleteDataResult, setDeleteDataResult] = useState<DeleteDataResult | null>(null);
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
    setInsertingMockData(true);
    setError('');
    setMockDataResult(null);

    try {
      let userId = user?.uid;

      // If not logged in, create test user first
      if (!userId) {
        const [{ createUserWithEmailAndPassword, signInWithEmailAndPassword }, { auth }] = await Promise.all([
          import('firebase/auth'),
          import('@/lib/firebase')
        ]);

        const testEmail = 'test@example.com';
        const testPassword = 'password123';

        try {
          // Try to create the user
          const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
          userId = userCredential.user.uid;
          console.log('✅ Test user created');
        } catch (createError: any) {
          // If user already exists, try to sign in
          if (createError.code === 'auth/email-already-in-use') {
            const userCredential = await signInWithEmailAndPassword(auth, testEmail, testPassword);
            userId = userCredential.user.uid;
            console.log('✅ Signed in with existing test user');
          } else {
            throw createError;
          }
        }
      }

      const result = await insertMockData(userId, {
        guestCount: 50,
        vendorCount: 8,
        taskCount: 12,
        epicCount: 4,
      });

      if (result.success && result.data) {
        setMockDataResult(result.data);
        setSuccessMessage(`נתוני דוגמה הוכנסו בהצלחה! ${result.data.guestsCreated} אורחים, ${result.data.vendorsCreated} ספקים, ${result.data.tasksCreated} משימות`);
      } else {
        setError(result.error || 'שגיאה בהכנסת נתוני דוגמה');
      }
    } catch (err: any) {
      setError(err.message || 'שגיאה בהכנסת נתוני דוגמה');
    } finally {
      setInsertingMockData(false);
    }
  }, [user]);

  // Delete all data handler
  const handleDeleteAllData = useCallback(async () => {
    if (!user?.uid) {
      setError('יש להתחבר תחילה');
      return;
    }

    if (!window.confirm('האם אתה בטוח? כל הנתונים ימחקו כולל המשתמש!')) {
      return;
    }

    setDeletingData(true);
    setError('');
    setDeleteDataResult(null);

    try {
      const result = await deleteAllData(user.uid);
      if (result.success && result.data) {
        setDeleteDataResult(result.data);
        setSuccessMessage('כל הנתונים נמחקו בהצלחה');
        // Redirect to login page after deletion
        setTimeout(() => {
          router.push('/login');
          window.location.reload();
        }, 1500);
      } else {
        setError(result.error || 'שגיאה במחיקת נתונים');
      }
    } catch (err: any) {
      setError(err.message || 'שגיאה במחיקת נתונים');
    } finally {
      setDeletingData(false);
    }
  }, [user, router]);

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
    // Delete data
    deletingData,
    deleteDataResult,
    handleDeleteAllData,
    isLoggedIn: !!user,
  };
}

