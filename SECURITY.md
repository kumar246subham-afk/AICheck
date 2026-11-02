# AICheck — Security Architecture & Hardening Specification

This document details the security model, cryptographic verification procedures, access controls, and data hygiene practices implemented across the AICheck platform.

---

## 1. Authentication & Token Verification

AICheck employs Firebase Authentication combined with server-side Firebase Admin SDK verification.

### Bearer Token Verification (`authMiddleware.js`)
- All protected API routes (`/api/v1/auth/verify`, `/api/v1/history`, `/api/v1/admin/*`) require an `Authorization: Bearer <ID_TOKEN>` header.
- The backend verifies the token cryptographically via `admin.auth().verifyIdToken(token, true)`:
  - The second parameter `checkRevoked: true` ensures that tokens revoked due to password resets, session invalidation, or administrative bans are instantly rejected.
  - Expired, malformed, or unsigned tokens result in immediate HTTP 401 Unauthorized responses.
  - The authenticated user identity (`req.user = { uid, email, role }`) is attached to the request object for downstream authorization.

---

## 2. Cloud Firestore Security Rules

Cloud Firestore security rules enforce strict multi-tenant isolation at the database layer.

### Rule Highlights (`firebase/firestore.rules`):
- **User Profile Isolation (`/users/{userId}`)**:
  - Unauthenticated reads and writes are denied.
  - Authenticated users can only read their own profile (`request.auth.uid == userId`).
  - Account creation allows only authenticated registration with strictly validated fields (`uid`, `email`, `role`, `createdAt`).
  - **Immutable Roles**: Ordinary users cannot update their own `role` or `plan`. Client attempts to escalate privileges are blocked:
    `request.resource.data.role == resource.data.role`
  - Account deletion directly from clients is denied to enforce secure deletion workflows.
- **Analysis History Isolation (`/analyses/{analysisId}`)**:
  - Reads and updates are restricted strictly to document owners (`resource.data.userId == request.auth.uid`).
  - Analysis records require valid ownership tagging matching the authenticated token (`request.resource.data.userId == request.auth.uid`).
  - Third-party users cannot view, query, or enumerate analyses belonging to other users.
- **Audit Logs Protection (`/auditLogs/{logId}`)**:
  - Client-side writes are strictly denied (`allow write: if false;`).
  - Only backend operations using the trusted Firebase Admin SDK can record administrative and security audit logs.
- **Admin Access Control**:
  - Elevated admin endpoints require verified admin claims or Firestore document attributes verified server-side.

---

## 3. Zero-Disk Retention Architecture

To protect user confidentiality and comply with enterprise data retention standards:
- **In-Memory Streaming**: File uploads (`.pdf`, `.docx`, `.doc`, `.txt`) are processed via `multer.memoryStorage()`.
- **Zero Temporary File Persistence**: Uploaded document buffers are parsed directly in RAM via `pdf-parse`, `mammoth`, and buffer decoding. No intermediate files are written to the host filesystem.
- **Buffer Garbage Collection**: Once text extraction completes or is canceled, memory buffers are dereferenced for immediate V8 garbage collection.
- **Client Cancellation (`AbortController`)**: Users can cancel active uploads or analysis pipelines at any time; the server and frontend discard partial streams immediately.

---

## 4. Network & Application Hardening

### HTTP Header Security & Sanitization
- **Helmet**: Secures Express apps by setting standard security headers (Content Security Policy, X-Frame-Options, HSTS, X-Content-Type-Options).
- **CORS Whitelist**: Access is restricted strictly to authorized client origins (e.g. `http://localhost:5173`, `https://your-aicheck-app.vercel.app`).
- **Rate Limiting**: Protected by `express-rate-limit` allowing 100 requests per 15-minute window per IP address, preventing brute force and denial-of-service attempts.
- **Payload & Upload Caps**: Enforced file size ceiling of 10 MB per upload (`MAX_FILE_SIZE_MB=10`) and 1 MB JSON body limit.

---

## 5. Secret Hygiene & Git Exclusion

All sensitive secrets are isolated from source code repositories:
- `client/.env` and `server/.env` contain environment-specific variables and are excluded via `.gitignore`.
- `server/config/serviceAccountKey.json` contains private Google service account keys and is explicitly ignored in both root and server `.gitignore`.
- Repository commits must never include production private keys. For cloud platforms (Render, Railway), secrets are injected strictly via secure platform environment variables.
