# AICheck — Render Production Deployment Guide

This guide describes how to deploy the AICheck Node.js backend to **[Render](https://render.com/)** with Firebase Admin SDK authentication.

---

## 1. Create a New Web Service on Render

1. Log in to the [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** → **Web Service**.
3. Connect your Git repository containing the AICheck codebase.
4. Configure the basic settings:
   - **Name**: `aicheck-api` (or your choice)
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Region**: Select closest to your users (e.g., Oregon, Frankfurt, Singapore)
   - **Branch**: `main`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free or Starter

---

## 2. Configure Firebase Admin SDK on Render

Because `serviceAccountKey.json` is strictly ignored by Git (never commit private credentials), configure the credentials in Render using **one of the two recommended production methods**:

### Option A: Secret Files (Recommended & Cleanest)
Render supports Secret Files that are mounted directly into your app's directory structure during runtime:
1. In the Render Dashboard, go to your Web Service → **Environment** tab.
2. Scroll to the **Secret Files** section and click **Add Secret File**.
3. Set **Filename**: `config/serviceAccountKey.json`
4. In the **Contents** box, paste the exact contents of your `serviceAccountKey.json`.
5. Click **Save Changes**.
6. The AICheck backend will automatically detect and load `server/config/serviceAccountKey.json` upon startup.

---

### Option B: Base64 or JSON Environment Variable
If you prefer configuring via standard Environment Variables:
1. Base64-encode your service account file:
   - On Windows (PowerShell):
     ```powershell
     [Convert]::ToBase64String([System.IO.File]::ReadAllBytes("server\config\serviceAccountKey.json")) | Set-Clipboard
     ```
   - On macOS/Linux:
     ```bash
     base64 -w 0 server/config/serviceAccountKey.json | pbcopy
     ```
2. In Render → **Environment** → **Environment Variables**, add:
   - **Key**: `FIREBASE_SERVICE_ACCOUNT_KEY`
   - **Value**: *(paste the Base64 string or minified JSON)*
3. AICheck automatically decodes Base64 and initializes Firebase Admin SDK.

---

### Option C: Individual Environment Variables
Alternatively, configure individual keys:
- `FIREBASE_PROJECT_ID`: `aicheck-784df`
- `FIREBASE_CLIENT_EMAIL`: `firebase-adminsdk-fbsvc@aicheck-784df.iam.gserviceaccount.com`
- `FIREBASE_PRIVATE_KEY`: `"-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"`

*(Note: Preserve literal `\n` characters in the private key string).*

---

## 3. Required Environment Variables Summary

Add the following environment variables in Render:

| Variable | Value / Description |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `CLIENT_ORIGIN` | `https://aicheck-784df.web.app` *(or your custom domain)* |
| `FIREBASE_PROJECT_ID` | `aicheck-784df` |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | *(Base64 string from Option B, or use Secret File Option A)* |
| `HUGGINGFACE_API_KEY` | *(Optional: Your HF API key for remote model inference)* |
| `MAX_FILE_SIZE_MB` | `10` |
| `RATE_LIMIT_WINDOW_MS` | `900000` *(15 minutes)* |
| `RATE_LIMIT_MAX` | `100` |

---

## 4. Health Check Verification

Render provides built-in health check monitoring:
1. In Render Web Service settings, scroll to **Health Check Path**.
2. Enter: `/api/v1/health`
3. Render will monitor this endpoint and automatically ensure zero-downtime deploys.

---

## 5. Connecting Frontend to Render Backend

Once Render finishes deploying, copy your service URL (e.g. `https://aicheck-api.onrender.com`).

In `client/.env`:
```env
VITE_API_URL=https://aicheck-api.onrender.com/api/v1
```
Rebuild and deploy your frontend to Firebase Hosting:
```bash
cd client
npm run build
firebase deploy --only hosting
```
