import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';

export interface FirebaseConfigObject {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
  measurementId?: string;
}

const STORAGE_KEY_FIREBASE_CONFIG = 'STAR_WALK_FIREBASE_CONFIG';

export function getStoredFirebaseConfig(): FirebaseConfigObject | null {
  // 1. Check localStorage first
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FIREBASE_CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse stored Firebase config', e);
  }

  // 2. Fallback to Vite environment variables
  const envConfig: FirebaseConfigObject = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ''
  };

  if (envConfig.apiKey && envConfig.projectId) {
    return envConfig;
  }

  return null;
}

export function saveStoredFirebaseConfig(config: FirebaseConfigObject): void {
  localStorage.setItem(STORAGE_KEY_FIREBASE_CONFIG, JSON.stringify(config));
}

export function clearStoredFirebaseConfig(): void {
  localStorage.removeItem(STORAGE_KEY_FIREBASE_CONFIG);
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let isConfigured = false;

const initialConfig = getStoredFirebaseConfig();

if (initialConfig && initialConfig.apiKey && initialConfig.projectId) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(initialConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    isConfigured = true;
  } catch (err) {
    console.warn('Firebase initialization warning:', err);
  }
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export { app, auth, db, isConfigured };

// Test connection helper
export async function testFirestoreConnection(): Promise<boolean> {
  if (!db) return false;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('the client is offline')) {
      console.warn('Firebase client is offline');
      return false;
    }
    // Any other error (like permission denied) still confirms server reachability
    return true;
  }
}
