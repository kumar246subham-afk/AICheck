import PDFDocument from 'pdfkit';

/**
 * Generate a professional audit PDF report for an analysis result
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

  // Brand Header
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

  // Document & Audit Metadata
  let currentY = 115;
  doc.fontSize(10).fillColor('#334155').font('Helvetica');

  doc.text(`Document Name:`, 50, currentY);
  doc.font('Helvetica-Bold').text(`${analysisData.documentName || 'Untitled Document'}`, 160, currentY);

  currentY += 18;
  doc.font('Helvetica').text(`Analysis Timestamp:`, 50, currentY);
  doc.font('Helvetica-Bold').text(`${new Date(analysisData.analysisTimestamp || Date.now()).toLocaleString()}`, 160, currentY);

  currentY += 18;
  doc.font('Helvetica').text(`Total Words:`, 50, currentY);
  doc.font('Helvetica-Bold').text(`${analysisData.totalWords || 0} words`, 160, currentY);

  currentY += 18;
  doc.font('Helvetica').text(`Total Sentences:`, 50, currentY);
  doc.font('Helvetica-Bold').text(`${analysisData.totalSentences || 0} sentences`, 160, currentY);

  currentY += 18;
  doc.font('Helvetica').text(`Model Engine:`, 50, currentY);
  doc.font('Helvetica-Bold').text(`${analysisData.modelName || 'AICheck Classifier'} (v${analysisData.modelVersion || '1.4'})`, 160, currentY);

  // Executive Scores Box
  currentY += 30;
  doc
    .rect(50, currentY, 495, 75)
    .fillAndStroke('#f8fafc', '#cbd5e1');

  // AI-Like Score Box
  doc
    .fontSize(10)
    .fillColor('#b45309')
    .font('Helvetica-Bold')
    .text('AI-LIKE PATTERNS', 70, currentY + 15);
  doc
    .fontSize(22)
    .fillColor('#d97706')
    .text(`${analysisData.overallAiLikePercentage || 0}%`, 70, currentY + 35);

  // Human-Like Score Box
  doc
    .fontSize(10)
    .fillColor('#047857')
    .text('HUMAN-LIKE PATTERNS', 230, currentY + 15);
  doc
    .fontSize(22)
    .fillColor('#059669')
    .text(`${analysisData.overallHumanLikePercentage || 0}%`, 230, currentY + 35);

  // Uncertain Score Box
  doc
    .fontSize(10)
    .fillColor('#475569')
    .text('UNCERTAIN CONTENT', 390, currentY + 15);
  doc
    .fontSize(22)
    .fillColor('#64748b')
    .text(`${analysisData.uncertainPercentage || 0}%`, 390, currentY + 35);

  // Linguistic Diagnostics Row
  currentY += 88;
  const diag = analysisData.linguisticDiagnostics || {};
  doc.fontSize(8.5).fillColor('#475569').font('Helvetica');
  doc.text(`Burstiness Index: ${diag.burstinessScore ?? 'N/A'}/100   |   Perplexity Heuristic: ${diag.perplexityIndex ?? 'N/A'}/100   |   Lexical Diversity: ${diag.lexicalDiversity ?? 'N/A'}%`, 50, currentY);

  if (diag.sentenceDistribution) {
    currentY += 12;
    doc.text(`Sentence Distribution: ${diag.sentenceDistribution.short || 0} Short (≤10w), ${diag.sentenceDistribution.medium || 0} Medium (11-26w), ${diag.sentenceDistribution.long || 0} Long (>26w)`, 50, currentY);
  }

  // Sentence-Level Breakdown Table
  currentY += 22;
  doc
    .fontSize(13)
    .fillColor('#0f172a')
    .font('Helvetica-Bold')
    .text('Sentence-by-Sentence Breakdown', 50, currentY);

  currentY += 20;

  // Table header
  doc
    .rect(50, currentY, 495, 20)
    .fillAndStroke('#e2e8f0', '#cbd5e1');

  doc
    .fontSize(9)
    .fillColor('#334155')
    .font('Helvetica-Bold')
    .text('#', 60, currentY + 5)
    .text('Classification', 85, currentY + 5)
    .text('Score', 180, currentY + 5)
    .text('Sentence Text', 230, currentY + 5);

  currentY += 25;

  const sentences = analysisData.sentenceResults || [];
  doc.font('Helvetica').fontSize(8.5);

  for (let i = 0; i < sentences.length; i++) {
    const s = sentences[i];
    
    // Check if new page is needed
    if (currentY > 740) {
      doc.addPage();
      currentY = 50;

      // Repeat table header on new page
      doc
        .rect(50, currentY, 495, 20)
        .fillAndStroke('#e2e8f0', '#cbd5e1');
      doc
        .fontSize(9)
        .fillColor('#334155')
        .font('Helvetica-Bold')
        .text('#', 60, currentY + 5)
        .text('Classification', 85, currentY + 5)
        .text('Score', 180, currentY + 5)
        .text('Sentence Text', 230, currentY + 5);
      currentY += 25;
      doc.font('Helvetica').fontSize(8.5);
    }

    const tag = (s.classification || 'uncertain').toUpperCase();
    let tagColor = '#475569';
    if (tag === 'AI' || tag === 'AI_LIKE') tagColor = '#d97706';
    else if (tag === 'HUMAN' || tag === 'HUMAN_LIKE') tagColor = '#059669';

    doc.fillColor('#64748b').text(`${i + 1}`, 60, currentY);
    doc.fillColor(tagColor).font('Helvetica-Bold').text(tag, 85, currentY);
    doc.fillColor('#334155').font('Helvetica').text(`${s.score || 0}%`, 180, currentY);

    const snippet = s.text && s.text.length > 85 ? `${s.text.substring(0, 85)}...` : s.text;
    doc.fillColor('#1e293b').text(snippet, 230, currentY, { width: 310, ellipsis: true });

    currentY += 18;
  }

  // Legal & Probabilistic Disclaimer Footer
  if (currentY > 700) {
    doc.addPage();
    currentY = 50;
  } else {
    currentY += 25;
  }

  doc
    .strokeColor('#e2e8f0')
    .moveTo(50, currentY)
    .lineTo(545, currentY)
    .stroke();

  currentY += 15;
  doc
    .fontSize(8)
    .fillColor('#64748b')
    .font('Helvetica-Oblique')
    .text(
      'ETHICAL & PROBABILISTIC DISCLAIMER: AI content detection measures heuristic stylistic writing patterns rather than deterministic proof of authorship. Highly structured human writing (e.g. legal documents, academic research) may exhibit elevated AI-like scores (false positives), and edited AI text may evade pattern detection (false negatives). Outputs must never be used as sole evidence for academic or disciplinary action without independent verification.',
      50,
      currentY,
      { width: 495, align: 'justify' }
    );

  // Finish document
  doc.end();
}

export default {
  generatePdfReport,
};
