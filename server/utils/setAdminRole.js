/**
 * Utility script to assign the 'admin' custom claim to a user using Firebase Admin SDK.
 * 
 * Usage:
 *   node server/utils/setAdminRole.js <USER_UID>
 * 
 * Example:
 *   node server/utils/setAdminRole.js AbCdEf123456
 */

import { admin, isFirebaseAdminInitialized } from '../config/firebaseAdmin.js';

async function setAdminRole(uid) {
  if (!uid) {
    console.error('❌ Error: Please provide the target user UID as an argument.');
    console.log('Usage: node server/utils/setAdminRole.js <USER_UID>');
    process.exit(1);
  }

  if (!isFirebaseAdminInitialized || !admin) {
    console.error('❌ Error: Firebase Admin SDK is not initialized.');
    console.error('Please configure server/config/serviceAccountKey.json or set FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in server/.env');
    process.exit(1);
  }

  try {
    console.log(`Setting admin role for user UID: ${uid}...`);
    
    // 1. Set Custom Claims on Firebase Authentication
    await admin.auth().setCustomUserClaims(uid, { role: 'admin' });
    console.log('✅ Custom claim { role: "admin" } assigned successfully in Firebase Auth.');

    // 2. Also sync to Firestore user profile document if it exists
    const db = admin.firestore();
    const userDocRef = db.collection('users').doc(uid);
    const docSnap = await userDocRef.get();

    if (docSnap.exists) {
      await userDocRef.update({ role: 'admin' });
      console.log('✅ Synced role: "admin" to Firestore users/' + uid);
    } else {
      console.log('ℹ️ Note: Firestore document users/' + uid + ' does not exist yet. It will reflect admin once created.');
    }

    console.log(`🎉 Success! User ${uid} now has full verified Administrator privileges.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to set admin role:', err.message);
    process.exit(1);
  }
}

const targetUid = process.argv[2];
setAdminRole(targetUid);
