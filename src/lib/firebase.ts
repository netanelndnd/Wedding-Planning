import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, Firestore } from 'firebase/firestore';
import { getStorage, connectStorageEmulator, FirebaseStorage } from 'firebase/storage';

/**
 * Firebase Configuration
 *
 * Environment Variables Required:
 * - NEXT_PUBLIC_FIREBASE_API_KEY
 * - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
 * - NEXT_PUBLIC_FIREBASE_PROJECT_ID
 * - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
 * - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
 * - NEXT_PUBLIC_FIREBASE_APP_ID
 * - NEXT_PUBLIC_USE_FIREBASE_EMULATOR (optional, defaults to true in development)
 */

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase App (singleton pattern)
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firebase Services
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

// Connect to Firebase Emulator in development
const useEmulator =
  process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true' ||
  (process.env.NODE_ENV === 'development' &&
   process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR !== 'false');

if (useEmulator && typeof window !== 'undefined') {
  // Only connect to emulator once on client side
  const EMULATOR_HOST = 'localhost';

  try {
    // Auth Emulator - Port 9099
    connectAuthEmulator(auth, `http://${EMULATOR_HOST}:9099`, {
      disableWarnings: true,
    });

    // Firestore Emulator - Port 8080
    connectFirestoreEmulator(db, EMULATOR_HOST, 8080);

    // Storage Emulator - Port 9199
    connectStorageEmulator(storage, EMULATOR_HOST, 9199);

    console.info('🔧 Connected to Firebase Emulator Suite');
  } catch {
    // Emulators already connected, ignore error
    // This can happen on hot module replacement
  }
}

// Export initialized app
export { app };
