'use client';

/**
 * useLoginForm Hook
 *
 * Custom hook for managing login form state and validation.
 * Handles email and password input, form submission, and error states.
 */

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';
import { logger } from '@/lib/logger';

/**
 * Login form state and handlers
 */
export interface UseLoginFormReturn {
  /** Email input value */
  email: string;
  /** Password input value */
  password: string;
  /** Form-level error message */
  error: string | null;
  /** Form submission loading state */
  loading: boolean;
  /** Email field change handler */
  setEmail: (email: string) => void;
  /** Password field change handler */
  setPassword: (password: string) => void;
  /** Form submission handler */
  handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  /** Clear error state */
  clearError: () => void;
}

/**
 * Hook for login form management
 *
 * @example
 * ```tsx
 * const { email, password, setEmail, setPassword, handleSubmit, loading, error } = useLoginForm();
 *
 * <form onSubmit={handleSubmit}>
 *   <Input value={email} onChange={(e) => setEmail(e.target.value)} />
 *   <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
 *   <Button type="submit" loading={loading}>התחבר</Button>
 *   {error && <p>{error}</p>}
 * </form>
 * ```
 */
export function useLoginForm(): UseLoginFormReturn {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth();
  const router = useRouter();

  /**
   * Validate form fields
   */
  const validateForm = (): boolean => {
    if (!email.trim()) {
      setError('נא להזין כתובת אימייל');
      return false;
    }

    if (!password) {
      setError('נא להזין סיסמה');
      return false;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('כתובת אימייל לא תקינה');
      return false;
    }

    return true;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      logger.info('Login form submitted', { email });

      await signIn(email, password);

      logger.info('Login successful, redirecting to dashboard', { email });
      router.push('/dashboard');
    } catch (err) {
      logger.error('Login form submission failed', {
        email,
        error: err instanceof Error ? err.message : String(err),
      });

      // Extract user-friendly error message
      if (err instanceof Error) {
        const errorCode = (err as { code?: string }).code;

        switch (errorCode) {
          case 'auth/invalid-credential':
          case 'auth/user-not-found':
          case 'auth/wrong-password':
            setError('פרטי התחברות שגויים');
            break;
          case 'auth/too-many-requests':
            setError('יותר מדי ניסיונות התחברות. נסה שוב מאוחר יותר');
            break;
          case 'auth/network-request-failed':
            setError('שגיאת רשת. בדוק את החיבור לאינטרנט');
            break;
          default:
            setError(err.message || 'שגיאה בהתחברות');
        }
      } else {
        setError('שגיאה בהתחברות');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Clear error state
   */
  const clearError = (): void => {
    setError(null);
  };

  return {
    email,
    password,
    error,
    loading,
    setEmail,
    setPassword,
    handleSubmit,
    clearError,
  };
}
