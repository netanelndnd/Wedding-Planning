'use client';

/**
 * useForgotPassword Hook
 *
 * Custom hook for managing forgot password form state and validation.
 * Handles email input and password reset email sending.
 */

import { useState, FormEvent } from 'react';
import { useAuth } from './useAuth';
import { logger } from '@/lib/logger';

/**
 * Forgot password form state and handlers
 */
export interface UseForgotPasswordReturn {
  /** Email input value */
  email: string;
  /** Form-level error message */
  error: string | null;
  /** Form submission loading state */
  loading: boolean;
  /** Whether reset email was sent successfully */
  emailSent: boolean;
  /** Email field change handler */
  setEmail: (email: string) => void;
  /** Form submission handler */
  handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  /** Clear error state */
  clearError: () => void;
  /** Reset form state */
  resetForm: () => void;
}

/**
 * Hook for forgot password form management
 *
 * @example
 * ```tsx
 * const { email, setEmail, handleSubmit, loading, error, emailSent } = useForgotPassword();
 *
 * if (emailSent) {
 *   return <p>נשלח אימייל לאיפוס סיסמה ל-{email}</p>;
 * }
 *
 * <form onSubmit={handleSubmit}>
 *   <Input value={email} onChange={(e) => setEmail(e.target.value)} />
 *   <Button type="submit" loading={loading}>שלח קישור לאיפוס</Button>
 *   {error && <p>{error}</p>}
 * </form>
 * ```
 */
export function useForgotPassword(): UseForgotPasswordReturn {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const { sendPasswordReset } = useAuth();

  /**
   * Validate email field
   */
  const validateEmail = (): boolean => {
    if (!email.trim()) {
      setError('נא להזין כתובת אימייל');
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

    // Validate email
    if (!validateEmail()) {
      return;
    }

    try {
      setLoading(true);
      logger.info('Password reset requested', { email });

      await sendPasswordReset(email);

      logger.info('Password reset email sent successfully', { email });
      setEmailSent(true);
    } catch (err) {
      logger.error('Password reset failed', {
        email,
        error: err instanceof Error ? err.message : String(err),
      });

      // Extract user-friendly error message
      if (err instanceof Error) {
        const errorCode = (err as { code?: string }).code;

        switch (errorCode) {
          case 'auth/user-not-found':
            // For security, don't reveal if user exists
            // Still show success message
            setEmailSent(true);
            break;
          case 'auth/invalid-email':
            setError('כתובת אימייל לא תקינה');
            break;
          case 'auth/network-request-failed':
            setError('שגיאת רשת. בדוק את החיבור לאינטרנט');
            break;
          case 'auth/too-many-requests':
            setError('יותר מדי בקשות. נסה שוב מאוחר יותר');
            break;
          default:
            setError(err.message || 'שגיאה בשליחת אימייל לאיפוס סיסמה');
        }
      } else {
        setError('שגיאה בשליחת אימייל לאיפוס סיסמה');
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

  /**
   * Reset form to initial state
   */
  const resetForm = (): void => {
    setEmail('');
    setError(null);
    setEmailSent(false);
    setLoading(false);
  };

  return {
    email,
    error,
    loading,
    emailSent,
    setEmail,
    handleSubmit,
    clearError,
    resetForm,
  };
}
