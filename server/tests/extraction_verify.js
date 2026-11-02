import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import axios from 'axios';
import FormData from 'form-data';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runExtractionAudit() {
  console.log('--- Starting Multi-Format Document Extraction Audit ---');

  const testDir = path.join(__dirname, 'temp_fixtures');
  if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });

  const txtPath = path.join(testDir, 'sample.txt');
  const pdfPath = path.join(testDir, 'sample.pdf');

  // 1. Create real TXT file
  const txtContent = "Artificial intelligence models analyze linguistic perplexity and burstiness to evaluate probabilistic writing pattern signatures.";
  fs.writeFileSync(txtPath, txtContent, 'utf8');

  // 2. Create real PDF file using PDFKit
  await new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);
    doc.fontSize(14).text("This is an authenticated PDF document created for automated verification of AICheck text extraction.");
    doc.fontSize(12).text("Machine learning models evaluate semantic sentence structures with high statistical precision.");
    doc.end();
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  // 3. Test TXT extraction via API
  console.log('Testing TXT extraction via POST /api/v1/documents/extract...');
  const txtForm = new FormData();
  txtForm.append('file', fs.createReadStream(txtPath), { filename: 'sample.txt', contentType: 'text/plain' });
  const txtRes = await axios.post('http://localhost:5000/api/v1/documents/extract', txtForm, {
    headers: txtForm.getHeaders(),
  });
  console.log('TXT Extraction result:', txtRes.data.data.format, 'Words:', txtRes.data.data.wordCount);
  if (!txtRes.data.data.text.includes('linguistic perplexity')) {
    throw new Error('TXT extraction failed: text content missing');
  }

  // 4. Test PDF extraction via API
  console.log('Testing PDF extraction via POST /api/v1/documents/extract...');
  const pdfForm = new FormData();
  pdfForm.append('file', fs.createReadStream(pdfPath), { filename: 'sample.pdf', contentType: 'application/pdf' });
  const pdfRes = await axios.post('http://localhost:5000/api/v1/documents/extract', pdfForm, {
    headers: pdfForm.getHeaders(),
  });
  console.log('PDF Extraction result:', pdfRes.data.data.format, 'Words:', pdfRes.data.data.wordCount);
  if (!pdfRes.data.data.text.includes('authenticated PDF document')) {
    throw new Error('PDF extraction failed: expected text missing');
  }

  // Cleanup temp files
  fs.rmSync(testDir, { recursive: true, force: true });
  console.log('✅ Multi-format extraction test passed successfully!');
}

runExtractionAudit().catch((err) => {
  console.error('Extraction audit failed:', err.message);
  process.exit(1);
});
