import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

export const EXPECTED_PROJECT_ID = 'aicheck-784df';

/**
 * Trims whitespace and removes any surrounding single/double quotes
 * (commonly introduced when copying and pasting into hosting provider dashboards)
 */
const cleanEnv = (val) => {
  if (!val || typeof val !== 'string') return '';
  return val.trim().replace(/^["']|["']$/g, '');
};

export const firebaseConfig = {
  apiKey: cleanEnv(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: cleanEnv(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: cleanEnv(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: cleanEnv(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: cleanEnv(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: cleanEnv(import.meta.env.VITE_FIREBASE_APP_ID),
  ...(cleanEnv(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) && {
    measurementId: cleanEnv(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID),
  }),
};

/**
 * Validate that required Firebase client configuration keys are present and not default placeholders.
 * Note: These are public Web SDK keys, NOT server-side admin service account credentials.
 */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== 'your_firebase_api_key_here' &&
  !firebaseConfig.apiKey.includes('your_') &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== 'your_project_id' &&
  !firebaseConfig.projectId.includes('your_') &&
  firebaseConfig.appId &&
  firebaseConfig.appId !== 'your_app_id' &&
  !firebaseConfig.appId.includes('your_')
);

export function getFirebaseConfigStatus() {
  const missing = [];
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes('your_')) missing.push('VITE_FIREBASE_API_KEY');
  if (!firebaseConfig.authDomain || firebaseConfig.authDomain.includes('your_')) missing.push('VITE_FIREBASE_AUTH_DOMAIN');
  if (!firebaseConfig.projectId || firebaseConfig.projectId.includes('your_')) missing.push('VITE_FIREBASE_PROJECT_ID');
  if (!firebaseConfig.appId || firebaseConfig.appId.includes('your_')) missing.push('VITE_FIREBASE_APP_ID');

  const isProjectAligned = firebaseConfig.projectId === EXPECTED_PROJECT_ID;

  return {
    isConfigured: isFirebaseConfigured,
    projectId: firebaseConfig.projectId || null,
    isProjectAligned,
    missingVariables: missing,
  };
}

let app;
let auth;
let db;
let storage;
let googleProvider;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });

    if (firebaseConfig.projectId !== EXPECTED_PROJECT_ID) {
      console.warn(
        `⚠️ Warning: Firebase Web configuration projectId ("${firebaseConfig.projectId}") does not match expected "${EXPECTED_PROJECT_ID}".`
      );
    } else {
      console.log(`✅ Firebase Web SDK initialized for project: ${EXPECTED_PROJECT_ID}`);
    }
  } catch (error) {
    console.error('Failed to initialize Firebase Web SDK:', error);
  }
} else {
  const status = getFirebaseConfigStatus();
  console.warn(
    `⚠️ Firebase Web SDK is not configured. Missing required variables: [${status.missingVariables.join(', ')}]. ` +
    `Configure these in your environment (client/.env locally or Vercel Project Settings > Environment Variables in production).`
  );
}

export { app, auth, db, storage, googleProvider };

export default {
  app,
  auth,
  db,
  storage,
  googleProvider,
  firebaseConfig,
  isFirebaseConfigured,
  getFirebaseConfigStatus,
  EXPECTED_PROJECT_ID,
};
