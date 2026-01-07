/**
 * IAuthService Interface
 *
 * Authentication service contract for managing user authentication
 * with Firebase Auth. Handles registration, login, logout, and password reset.
 */

import { User } from 'firebase/auth';

/**
 * Authentication service interface
 */
export interface IAuthService {
  /**
   * Register a new user with email and password
   * @param email User email address
   * @param password User password
   * @returns Promise resolving to the created user
   * @throws FirebaseError if registration fails
   */
  signUp(email: string, password: string): Promise<User>;

  /**
   * Sign in an existing user with email and password
   * @param email User email address
   * @param password User password
   * @returns Promise resolving to the authenticated user
   * @throws FirebaseError if authentication fails
   */
  signIn(email: string, password: string): Promise<User>;

  /**
   * Sign out the current user
   * @returns Promise that resolves when sign out is complete
   * @throws FirebaseError if sign out fails
   */
  signOut(): Promise<void>;

  /**
   * Send password reset email to the specified email address
   * @param email User email address
   * @returns Promise that resolves when email is sent
   * @throws FirebaseError if email send fails
   */
  sendPasswordReset(email: string): Promise<void>;

  /**
   * Get the currently authenticated user
   * @returns Current user or null if not authenticated
   */
  getCurrentUser(): User | null;

  /**
   * Subscribe to authentication state changes
   * @param callback Function to call when auth state changes
   * @returns Unsubscribe function to stop listening
   */
  onAuthStateChanged(callback: (user: User | null) => void): () => void;
}
