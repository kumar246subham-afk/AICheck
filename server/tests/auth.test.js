import test from 'node:test';
import assert from 'node:assert';
import {
  admin,
  isFirebaseAdminInitialized,
  activeProjectId,
  activeClientEmail,
  EXPECTED_PROJECT_ID,
  validateServiceAccount,
  CANDIDATE_SECRET_PATHS,
} from '../config/firebaseAdmin.js';
import { verifyAuthToken, optionalAuthToken, requireAdminRole } from '../middleware/authMiddleware.js';

test('Firebase Admin SDK Initialization & Secret Files Configuration', async (t) => {
  await t.test('Admin SDK is initialized with credentials', () => {
    assert.strictEqual(isFirebaseAdminInitialized, true, 'Firebase Admin SDK should be initialized');
    assert.ok(admin.apps.length > 0, 'At least one Firebase app should be active');
  });

  await t.test('Project ID matches expected "aicheck-784df"', () => {
    assert.strictEqual(activeProjectId, EXPECTED_PROJECT_ID, `Project ID must be ${EXPECTED_PROJECT_ID}`);
  });

  await t.test('Client email is verified and associated with project', () => {
    assert.ok(activeClientEmail && activeClientEmail.includes('aicheck-784df'), 'Client email should match project');
  });

  await t.test('Candidate paths include Render Secret Files prioritizing /etc/secrets/serviceAccountKey.json', () => {
    assert.ok(CANDIDATE_SECRET_PATHS.includes('/etc/secrets/serviceAccountKey.json'), 'Must check /etc/secrets/serviceAccountKey.json');
    assert.ok(CANDIDATE_SECRET_PATHS.includes('/etc/secrets/aicheck-784df-firebase-adminsdk-fbsvc-e5a47a4007.json'), 'Must check second Render Secret File');

    // Index of serviceAccountKey.json should come before the secondary filename
    const idxPrimary = CANDIDATE_SECRET_PATHS.indexOf('/etc/secrets/serviceAccountKey.json');
    const idxSecondary = CANDIDATE_SECRET_PATHS.indexOf('/etc/secrets/aicheck-784df-firebase-adminsdk-fbsvc-e5a47a4007.json');
    assert.ok(idxPrimary < idxSecondary, 'Preferred /etc/secrets/serviceAccountKey.json must have higher priority');
  });

  await t.test('validateServiceAccount validates schema and rejects mismatched project_id', () => {
    const validDummy = {
      project_id: 'aicheck-784df',
      client_email: 'test@aicheck-784df.iam.gserviceaccount.com',
      private_key: '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n',
    };
    assert.strictEqual(validateServiceAccount(validDummy, 'test-dummy'), true);

    // Reject incorrect project ID
    assert.throws(() => {
      validateServiceAccount({ ...validDummy, project_id: 'wrong-project' }, 'test');
    }, /Security mismatch/);

    // Reject missing client_email
    assert.throws(() => {
      validateServiceAccount({ ...validDummy, client_email: '' }, 'test');
    }, /missing or malformed "client_email"/);

    // Reject invalid private_key
    assert.throws(() => {
      validateServiceAccount({ ...validDummy, private_key: 'not-a-key' }, 'test');
    }, /missing or malformed "private_key"/);
  });
});

test('Authentication Middleware - verifyAuthToken', async (t) => {
  await t.test('Rejects request with missing Authorization header', async () => {
    let statusCode = null;
    let jsonResponse = null;

    const req = { headers: {} };
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        jsonResponse = data;
        return this;
      },
    };
    let nextCalled = false;

    await verifyAuthToken(req, res, () => { nextCalled = true; });

    assert.strictEqual(nextCalled, false, 'next() should not be called');
    assert.strictEqual(statusCode, 401);
    assert.strictEqual(jsonResponse.code, 'AUTH_MISSING_TOKEN');
  });

  await t.test('Rejects invalid or fake Bearer token', async () => {
    let statusCode = null;
    let jsonResponse = null;

    const req = { headers: { authorization: 'Bearer invalid_fake_token_12345' } };
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        jsonResponse = data;
        return this;
      },
    };
    let nextCalled = false;

    await verifyAuthToken(req, res, () => { nextCalled = true; });

    assert.strictEqual(nextCalled, false, 'next() should not be called');
    assert.strictEqual(statusCode, 401);
    assert.strictEqual(jsonResponse.code, 'INVALID_TOKEN');
  });
});

test('Authentication Middleware - optionalAuthToken', async (t) => {
  await t.test('Passes request through when no token is present, setting user to null', async () => {
    const req = { headers: {} };
    const res = {};
    let nextCalled = false;

    await optionalAuthToken(req, res, () => { nextCalled = true; });

    assert.strictEqual(nextCalled, true, 'next() should be called');
    assert.strictEqual(req.user, null, 'req.user should be null');
  });
});

test('Authorization Middleware - requireAdminRole', async (t) => {
  await t.test('Rejects non-admin user with 403 Forbidden', async () => {
    let statusCode = null;
    let jsonResponse = null;

    const req = { user: { uid: 'regular_user_1', role: 'user' } };
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        jsonResponse = data;
        return this;
      },
    };
    let nextCalled = false;

    await requireAdminRole(req, res, () => { nextCalled = true; });

    assert.strictEqual(nextCalled, false, 'next() should not be called');
    assert.strictEqual(statusCode, 403);
    assert.strictEqual(jsonResponse.code, 'FORBIDDEN_ADMIN_REQUIRED');
  });

  await t.test('Allows user with admin role to proceed', async () => {
    const req = { user: { uid: 'admin_user_1', role: 'admin' } };
    const res = {};
    let nextCalled = false;

    await requireAdminRole(req, res, () => { nextCalled = true; });

    assert.strictEqual(nextCalled, true, 'next() should be called for admin');
  });
});

test('Firebase Admin SDK Live API Integration', async (t) => {
  await t.test('Can query Firebase Auth users list', async () => {
    const listResult = await admin.auth().listUsers(5);
    assert.ok(Array.isArray(listResult.users), 'listUsers should return an array of users');
    console.log(`ℹ️ Live Firebase Auth test: Found ${listResult.users.length} registered user(s).`);
  });

  await t.test('Can query Firestore collections', async () => {
    const collections = await admin.firestore().listCollections();
    assert.ok(Array.isArray(collections), 'listCollections should return an array');
    console.log(`ℹ️ Live Cloud Firestore test: Collections online: [${collections.map(c => c.id).join(', ')}]`);
  });
});
