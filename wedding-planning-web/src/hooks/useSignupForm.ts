import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface SignupFormData {
  partner1Name: string;
  partner2Name: string;
  email: string;
  password: string;
  confirmPassword: string;
  weddingDate: string;
}

/**
 * useSignupForm Hook
 * -----------------
 * Handles signup form logic with performance optimizations:
 * - Dynamic imports for Firebase
 * - useCallback for memoized functions
 * - Parallel imports with Promise.all
 */
export function useSignupForm() {
  const [formData, setFormData] = useState<SignupFormData>({
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

  // Memoize handleChange to prevent unnecessary re-renders
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  // Memoize handleSignup
  const handleSignup = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('הסיסמאות לא תואמות');
      return;
    }

    setLoading(true);

    if (isMockMode && mockLogin) {
      setTimeout(() => {
        mockLogin();
      }, 1000);
      return;
    }

    try {
      // Dynamic imports - parallel loading for better performance
      const [
        { createUserWithEmailAndPassword },
        { setDoc, doc, Timestamp },
        { auth, db }
      ] = await Promise.all([
        import('firebase/auth'),
        import('firebase/firestore'),
        import('@/lib/firebase')
      ]);
      
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

      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
    } catch (err: any) {
      setError(err.message || 'שגיאה ברישום');
    } finally {
      setLoading(false);
    }
  }, [formData, isMockMode, mockLogin, router]);

  return {
    formData,
    handleChange,
    error,
    loading,
    handleSignup,
    isMockMode,
  };
}

