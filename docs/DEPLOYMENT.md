# AICheck — Production Deployment Guide

Instructions for deploying AICheck to production using Vercel (Frontend) and Render (Backend).

---

## 1. Backend Deployment (Render / Railway / DigitalOcean)

### Deploying to Render
1. Create a new **Web Service** on [Render](https://render.com/).
2. Connect your GitHub repository.
3. Configure the service settings:
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Set Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (Render handles this automatically)
   - `CLIENT_ORIGIN`: `https://your-aicheck-app.vercel.app`
   - `FIREBASE_PROJECT_ID`: your Firebase project ID
   - `FIREBASE_CLIENT_EMAIL`: your service account email
   - `FIREBASE_PRIVATE_KEY`: your private key (with escaped `\n`)
   - `HUGGINGFACE_API_KEY`: your Hugging Face API key
5. Deploy and copy your backend URL (e.g. `https://aicheck-api.onrender.com`).

---

## 2. Frontend Deployment (Vercel)

1. Import your repository into [Vercel](https://vercel.com/).
2. Set **Root Directory** to `client`.
3. Framework Preset: `Vite`.
4. Configure Environment Variables:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_API_URL`: `https://aicheck-api.onrender.com`
5. Click **Deploy**.
6. In Firebase Console, go to **Authentication > Settings > Authorized domains** and add your Vercel domain.
