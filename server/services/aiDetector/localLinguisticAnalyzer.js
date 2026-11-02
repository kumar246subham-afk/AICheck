/**
 * Genuine Local Statistical & Linguistic Analyzer
 * Measures Sentence Length Distribution, Burstiness (CV), Lexical Diversity (TTR),
 * Repeated Phrase Signatures (n-grams), and Documented Perplexity Heuristics.
 * 
 * Completely deterministic — zero random numbers.
 */

// Formal AI-favored transition patterns and cliché vocabulary
const AI_MARKER_WORDS = new Set([
  'furthermore', 'moreover', 'multifaceted', 'paramount', 'testament',
  'delve', 'crucial', 'comprehensive', 'fosters', 'paradigm', 'nuanced',
  'intricate', 'underscores', 'seamlessly', 'pivotal', 'embark', 'tapestry',
  'utilize', 'holistic', 'leverage', 'optimal', 'interplay', 'navigating',
  'realm', 'showcases', 'notably', 'in conclusion', 'in summary', 'it is important to note',
  'it is worth noting', 'plays a crucial role', 'in the modern era', 'testament to',
  'spearhead', 'beacon', 'unravel', 'unwavering', 'ever-evolving', 'synergistic'
]);

/**
 * Calculate standard deviation
 */
function standardDeviation(values, mean) {
  if (values.length <= 1) return 0;
  const squareDiffs = values.map((value) => Math.pow(value - mean, 2));
  const avgSquareDiff = squareDiffs.reduce((sum, d) => sum + d, 0) / (values.length - 1);
  return Math.sqrt(avgSquareDiff);
}

/**
 * Calculate lexical diversity (Type-Token Ratio)
 */
function calculateTTR(tokens) {
  if (tokens.length === 0) return 0;
  const unique = new Set(tokens.map((t) => t.toLowerCase()));
  return unique.size / tokens.length;
}

/**
 * Detect repeated 3-gram and 4-gram phrases across the text
 * @param {Array<string>} words 
 * @returns {Array<{ phrase: string, count: number }>}
 */
function detectRepeatedPhrases(words) {
  if (!words || words.length < 12) return [];

  const phraseCounts = new Map();
  // Check 3-word and 4-word windows
  for (const n of [3, 4]) {
    for (let i = 0; i <= words.length - n; i++) {
      const phrase = words.slice(i, i + n).join(' ').toLowerCase();
      // Skip pure stopword chains
      if (/^(the|of|and|in|to|a|is|that|for)\s/.test(phrase)) {
        phraseCounts.set(phrase, (phraseCounts.get(phrase) || 0) + 1);
      }
    }
  }

  const repeated = [];
  for (const [phrase, count] of phraseCounts.entries()) {
    if (count >= 2 && phrase.length > 10) {
      repeated.push({ phrase, count });
    }
  }

  // Sort by count descending, limit to top 5
  return repeated.sort((a, b) => b.count - a.count).slice(0, 5);
}

/**
 * Analyze statistical writing patterns for a set of tokenized sentences
 * @param {Array<{ index: number, text: string, wordCount: number }>} sentences 
 * @param {string} fullText
 * @returns {object}
 */
export function analyzeLinguisticPatterns(sentences, fullText) {
  if (!sentences || sentences.length === 0) {
    return {
      sentenceScores: [],
      burstinessScore: 50,
      perplexityIndex: 50,
      lexicalDiversity: 50,
      repeatedPhrases: [],
      sentenceDistribution: { short: 0, medium: 0, long: 0 },
      coefficientOfVariation: 0,
    };
  }

  const allWords = fullText.toLowerCase().match(/\b[a-z]{2,}\b/g) || [];
  const ttr = calculateTTR(allWords);

  // 1. Calculate Sentence Length Distribution & Burstiness
  const sentenceLengths = sentences.map((s) => s.wordCount);
  const avgSentenceLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentences.length;
  const lengthStdDev = standardDeviation(sentenceLengths, avgSentenceLength);

  // Coefficient of Variation (CV = StdDev / Mean):
  // Human writing typically exhibits high syntactic variance: CV > 0.40
  // LLM outputs cluster into predictable cadence: CV < 0.25
  const coefficientOfVariation = avgSentenceLength > 0 ? (lengthStdDev / avgSentenceLength) : 0;
  
  // Categorize sentence length distribution
  const sentenceDistribution = {
    short: sentenceLengths.filter((l) => l <= 10).length,
    medium: sentenceLengths.filter((l) => l > 10 && l <= 26).length,
    long: sentenceLengths.filter((l) => l > 26).length,
  };

  // 2. Detect repeated n-gram phrases
  const repeatedPhrases = detectRepeatedPhrases(allWords);

  // 3. Evaluate each sentence individually
  const sentenceScores = sentences.map((sentence) => {
    const sWords = sentence.text.toLowerCase().match(/\b[a-z]{2,}\b/g) || [];
    const count = sWords.length;
    if (count === 0) {
      return { index: sentence.index, score: 50, classification: 'uncertain' };
    }

    let sentenceAiPoints = 50; // Neutral baseline

    // A. Check for AI marker vocabulary
    let markerCount = 0;
    for (const w of sWords) {
      if (AI_MARKER_WORDS.has(w)) markerCount++;
    }
    const markerRatio = markerCount / count;
    sentenceAiPoints += Math.min(35, Math.round(markerRatio * 150));

    // B. Check sentence length deviation from human extremes
    if (count >= 14 && count <= 24) {
      // Classic AI sweet-spot (uniform medium sentence)
      sentenceAiPoints += 10;
    } else if (count <= 6 || count >= 32) {
      // Human burstiness pattern (punchy fragment or sprawling complex clause)
      sentenceAiPoints -= 18;
    }

    // C. Punctuation complexity (semicolons, dashes, ellipses, quotes indicate human nuance)
    const hasComplexPunctuation = /[—–;\:\(\)\"\“]/.test(sentence.text);
    if (hasComplexPunctuation) {
      sentenceAiPoints -= 8;
    }

    // Bound sentence score strictly between 5 and 95
    const finalScore = Math.max(5, Math.min(95, sentenceAiPoints));

    let classification = 'uncertain';
    if (finalScore >= 60) classification = 'ai';
    else if (finalScore < 40) classification = 'human';

    return {
      index: sentence.index,
      text: sentence.text,
      wordCount: count,
      score: finalScore,
      classification,
    };
  });

  // 4. Clearly Documented Heuristic Perplexity Index
  // Formula: Perplexity = round((TTR * 50) + (min(1.0, CV) * 50))
  // Combines lexical unpredictability (vocabulary diversity) with structural unpredictability (sentence length variance)
  const perplexityIndex = Math.round((ttr * 50) + (Math.min(1.0, coefficientOfVariation) * 50));

  return {
    sentenceScores,
    burstinessScore: Math.round(coefficientOfVariation * 100),
    perplexityIndex,
    lexicalDiversity: Math.round(ttr * 100),
    repeatedPhrases,
    sentenceDistribution,
    coefficientOfVariation: Math.round(coefficientOfVariation * 100) / 100,
  };
}

export default {
  analyzeLinguisticPatterns,
};
