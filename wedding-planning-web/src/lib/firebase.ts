import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, Auth } from 'firebase/auth';
import { getFirestore, Firestore, enableNetwork, disableNetwork } from 'firebase/firestore';
import { getDatabase, Database } from 'firebase/database';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getMessaging, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  // Realtime Database URL
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}-default-rtdb.europe-west1.firebasedatabase.app`,
};

// Check if config is valid
export const isMockMode = !firebaseConfig.apiKey;

console.log('Firebase Config Check:', {
  hasApiKey: !!firebaseConfig.apiKey,
  isMockMode,
  projectId: firebaseConfig.projectId
});

let app;
let auth: Auth;
let db: Firestore;
let rtdb: Database; // Realtime Database
let storage: FirebaseStorage;
let messaging: Promise<any>;

if (!isMockMode) {
  try {
    // Initialize Firebase
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    
    // Initialize Firebase Authentication
    auth = getAuth(app);
    setPersistence(auth, browserLocalPersistence);
    
    // Initialize Firestore (optional - can be removed if only using Realtime Database)
    db = getFirestore(app);
    
    // Force Firestore to be online (disable offline persistence issues)
    enableNetwork(db).catch((err) => {
      console.warn('Could not enable Firestore network:', err);
    });
    
    // Initialize Realtime Database
    rtdb = getDatabase(app);
    console.log('Realtime Database initialized:', firebaseConfig.databaseURL);
    
    // Initialize Firebase Storage
    storage = getStorage(app);
    
    // Initialize Firebase Cloud Messaging (if supported)
    messaging = isSupported().then(
      (supported) => (supported ? getMessaging(app) : null)
    ).catch(() => null);
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    // Fallback to mock mode if initialization fails
    auth = null as unknown as Auth;
  }
} else {
  console.log('Running in Mock Mode (Firebase config missing)');
  // We explicitly set auth to null to prevent useAuthState hook from crashing
  // when it receives a partial object. null tells the hook to skip subscription.
  auth = null as unknown as Auth;
  db = null as unknown as Firestore;
  rtdb = null as unknown as Database;
}

export { app, auth, db, rtdb, storage, messaging };
export default app;
