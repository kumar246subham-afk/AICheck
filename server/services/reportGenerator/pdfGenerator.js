import PDFDocument from 'pdfkit';

/**
 * Generate a professional audit PDF report for an analysis result
 * with dynamic row-height calculation, robust multi-page pagination,
 * and zero text overlapping.
 * 
 * @param {object} analysisData 
 * @param {import('stream').Writable} writeStream 
 */
export function generatePdfReport(analysisData, writeStream) {
  const doc = new PDFDocument({
    margin: 50,
    size: 'A4',
    bufferPages: true,
  });

  doc.pipe(writeStream);

  const PAGE_WIDTH = 595.28;
  const PAGE_HEIGHT = 841.89;
  const MARGIN_X = 50;
  const TABLE_WIDTH = 495; // 545 - 50
  const MAX_PAGE_Y = 740;  // Safe threshold before page bottom

  // Table Column Coordinates & Widths
  const COL_INDEX = { x: 50, width: 28 };
  const COL_CLASS = { x: 78, width: 90 };
  const COL_SCORE = { x: 168, width: 45 };
  const COL_TEXT  = { x: 213, width: 332, textPaddingX: 7, textWidth: 318 };

  // Helper: Draw standardized table header
  const drawTableHeader = (y, isContinued = false) => {
    if (isContinued) {
      doc
        .fontSize(8)
        .fillColor('#94a3b8')
        .font('Helvetica')
        .text('AICheck — Sentence-by-Sentence Audit Breakdown (Continued)', MARGIN_X, y - 14, { width: TABLE_WIDTH });
    }

    doc
      .rect(MARGIN_X, y, TABLE_WIDTH, 20)
      .fillAndStroke('#e2e8f0', '#cbd5e1');

    doc.fontSize(8.5).fillColor('#334155').font('Helvetica-Bold');
    doc.text('#', COL_INDEX.x, y + 6, { width: COL_INDEX.width, align: 'center' });
    doc.text('Classification', COL_CLASS.x + 8, y + 6, { width: COL_CLASS.width - 12 });
    doc.text('Score', COL_SCORE.x, y + 6, { width: COL_SCORE.width, align: 'center' });
    doc.text('Sentence Text', COL_TEXT.x + COL_TEXT.textPaddingX, y + 6, { width: COL_TEXT.textWidth });
  };

  // --- BRAND HEADER ---
  doc
    .fillColor('#00d2ff')
    .fontSize(22)
    .font('Helvetica-Bold')
    .text('AICheck', 50, 50);

  doc
    .fillColor('#64748b')
    .fontSize(10)
    .font('Helvetica')
    .text('AI Content Detection & Writing Pattern Audit Report', 50, 75);

  doc
    .strokeColor('#e2e8f0')
    .lineWidth(1)
    .moveTo(50, 95)
    .lineTo(545, 95)
    .stroke();

  // --- DOCUMENT METADATA ---
  let currentY = 112;
  doc.fontSize(9.5).fillColor('#334155').font('Helvetica');

  doc.text('Document Name:', 50, currentY);
  doc.font('Helvetica-Bold').text(`${analysisData.documentName || 'Untitled Document'}`, 160, currentY, { width: 385, ellipsis: true });

  currentY += 16;
  doc.font('Helvetica').text('Analysis Timestamp:', 50, currentY);
  doc.font('Helvetica-Bold').text(`${new Date(analysisData.analysisTimestamp || Date.now()).toLocaleString()}`, 160, currentY);

  currentY += 16;
  doc.font('Helvetica').text('Total Words:', 50, currentY);
  doc.font('Helvetica-Bold').text(`${analysisData.totalWords || 0} words`, 160, currentY);

  currentY += 16;
  doc.font('Helvetica').text('Total Sentences:', 50, currentY);
  doc.font('Helvetica-Bold').text(`${analysisData.totalSentences || 0} sentences`, 160, currentY);

  currentY += 16;
  doc.font('Helvetica').text('Model Engine:', 50, currentY);
  doc.font('Helvetica-Bold').text(`${analysisData.modelName || 'AICheck Classifier'} (v${analysisData.modelVersion || '1.5.0'})`, 160, currentY);

  // --- EXECUTIVE SCORES BOX ---
  currentY += 26;
  doc
    .rect(50, currentY, 495, 70)
    .fillAndStroke('#f8fafc', '#cbd5e1');

  // AI-Like Score Box
  doc
    .fontSize(9.5)
    .fillColor('#b45309')
    .font('Helvetica-Bold')
    .text('AI-LIKE PATTERNS', 70, currentY + 14);
  doc
    .fontSize(22)
    .fillColor('#d97706')
    .text(`${analysisData.overallAiLikePercentage || 0}%`, 70, currentY + 32);

  // Human-Like Score Box
  doc
    .fontSize(9.5)
    .fillColor('#047857')
    .font('Helvetica-Bold')
    .text('HUMAN-LIKE PATTERNS', 230, currentY + 14);
  doc
    .fontSize(22)
    .fillColor('#059669')
    .text(`${analysisData.overallHumanLikePercentage || 0}%`, 230, currentY + 32);

  // Uncertain Score Box
  doc
    .fontSize(9.5)
    .fillColor('#475569')
    .font('Helvetica-Bold')
    .text('UNCERTAIN CONTENT', 390, currentY + 14);
  doc
    .fontSize(22)
    .fillColor('#64748b')
    .text(`${analysisData.uncertainPercentage || 0}%`, 390, currentY + 32);

  // --- LINGUISTIC DIAGNOSTICS ROW ---
  currentY += 80;
  const diag = analysisData.linguisticDiagnostics || {};
  doc.fontSize(8.5).fillColor('#475569').font('Helvetica');
  doc.text(
    `Burstiness Index: ${diag.burstinessScore ?? 'N/A'}/100   |   Perplexity Heuristic: ${diag.perplexityIndex ?? 'N/A'}/100   |   Lexical Diversity: ${diag.lexicalDiversity ?? 'N/A'}%`,
    50,
    currentY
  );

  if (diag.sentenceDistribution) {
    currentY += 12;
    doc.text(
      `Sentence Distribution: ${diag.sentenceDistribution.short || 0} Short (≤10w), ${diag.sentenceDistribution.medium || 0} Medium (11-26w), ${diag.sentenceDistribution.long || 0} Long (>26w)`,
      50,
      currentY
    );
  }

  // --- SENTENCE-LEVEL BREAKDOWN TABLE ---
  currentY += 22;
  doc
    .fontSize(12)
    .fillColor('#0f172a')
    .font('Helvetica-Bold')
    .text('Sentence-by-Sentence Breakdown', 50, currentY);

  currentY += 18;

  // Draw Page 1 Table Header
  drawTableHeader(currentY, false);
  currentY += 20;

  const sentences = analysisData.sentenceResults || [];

  for (let i = 0; i < sentences.length; i++) {
    const s = sentences[i];
    const sentenceText = (s.text ? String(s.text).trim() : '');

    // Accurately calculate wrapped text height in the Sentence Text column
    doc.font('Helvetica').fontSize(8.5);
    const textHeight = doc.heightOfString(sentenceText, {
      width: COL_TEXT.textWidth,
      lineGap: 2,
    });

    // Row height includes top (6pt) + bottom (6pt) cell padding, with minimum height 22pt
    const rowHeight = Math.max(22, Math.ceil(textHeight + 12));

    // Dynamic Page Break Check: if row overflows current page, break to new page
    if (currentY + rowHeight > MAX_PAGE_Y) {
      doc.addPage();
      currentY = 50;
      drawTableHeader(currentY, true);
      currentY += 20;
    }

    // Row styling with alternating zebra backgrounds
    const isEven = i % 2 === 0;
    const rowBg = isEven ? '#ffffff' : '#f8fafc';

    // Draw row container rectangle with border
    doc
      .rect(MARGIN_X, currentY, TABLE_WIDTH, rowHeight)
      .fillAndStroke(rowBg, '#e2e8f0');

    // Draw subtle vertical column dividers
    doc
      .strokeColor('#e2e8f0')
      .lineWidth(0.5)
      .moveTo(COL_CLASS.x, currentY).lineTo(COL_CLASS.x, currentY + rowHeight)
      .moveTo(COL_SCORE.x, currentY).lineTo(COL_SCORE.x, currentY + rowHeight)
      .moveTo(COL_TEXT.x, currentY).lineTo(COL_TEXT.x, currentY + rowHeight)
      .stroke();

    // Determine Classification Tag & Brand Colors
    const rawTag = (s.classification || 'uncertain').toUpperCase();
    let tag = rawTag;
    let tagColor = '#475569';
    if (rawTag.includes('AI')) {
      tag = 'AI-LIKE';
      tagColor = '#d97706';
    } else if (rawTag.includes('HUMAN')) {
      tag = 'HUMAN-LIKE';
      tagColor = '#059669';
    } else {
      tag = 'UNCERTAIN';
      tagColor = '#64748b';
    }

    const cellPaddingY = 6;

    // Render Col 1: Sentence Index (#)
    doc
      .fillColor('#64748b')
      .font('Helvetica')
      .fontSize(8)
      .text(`${i + 1}`, COL_INDEX.x, currentY + cellPaddingY, {
        width: COL_INDEX.width,
        align: 'center',
      });

    // Render Col 2: Classification Badge Text
    doc
      .fillColor(tagColor)
      .font('Helvetica-Bold')
      .fontSize(8)
      .text(tag, COL_CLASS.x + 8, currentY + cellPaddingY, {
        width: COL_CLASS.width - 12,
      });

    // Render Col 3: Score (%)
    doc
      .fillColor('#334155')
      .font('Helvetica-Bold')
      .fontSize(8)
      .text(`${s.score ?? 0}%`, COL_SCORE.x, currentY + cellPaddingY, {
        width: COL_SCORE.width,
        align: 'center',
      });

    // Render Col 4: Wrapped Full Sentence Text (No ellipsis truncation, zero vertical overlap)
    doc
      .fillColor('#1e293b')
      .font('Helvetica')
      .fontSize(8.5)
      .text(sentenceText, COL_TEXT.x + COL_TEXT.textPaddingX, currentY + cellPaddingY, {
        width: COL_TEXT.textWidth,
        lineGap: 2,
      });

    // Advance currentY by the row's exact calculated height
    currentY += rowHeight;
  }

  // --- LEGAL & PROBABILISTIC DISCLAIMER FOOTER ---
  const disclaimerText =
    'ETHICAL & PROBABILISTIC DISCLAIMER: AI content detection measures heuristic stylistic writing patterns rather than deterministic proof of authorship. Highly structured human writing (e.g. legal documents, academic research, technical resumes) may exhibit elevated AI-like scores (false positives), and edited AI text may evade pattern detection (false negatives). Outputs must never be used as sole evidence for academic, disciplinary, or recruitment action without independent human review.';

  doc.font('Helvetica-Oblique').fontSize(8);
  const disclaimerHeight = doc.heightOfString(disclaimerText, {
    width: TABLE_WIDTH,
    align: 'justify',
  });

  const spaceNeeded = disclaimerHeight + 35;

  // Check if disclaimer fits on current page
  if (currentY + spaceNeeded > 780) {
    doc.addPage();
    currentY = 50;
  } else {
    currentY += 16;
  }

  // Top divider line
  doc
    .strokeColor('#cbd5e1')
    .lineWidth(1)
    .moveTo(MARGIN_X, currentY)
    .lineTo(MARGIN_X + TABLE_WIDTH, currentY)
    .stroke();

  currentY += 10;

  // Disclaimer body
  doc
    .fontSize(8)
    .fillColor('#64748b')
    .font('Helvetica-Oblique')
    .text(disclaimerText, MARGIN_X, currentY, {
      width: TABLE_WIDTH,
      align: 'justify',
    });

  // --- NUMBER ALL PAGES (BufferPages) ---
  const range = doc.bufferedPageRange();
  for (let p = 0; p < range.count; p++) {
    doc.switchToPage(p);
    const prevBottom = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    doc
      .fontSize(8)
      .fillColor('#94a3b8')
      .font('Helvetica')
      .text(`Page ${p + 1} of ${range.count}`, MARGIN_X, 810, {
        width: TABLE_WIDTH,
        align: 'center',
        lineBreak: false,
      });
    doc.page.margins.bottom = prevBottom;
  }

  // Finalize PDF stream
  doc.end();
}

export default {
  generatePdfReport,
};
