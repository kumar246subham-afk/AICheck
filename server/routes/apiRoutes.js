import express from 'express';
import multer from 'multer';
import {
  extractDocumentText,
  analyzeTextContent,
  downloadPdfReport,
  getAdminMetrics,
} from '../controllers/detectionController.js';
import {
  verifyAuthToken,
  optionalAuthToken,
  requireAdminRole,
} from '../middleware/authMiddleware.js';
import { admin } from '../config/firebaseAdmin.js';

const router = express.Router();

// Configure in-memory upload storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10)) * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = /\.(pdf|docx|doc|txt)$/i;
    const allowedMime = /(pdf|wordprocessingml|msword|text\/)/i;

    if (allowedExtensions.test(file.originalname) || allowedMime.test(file.mimetype)) {
      return cb(null, true);
    }
    cb(new Error('Unsupported file format. Please upload a PDF, DOCX, DOC, or TXT file.'));
  },
});

// Document extraction route (optional auth to identify requesting user)
router.post('/documents/extract', optionalAuthToken, upload.single('file'), extractDocumentText);

// Direct AI text analysis route (optional auth to link scan to user session)
router.post('/detect', optionalAuthToken, analyzeTextContent);

// Downloadable PDF audit report generation route
router.post('/reports/pdf', optionalAuthToken, downloadPdfReport);

// Protected token verification endpoint for checking auth state & token validity
router.get('/auth/verify', verifyAuthToken, (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Firebase ID Token successfully verified by Admin SDK.',
    user: {
      uid: req.user.uid,
      email: req.user.email,
      emailVerified: req.user.email_verified,
      role: req.user.role || 'user',
      authTime: req.user.auth_time,
    },
  });
});

// Diagnostic check-method endpoint to provide accurate guidance when login fails
router.post('/auth/check-method', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ status: 'error', message: 'Email address is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const userRecord = await admin.auth().getUserByEmail(cleanEmail);
    const providers = userRecord.providerData.map((p) => p.providerId);
    const hasPassword = Boolean(userRecord.passwordHash);
    const isGoogleOnly = providers.includes('google.com') && !hasPassword;

    return res.status(200).json({
      status: 'success',
      exists: true,
      disabled: Boolean(userRecord.disabled),
      isGoogleOnly,
      providers,
    });
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      return res.status(200).json({
        status: 'success',
        exists: false,
        isGoogleOnly: false,
        providers: [],
      });
    }
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

// Protected Admin metrics route
router.get('/admin/metrics', verifyAuthToken, requireAdminRole, getAdminMetrics);

export default router;
