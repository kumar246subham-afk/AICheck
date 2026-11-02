import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXPECTED_PROJECT_ID = 'aicheck-784df';

let isFirebaseAdminInitialized = false;
let activeProjectId = null;

/**
 * Initialize Firebase Admin SDK using the most secure available credential source:
 * 1. FIREBASE_SERVICE_ACCOUNT_KEY (Base64 or JSON string, best for Render / cloud PaaS)
 * 2. FIREBASE_SERVICE_ACCOUNT_PATH or local config/serviceAccountKey.json
 * 3. Individual Environment Variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)
 */
function initFirebaseAdmin() {
  if (admin.apps.length > 0) {
    isFirebaseAdminInitialized = true;
    return admin.app();
  }

  try {
    let credential = null;
    let credentialSource = '';

    // 1. Cloud / Render Environment Variable: JSON or Base64 string
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      let rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim();
      if (!rawJson.startsWith('{')) {
        // Assume Base64 encoded JSON
        rawJson = Buffer.from(rawJson, 'base64').toString('utf8');
      }
      const parsed = JSON.parse(rawJson);
      credential = admin.credential.cert(parsed);
      activeProjectId = parsed.project_id;
      credentialSource = 'FIREBASE_SERVICE_ACCOUNT_KEY env variable';
    }

    // 2. Cloud Secret File (Render /etc/secrets/serviceAccountKey.json) or Local Service Account JSON file
    if (!credential) {
      const candidatePaths = [
        process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
        '/etc/secrets/serviceAccountKey.json',
        path.join(__dirname, 'serviceAccountKey.json'),
      ].filter(Boolean);

      for (const candidate of candidatePaths) {
        if (fs.existsSync(candidate)) {
          const fileContent = JSON.parse(fs.readFileSync(candidate, 'utf8'));
          credential = admin.credential.cert(fileContent);
          activeProjectId = fileContent.project_id;
          credentialSource = `file (${candidate.includes('secrets') ? 'Render Secret File' : path.basename(candidate)})`;
          break;
        }
      }
    }

    // 3. Individual Environment Variables
    if (!credential && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      credential = admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      });
      activeProjectId = process.env.FIREBASE_PROJECT_ID;
      credentialSource = 'individual environment variables';
    }

    if (credential) {
      admin.initializeApp({
        credential,
        projectId: activeProjectId || EXPECTED_PROJECT_ID,
      });

      // Verify Project ID alignment
      if (activeProjectId && activeProjectId !== EXPECTED_PROJECT_ID) {
        console.warn(`⚠️ Warning: Service account project ID (${activeProjectId}) does not match expected (${EXPECTED_PROJECT_ID}).`);
      } else {
        console.log(`✅ Firebase Admin SDK initialized successfully for project: ${activeProjectId || EXPECTED_PROJECT_ID} [via ${credentialSource}]`);
      }

      isFirebaseAdminInitialized = true;
    } else {
      console.warn('⚠️ Firebase Admin SDK: No credentials found. Running in Development Open-Auth mode.');
    }
  } catch (err) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', err.message);
    isFirebaseAdminInitialized = false;
  }

  return isFirebaseAdminInitialized ? admin.app() : null;
}

initFirebaseAdmin();

export const auth = isFirebaseAdminInitialized ? admin.auth() : null;
export const db = isFirebaseAdminInitialized ? admin.firestore() : null;
export { admin, isFirebaseAdminInitialized, activeProjectId, EXPECTED_PROJECT_ID };
export { verifyAuthToken, requireAdminRole, optionalAuthToken } from '../middleware/authMiddleware.js';

export default {
  admin,
  auth,
  db,
  isFirebaseAdminInitialized,
  activeProjectId,
  EXPECTED_PROJECT_ID,
};
