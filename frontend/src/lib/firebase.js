import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const isPlaceholder =
  !apiKey ||
  apiKey.startsWith("AIzaSyDummy") ||
  apiKey.includes("YOUR_FIREBASE_API_KEY");

if (isPlaceholder && import.meta.env.PROD) {
  console.error(
    "Firebase is not configured for production. Set VITE_FIREBASE_* build args when building the frontend Docker image."
  );
} else if (isPlaceholder) {
  console.warn(
    "Firebase API Key is missing or using placeholder. Set VITE_FIREBASE_API_KEY in frontend/.env"
  );
}

const firebaseConfig = {
  apiKey: apiKey || "AIzaSyDummyKeyForLocalDev_1234567890",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "chattx-app.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "chattx-app",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "chattx-app.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1234567890:web:abcdef123456",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
