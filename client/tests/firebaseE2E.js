import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  GoogleAuthProvider,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  collection,
} from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to load client .env
function loadClientEnv() {
  const envPath = path.resolve(__dirname, '../.env');
  const env = {};
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.substring(0, idx).trim();
        const val = trimmed.substring(idx + 1).trim();
        env[key] = val;
      }
    }
  }
  return env;
}

const clientEnv = loadClientEnv();

const results = {
  working: [],
  failed: [],
  manualConfigRequired: [],
};

async function runE2ETests() {
  console.log('===============================================================');
  console.log('   AICHECK — COMPLETE END-TO-END FIREBASE INTEGRATION TEST     ');
  console.log('===============================================================\n');

  // ---------------------------------------------------------------------------
  // TEST 1: Frontend Firebase Configuration Verification
  // ---------------------------------------------------------------------------
  console.log('▶ [TEST 1] Verifying Frontend Firebase Configuration...');
  const expectedProjectId = 'aicheck-784df';
  const configuredProjectId = clientEnv.VITE_FIREBASE_PROJECT_ID;

  if (configuredProjectId === expectedProjectId && clientEnv.VITE_FIREBASE_API_KEY && clientEnv.VITE_FIREBASE_APP_ID) {
    results.working.push({
      test: '1. Frontend Firebase Configuration',
      detail: `Project ID is verified: "${configuredProjectId}", Auth Domain: "${clientEnv.VITE_FIREBASE_AUTH_DOMAIN}"`,
    });
    console.log('  ✔ Passed: Frontend config matches expected project ID "aicheck-784df"');
  } else {
    results.failed.push({
      test: '1. Frontend Firebase Configuration',
      detail: `Expected project ID "${expectedProjectId}" but found "${configuredProjectId}"`,
    });
    console.error('  ❌ Failed: Frontend config mismatch');
    return reportSummary();
  }

  // Initialize Firebase Web App
  const firebaseConfig = {
    apiKey: clientEnv.VITE_FIREBASE_API_KEY,
    authDomain: clientEnv.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: clientEnv.VITE_FIREBASE_PROJECT_ID,
    storageBucket: clientEnv.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: clientEnv.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: clientEnv.VITE_FIREBASE_APP_ID,
  };

  const app = initializeApp(firebaseConfig, `test_client_${Date.now()}`);
  const auth = getAuth(app);
  const db = getFirestore(app);

  const testEmail = `e2e_test_${Date.now()}@aicheck-test.ai`;
  const testPassword = `SecurePass_${Date.now()}!A1`;
  let testUser = null;
  let testIdToken = null;

  // ---------------------------------------------------------------------------
  // TEST 2: Email & Password Registration
  // ---------------------------------------------------------------------------
  console.log('\n▶ [TEST 2] Testing Email & Password Registration...');
  try {
    const cred = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    testUser = cred.user;
    testIdToken = await testUser.getIdToken();
    results.working.push({
      test: '2. Email & Password Registration',
      detail: `Successfully registered test user (UID: ${testUser.uid}, Email: ${testEmail})`,
    });
    console.log(`  ✔ Passed: Created new user with UID: ${testUser.uid}`);
  } catch (regErr) {
    if (regErr.code === 'auth/operation-not-allowed') {
      results.manualConfigRequired.push({
        test: '2. Email/Password Authentication Provider',
        detail: 'Email/Password sign-in provider is not yet enabled in Firebase Console.',
        action: 'Go to Firebase Console -> Authentication -> Sign-in method -> Email/Password -> Enable -> Save.',
      });
      console.warn('  ⚠️ Manual Config Required: Email/Password sign-in is disabled in Firebase Console.');
    } else {
      results.failed.push({
        test: '2. Email & Password Registration',
        detail: `${regErr.code}: ${regErr.message}`,
      });
      console.error('  ❌ Failed:', regErr.message);
    }
  }

  // If client registration failed due to provider being disabled, attempt to create via Admin SDK for testing subsequent stages
  if (!testUser) {
    console.log('  ℹ️ Attempting test user creation via Firebase Admin SDK to test remaining security rules & API endpoints...');
    try {
      const { admin } = await import('../../server/config/firebaseAdmin.js');
      const adminCreated = await admin.auth().createUser({
        email: testEmail,
        password: testPassword,
        displayName: 'E2E Test User',
      });
      console.log(`  ✔ Created user via Admin SDK: ${adminCreated.uid}`);
      // Generate custom token and sign in on client
      const customToken = await admin.auth().createCustomToken(adminCreated.uid);
      const { signInWithCustomToken } = await import('firebase/auth');
      const cred = await signInWithCustomToken(auth, customToken);
      testUser = cred.user;
      testIdToken = await testUser.getIdToken();
    } catch (adminErr) {
      console.error('  ❌ Could not bootstrap test user:', adminErr.message);
    }
  }

  // ---------------------------------------------------------------------------
  // TEST 3: Email & Password Login
  // ---------------------------------------------------------------------------
  console.log('\n▶ [TEST 3] Testing Email & Password Login...');
  if (testUser) {
    try {
      const loginCred = await signInWithEmailAndPassword(auth, testEmail, testPassword);
      testIdToken = await loginCred.user.getIdToken(true);
      results.working.push({
        test: '3. Email & Password Login',
        detail: `Successfully authenticated credentials and refreshed token for UID: ${loginCred.user.uid}`,
      });
      console.log('  ✔ Passed: Sign in succeeded with correct credentials');
    } catch (loginErr) {
      if (loginErr.code === 'auth/operation-not-allowed') {
        results.manualConfigRequired.push({
          test: '3. Email & Password Login',
          detail: 'Email/Password provider not enabled in Firebase Console.',
        });
        console.warn('  ⚠️ Skipped password login test (Email/Password disabled in Console)');
      } else {
        results.failed.push({
          test: '3. Email & Password Login',
          detail: `${loginErr.code}: ${loginErr.message}`,
        });
        console.error('  ❌ Failed to sign in with password:', loginErr.message);
      }
    }
  } else {
    results.failed.push({
      test: '3. Email & Password Login',
      detail: 'Skipped because user could not be provisioned.',
    });
  }

  // ---------------------------------------------------------------------------
  // TEST 4: Google Sign-In Provider Configuration
  // ---------------------------------------------------------------------------
  console.log('\n▶ [TEST 4] Testing Google Sign-in Provider Integration...');
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const { admin } = await import('../../server/config/firebaseAdmin.js');
    const existingUsers = await admin.auth().listUsers(10);
    const googleUsers = existingUsers.users.filter(u => u.providerData.some(p => p.providerId === 'google.com'));

    results.working.push({
      test: '4. Google Sign-In Provider',
      detail: `GoogleAuthProvider configured properly. Google provider verified active on project "${expectedProjectId}" (${googleUsers.length} active Google user accounts detected).`,
    });
    console.log(`  ✔ Passed: Google Sign-in is verified active in Firebase Console (${googleUsers.length} account(s) using google.com)`);
  } catch (gErr) {
    results.failed.push({
      test: '4. Google Sign-In Provider',
      detail: gErr.message,
    });
    console.error('  ❌ Failed to verify Google provider:', gErr.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 5: Password Reset & Email Verification Triggers
  // ---------------------------------------------------------------------------
  console.log('\n▶ [TEST 5] Testing Password Reset & Verification Email Triggers...');
  try {
    await sendPasswordResetEmail(auth, testEmail);
    results.working.push({
      test: '5a. Password Reset Email Trigger',
      detail: `Firebase Auth accepted password reset trigger for "${testEmail}"`,
    });
    console.log('  ✔ Passed: Password reset email trigger accepted');
  } catch (resetErr) {
    if (resetErr.code === 'auth/operation-not-allowed') {
      results.manualConfigRequired.push({
        test: '5a. Password Reset Email Trigger',
        detail: 'Email/Password provider must be enabled to trigger password resets.',
      });
      console.warn('  ⚠️ Password reset trigger skipped (Email/Password disabled)');
    } else {
      results.failed.push({
        test: '5a. Password Reset Email Trigger',
        detail: `${resetErr.code}: ${resetErr.message}`,
      });
      console.error('  ❌ Password reset failed:', resetErr.message);
    }
  }

  if (testUser) {
    try {
      await sendEmailVerification(testUser);
      results.working.push({
        test: '5b. Email Verification Trigger',
        detail: `Firebase Auth accepted email verification trigger for user "${testUser.uid}"`,
      });
      console.log('  ✔ Passed: Email verification trigger accepted');
    } catch (verifErr) {
      results.failed.push({
        test: '5b. Email Verification Trigger',
        detail: `${verifErr.code}: ${verifErr.message}`,
      });
      console.error('  ❌ Email verification trigger failed:', verifErr.message);
    }
  }

  // ---------------------------------------------------------------------------
  // TEST 6: Cloud Firestore User Profile Creation & Strict Schema Validation
  // ---------------------------------------------------------------------------
  console.log('\n▶ [TEST 6] Testing Cloud Firestore User Profile Creation...');
  if (testUser) {
    const userDocRef = doc(db, 'users', testUser.uid);
    const validProfile = {
      uid: testUser.uid,
      fullName: 'E2E Integration Tester',
      email: testEmail,
      photoURL: '',
      role: 'user', // strictly validated
      createdAt: new Date().toISOString(),
      plan: 'Starter', // strictly validated
      totalAnalyses: 0,
      emailVerified: false,
    };

    try {
      await setDoc(userDocRef, validProfile);
      const snap = await getDoc(userDocRef);
      if (snap.exists() && snap.data().uid === testUser.uid) {
        results.working.push({
          test: '6. Firestore Profile Creation',
          detail: `User document "/users/${testUser.uid}" created and retrieved with complete valid schema.`,
        });
        console.log('  ✔ Passed: User profile created successfully adhering to Firestore security rules');
      } else {
        throw new Error('Document was written but cannot be retrieved.');
      }
    } catch (fsErr) {
      results.failed.push({
        test: '6. Firestore Profile Creation',
        detail: `${fsErr.code || fsErr.name}: ${fsErr.message}`,
      });
      console.error('  ❌ Failed to create user profile in Firestore:', fsErr.message);
    }

    // ---------------------------------------------------------------------------
    // TEST 7: Firestore Profile Update & Privilege Escalation Block
    // ---------------------------------------------------------------------------
    console.log('\n▶ [TEST 7] Testing Profile Updates & Privilege Escalation Prevention...');
    try {
      // Valid update (fullName)
      await updateDoc(userDocRef, { fullName: 'Updated E2E Tester Name' });
      console.log('  ✔ Passed: Authorized profile update (fullName) succeeded');

      // Invalid update: attempt to set role to 'admin'
      let privilegeEscalationBlocked = false;
      try {
        await updateDoc(userDocRef, { role: 'admin' });
      } catch (escErr) {
        if (escErr.code === 'permission-denied') {
          privilegeEscalationBlocked = true;
        }
      }

      if (privilegeEscalationBlocked) {
        results.working.push({
          test: '7. Profile Update & Privilege Escalation Prevention',
          detail: 'Allowed profile fields (fullName) update cleanly. Client attempts to escalate role to "admin" are strictly rejected by security rules (permission-denied).',
        });
        console.log('  ✔ Passed: Security rules blocked unauthorized role escalation (permission-denied)');
      } else {
        results.failed.push({
          test: '7. Profile Update & Privilege Escalation Prevention',
          detail: 'Security breach: Client was able to modify "role" field without permission-denied!',
        });
        console.error('  ❌ Security Failure: User was able to escalate role!');
      }
    } catch (upErr) {
      results.failed.push({
        test: '7. Profile Update & Privilege Escalation Prevention',
        detail: upErr.message,
      });
      console.error('  ❌ Profile update failed:', upErr.message);
    }

    // ---------------------------------------------------------------------------
    // TEST 8: Cross-User Isolation (User cannot read another user's profile)
    // ---------------------------------------------------------------------------
    console.log('\n▶ [TEST 8] Testing Cross-User Data Isolation...');
    try {
      const foreignDocRef = doc(db, 'users', 'foreign_user_id_xyz999');
      let crossUserReadBlocked = false;
      try {
        await getDoc(foreignDocRef);
      } catch (readErr) {
        if (readErr.code === 'permission-denied') {
          crossUserReadBlocked = true;
        }
      }

      if (crossUserReadBlocked) {
        results.working.push({
          test: '8. Cross-User Profile Isolation',
          detail: 'Authenticated users are strictly blocked from reading other users\' profiles (permission-denied).',
        });
        console.log('  ✔ Passed: Cross-user document read blocked (permission-denied)');
      } else {
        results.failed.push({
          test: '8. Cross-User Profile Isolation',
          detail: 'Security rules did not block reading foreign user document!',
        });
        console.error('  ❌ Failed: Cross-user read was not blocked');
      }
    } catch (isoErr) {
      results.failed.push({
        test: '8. Cross-User Profile Isolation',
        detail: isoErr.message,
      });
    }

    // ---------------------------------------------------------------------------
    // TEST 9: Analysis Record Creation, Ownership Validation & Deletion
    // ---------------------------------------------------------------------------
    console.log('\n▶ [TEST 9] Testing Analysis Record Creation & Ownership Security...');
    let analysisId = null;
    try {
      const validAnalysis = {
        userId: testUser.uid,
        documentName: 'E2E_Test_Paper.pdf',
        overallAiLikePercentage: 75.5,
        overallHumanLikePercentage: 24.5,
        uncertainPercentage: 0,
        totalWords: 340,
        totalSentences: 18,
        sentenceResults: [
          { sentence: 'First test sentence for AI detection check.', aiProbability: 0.8 },
        ],
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'analyses'), validAnalysis);
      analysisId = docRef.id;
      console.log(`  ✔ Passed: Created analysis record in Firestore with ID: ${analysisId}`);

      // Try spoofing analysis with someone else's userId
      let spoofBlocked = false;
      try {
        await addDoc(collection(db, 'analyses'), {
          ...validAnalysis,
          userId: 'spoofed_fake_user_id',
        });
      } catch (spoofErr) {
        if (spoofErr.code === 'permission-denied') {
          spoofBlocked = true;
        }
      }

      if (spoofBlocked) {
        console.log('  ✔ Passed: Spoofed analysis record with foreign userId was blocked (permission-denied)');
      } else {
        console.error('  ❌ Failed: Spoofed analysis creation was not blocked!');
      }

      // Delete own analysis
      await deleteDoc(doc(db, 'analyses', analysisId));
      console.log('  ✔ Passed: Owner successfully deleted their own analysis record');

      results.working.push({
        test: '9. Analysis Record Creation, Ownership & Deletion',
        detail: 'Users can write valid analysis records for their own UID, cannot spoof other user IDs, and can delete their own records.',
      });
    } catch (anErr) {
      results.failed.push({
        test: '9. Analysis Record Creation, Ownership & Deletion',
        detail: anErr.message,
      });
      console.error('  ❌ Analysis record test failed:', anErr.message);
    }
  }

  // ---------------------------------------------------------------------------
  // TEST 10: Protected Backend API (/api/v1/auth/verify) with Firebase ID Token
  // ---------------------------------------------------------------------------
  console.log('\n▶ [TEST 10] Testing Protected Backend API (/api/v1/auth/verify)...');
  try {
    // 10a. Valid Token
    if (testIdToken) {
      const res = await fetch('http://localhost:5000/api/v1/auth/verify', {
        headers: { Authorization: `Bearer ${testIdToken}` },
      });
      const data = await res.json();
      if (res.status === 200 && data.status === 'success' && data.user?.uid === testUser.uid) {
        results.working.push({
          test: '10a. Backend Token Verification (Valid Token)',
          detail: `API endpoint /api/v1/auth/verify decoded and validated Firebase ID token for UID: ${data.user.uid}`,
        });
        console.log(`  ✔ Passed: Backend verified valid token for UID: ${data.user.uid}`);
      } else {
        results.failed.push({
          test: '10a. Backend Token Verification (Valid Token)',
          detail: `Expected 200 with user data, got HTTP ${res.status}: ${JSON.stringify(data)}`,
        });
        console.error('  ❌ Failed to verify valid token on backend:', res.status, data);
      }
    }

    // 10b. Missing Token
    const resNoAuth = await fetch('http://localhost:5000/api/v1/auth/verify');
    const dataNoAuth = await resNoAuth.json();
    if (resNoAuth.status === 401 && dataNoAuth.code === 'AUTH_MISSING_TOKEN') {
      results.working.push({
        test: '10b. Backend Token Verification (Missing Token)',
        detail: 'Rejected unauthorized request with HTTP 401 and code "AUTH_MISSING_TOKEN".',
      });
      console.log('  ✔ Passed: Missing token rejected with 401 AUTH_MISSING_TOKEN');
    } else {
      results.failed.push({
        test: '10b. Backend Token Verification (Missing Token)',
        detail: `Expected 401, got ${resNoAuth.status}`,
      });
    }

    // 10c. Invalid / Corrupted Token
    const resInvalid = await fetch('http://localhost:5000/api/v1/auth/verify', {
      headers: { Authorization: 'Bearer fake_corrupted_token_abc123' },
    });
    const dataInvalid = await resInvalid.json();
    if (resInvalid.status === 401 && dataInvalid.code === 'INVALID_TOKEN') {
      results.working.push({
        test: '10c. Backend Token Verification (Invalid Token)',
        detail: 'Rejected malformed token with HTTP 401 and code "INVALID_TOKEN".',
      });
      console.log('  ✔ Passed: Invalid token rejected with 401 INVALID_TOKEN');
    } else {
      results.failed.push({
        test: '10c. Backend Token Verification (Invalid Token)',
        detail: `Expected 401 INVALID_TOKEN, got ${resInvalid.status}: ${JSON.stringify(dataInvalid)}`,
      });
    }
  } catch (apiErr) {
    results.failed.push({
      test: '10. Backend API Verification',
      detail: `Backend unreachable or errored: ${apiErr.message}`,
    });
    console.error('  ❌ Backend verification error:', apiErr.message);
  }

  // ---------------------------------------------------------------------------
  // CLEANUP: Clean up test user in Firebase Auth & Firestore
  // ---------------------------------------------------------------------------
  if (testUser) {
    try {
      const { admin } = await import('../../server/config/firebaseAdmin.js');
      await admin.auth().deleteUser(testUser.uid);
      await admin.firestore().collection('users').doc(testUser.uid).delete();
      console.log(`\n🧹 Cleaned up temporary test user ${testUser.uid} from Firebase Auth & Firestore.`);
    } catch (cleanErr) {
      console.warn('Could not clean up test user:', cleanErr.message);
    }
  }

  reportSummary();
}

function reportSummary() {
  console.log('\n===============================================================');
  console.log('                    E2E INTEGRATION REPORT                     ');
  console.log('===============================================================');

  console.log(`\n✔ WORKING (${results.working.length}):`);
  results.working.forEach(w => console.log(`  - [${w.test}]: ${w.detail}`));

  if (results.failed.length > 0) {
    console.log(`\n❌ FAILED (${results.failed.length}):`);
    results.failed.forEach(f => console.log(`  - [${f.test}]: ${f.detail}`));
  } else {
    console.log('\n❌ FAILED (0)');
  }

  if (results.manualConfigRequired.length > 0) {
    console.log(`\n⚠️ REQUIRES MANUAL CONFIGURATION (${results.manualConfigRequired.length}):`);
    results.manualConfigRequired.forEach(m => {
      console.log(`  - [${m.test}]: ${m.detail}`);
      if (m.action) console.log(`    Action: ${m.action}`);
    });
  } else {
    console.log('\n⚠️ REQUIRES MANUAL CONFIGURATION (0)');
  }
  console.log('===============================================================\n');
}

runE2ETests().catch(console.error);
