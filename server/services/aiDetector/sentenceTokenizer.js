/**
 * Sentence Tokenizer with abbreviation and punctuation preservation
 */

// Common abbreviations that do not denote sentence boundaries
const ABBREVIATIONS = new Set([
  'mr', 'mrs', 'ms', 'dr', 'prof', 'sr', 'jr', 'vs', 'etc', 'eg', 'ie', 'inc', 'ltd', 'corp', 'dept', 'est', 'approx', 'no', 'vol'
]);

/**
 * Tokenize input text into normalized sentences
 * @param {string} text 
 * @returns {Array<{ index: number, text: string, wordCount: number }>}
 */
export function tokenizeSentences(text) {
  if (!text || typeof text !== 'string') return [];

  // Clean and normalize linebreaks
  const cleaned = text.trim();
  if (!cleaned) return [];

  // Match sentences ending in ., !, or ? followed by space or newline, or end of string
  const rawSegments = cleaned.split(/(?<=[.!?])\s+(?=[A-Z0-9"“'‘])/g);
  const sentences = [];

  for (let i = 0; i < rawSegments.length; i++) {
    const raw = rawSegments[i].trim();
    if (!raw) continue;

    // Check if segment is merely an abbreviation that was prematurely split
    const words = raw.split(/\s+/).filter(Boolean);
    const lastWord = words[words.length - 1]?.toLowerCase().replace(/[^a-z]/g, '');

    if (ABBREVIATIONS.has(lastWord) && i + 1 < rawSegments.length) {
      // Merge with next segment
      rawSegments[i + 1] = `${raw} ${rawSegments[i + 1]}`;
      continue;
    }

    if (words.length > 0) {
      sentences.push({
        index: sentences.length,
        text: raw,
        wordCount: words.length,
      });
    }
  }

  // If no punctuation split occurred (e.g. single block of text), create chunks of ~20-30 words
  if (sentences.length === 0 && cleaned.length > 0) {
    const words = cleaned.split(/\s+/).filter(Boolean);
    sentences.push({
      index: 0,
      text: cleaned,
      wordCount: words.length,
    });
  }

  return sentences;
}

export default {
  tokenizeSentences,
};
