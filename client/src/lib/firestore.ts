// client/src/lib/firestore.ts

import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// This configuration is for local development and uses variables
// from your.env.local file. Vite's `import.meta.env` provides these
// variables during development.[1]
const localFirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// This configuration is generated by the build script for production
// and will not exist during local development. We handle this by
// checking if the import exists.
let productionFirebaseConfig;
try {
  const { firebaseConfig } = await import('./firebase-config');
  productionFirebaseConfig = firebaseConfig;
} catch (e) {
  productionFirebaseConfig = null;
}

// Vite's `import.meta.env.DEV` is true when running `npm run dev`
// and false when running `npm run build`. We use the appropriate
// config based on the environment.[1]
const app = initializeApp(import.meta.env.DEV? localFirebaseConfig : productionFirebaseConfig);

// Initialize and export the Firebase services so they can be
// imported in other files.[2]
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

// Conditionally connect to the local emulators only when in development mode.
// This allows for local testing without affecting production data.[3, 4]
if (import.meta.env.DEV) {
  console.log('Development mode: Connecting to Firebase Emulators...');
  
  // Default emulator ports
  connectAuthEmulator(auth, 'http://127.0.0.1:9099');
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  connectFunctionsEmulator(functions, '127.0.0.1', 5001);
}