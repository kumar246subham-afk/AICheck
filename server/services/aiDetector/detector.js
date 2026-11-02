import { tokenizeSentences } from './sentenceTokenizer.js';
import { analyzeLinguisticPatterns } from './localLinguisticAnalyzer.js';
import { queryHuggingFaceModel } from './modelProvider.js';
import { aggregateDetectionScores } from './scoreAggregator.js';

/**
 * Master AI Content Detection & Writing Pattern Evaluation Function
 * @param {string} text 
 * @param {object} options 
 * @returns {Promise<object>}
 */
export async function detectAiContent(text, options = {}) {
  if (!text || typeof text !== 'string') {
    throw new Error('Input text must be a valid, non-empty string.');
  }

  const trimmed = text.trim();
  const words = trimmed.split(/\s+/).filter(Boolean);

  if (words.length < 15) {
    throw new Error('Document is too short for reliable pattern analysis. Please provide at least 15 words.');
  }

  // 1. Tokenize into sentences with boundary preservation
  const sentences = tokenizeSentences(trimmed);
  if (sentences.length === 0) {
    throw new Error('No valid sentences could be identified in the submitted text.');
  }

  // 2. Run Genuine Deterministic Heuristic Linguistic Evaluation
  const linguisticStats = analyzeLinguisticPatterns(sentences, trimmed);
  let sentenceScores = linguisticStats.sentenceScores;

  // Default baseline: Algorithmic Heuristic Engine
  let activeEngineMode = 'heuristic';
  let modelName = 'AICheck Heuristic Linguistic & Statistical Engine';
  let modelVersion = '1.5.0';
  let externalProviderStatus = {
    configured: false,
    status: 'unconfigured',
    provider: 'Hugging Face Inference API',
    message: 'Running standalone deterministic linguistic heuristic engine.',
  };

  // 3. Inspect Hugging Face integration if configured
  const hfKey = process.env.HUGGINGFACE_API_KEY;
  const hfModelUrl = process.env.HUGGINGFACE_MODEL_URL;

  if (hfKey && hfKey.trim() !== '') {
    externalProviderStatus.configured = true;
    try {
      const chunk = words.slice(0, 400).join(' ');
      const hfResult = await queryHuggingFaceModel(chunk, hfKey, hfModelUrl);

      if (hfResult && hfResult.success === true && typeof hfResult.aiScore === 'number') {
        activeEngineMode = 'neural_hybrid';
        modelName = 'RoBERTa Legacy GPT-2 Detector + Heuristic Blend';
        modelVersion = '2.2.0';
        externalProviderStatus = {
          configured: true,
          status: 'connected',
          provider: hfResult.provider,
          model: hfResult.model,
          rawScore: hfResult.aiScore,
          legacyWarning: hfResult.legacyWarning || 'Model was trained on GPT-2 outputs and is not a calibrated modern ChatGPT detector.',
        };

        // Blend external score (60% weight) with local sentence scores (40% weight)
        sentenceScores = sentenceScores.map((s) => {
          const blendedScore = Math.max(5, Math.min(95, Math.round((hfResult.aiScore * 0.6) + (s.score * 0.4))));
          let classification = 'uncertain';
          if (blendedScore >= 60) classification = 'ai';
          else if (blendedScore < 40) classification = 'human';

          return {
            ...s,
            score: blendedScore,
            classification,
          };
        });
      } else {
        // Model call was attempted but failed (e.g. 401, 503, network error)
        // DO NOT silently claim neural hybrid mode!
        activeEngineMode = 'heuristic_fallback';
        externalProviderStatus = {
          configured: true,
          status: 'error',
          provider: 'Hugging Face Inference API',
          error: hfResult?.error || 'Failed to receive inference response from Hugging Face.',
          fallbackApplied: true,
          message: 'External neural model unavailable; analyzed using AICheck Deterministic Heuristic Engine.',
        };
      }
    } catch (hfErr) {
      activeEngineMode = 'heuristic_fallback';
      externalProviderStatus = {
        configured: true,
        status: 'error',
        provider: 'Hugging Face Inference API',
        error: hfErr.message,
        fallbackApplied: true,
        message: 'External provider encountered an error; analyzed using AICheck Deterministic Heuristic Engine.',
      };
    }
  }

  // 4. Derive specific qualitative diagnostic indicators
  const indicators = {
    aiIndicators: [],
    humanIndicators: [],
    uncertaintyNotes: [],
  };

  // Burstiness (sentence length variation)
  if (linguisticStats.burstinessScore < 25) {
    indicators.aiIndicators.push(`Uniform sentence structure (Low Burstiness Index: ${linguisticStats.burstinessScore}/100) typical of automated text.`);
  } else if (linguisticStats.burstinessScore > 50) {
    indicators.humanIndicators.push(`Dynamic sentence length variation (High Burstiness Index: ${linguisticStats.burstinessScore}/100) characteristic of human writing.`);
  } else {
    indicators.uncertaintyNotes.push(`Moderate sentence length rhythm (Burstiness: ${linguisticStats.burstinessScore}/100).`);
  }

  // Lexical Diversity
  if (linguisticStats.lexicalDiversity < 60 && words.length > 50) {
    indicators.aiIndicators.push(`Repetitive vocabulary patterns (Lexical Diversity TTR: ${linguisticStats.lexicalDiversity}%).`);
  } else if (linguisticStats.lexicalDiversity > 75) {
    indicators.humanIndicators.push(`High lexical diversity and varied word choice (TTR: ${linguisticStats.lexicalDiversity}%).`);
  }

  // 5. Aggregate scores with transparent labels and legal disclaimers
  const aggregated = aggregateDetectionScores(sentenceScores, linguisticStats, {
    modelName,
    modelVersion,
    activeEngineMode,
    externalProviderStatus,
    indicators,
  });

  return aggregated;
}

export default {
  detectAiContent,
};
