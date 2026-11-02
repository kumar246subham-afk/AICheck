import axios from 'axios';

// Updated to the current Hugging Face Inference Router endpoint
export const HF_DEFAULT_MODEL_URL = 'https://router.huggingface.co/hf-inference/models/roberta-base-openai-detector';

/**
 * Call Hugging Face Inference API for text classification with explicit status tracking
 * @param {string} textChunk 
 * @param {string} apiKey 
 * @param {string} modelUrl 
 * @returns {Promise<{ success: boolean, aiScore?: number, provider: string, model: string, raw?: any, error?: string, legacyWarning?: string }>}
 */
export async function queryHuggingFaceModel(textChunk, apiKey, modelUrl = HF_DEFAULT_MODEL_URL) {
  const modelIdentifier = modelUrl.split('/models/').pop() || 'roberta-base-openai-detector';

  // Check if API key is provided
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
    return {
      success: false,
      provider: 'Hugging Face Inference API',
      model: modelIdentifier,
      error: 'HUGGINGFACE_API_KEY is not configured in server environment variables.',
    };
  }

  if (!textChunk || typeof textChunk !== 'string' || textChunk.trim().length === 0) {
    return {
      success: false,
      provider: 'Hugging Face Inference API',
      model: modelIdentifier,
      error: 'No text provided for inference.',
    };
  }

  // Warning notice for legacy GPT-2 detector
  const isLegacyGpt2Model = modelIdentifier.includes('roberta-base-openai-detector');
  const legacyWarning = isLegacyGpt2Model
    ? 'NOTICE: roberta-base-openai-detector was trained on GPT-2 output in 2019 and is not calibrated to reliably detect modern LLMs (e.g. ChatGPT, GPT-4, Claude).'
    : null;

  try {
    const response = await axios.post(
      modelUrl,
      { inputs: textChunk },
      {
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json',
        },
        timeout: 8000, // 8-second safety timeout
      }
    );

    const data = response.data;
    if (Array.isArray(data) && data.length > 0) {
      const predictions = Array.isArray(data[0]) ? data[0] : data;
      
      const fakePred = predictions.find((p) => p.label === 'Fake' || p.label === 'LABEL_1' || p.label?.toLowerCase().includes('ai'));
      const realPred = predictions.find((p) => p.label === 'Real' || p.label === 'LABEL_0' || p.label?.toLowerCase().includes('human'));

      const aiScore = fakePred ? Math.round(fakePred.score * 100) : 50;

      return {
        success: true,
        aiScore,
        provider: 'Hugging Face Inference API',
        model: modelIdentifier,
        raw: predictions,
        ...(legacyWarning && { legacyWarning }),
      };
    }

    return {
      success: false,
      provider: 'Hugging Face Inference API',
      model: modelIdentifier,
      error: 'Hugging Face API returned empty or unrecognized response format.',
    };
  } catch (err) {
    let errorMsg = err.message;
    if (err.response?.status === 401) {
      errorMsg = 'Hugging Face API returned 401 Unauthorized: Invalid or missing API key.';
    } else if (err.response?.status === 404) {
      errorMsg = `Hugging Face model "${modelIdentifier}" not found on inference router (404).`;
    } else if (err.response?.status === 503) {
      errorMsg = 'Hugging Face model is currently loading on cold start (503). Try again in 20 seconds.';
    } else if (err.code === 'ECONNABORTED') {
      errorMsg = 'Hugging Face API request timed out after 8 seconds.';
    } else if (err.code === 'ENOTFOUND') {
      errorMsg = 'Hugging Face endpoint DNS lookup failed (ENOTFOUND).';
    }

    return {
      success: false,
      provider: 'Hugging Face Inference API',
      model: modelIdentifier,
      error: errorMsg,
      statusCode: err.response?.status || null,
      ...(legacyWarning && { legacyWarning }),
    };
  }
}

export default {
  queryHuggingFaceModel,
  HF_DEFAULT_MODEL_URL,
};
