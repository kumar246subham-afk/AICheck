import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const EXPECTED_PROJECT_ID = 'aicheck-784df';

export let isFirebaseAdminInitialized = false;
export let activeProjectId = null;
export let activeClientEmail = null;
export let activeCredentialSource = null;
export let activeCredentialPath = null;

/**
 * Candidate secret paths evaluated in priority order.
 * Render mounts uploaded Secret Files under /etc/secrets/.
 * Prefers /etc/secrets/serviceAccountKey.json if present.
 */
export const CANDIDATE_SECRET_PATHS = [
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
  '/etc/secrets/serviceAccountKey.json',
  '/etc/secrets/aicheck-784df-firebase-adminsdk-fbsvc-e5a47a4007.json',
  path.join(__dirname, 'serviceAccountKey.json'),
  path.join(__dirname, 'aicheck-784df-firebase-adminsdk-fbsvc-e5a47a4007.json'),
].filter(Boolean);

/**
 * Validate service account credential structure without exposing sensitive private key details
 * @param {object} parsed 
 * @param {string} source 
 * @returns {boolean}
 */
export function validateServiceAccount(parsed, source = 'file') {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(`Invalid service account credential from ${source}: payload is not a valid JSON object.`);
  }

  // 1. Verify Project ID matches aicheck-784df
  if (!parsed.project_id || typeof parsed.project_id !== 'string') {
    throw new Error(`Invalid service account credential from ${source}: missing "project_id".`);
  }
  if (parsed.project_id !== EXPECTED_PROJECT_ID) {
    throw new Error(`Security mismatch: Service account project_id "${parsed.project_id}" does not match required "${EXPECTED_PROJECT_ID}".`);
  }

  // 2. Validate client_email
  if (!parsed.client_email || typeof parsed.client_email !== 'string' || !parsed.client_email.includes('@')) {
    throw new Error(`Invalid service account credential from ${source}: missing or malformed "client_email".`);
  }

  // 3. Validate private_key (ensures non-empty valid RSA key without printing contents)
  if (!parsed.private_key || typeof parsed.private_key !== 'string' || !parsed.private_key.includes('PRIVATE KEY')) {
    throw new Error(`Invalid service account credential from ${source}: missing or malformed "private_key".`);
  }

  return true;
}

/**
 * Initialize Firebase Admin SDK using the most secure available credential source:
 * 1. Render Secret Files or local file (prefers /etc/secrets/serviceAccountKey.json)
 * 2. FIREBASE_SERVICE_ACCOUNT_KEY (Base64 or JSON string in environment variable)
 * 3. Individual Environment Variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)
 * 
 * Fails securely in production if credentials are missing or invalid (no open-auth mode in prod).
 */
export function initFirebaseAdmin() {
  if (admin.apps.length > 0) {
    isFirebaseAdminInitialized = true;
    return admin.app();
  }

  try {
    let credential = null;

    // 1. Check Candidate Secret Files (Render Secret Files & local dev files)
    for (const candidate of CANDIDATE_SECRET_PATHS) {
      if (fs.existsSync(candidate)) {
        try {
          const rawContent = fs.readFileSync(candidate, 'utf8');
          const parsed = JSON.parse(rawContent);

          // Strictly validate project ID and key format
          validateServiceAccount(parsed, candidate);

          credential = admin.credential.cert(parsed);
          activeProjectId = parsed.project_id;
          activeClientEmail = parsed.client_email;
          activeCredentialPath = candidate;
          activeCredentialSource = candidate.startsWith('/etc/secrets')
            ? `Render Secret File (/etc/secrets/${path.basename(candidate)})`
            : `local file (${path.basename(candidate)})`;

          break; // Stop at first valid candidate (prefers /etc/secrets/serviceAccountKey.json)
        } catch (fileErr) {
          console.error(`⚠️ Could not use credential candidate ${candidate}: ${fileErr.message}`);
        }
      }
    }

    // 2. Fallback: Cloud / PaaS Environment Variable (JSON or Base64 string)
    if (!credential && process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      try {
        let rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim();
        if (!rawJson.startsWith('{')) {
          rawJson = Buffer.from(rawJson, 'base64').toString('utf8');
        }
        const parsed = JSON.parse(rawJson);
        validateServiceAccount(parsed, 'FIREBASE_SERVICE_ACCOUNT_KEY env variable');

        credential = admin.credential.cert(parsed);
        activeProjectId = parsed.project_id;
        activeClientEmail = parsed.client_email;
        activeCredentialSource = 'FIREBASE_SERVICE_ACCOUNT_KEY env variable';
      } catch (envErr) {
        console.error('⚠️ Could not parse FIREBASE_SERVICE_ACCOUNT_KEY:', envErr.message);
      }
    }

    // 3. Fallback: Individual Environment Variables
    if (!credential && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      try {
        const parsed = {
          project_id: process.env.FIREBASE_PROJECT_ID,
          client_email: process.env.FIREBASE_CLIENT_EMAIL,
          private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        };
        validateServiceAccount(parsed, 'individual environment variables');

        credential = admin.credential.cert(parsed);
        activeProjectId = parsed.project_id;
        activeClientEmail = parsed.client_email;
        activeCredentialSource = 'individual environment variables';
      } catch (indivErr) {
        console.error('⚠️ Could not use individual Firebase environment variables:', indivErr.message);
      }
    }

    if (credential) {
      admin.initializeApp({
        credential,
        projectId: EXPECTED_PROJECT_ID,
      });

      console.log(`✅ Firebase Admin SDK initialized successfully for project: ${EXPECTED_PROJECT_ID} [via ${activeCredentialSource}]`);
      console.log(`🔒 Authenticated Service Account: ${activeClientEmail}`);
      isFirebaseAdminInitialized = true;
    } else {
      isFirebaseAdminInitialized = false;

      // STRICT SECURITY: Fail fast and halt startup in production
      if (process.env.NODE_ENV === 'production') {
        const fatalMsg = 'FATAL SECURITY MISCONFIGURATION: No valid Firebase Admin SDK credentials found in production. Evaluated candidate paths including /etc/secrets/serviceAccountKey.json and /etc/secrets/aicheck-784df-firebase-adminsdk-fbsvc-e5a47a4007.json. Server will not run in unauthenticated or open-auth mode in production.';
        console.error(`❌ ${fatalMsg}`);
        throw new Error(fatalMsg);
      } else {
        console.warn('⚠️ Firebase Admin SDK: No credentials found. Running in Development Open-Auth mode.');
      }
    }
  } catch (err) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', err.message);
    isFirebaseAdminInitialized = false;
    if (process.env.NODE_ENV === 'production') {
      throw err;
    }
  }

  return isFirebaseAdminInitialized ? admin.app() : null;
}

initFirebaseAdmin();

export const auth = isFirebaseAdminInitialized ? admin.auth() : null;
export const db = isFirebaseAdminInitialized ? admin.firestore() : null;
export { admin };
export { verifyAuthToken, requireAdminRole, optionalAuthToken } from '../middleware/authMiddleware.js';

export default {
  admin,
  auth,
  db,
  isFirebaseAdminInitialized,
  activeProjectId,
  activeClientEmail,
  activeCredentialSource,
  activeCredentialPath,
  EXPECTED_PROJECT_ID,
  validateServiceAccount,
  initFirebaseAdmin,
  CANDIDATE_SECRET_PATHS,
};
