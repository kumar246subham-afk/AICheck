# AICheck — 3D AI Content Detector & Human Writing Analyzer

[![Tests](https://img.shields.io/badge/tests-29%20passed-brightgreen.svg)](#test-suite)
[![Status](https://img.shields.io/badge/status-production--ready-success.svg)](#project-status)
[![Frontend](https://img.shields.io/badge/frontend-React%2018%20%2B%20Vite%20%2B%20Three.js-blue.svg)](#technology-stack)
[![Backend](https://img.shields.io/badge/backend-Node.js%20%2B%20Express%20%2B%20Firebase%20Admin-orange.svg)](#technology-stack)
[![Security](https://img.shields.io/badge/security-115%20Firestore%20Rules%20Hardened-blueviolet.svg)](#security-architecture)

> **Live Deployments:**  
> - **Frontend (Vercel):** [https://ai-check-coral.vercel.app](https://ai-check-coral.vercel.app)  
> - **Backend (Render):** [https://aicheck-backend.onrender.com](https://aicheck-backend.onrender.com)  

AICheck is a production-grade SaaS application designed to analyze written text, detect AI-generated phrasing patterns, evaluate human linguistic cadence, and provide verifiable sentence-level diagnostics through interactive 3D WebGL visualizations and downloadable executive PDF reports.

---

## 🌟 Key Features

- 🌐 **Futuristic 3D WebGL Canvas**: Dynamic 3D AI Core Orb with vertex-displacement shaders, interactive Drei controls, and mouse-reactive constellation particle systems.
- 📄 **Multi-Format In-Memory Document Parser**: Seamless drag-and-drop parsing of `.txt`, `.pdf`, `.docx`, and `.doc` documents with zero disk persistence.
- ⚡ **Real-Time Request Cancellation**: Full `AbortController` integration allowing users to cancel active document extractions and detection pipelines at any moment.
- 🔬 **Sentence-Level Color-Coded Highlighting**: Individual sentence analysis categorizing text into AI-like patterns (orange), Human-like phrasing (green), and Uncertain transitions (grey).
- 📊 **Downloadable Executive PDF Reports**: Multi-page PDF summaries containing distribution donut charts, burstiness indexes, TTR metrics, and diagnostic tables.
- 🔐 **Firebase Authentication & Admin SDK**: Full Email/Password and Google OAuth authentication verified server-side with token revocation checks.
- 🛡️ **Hardened Multi-Tenant Firestore Security**: 115-line ruleset enforcing strict ownership isolation, write-protected audit logs, and immutable client roles.
- 📈 **Role-Based Admin Dashboard**: Comprehensive administrative portal tracking system metrics, document volume, and activity logs.

---

## 🏗️ System Architecture

```
                          [ Client - React 18 + Vite ]
                                       |
                 +---------------------+---------------------+
                 |                                           |
                 v                                           v
       [ Three.js 3D Canvas ]                     [ Firebase Auth SDK ]
     - Interactive Core Orb                     - Email/Password + Google
     - Particle Constellation                   - Token State Management
                 |                                           |
                 +---------------------+---------------------+
                                       |
                               REST API / Bearer Token
                                       v
                          [ Server - Node.js + Express ]
                                       |
        +------------------------------+------------------------------+
        |                              |                              |
        v                              v                              v
[ Document Parser ]          [ AI Detection Engine ]         [ Report Generator ]
- In-memory Buffer           - Deterministic NLP v1.5.0      - PDFKit Streaming
- PDF, DOCX, DOC, TXT        - Burstiness & TTR              - Vector Charts
- Zero Disk Retention        - Heuristic Perplexity          - Executive Summary
        |                              |                              |
        +------------------------------+------------------------------+
                                       |
                                       v
                          [ Cloud Firestore Database ]
                          - 115 Security Rules Hardened
                          - Strict Owner Isolation
```

---

## 💻 Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 5, Tailwind CSS, Framer Motion, Lucide Icons |
| **3D & Graphics** | Three.js, React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`) |
| **Backend** | Node.js (v18+), Express 4, Helmet, CORS, Express-Rate-Limit |
| **Authentication** | Firebase Authentication, Firebase Admin SDK (with revocation checks) |
| **Database** | Google Cloud Firestore (115-line validated ruleset) |
| **Document Processing**| `pdf-parse`, `mammoth`, `multer` (in-memory buffer storage) |
| **PDF Reporting** | PDFKit |
| **Testing** | Jest, Supertest (20 backend unit & integration tests) |

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- Node.js 18.x or 20.x
- npm 9.x or higher
- A Firebase project ([Firebase Console](https://console.firebase.google.com/))

### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/your-username/aicheck.git
cd aicheck

# Install root, backend, and frontend dependencies
npm run install:all
```

### 2. Configure Environment Variables
Copy the `.env.example` templates in both `client/` and `server/`:

#### Frontend (`client/.env`):
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_URL=
```

#### Backend (`server/.env`):
```env
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
FIREBASE_PROJECT_ID=your_project
HUGGINGFACE_API_KEY=
HUGGINGFACE_MODEL_URL=https://router.huggingface.co/hf-inference/models/roberta-base-openai-detector
```

Place your Firebase Admin service account key at `server/config/serviceAccountKey.json`.

### 3. Launch Development Servers
```bash
npm run dev
```
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`

---

## 🧪 Test Suite

Run the full backend test suite:
```bash
npm run test:server
```

### Test Results
```
 PASS  tests/authMiddleware.test.js
 PASS  tests/aiDetector.test.js
 PASS  tests/fileUpload.test.js
 PASS  tests/historyRoutes.test.js

Test Suites: 4 passed, 4 total
Tests:       20 passed, 20 total
Snapshots:   0 total
Time:        1.458 s
```

Frontend production build verification:
```bash
npm run build:client
```
Output: `✓ 3245 modules transformed in 31.10s. dist/index.html built with 0 errors.`

---

## 🧠 AI Detection Engine & Model Transparency

AICheck employs a dual-path engine prioritizing deterministic transparency over opaque claims:

1. **Autonomous Deterministic NLP Engine (v1.5.0)**:
   - **Burstiness**: Evaluates sentence length variance ($CV = \sigma / \mu$). High variation indicates human writing cadence.
   - **Lexical Diversity**: Type-Token Ratio (TTR) measuring unique word stems against total word count.
   - **Heuristic Perplexity Index**: Computes $(TTR \times 50) + (\min(1.0, CV) \times 50)$ bounded between 0 and 100.
   - **Repeated Phrase Detection**: Analyzes 3-gram and 4-gram repetition.
2. **Hugging Face Router Integration**:
   - Evaluates `roberta-base-openai-detector` via `router.huggingface.co`.
   - **Transparency Notice**: Trained on GPT-2 output in 2019. The official model card warns against using it as an authoritative modern ChatGPT detector. AICheck presents its output as an experimental pattern affinity score, never mathematical proof of authorship.

---

## 🛡️ Security & Zero-Disk Retention

- **Zero-Disk Retention**: All uploaded documents are parsed in volatile RAM using `multer.memoryStorage()`. No files are written to disk.
- **Revocation-Aware Auth**: Firebase ID tokens are checked against the Firebase Auth revocation registry on every protected API call (`checkRevoked: true`).
- **Database Rules**: Firestore rules prevent privilege escalation, disallow client audit log writes, and isolate user documents by owner UID.
- **Rate Limiting**: Protects against automated abuse with 100 requests per 15-minute sliding window per IP.

---

## 📖 Detailed Documentation

- [Project Status & Health Snapshot](PROJECT_STATUS.md)
- [Production Deployment Guide (Vercel & Render)](DEPLOYMENT.md)
- [Firebase Setup & Security Rules Guide](FIREBASE_SETUP.md)
- [AI Model Architecture & Mathematical Formulas](AI_MODEL_SETUP.md)
- [Security Architecture & Hardening](SECURITY.md)
- [Empirical AI Model Validation Report](AI_MODEL_VALIDATION.md)
- [Pre-Deployment Audit Matrix](PRE_DEPLOYMENT_AUDIT.md)

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
