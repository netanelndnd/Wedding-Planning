/**
 * AuthService Implementation
 *
 * Firebase Authentication service implementation.
 * Handles user registration, login, logout, and password reset.
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import { IAuthService } from '@/services/interfaces/IAuthService';

/**
 * Firebase Authentication Service Implementation
 */
class AuthService implements IAuthService {
  /**
   * Register a new user with email and password
   * Sends email verification after successful registration
   */
  async signUp(email: string, password: string): Promise<User> {
    try {
      logger.info('Attempting user registration', { email });

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // Send email verification
      await sendEmailVerification(user);
      logger.info('Email verification sent', { userId: user.uid, email });

      logger.info('User registered successfully', {
        userId: user.uid,
        email: user.email,
      });

      return user;
    } catch (error) {
      logger.error('Registration failed', {
        email,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Sign in an existing user with email and password
   */
  async signIn(email: string, password: string): Promise<User> {
    try {
      logger.info('Attempting user sign in', { email });

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      logger.info('User signed in successfully', {
        userId: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
      });

      return user;
    } catch (error) {
      logger.error('Sign in failed', {
        email,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<void> {
    try {
      const currentUser = auth.currentUser;
      logger.info('Attempting user sign out', {
        userId: currentUser?.uid,
        email: currentUser?.email,
      });

      await firebaseSignOut(auth);

      logger.info('User signed out successfully');
    } catch (error) {
      logger.error('Sign out failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Send password reset email to the specified email address
   */
  async sendPasswordReset(email: string): Promise<void> {
    try {
      logger.info('Sending password reset email', { email });

      await sendPasswordResetEmail(auth, email);

      logger.info('Password reset email sent', { email });
    } catch (error) {
      logger.error('Password reset email failed', {
        email,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Get the currently authenticated user
   */
  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  /**
   * Subscribe to authentication state changes
   */
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return firebaseOnAuthStateChanged(auth, callback);
  }
}

// Export singleton instance
export const authService = new AuthService();
