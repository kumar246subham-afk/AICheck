# AICheck — Production Deployment Guide

This guide provides end-to-end instructions for deploying AICheck to production using **Vercel** for the React frontend, **Render** for the Node.js backend, and **Firebase** for Authentication, Cloud Firestore, and the Admin SDK.

---

## Architecture Topology

```
+------------------------------------+
|        Vercel (Client App)         |
|   https://ai-check-coral.vercel.app|
|   - React 18 + Vite + Tailwind CSS |
|   - Three.js 3D WebGL Canvas       |
|   - Firebase Client SDK (Auth/DB)  |
+-----------------+------------------+
                  |
         REST API | Bearer Token
                  v
+------------------------------------+
|        Render (Backend API)        |
|    https://aicheck-api.onrender.com|
|   - Node.js + Express              |
|   - Firebase Admin SDK (Tokens/DB) |
|   - In-Memory Document Parser      |
|   - Local NLP Statistical Engine   |
|   - PDFKit Report Generator        |
+-----------------+------------------+
                  |
     Verification | Admin Sync
                  v
+------------------------------------+
|    Firebase Cloud Platform         |
|    Project ID: aicheck-784df       |
|   - Firebase Authentication        |
|   - Cloud Firestore (115 Rules)    |
|   - Service Account IAM            |
+------------------------------------+
```

---

## 1. Firebase Production Preparation

### A. Add Production Domain to Authorized Domains
1. Open the [Firebase Console](https://console.firebase.google.com/) for project `aicheck-784df`.
2. Go to **Authentication > Settings > Authorized domains**.
3. Click **Add domain**.
4. Enter your Vercel production domain (e.g., `your-app.vercel.app` or custom domain).

### B. Verify Security Rules
Confirm that the hardened 115-line security rules from `firebase/firestore.rules` (or `firestore-rules-final.txt`) are active in the Firebase Console:
- Go to **Firestore Database > Rules**.
- Confirm that users can only read/update their own documents and that client role elevation is denied.

---

## 2. Backend Deployment (Render)

### Step 1: Create a Web Service
1. Sign in to [Render](https://render.com/).
2. Click **New + > Web Service**.
3. Connect your GitHub repository.
4. Set the configuration:
   - **Name**: `aicheck-backend`
   - **Region**: Choose closest to your users (e.g. `Oregon (US West)` or `Frankfurt (EU Central)`).
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: `Free` or `Starter`

### Step 2: Configure Environment Variables
In the Render dashboard under **Environment**:
| Variable Name | Value | Purpose |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production optimizations & error handling |
| `PORT` | `10000` | Port automatically provided by Render |
| `CLIENT_ORIGIN` | `https://ai-check-coral.vercel.app` | Production frontend URL for CORS whitelist |
| `FIREBASE_PROJECT_ID` | `aicheck-784df` | Firebase Project ID |
| `FIREBASE_CLIENT_EMAIL` | `firebase-adminsdk-fbsvc@aicheck-784df.iam.gserviceaccount.com` | Service account email |
| `FIREBASE_PRIVATE_KEY` | `"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"` | Service account private key |
| `HUGGINGFACE_API_KEY` | *(Optional)* | Hugging Face Access Token |
| `HUGGINGFACE_MODEL_URL` | `https://router.huggingface.co/hf-inference/models/roberta-base-openai-detector` | Modern router endpoint |
| `MAX_FILE_SIZE_MB` | `10` | Maximum upload size |
| `RATE_LIMIT_WINDOW_MS` | `900000` | 15-minute rate limit window |
| `RATE_LIMIT_MAX` | `100` | Requests allowed per window |

### Step 3: Health Check Verification
Once deployed, verify backend operational status:
```bash
curl https://aicheck-backend.onrender.com/api/v1/health
```
Expected response:
```json
{"status":"ok","timestamp":"...","uptime":...}
```

---

## 3. Frontend Deployment (Vercel)

### Step 1: Import Project into Vercel
1. Log in to [Vercel](https://vercel.com/).
2. Click **Add New > Project**.
3. Import your GitHub repository.
4. Set the project configuration:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click Edit and select `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 2: Configure Environment Variables
In the Vercel project settings under **Environment Variables**, add:
| Variable Name | Value | Description |
| :--- | :--- | :--- |
| `VITE_FIREBASE_API_KEY` | `AIzaSyAicr2lg74PfKu2cIPeZsmYGkWvoBmWeAc` | Web API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | `aicheck-784df.firebaseapp.com` | Firebase Auth Domain |
| `VITE_FIREBASE_PROJECT_ID` | `aicheck-784df` | Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | `aicheck-784df.firebasestorage.app` | Storage Bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `781432936548` | Sender ID |
| `VITE_FIREBASE_APP_ID` | `1:781432936548:web:acc86ed670224e811de771` | App ID |
| `VITE_API_URL` | `https://aicheck-backend.onrender.com` | Render Backend API URL |

### Step 3: Deploy & Verify SPA Routing
1. Click **Deploy**.
2. Notice `client/vercel.json` contains:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```
This guarantees direct navigation to `/app`, `/history`, `/profile`, and `/admin` does not trigger 404 errors.

---

## 4. Post-Deployment Verification Checklist

1. [ ] Navigate to the Vercel frontend URL. Confirm the 3D Core Orb renders smoothly at 60 FPS.
2. [ ] Register a new user account with Email/Password. Verify email appears in Firebase Console Auth tab.
3. [ ] Verify that a corresponding user document is created under Firestore `/users/{uid}`.
4. [ ] Run a test text analysis on the Document Analyzer. Confirm detection completes and results load.
5. [ ] Upload a test PDF, DOCX, and TXT file. Confirm text extracts accurately and report downloads.
6. [ ] Click **Export PDF Report**. Confirm a multi-page PDF generates with charts and diagnostic tables.
7. [ ] Test cancellation: Start a document upload and click **Cancel Analysis**. Confirm operation terminates cleanly.
8. [ ] Check User History: Confirm the new analysis record is listed and isolated to the logged-in user.
