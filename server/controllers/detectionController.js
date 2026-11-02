import { parseDocumentBuffer } from '../services/documentParser/parser.js';
import { detectAiContent } from '../services/aiDetector/detector.js';
import { generatePdfReport } from '../services/reportGenerator/pdfGenerator.js';
import { admin, isFirebaseAdminInitialized } from '../config/firebaseAdmin.js';

// In-memory audit metrics tracking for the Admin portal
export const systemStats = {
  totalScans: 0,
  failedScans: 0,
  totalWordsProcessed: 0,
  engineUptimeStart: Date.now(),
  modelStatus: 'Operational',
  historyLog: [],
};

/**
 * Extract clean plain text from uploaded document file
 */
export async function extractDocumentText(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'No file uploaded. Please attach a PDF, DOCX, DOC, or TXT file.' });
    }

    const { buffer, originalname, mimetype, size } = req.file;

    // File size limit check (10MB)
    const MAX_SIZE = (parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10)) * 1024 * 1024;
    if (size > MAX_SIZE) {
      return res.status(400).json({ status: 'error', message: `File size exceeds the allowed limit of ${process.env.MAX_FILE_SIZE_MB || 10}MB.` });
    }

    const result = await parseDocumentBuffer(buffer, originalname, mimetype);

    res.status(200).json({
      status: 'success',
      data: {
        documentName: originalname,
        format: result.format,
        wordCount: result.wordCount,
        charCount: result.charCount,
        text: result.text,
      },
    });
  } catch (err) {
    systemStats.failedScans++;
    next(err);
  }
}

/**
 * Execute genuine AI detection analysis on submitted text
 */
export async function analyzeTextContent(req, res, next) {
  try {
    const { text, documentName } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ status: 'error', message: 'Field "text" is required and must be a valid string.' });
    }

    const result = await detectAiContent(text);

    // Update system telemetry
    systemStats.totalScans++;
    systemStats.totalWordsProcessed += (result.totalWords || 0);

    const scanRecord = {
      id: `scan_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      documentName: documentName || 'Direct Text Submission',
      overallAiLikePercentage: result.overallAiLikePercentage,
      overallHumanLikePercentage: result.overallHumanLikePercentage,
      uncertainPercentage: result.uncertainPercentage,
      totalWords: result.totalWords,
      totalSentences: result.totalSentences,
      modelName: result.modelName,
      modelVersion: result.modelVersion,
      activeEngineMode: result.activeEngineMode,
      externalProviderStatus: result.externalProviderStatus,
      qualitativeIndicators: result.qualitativeIndicators,
      sentenceResults: result.sentenceResults,
      linguisticDiagnostics: result.linguisticDiagnostics,
      limitations: result.limitations,
      createdAt: result.analysisTimestamp,
    };

    systemStats.historyLog.unshift({
      id: scanRecord.id,
      name: scanRecord.documentName,
      timestamp: scanRecord.createdAt,
      aiScore: scanRecord.overallAiLikePercentage,
    });
    if (systemStats.historyLog.length > 50) systemStats.historyLog.pop();

    res.status(200).json({
      status: 'success',
      data: scanRecord,
    });
  } catch (err) {
    systemStats.failedScans++;
    next(err);
  }
}

/**
 * Generate and stream downloadable PDF report
 */
export async function downloadPdfReport(req, res, next) {
  try {
    const analysisData = req.body;
    if (!analysisData || typeof analysisData !== 'object') {
      return res.status(400).json({ status: 'error', message: 'Analysis data payload is required to compile a PDF report.' });
    }

    const filename = `AICheck_Report_${(analysisData.documentName || 'analysis').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    generatePdfReport(analysisData, res);
  } catch (err) {
    next(err);
  }
}

/**
 * Admin portal statistics endpoint
 */
export async function getAdminMetrics(req, res, next) {
  try {
    let totalUsers = 1;
    if (isFirebaseAdminInitialized && admin) {
      try {
        const usersList = await admin.auth().listUsers(100);
        totalUsers = usersList.users.length;
      } catch (e) {
        console.warn('Could not query admin.auth().listUsers:', e.message);
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        totalUsers,
        totalScans: systemStats.totalScans,
        failedScans: systemStats.failedScans,
        totalWordsProcessed: systemStats.totalWordsProcessed,
        modelStatus: systemStats.modelStatus,
        activeEngine: process.env.HUGGINGFACE_API_KEY ? 'Hugging Face RoBERTa GPT-2 + Heuristic Blend' : 'AICheck Heuristic Linguistic & Statistical Engine',
        uptimeSeconds: Math.floor((Date.now() - systemStats.engineUptimeStart) / 1000),
        recentScans: systemStats.historyLog.slice(0, 10),
      },
    });
  } catch (err) {
    next(err);
  }
}

export default {
  extractDocumentText,
  analyzeTextContent,
  downloadPdfReport,
  getAdminMetrics,
};
