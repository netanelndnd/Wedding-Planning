'use client';

/**
 * useAuth Hook
 *
 * Custom hook for managing authentication state and operations.
 * Provides user state, loading state, error handling, and auth methods.
 */

import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { authService } from '@/services/crud/authService';
import { logger } from '@/lib/logger';

/**
 * Authentication state and methods
 */
export interface UseAuthReturn {
  /** Current authenticated user or null */
  user: User | null;
  /** Loading state during auth operations */
  loading: boolean;
  /** Error message if auth operation failed */
  error: string | null;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Sign up a new user */
  signUp: (email: string, password: string) => Promise<User>;
  /** Sign in existing user */
  signIn: (email: string, password: string) => Promise<User>;
  /** Sign out current user */
  signOut: () => Promise<void>;
  /** Send password reset email */
  sendPasswordReset: (email: string) => Promise<void>;
  /** Clear error state */
  clearError: () => void;
}

/**
 * Hook for authentication state and operations
 *
 * @example
 * ```tsx
 * const { user, loading, signIn, signOut } = useAuth();
 *
 * if (loading) return <LoadingSpinner />;
 * if (!user) return <LoginForm />;
 * return <Dashboard user={user} onLogout={signOut} />;
 * ```
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to auth state changes
  useEffect(() => {
    logger.debug('Setting up auth state listener');

    const unsubscribe = authService.onAuthStateChanged((user) => {
      logger.debug('Auth state changed', {
        userId: user?.uid,
        email: user?.email,
        emailVerified: user?.emailVerified,
      });

      setUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      logger.debug('Cleaning up auth state listener');
      unsubscribe();
    };
  }, []);

  /**
   * Sign up a new user
   */
  const signUp = async (email: string, password: string): Promise<User> => {
    try {
      setLoading(true);
      setError(null);

      const user = await authService.signUp(email, password);
      return user;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      logger.error('Sign up error in hook', { error: errorMessage });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign in existing user
   */
  const signIn = async (email: string, password: string): Promise<User> => {
    try {
      setLoading(true);
      setError(null);

      const user = await authService.signIn(email, password);
      return user;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      logger.error('Sign in error in hook', { error: errorMessage });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign out current user
   */
  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      await authService.signOut();
      setUser(null);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      logger.error('Sign out error in hook', { error: errorMessage });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Send password reset email
   */
  const sendPasswordReset = async (email: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      await authService.sendPasswordReset(email);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      logger.error('Password reset error in hook', { error: errorMessage });
      throw err;
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
    user,
    loading,
    error,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signOut,
    sendPasswordReset,
    clearError,
  };
}

/**
 * Extract user-friendly error message from Firebase error
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Map Firebase error codes to Hebrew messages
    const errorCode = (error as { code?: string }).code;

    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'כתובת האימייל כבר בשימוש';
      case 'auth/invalid-email':
        return 'כתובת אימייל לא תקינה';
      case 'auth/operation-not-allowed':
        return 'הפעולה אינה מורשית';
      case 'auth/weak-password':
        return 'הסיסמה חלשה מדי';
      case 'auth/user-disabled':
        return 'חשבון המשתמש הושבת';
      case 'auth/user-not-found':
        return 'משתמש לא נמצא';
      case 'auth/wrong-password':
        return 'סיסמה שגויה';
      case 'auth/invalid-credential':
        return 'פרטי התחברות שגויים';
      case 'auth/too-many-requests':
        return 'יותר מדי ניסיונות התחברות. נסה שוב מאוחר יותר';
      case 'auth/network-request-failed':
        return 'שגיאת רשת. בדוק את החיבור לאינטרנט';
      default:
        return error.message || 'אירעה שגיאה';
    }
  }

  return 'אירעה שגיאה';
}
