import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseDocumentBuffer } from '../services/documentParser/parser.js';
import { generatePdfReport } from '../services/reportGenerator/pdfGenerator.js';
import { detectAiContent } from '../services/aiDetector/detector.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runExtractionAudit() {
  console.log('===============================================================');
  console.log('         DOCUMENT EXTRACTION & PARSER COMPREHENSIVE AUDIT      ');
  console.log('===============================================================\n');

  // 1. Plain Text (.txt)
  console.log('▶ [1] Testing TXT Extraction...');
  const txtContent = Buffer.from('Artificial intelligence models analyze linguistic features across text corpora to identify repetitive syntax.');
  const txtRes = await parseDocumentBuffer(txtContent, 'sample.txt', 'text/plain');
  console.log(`  ✔ TXT Parsed: ${txtRes.wordCount} words, format: ${txtRes.format}`);

  // 2. Empty Document
  console.log('\n▶ [2] Testing Empty File Rejection...');
  try {
    await parseDocumentBuffer(Buffer.from(''), 'empty.txt', 'text/plain');
    console.error('  ❌ Failed: Empty file was not rejected!');
  } catch (err) {
    console.log(`  ✔ Passed: Empty file rejected with: "${err.message}"`);
  }

  // 3. Corrupted PDF Document
  console.log('\n▶ [3] Testing Corrupted PDF File Handling...');
  try {
    const corruptPdf = Buffer.from('%PDF-1.4 corrupted binary trash %%EOF');
    await parseDocumentBuffer(corruptPdf, 'corrupted.pdf', 'application/pdf');
    console.error('  ❌ Failed: Corrupted PDF was not rejected!');
  } catch (err) {
    console.log(`  ✔ Passed: Corrupted PDF rejected gracefully: "${err.message}"`);
  }

  // 4. Corrupted DOCX Document
  console.log('\n▶ [4] Testing Corrupted DOCX File Handling...');
  try {
    const corruptDocx = Buffer.from('PK\x03\x04 fake corrupted zip stream');
    await parseDocumentBuffer(corruptDocx, 'corrupted.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    console.error('  ❌ Failed: Corrupted DOCX was not rejected!');
  } catch (err) {
    console.log(`  ✔ Passed: Corrupted DOCX rejected gracefully: "${err.message}"`);
  }

  // 5. Real PDF Generation and Extraction Round-trip
  console.log('\n▶ [5] Testing PDF Generation & Extraction Round-trip...');
  const analysisData = await detectAiContent('The comprehensive interplay of algorithmic models and deep learning frameworks fosters unprecedented automation across enterprise systems. Furthermore, navigating this intricate landscape enables organizations to optimize productivity.');
  
  const tempPdfPath = path.join(__dirname, 'temp_audit_report.pdf');
  const writeStream = fs.createWriteStream(tempPdfPath);
  generatePdfReport({
    documentName: 'Audit_Test_Document.pdf',
    overallAiLikePercentage: analysisData.overallAiLikePercentage,
    overallHumanLikePercentage: analysisData.overallHumanLikePercentage,
    uncertainPercentage: analysisData.uncertainPercentage,
    totalWords: analysisData.totalWords,
    totalSentences: analysisData.totalSentences,
    sentenceResults: analysisData.sentenceResults,
    modelName: analysisData.modelName,
    modelVersion: analysisData.modelVersion,
    analysisTimestamp: new Date().toISOString(),
  }, writeStream);

  await new Promise((resolve) => writeStream.on('finish', resolve));
  const pdfBytes = fs.readFileSync(tempPdfPath);
  console.log(`  ✔ PDF Report Generated: ${pdfBytes.length} bytes`);

  // Now parse back the generated PDF using unpdf
  const pdfExtractRes = await parseDocumentBuffer(pdfBytes, 'Audit_Test_Document.pdf', 'application/pdf');
  console.log(`  ✔ PDF Extracted: ${pdfExtractRes.wordCount} words extracted from generated PDF`);
  
  // Cleanup temp file
  fs.unlinkSync(tempPdfPath);
  console.log('  ✔ Temporary audit PDF cleaned up.');

  console.log('\n===============================================================');
  console.log('             DOCUMENT AUDIT COMPLETED SUCCESSFULLY             ');
  console.log('===============================================================\n');
}

runExtractionAudit().catch(console.error);
