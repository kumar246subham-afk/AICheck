import { admin, isFirebaseAdminInitialized } from '../config/firebaseAdmin.js';

/**
 * Authentication Middleware: Strict Verification of Firebase ID Token
 * Validates the Authorization Bearer token against Firebase Admin SDK
 */
export async function verifyAuthToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Fail securely if Admin SDK is uninitialized
    if (!isFirebaseAdminInitialized) {
      if (process.env.NODE_ENV === 'production') {
        return res.status(500).json({
          status: 'error',
          code: 'AUTH_UNINITIALIZED',
          message: 'Server authentication subsystem is uninitialized.',
        });
      }
      req.user = { uid: 'dev_user_local', role: 'user', email: 'dev@aicheck.ai' };
      return next();
    }
    return res.status(401).json({
      status: 'error',
      code: 'AUTH_MISSING_TOKEN',
      message: 'Unauthorized: Missing or invalid Authorization header. Expected "Bearer <token>".',
    });
  }

  const token = authHeader.split('Bearer ')[1].trim();
  if (!token) {
    return res.status(401).json({
      status: 'error',
      code: 'AUTH_EMPTY_TOKEN',
      message: 'Unauthorized: Bearer token is empty.',
    });
  }

  if (!isFirebaseAdminInitialized) {
    if (process.env.NODE_ENV === 'production') {
      return res.status(500).json({
        status: 'error',
        code: 'AUTH_UNINITIALIZED',
        message: 'Server authentication subsystem is uninitialized.',
      });
    }
    req.user = { uid: 'dev_user_token', role: 'user' };
    return next();
  }

  try {
    // verifyIdToken with checkRevoked = true ensures revoked tokens are rejected immediately
    const decodedToken = await admin.auth().verifyIdToken(token, true);
    req.user = decodedToken;
    next();
  } catch (err) {
    console.error('Firebase Auth Token Verification Error:', err.code, err.message);

    switch (err.code) {
      case 'auth/id-token-expired':
        return res.status(401).json({
          status: 'error',
          code: 'TOKEN_EXPIRED',
          message: 'Your session has expired. Please sign in again or refresh your token.',
        });
      case 'auth/id-token-revoked':
        return res.status(401).json({
          status: 'error',
          code: 'TOKEN_REVOKED',
          message: 'Your session was revoked. Please sign in again.',
        });
      case 'auth/user-disabled':
        return res.status(403).json({
          status: 'error',
          code: 'USER_DISABLED',
          message: 'The user account associated with this token has been disabled.',
        });
      case 'auth/invalid-id-token':
      case 'auth/argument-error':
      default:
        return res.status(401).json({
          status: 'error',
          code: 'INVALID_TOKEN',
          message: 'Unauthorized: Invalid or corrupted authentication token.',
        });
    }
  }
}

/**
 * Optional Authentication Middleware
 * If a token is provided, it verifies it and populates req.user.
 * If no token is provided, it simply continues with req.user = null.
 */
export async function optionalAuthToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split('Bearer ')[1].trim();
  if (!token || !isFirebaseAdminInitialized) {
    req.user = null;
    return next();
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token, false);
    req.user = decodedToken;
  } catch (err) {
    // Log token error but allow anonymous / unauthenticated request to proceed
    console.warn('Optional auth token could not be verified:', err.message);
    req.user = null;
  }

  next();
}

/**
 * Authorization Middleware: Require Administrator Role
 * Checks both token custom claims and Firestore user record for admin privileges
 */
export async function requireAdminRole(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      code: 'AUTH_REQUIRED',
      message: 'Authentication is required before checking administrative permissions.',
    });
  }

  // 1. Direct claim check on the token
  if (req.user.role === 'admin' || req.user.admin === true) {
    return next();
  }

  // 2. Fallback check: query the user's Firestore profile if Admin SDK is active
  if (isFirebaseAdminInitialized && admin) {
    try {
      const userDoc = await admin.firestore().collection('users').doc(req.user.uid).get();
      if (userDoc.exists && userDoc.data().role === 'admin') {
        req.user.role = 'admin';
        return next();
      }
    } catch (dbErr) {
      console.warn('Failed to inspect Firestore for admin role:', dbErr.message);
    }
  }

  return res.status(403).json({
    status: 'error',
    code: 'FORBIDDEN_ADMIN_REQUIRED',
    message: 'Forbidden: Administrator privileges required to access this resource.',
  });
}

export default {
  verifyAuthToken,
  optionalAuthToken,
  requireAdminRole,
};
