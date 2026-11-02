# AICheck — Vercel Production Deployment Guide

This guide provides exact, step-by-step instructions to deploy the **AICheck React Frontend** to **Vercel** directly from your GitHub repository.

---

## 1. Pre-Deployment Summary & Verification

| Property | Value |
| :--- | :--- |
| **GitHub Repository** | [`https://github.com/kumar246subham-afk/AICheck`](https://github.com/kumar246subham-afk/AICheck) |
| **GitHub Account** | `kumar246subham-afk` |
| **Production Branch** | `main` |
| **Project Subfolder (Root Directory)** | `client` |
| **Framework Preset** | `Vite` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |
| **Node Version** | `18.x` or `20.x` (default) |
| **SPA Rewrite Rules** | Verified in `client/vercel.json` |

---

## 2. Step-by-Step Vercel Deployment Instructions

### Step 1: Sign in to Vercel
1. Open [https://vercel.com/login](https://vercel.com/login) in your browser.
2. Sign in with your **GitHub** account (`kumar246subham-afk`).

### Step 2: Import the GitHub Repository
1. In your Vercel Dashboard, click the **"Add New..."** button (top right) and select **"Project"** (or visit [https://vercel.com/new](https://vercel.com/new)).
2. Locate the repository **`kumar246subham-afk/AICheck`** under "Import Git Repository".
   - *If the repository is not listed, click "Adjust GitHub App Permissions" and grant access to `AICheck`.*
3. Click the blue **"Import"** button next to `AICheck`.

### Step 3: Configure Project Settings
In the **"Configure Project"** screen, apply the following settings:

1. **Project Name**: `aicheck` (or your preferred name)
2. **Framework Preset**: Select **`Vite`** (Vercel typically detects this automatically)
3. **Root Directory**:
   - Click the **"Edit"** button next to Root Directory.
   - Select the folder **`client`** and click **Continue**.
   - *(CRITICAL: Do NOT leave it as the repository root, because the React application lives in `client/`)*.
4. **Build & Output Settings**:
   - **Build Command**: `npm run build` (Toggle Override if needed, though default matches)
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 4: Add Environment Variables
Under the **"Environment Variables"** accordion, add each of the following variables for **Production**, **Preview**, and **Development**:

| Variable Name | Value | Purpose |
| :--- | :--- | :--- |
| `VITE_FIREBASE_API_KEY` | `AIzaSyAicr2lg74PfKu2cIPeZsmYGkWvoBmWeAc` | Firebase Web API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | `aicheck-784df.firebaseapp.com` | Firebase Authentication Domain |
| `VITE_FIREBASE_PROJECT_ID` | `aicheck-784df` | Firebase Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | `aicheck-784df.firebasestorage.app` | Firebase Storage Bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `781432936548` | Firebase Cloud Messaging Sender ID |
| `VITE_FIREBASE_APP_ID` | `1:781432936548:web:acc86ed670224e811de771` | Firebase Web App ID |
| `VITE_FIREBASE_MEASUREMENT_ID` | `G-3QH12QZ07S` | Google Analytics Measurement ID (Optional) |
| `VITE_API_URL` | `https://aicheck-backend.onrender.com` | Backend API URL (or your Render URL) |

> **Note on `VITE_API_URL`**:
> If your Render backend is not deployed yet, you can leave `VITE_API_URL` empty or enter your expected backend URL. You can update this at any time in **Project Settings > Environment Variables** and trigger a redeploy.

### Step 5: Deploy
1. Click the **"Deploy"** button.
2. Vercel will clone the `main` branch, navigate to `client/`, install dependencies, run `npm run build`, and deploy the resulting assets to its global edge network.
3. The build takes ~1–2 minutes. Once complete, you will see the celebration screen with your live production URL (e.g., `https://aicheck-xxxx.vercel.app`).

---

## 3. Post-Deployment: Authorize Vercel Domain in Firebase

Firebase Authentication strictly enforces an authorized domain whitelist to prevent unauthorized token generation.

1. Copy your new Vercel domain (e.g., `aicheck-xxxx.vercel.app` and/or `aicheck.vercel.app`).
2. Go to the [Firebase Console](https://console.firebase.google.com/project/aicheck-784df/authentication/settings).
3. Select your project: **`aicheck-784df`**.
4. In the left sidebar, click **Authentication** and navigate to the **Settings** tab.
5. Under **Authorized domains**, click **Add domain**.
6. Paste your Vercel domain (without `https://`, e.g. `aicheck-xxxx.vercel.app`).
7. Click **Save**.

*(Google Sign-In and Email/Password authentication will now work seamlessly on your live Vercel deployment!)*

---

## 4. Single-Page Application (SPA) Routing Verification

AICheck uses client-side routing with `react-router-dom`. The project already includes `client/vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This guarantees that deep links like `/app`, `/history`, `/profile`, `/login`, and `/register` will never return `404 Not Found` when refreshed or accessed directly.

---

## 5. Live Production Smoke Test Checklist

Once deployed, perform this quick sanity check on your production URL:
- [ ] **Home Page**: Landing page loads, 3D Canvas / Core Orb animates smoothly without WebGL warnings.
- [ ] **Authentication**: Click "Sign In" or "Get Started" -> Sign in with an existing user or Google account.
- [ ] **SPA Direct Refresh**: Refresh the page on `/app` or `/profile` — page should reload cleanly without a 404 error.
- [ ] **Theme Switching**: Toggle dark/light theme mode.
- [ ] **Navigation**: Links to Features, Pricing, History, and Documentation function properly.
- [ ] **Backend Connection**: If Render backend is live, run a sample text scan in the Document Analyzer.
