import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseEnv = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const placeholderPatterns = [
  /^AIzaSyDummy/,
  /YOUR_FIREBASE_API_KEY/i,
  /your-app/i,
  /your-app-id/i,
  /1234567890:web:abcdef/i,
];

export function getFirebaseConfigIssues() {
  const missing = [];
  const invalid = [];

  for (const [key, value] of Object.entries(firebaseEnv)) {
    const normalized = String(value || "").trim();
    if (!normalized) {
      missing.push(key);
      continue;
    }
    if (placeholderPatterns.some((pattern) => pattern.test(normalized))) {
      invalid.push(key);
    }
  }

  return { missing, invalid };
}

export function isFirebaseConfigured() {
  const { missing, invalid } = getFirebaseConfigIssues();
  return missing.length === 0 && invalid.length === 0;
}

const { missing, invalid } = getFirebaseConfigIssues();

if (import.meta.env.PROD && (missing.length > 0 || invalid.length > 0)) {
  console.error(
    "Firebase config is incomplete for production.",
    { missing, invalid }
  );
} else if (missing.length > 0 || invalid.length > 0) {
  console.warn(
    "Firebase config is incomplete. Set all VITE_FIREBASE_* values in frontend/.env",
    { missing, invalid }
  );
}

const firebaseConfig = {
  apiKey: firebaseEnv.apiKey || "",
  authDomain: firebaseEnv.authDomain || "",
  projectId: firebaseEnv.projectId || "",
  storageBucket: firebaseEnv.storageBucket || "",
  messagingSenderId: firebaseEnv.messagingSenderId || "",
  appId: firebaseEnv.appId || "",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });
