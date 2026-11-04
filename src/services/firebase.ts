import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

export interface FirebaseConfigObject {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
  measurementId?: string;
  firestoreDatabaseId?: string;
}

const STORAGE_KEY_FIREBASE_CONFIG = 'STAR_WALK_FIREBASE_CONFIG';

export function getStoredFirebaseConfig(): FirebaseConfigObject {
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

  return firebaseConfig as FirebaseConfigObject;
}

export function saveStoredFirebaseConfig(config: FirebaseConfigObject): void {
  localStorage.setItem(STORAGE_KEY_FIREBASE_CONFIG, JSON.stringify(config));
}

export function clearStoredFirebaseConfig(): void {
  localStorage.removeItem(STORAGE_KEY_FIREBASE_CONFIG);
}

const activeConfig = getStoredFirebaseConfig();

const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(activeConfig);
// CRITICAL: Must pass firestoreDatabaseId if provided in config, otherwise named db won't connect
const db: Firestore = getFirestore(app, activeConfig.firestoreDatabaseId || firebaseConfig.firestoreDatabaseId);
const auth: Auth = getAuth(app);
const isConfigured = true;

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Validate connection to Firestore on boot (per skill requirement)
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('the client is offline')) {
      console.warn('Firebase client is offline. Please check network/Firebase configuration.');
      return false;
    }
    // Any other status (including permission or exists) confirms reachability
    return true;
  }
}

// Auto test on initial load
testFirestoreConnection().catch(() => {});

export { app, auth, db, isConfigured, googleProvider };
