import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// This configuration now uses the NEXT_PUBLIC_ prefixed environment variables
const firebaseConfig = {
  apiKey: import.meta.env.NEXT_PUBLIC_VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.NEXT_PUBLIC_VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.NEXT_PUBLIC_VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.NEXT_PUBLIC_VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.NEXT_PUBLIC_VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.NEXT_PUBLIC_VITE_FIREBASE_APP_ID,
};

// Validate that all required environment variables are set
if (
  !firebaseConfig.apiKey ||
  !firebaseConfig.projectId ||
  !firebaseConfig.appId
) {
  throw new Error(
    "Missing required Firebase configuration. Please set NEXT_PUBLIC_VITE_FIREBASE_API_KEY, NEXT_PUBLIC_VITE_FIREBASE_PROJECT_ID, and NEXT_PUBLIC_VITE_FIREBASE_APP_ID environment variables."
  );
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };