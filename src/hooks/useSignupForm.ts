'use client';

/**
 * useSignupForm Hook
 *
 * Custom hook for managing signup form state and validation.
 * Handles email, password, password confirmation, and email verification flow.
 */

import { useState, FormEvent } from 'react';
import { useAuth } from './useAuth';
import { logger } from '@/lib/logger';

/**
 * Signup form state and handlers
 */
export interface UseSignupFormReturn {
  /** Email input value */
  email: string;
  /** Password input value */
  password: string;
  /** Confirm password input value */
  confirmPassword: string;
  /** Form-level error message */
  error: string | null;
  /** Form submission loading state */
  loading: boolean;
  /** Whether email verification was sent */
  emailSent: boolean;
  /** Email field change handler */
  setEmail: (email: string) => void;
  /** Password field change handler */
  setPassword: (password: string) => void;
  /** Confirm password field change handler */
  setConfirmPassword: (password: string) => void;
  /** Form submission handler */
  handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  /** Clear error state */
  clearError: () => void;
}

/**
 * Hook for signup form management
 *
 * @example
 * ```tsx
 * const { email, password, confirmPassword, setEmail, setPassword, setConfirmPassword,
 *         handleSubmit, loading, error, emailSent } = useSignupForm();
 *
 * if (emailSent) {
 *   return <p>נשלח אימייל אימות ל-{email}</p>;
 * }
 *
 * <form onSubmit={handleSubmit}>
 *   <Input value={email} onChange={(e) => setEmail(e.target.value)} />
 *   <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
 *   <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
 *   <Button type="submit" loading={loading}>הירשם</Button>
 * </form>
 * ```
 */
export function useSignupForm(): UseSignupFormReturn {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const { signUp } = useAuth();

  /**
   * Validate form fields
   */
  const validateForm = (): boolean => {
    if (!email.trim()) {
      setError('נא להזין כתובת אימייל');
      return false;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('כתובת אימייל לא תקינה');
      return false;
    }

    if (!password) {
      setError('נא להזין סיסמה');
      return false;
    }

    // Password length validation
    if (password.length < 6) {
      setError('הסיסמה חייבת להכיל לפחות 6 תווים');
      return false;
    }

    if (!confirmPassword) {
      setError('נא לאמת את הסיסמה');
      return false;
    }

    // Password match validation
    if (password !== confirmPassword) {
      setError('הסיסמאות אינן תואמות');
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
      logger.info('Signup form submitted', { email });

      await signUp(email, password);

      logger.info('Signup successful, email verification sent', { email });
      setEmailSent(true);
    } catch (err) {
      logger.error('Signup form submission failed', {
        email,
        error: err instanceof Error ? err.message : String(err),
      });

      // Extract user-friendly error message
      if (err instanceof Error) {
        const errorCode = (err as { code?: string }).code;

        switch (errorCode) {
          case 'auth/email-already-in-use':
            setError('כתובת האימייל כבר בשימוש');
            break;
          case 'auth/invalid-email':
            setError('כתובת אימייל לא תקינה');
            break;
          case 'auth/weak-password':
            setError('הסיסמה חלשה מדי. נא להשתמש בסיסמה חזקה יותר');
            break;
          case 'auth/network-request-failed':
            setError('שגיאת רשת. בדוק את החיבור לאינטרנט');
            break;
          default:
            setError(err.message || 'שגיאה בהרשמה');
        }
      } else {
        setError('שגיאה בהרשמה');
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
    confirmPassword,
    error,
    loading,
    emailSent,
    setEmail,
    setPassword,
    setConfirmPassword,
    handleSubmit,
    clearError,
  };
}
