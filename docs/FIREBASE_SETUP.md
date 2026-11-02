# AICheck — Firebase Setup Guide

This guide walks you through connecting your Firebase project to AICheck for authentication, Firestore database, and Admin verification.

---

## 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** (or **Create a project**).
3. Name your project (e.g. `aicheck-production` or `aicheck-app`).
4. (Optional) Enable Google Analytics and select or create an account.
5. Click **Create project** and wait for provisioning to finish.

---

## 2. Register Web App & Obtain Frontend Credentials

1. On the Project Overview page, click the **Web icon (`</>`)** to add a web application.
2. Register your app with a nickname (e.g. `AICheck Web`).
3. Check or leave unchecked Firebase Hosting as needed.
4. Click **Register app**.
5. Copy the configuration object provided:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789...",
     appId: "1:123456789:web:abcdef..."
   };
   ```

---

## 3. Configure Frontend Environment Variables

Open `client/.env` and update the keys with your credentials:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

---

## 4. Enable Authentication Providers

1. In the Firebase Console left menu, navigate to **Build > Authentication**.
2. Click **Get started**.
3. Under the **Sign-in method** tab:
   - **Email/Password**:
     - Click **Email/Password**.
     - Enable the first toggle (**Email/Password**).
     - Leave Email link passwordless sign-in disabled unless specifically desired.
     - Click **Save**.
   - **Google Sign-In**:
     - Click **Add new provider** > **Google**.
     - Enable the provider.
     - Choose a Project public-facing name and Project support email.
     - Click **Save**.
4. Under **Settings > Authorized domains**, ensure `localhost` is listed for local development, and add your production domain (e.g. `your-app.vercel.app`) when deploying.

---

## 5. Create Cloud Firestore Database

1. In the left navigation, click **Build > Firestore Database**.
2. Click **Create database**.
3. Choose your database location (e.g. `nam5 (us-central)` or closest to your audience).
4. Start in **Production mode** (security rules from `firebase/firestore.rules` will govern access).
5. Click **Enable**.

---

## 6. Configure Firebase Admin SDK (Backend)

The Node.js backend uses the Firebase Admin SDK to verify client bearer tokens and manage user permissions securely:

1. In Firebase Console, go to **Project Settings** (gear icon) > **Service accounts**.
2. Click **Generate new private key**, then confirm by clicking **Generate key**.
3. A JSON file will download.
4. Rename this file to `serviceAccountKey.json` and place it in `server/config/serviceAccountKey.json` **OR** set the following in `server/.env`:
   ```env
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project-id.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgk...==\n-----END PRIVATE KEY-----\n"
   ```
> ⚠️ **Security Notice**: Never commit `serviceAccountKey.json` or your private key into public git repositories. Both are already listed in `.gitignore`.

---

## 7. Deploy Firestore & Storage Security Rules

Install Firebase CLI if not already installed:
```bash
npm install -g firebase-tools
firebase login
firebase use --add your-project-id
```

Deploy the rules included in the repository:
```bash
firebase deploy --only firestore:rules,firestore:indexes,storage
```

---

## 8. Initial Admin Setup

To grant the initial `admin` role to a user:
1. Register a standard user account on AICheck.
2. In Firebase Console, navigate to **Firestore Database** > `users` collection.
3. Locate your user document (identified by your `uid`).
4. Update the `role` field value from `"user"` to `"admin"`.
5. On your next login or page refresh, you will have access to `/admin`.
