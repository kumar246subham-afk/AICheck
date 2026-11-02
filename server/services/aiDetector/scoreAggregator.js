/**
 * Score Aggregator and Uncertainty Analyzer
 * Ensures scores are strictly normalized, probabilities sum to 100%,
 * and transparent ethical/probabilistic disclaimers are attached.
 */

export function aggregateDetectionScores(sentenceScores, linguisticStats, modelMetadata = {}) {
  const totalSentences = sentenceScores.length;
  if (totalSentences === 0) {
    return {
      overallAiLikePercentage: 0,
      overallHumanLikePercentage: 100,
      uncertainPercentage: 0,
      totalWords: 0,
      totalSentences: 0,
      analyzedSentences: 0,
      sentenceResults: [],
      modelName: modelMetadata.modelName || 'AICheck Heuristic Linguistic & Statistical Engine',
      modelVersion: modelMetadata.modelVersion || '1.5.0',
      activeEngineMode: modelMetadata.activeEngineMode || 'heuristic',
      analysisTimestamp: new Date().toISOString(),
      limitations: 'The document submitted contains no parseable sentences.',
    };
  }

  let totalAiSentences = 0;
  let totalHumanSentences = 0;
  let totalUncertainSentences = 0;
  let totalWords = 0;
  let weightedAiSum = 0;

  for (const s of sentenceScores) {
    totalWords += (s.wordCount || 0);
    const weight = Math.max(1, s.wordCount || 1);
    weightedAiSum += (s.score * weight);

    if (s.classification === 'ai') {
      totalAiSentences++;
    } else if (s.classification === 'human') {
      totalHumanSentences++;
    } else {
      totalUncertainSentences++;
    }
  }

  // Calculate weighted mean score
  const avgWeightedAiScore = totalWords > 0 ? Math.round(weightedAiSum / totalWords) : 50;

  // Derive document-level percentages
  let aiPct = Math.round((totalAiSentences / totalSentences) * 100);
  let humanPct = Math.round((totalHumanSentences / totalSentences) * 100);
  let uncertainPct = 100 - (aiPct + humanPct);

  // Safeguard against rounding discrepancy
  if (uncertainPct < 0) {
    uncertainPct = 0;
    if (aiPct + humanPct > 100) {
      if (aiPct >= humanPct) aiPct = 100 - humanPct;
      else humanPct = 100 - aiPct;
    }
  }

  return {
    overallAiLikePercentage: aiPct,
    overallHumanLikePercentage: humanPct,
    uncertainPercentage: uncertainPct,
    averageAiScore: avgWeightedAiScore,
    totalWords,
    totalSentences,
    analyzedSentences: totalSentences,
    sentenceResults: sentenceScores,
    linguisticDiagnostics: {
      burstinessScore: linguisticStats.burstinessScore,
      perplexityIndex: linguisticStats.perplexityIndex,
      lexicalDiversity: linguisticStats.lexicalDiversity,
      sentenceDistribution: linguisticStats.sentenceDistribution || { short: 0, medium: 0, long: 0 },
      repeatedPhrases: linguisticStats.repeatedPhrases || [],
      coefficientOfVariation: linguisticStats.coefficientOfVariation || 0,
    },
    qualitativeIndicators: modelMetadata.indicators || {
      aiIndicators: [],
      humanIndicators: [],
      uncertaintyNotes: [],
    },
    modelName: modelMetadata.modelName || 'AICheck Heuristic Linguistic & Statistical Engine',
    modelVersion: modelMetadata.modelVersion || '1.5.0',
    activeEngineMode: modelMetadata.activeEngineMode || 'heuristic',
    externalProviderStatus: modelMetadata.externalProviderStatus || {
      configured: false,
      status: 'unconfigured',
      provider: 'Hugging Face Inference API',
    },
    scoringMethodology: 'Heuristic Writing Pattern Similarity (Uncalibrated)',
    analysisTimestamp: new Date().toISOString(),
    limitations: 'AI text evaluation is probabilistic and measures heuristic stylistic markers rather than definitive proof of authorship. Highly structured human writing (e.g. legal contracts, formal academic papers) may show elevated AI pattern scores (False Positives), while edited or paraphrased AI text may show human patterns (False Negatives). Outputs should not be used as the sole basis for academic or disciplinary actions.',
  };
}

export default {
  aggregateDetectionScores,
};
