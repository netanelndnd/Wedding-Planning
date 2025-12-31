import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, Auth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, Firestore, enableNetwork, connectFirestoreEmulator } from 'firebase/firestore';
import { getDatabase, Database, connectDatabaseEmulator } from 'firebase/database';
import { getStorage, FirebaseStorage, connectStorageEmulator } from 'firebase/storage';
import { getMessaging, isSupported } from 'firebase/messaging';

// Firebase Configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

// Emulator Configuration from environment variables
const emulatorConfig = {
  useEmulator: process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true',
  host: process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST || 'localhost',
  authPort: parseInt(process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT || '9099', 10),
  firestorePort: parseInt(process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_PORT || '8080', 10),
  databasePort: parseInt(process.env.NEXT_PUBLIC_FIREBASE_DATABASE_EMULATOR_PORT || '9000', 10),
  storagePort: parseInt(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_PORT || '9199', 10),
};

// Check if config is valid
export const isMockMode = !firebaseConfig.apiKey;
export const isEmulatorMode = emulatorConfig.useEmulator;

console.log('Firebase Config Check:', {
  hasApiKey: !!firebaseConfig.apiKey,
  isMockMode,
  isEmulatorMode,
  projectId: firebaseConfig.projectId
});

let app;
let auth: Auth;
let db: Firestore;
let rtdb: Database;
let storage: FirebaseStorage;
let messaging: Promise<any>;

// Track if emulators are already connected (to avoid double connection)
let emulatorsConnected = false;

if (!isMockMode) {
  try {
    // Initialize Firebase
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

    // Initialize Firebase Authentication
    auth = getAuth(app);

    // Initialize Firestore with specific database name
    const DATABASE_NAME = 'weddingdatabase123';
    db = getFirestore(app, DATABASE_NAME);

    // Initialize Realtime Database
    rtdb = getDatabase(app);

    // Initialize Firebase Storage
    storage = getStorage(app);

    // Connect to emulators if enabled
    if (isEmulatorMode && !emulatorsConnected) {
      console.log('🔧 Connecting to Firebase Emulators...');

      // Connect Auth Emulator
      connectAuthEmulator(auth, `http://${emulatorConfig.host}:${emulatorConfig.authPort}`, {
        disableWarnings: true
      });
      console.log(`  ✅ Auth Emulator: http://${emulatorConfig.host}:${emulatorConfig.authPort}`);

      // Connect Firestore Emulator
      connectFirestoreEmulator(db, emulatorConfig.host, emulatorConfig.firestorePort);
      console.log(`  ✅ Firestore Emulator: ${emulatorConfig.host}:${emulatorConfig.firestorePort}`);

      // Connect Realtime Database Emulator
      connectDatabaseEmulator(rtdb, emulatorConfig.host, emulatorConfig.databasePort);
      console.log(`  ✅ Database Emulator: ${emulatorConfig.host}:${emulatorConfig.databasePort}`);

      // Connect Storage Emulator
      connectStorageEmulator(storage, emulatorConfig.host, emulatorConfig.storagePort);
      console.log(`  ✅ Storage Emulator: ${emulatorConfig.host}:${emulatorConfig.storagePort}`);

      console.log('🔧 Firebase Emulator UI: http://localhost:4000');

      emulatorsConnected = true;
    } else {
      // Production mode - set persistence and enable network
      setPersistence(auth, browserLocalPersistence)
        .then(() => {
          console.log('✅ Auth persistence set to browserLocalPersistence');
        })
        .catch((err) => {
          console.warn('⚠️ Could not set auth persistence:', err);
        });

      console.log('✅ Firestore initialized with database:', DATABASE_NAME);

      // Force Firestore to be online
      enableNetwork(db).catch((err) => {
        console.warn('Could not enable Firestore network:', err);
      });

      console.log('✅ Realtime Database initialized:', firebaseConfig.databaseURL);
    }

    // Initialize Firebase Cloud Messaging (if supported)
    messaging = isSupported().then(
      (supported) => (supported ? getMessaging(app) : null)
    ).catch(() => null);

  } catch (error) {
    console.error('Error initializing Firebase:', error);
    auth = null as unknown as Auth;
    db = null as unknown as Firestore;
    rtdb = null as unknown as Database;
    storage = null as unknown as FirebaseStorage;
  }
} else {
  console.log('Running in Mock Mode (Firebase config missing)');
  auth = null as unknown as Auth;
  db = null as unknown as Firestore;
  rtdb = null as unknown as Database;
  storage = null as unknown as FirebaseStorage;
}

export { app, auth, db, rtdb, storage, messaging };
export default app;
