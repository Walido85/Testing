import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import configJson from '../firebase-applet-config.json';

const firebaseConfig = configJson as any;

// Initialize Firebase with singleton pattern
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore safely for both SSR and Browser
export const db = (() => {
  // Server-side: persistence is not supported
  if (typeof window === 'undefined') {
    return getFirestore(app);
  }

  // Browser-side: attempt to use persistence
  try {
    // Check if we already have an initialized instance to avoid "already called" error
    return initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    });
  } catch (e) {
    // Fallback if initializeFirestore fails or was already called
    return getFirestore(app);
  }
})();

// Initialize Auth
export const auth = getAuth(app);
