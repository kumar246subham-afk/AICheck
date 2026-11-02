import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

/**
 * Clean and normalize extracted text string
 * @param {string} raw 
 * @returns {string}
 */
export function normalizeText(raw) {
  if (!raw || typeof raw !== 'string') return '';
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g, '') // remove non-printable ASCII
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Extract clean plain text from uploaded file buffer based on mimetype and extension
 * @param {Buffer} buffer 
 * @param {string} originalname 
 * @param {string} mimetype 
 * @returns {Promise<{ text: string, wordCount: number, charCount: number, format: string }>}
 */
export async function parseDocumentBuffer(buffer, originalname = '', mimetype = '') {
  if (!buffer || buffer.length === 0) {
    throw new Error('Uploaded document file is empty.');
  }

  const ext = originalname.split('.').pop().toLowerCase();
  let extractedRawText = '';
  let detectedFormat = ext || 'txt';

  try {
    if (ext === 'pdf' || mimetype === 'application/pdf') {
      detectedFormat = 'PDF';
      try {
        const { extractText } = await import('unpdf');
        const unpdfRes = await extractText(new Uint8Array(buffer));
        extractedRawText = Array.isArray(unpdfRes.text) ? unpdfRes.text.join('\n\n') : (unpdfRes.text || '');
      } catch (unpdfErr) {
        console.warn('unpdf extraction fallback to pdf-parse:', unpdfErr.message);
        const pdfData = await pdfParse(buffer);
        extractedRawText = pdfData.text || '';
      }
    } else if (ext === 'docx' || mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      detectedFormat = 'DOCX';
      const docxResult = await mammoth.extractRawText({ buffer });
      extractedRawText = docxResult.value || '';
    } else if (ext === 'doc' || mimetype === 'application/msword') {
      detectedFormat = 'DOC';
      // Fallback extraction for binary doc or RTF stream
      extractedRawText = buffer.toString('utf-8').replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ');
    } else if (ext === 'txt' || mimetype.startsWith('text/')) {
      detectedFormat = 'TXT';
      extractedRawText = buffer.toString('utf-8');
    } else {
      // Default try UTF-8 decoding
      extractedRawText = buffer.toString('utf-8');
    }
  } catch (parseErr) {
    console.error(`Document parsing failure for ${originalname}:`, parseErr);
    throw new Error(`Failed to parse ${detectedFormat} document. The file might be corrupted or password-protected.`);
  }

  const sanitized = normalizeText(extractedRawText);
  if (!sanitized || sanitized.length === 0) {
    throw new Error('No readable text could be extracted from the document. If this is a scanned PDF image, OCR is required.');
  }

  const words = sanitized.split(/\s+/).filter(Boolean);

  return {
    text: sanitized,
    wordCount: words.length,
    charCount: sanitized.length,
    format: detectedFormat,
  };
}

export default {
  parseDocumentBuffer,
  normalizeText,
};
