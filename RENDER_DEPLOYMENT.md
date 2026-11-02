# AICheck — Render Production Backend Deployment Guide

This guide describes how to deploy the AICheck Node.js backend to **[Render](https://render.com/)** and connect it to the production frontend at **`https://ai-check-coral.vercel.app`**.

---

## 1. Architecture Overview

```
+------------------------------------+
|        Vercel (Client App)         |
|   https://ai-check-coral.vercel.app|
|   - React 18 + Vite + Tailwind CSS |
|   - Three.js 3D WebGL Canvas       |
|   - Firebase Client SDK (Auth/DB)  |
+-----------------+------------------+
                  |
         REST API | Bearer ID Token
                  v
+------------------------------------+
|        Render (Backend API)        |
|  https://aicheck-backend.onrender.com|
|   - Node.js Express (ESM)          |
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

## 2. Create the Render Web Service

1. Sign in to the [Render Dashboard](https://dashboard.render.com/).
2. Click the **"New +"** button in the top right and select **"Web Service"**.
3. Under **"Connect a repository"**, select **`kumar246subham-afk/AICheck`**.
   *(If not visible, click "Configure account" to grant access to the `AICheck` repository)*.
4. Configure the Web Service:

| Setting | Value |
| :--- | :--- |
| **Name** | `aicheck-backend` *(or your preferred service name)* |
| **Region** | Select closest to your users (e.g., `Oregon (US West)` or `Frankfurt (EU Central)`) |
| **Branch** | `main` |
| **Root Directory** | `server` *(CRITICAL: do not leave empty)* |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` (or `Starter`) |

5. Scroll down to **Advanced** -> **Health Check Path** and set:
   - **Health Check Path**: `/api/v1/health`

---

## 3. Configure Firebase Admin Credentials on Render

The backend needs Firebase Admin credentials to verify authentication tokens and administer Firestore. Use **one of the three options** below:

### Option A: Secret Files (Recommended)
Render supports mounting secret files directly into the container filesystem:
1. In the Render Web Service dashboard, go to the **"Environment"** tab.
2. Scroll to the **"Secret Files"** section and click **"Add Secret File"**.
3. Set **Filename**: `serviceAccountKey.json`  
   *(Render will mount this at `/etc/secrets/serviceAccountKey.json`, which the backend automatically detects)*.
4. In the **File Contents** editor, paste the complete JSON from your local `server/config/serviceAccountKey.json`.
5. Click **Save Changes**.

---

### Option B: Base64 / Raw JSON Environment Variable
If you prefer configuring via an environment variable:
1. On your local machine (PowerShell):
   ```powershell
   [Convert]::ToBase64String([System.IO.File]::ReadAllBytes("server\config\serviceAccountKey.json")) | Set-Clipboard
   ```
2. In Render -> **Environment** -> **Environment Variables**, add:
   - **Key**: `FIREBASE_SERVICE_ACCOUNT_KEY`
   - **Value**: *(paste the Base64 string or the raw JSON)*

---

### Option C: Individual Environment Variables
Alternatively, enter the service account fields individually:
- `FIREBASE_PROJECT_ID`: `aicheck-784df`
- `FIREBASE_CLIENT_EMAIL`: `firebase-adminsdk-fbsvc@aicheck-784df.iam.gserviceaccount.com`
- `FIREBASE_PRIVATE_KEY`: `"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"`

---

## 4. Complete Environment Variables on Render

In the Render Web Service **Environment** tab, set the following environment variables:

| Variable Name | Production Value | Purpose |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production optimizations & security |
| `CLIENT_ORIGIN` | `https://ai-check-coral.vercel.app` | Production frontend CORS whitelist |
| `MAX_FILE_SIZE_MB` | `10` | Maximum file upload size limit |
| `RATE_LIMIT_WINDOW_MS` | `900000` | 15-minute rate limit window (ms) |
| `RATE_LIMIT_MAX` | `100` | Maximum requests per IP per window |
| `HUGGINGFACE_API_KEY` | *(Optional)* | Optional Hugging Face inference key |
| `HUGGINGFACE_MODEL_URL` | `https://router.huggingface.co/hf-inference/models/roberta-base-openai-detector` | Model URL endpoint |

*(Note: Render automatically injects `PORT`. Do not add a fixed `PORT` variable so Render can dynamically bind it).*

---

## 5. Verify the Render Deployment

Once deployed, Render will display your public backend URL (e.g., `https://aicheck-backend.onrender.com`).

### 1. Test Health Endpoint
```bash
curl https://aicheck-backend.onrender.com/api/v1/health
```
Expected 200 response:
```json
{
  "status": "success",
  "message": "AICheck API Engine operational",
  "timestamp": "...",
  "uptimeSeconds": 12,
  "environment": "production",
  "version": "1.0.0"
}
```

### 2. Verify CORS Preflight
```bash
curl -I -X OPTIONS https://aicheck-backend.onrender.com/api/v1/health \
  -H "Origin: https://ai-check-coral.vercel.app" \
  -H "Access-Control-Request-Method: GET"
```
Expected response headers:
- `access-control-allow-origin: https://ai-check-coral.vercel.app`
- `access-control-allow-credentials: true`

---

## 6. Connect Live Vercel Frontend to Render Backend

Now update your frontend on Vercel to point to your new live backend:

1. Open your Vercel project at [vercel.com](https://vercel.com/) -> Select **`aicheck`** (or your frontend project).
2. Go to **Settings** -> **Environment Variables**.
3. Find or add **`VITE_API_URL`**:
   - **Value**: `https://aicheck-backend.onrender.com` *(use your actual Render backend URL)*
4. Go to the **Deployments** tab, click **Redeploy** on your latest deployment.
5. Once redeployed, visit **`https://ai-check-coral.vercel.app`**!
   - Upload a test document or scan text in the Document Analyzer.
   - Network requests will now route to your production backend on Render.
