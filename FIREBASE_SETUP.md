# AICheck — Firebase Configuration & Security Guide

This document details the complete Firebase configuration for AICheck, covering Authentication, Cloud Firestore, Security Rules, and the Firebase Admin SDK.

---

## 1. Project Identification

- **Project ID**: `aicheck-784df`
- **Project Name**: `AICheck`
- **Web App ID**: `1:781432936548:web:acc86ed670224e811de771`
- **Auth Domain**: `aicheck-784df.firebaseapp.com`
- **Storage Bucket**: `aicheck-784df.firebasestorage.app`
- **Messaging Sender ID**: `781432936548`

---

## 2. Frontend Configuration (`client/.env`)

The React frontend utilizes the Firebase JS SDK (v10+ modular). Configuration is stored in `client/.env`:

```env
VITE_FIREBASE_API_KEY=AIzaSyAicr2lg74PfKu2cIPeZsmYGkWvoBmWeAc
VITE_FIREBASE_AUTH_DOMAIN=aicheck-784df.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=aicheck-784df
VITE_FIREBASE_STORAGE_BUCKET=aicheck-784df.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=781432936548
VITE_FIREBASE_APP_ID=1:781432936548:web:acc86ed670224e811de771
VITE_API_URL=
```

---

## 3. Cloud Firestore Security Rules (115 Lines Hardened)

The active production rules are defined in `firebase/firestore.rules` (and archived in `firestore-rules-final.txt`).

### Security Policies Enforced:
1. **User Profile Isolation (`/users/{userId}`)**:
   - `read`: Permitted only if `request.auth.uid == userId`.
   - `create`: Enforces matching `uid`, valid email format, initial role `"user"`, and strict timestamp/number validation.
   - `update`: Allows updating safe fields (`fullName`, `photoURL`, `totalAnalyses`). Blocks modification of `role`, `uid`, `email`, and `createdAt`.
   - `delete`: Denied from clients (`allow delete: if false;`). Enforces secure server-side account deletion.
2. **Analysis History Isolation (`/analyses/{analysisId}`)**:
   - `read`, `update`, `delete`: Permitted only if `resource.data.userId == request.auth.uid`.
   - `create`: Enforces valid ownership (`request.resource.data.userId == request.auth.uid`), word counts, and scores between $0$ and $100$.
3. **Audit Logs (`/auditLogs/{logId}`)**:
   - Client writes are completely disabled (`allow write: if false;`). Only the Firebase Admin SDK can create audit log records.

---

## 4. Firebase Admin SDK Configuration (Backend)

The Node.js backend initializes the Admin SDK via `server/config/firebaseAdmin.js` using one of two methods:

### Method 1: Local Development (`serviceAccountKey.json`)
1. Place your downloaded Firebase service account JSON file at:
   `server/config/serviceAccountKey.json`
2. This file is excluded from Git via `.gitignore`.
3. The server automatically detects and loads this credential file on startup.

### Method 2: Cloud / Production (Environment Variables)
In production environments (such as Render or Railway), set the following environment variables:
```env
FIREBASE_PROJECT_ID=aicheck-784df
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@aicheck-784df.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgk...==\n-----END PRIVATE KEY-----\n"
```
> Note: Ensure newlines in `FIREBASE_PRIVATE_KEY` are properly escaped as `\n`.

---

## 5. Admin Privilege Assignment

To grant the initial `admin` role to a registered user:
1. Register the account via the AICheck frontend signup form.
2. Open the [Firebase Console](https://console.firebase.google.com/) for `aicheck-784df`.
3. Navigate to **Firestore Database > Data > users collection**.
4. Locate the user document matching the user's `uid`.
5. Edit the `role` field value from `"user"` to `"admin"`.
6. On the user's next login or token refresh, access to `/admin` is granted.
