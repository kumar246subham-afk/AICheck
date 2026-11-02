# AICheck — AI Detection Quality & Model Validation Report

**Date of Audit**: November 2, 2026  
**Status**: Completed  
**Application Scope**: AI Detection Engine & Model Integrations  

---

## 1. Executive Summary & Critical Findings

### ⚠️ Critical Finding: Legacy GPT-2 Model vs. Modern LLMs
- The previously referenced external model checkpoint, **`roberta-base-openai-detector`**, was developed by OpenAI and fine-tuned in **2019** on GPT-2 output (1.5B parameters).
- **Official Model Card Warning**: The official Hugging Face model card explicitly warns that this model **is not trained or calibrated to detect modern generative models (such as ChatGPT, GPT-4, Claude, or Gemini)**.
- **API Connectivity Finding**: The legacy subdomain `https://api-inference.huggingface.co/` has been deprecated by Hugging Face (`ENOTFOUND`). The current router is `https://router.huggingface.co/hf-inference/models/roberta-base-openai-detector`, which requires an authenticated Hugging Face API bearer token (returning HTTP 401 Unauthorized when unauthenticated).

### Transparent System Architecture
AICheck resolves this through a transparent, dual-tier architecture:
1. **Primary Active Engine**: `AICheck Heuristic Linguistic & Statistical Engine (v1.5.0)`.
   - Fully deterministic algorithmic NLP.
   - Measures sentence burstiness (length variance standard deviation), lexical diversity (Type-Token Ratio), perplexity heuristics, and formal marker density.
   - **No random numbers (`Math.random()`) and no fabricated scores**.
   - Transparently labeled as a **heuristic writing pattern analyzer**, not a certified mathematical probability of authorship.
2. **External Neural Integration**:
   - If an external model is configured via `HUGGINGFACE_API_KEY`, its status is tracked explicitly (`connected` or `error`).
   - If the external API call fails, times out, or returns 401/503, the system **never silently claims neural hybrid mode**. It reports `Deterministic Heuristic Mode` with the exact provider error.

---

## 2. Active Engine & Exact Provider Details

| Parameter | Current Configuration |
| :--- | :--- |
| **Active Default Engine** | `AICheck Heuristic Linguistic & Statistical Engine` |
| **Engine Version** | `1.5.0` |
| **Classification Methodology** | Deterministic Heuristic Pattern Similarity (Uncalibrated) |
| **Sentence-Level Scoring** | Bounded algorithmic score (5% – 95%) based on marker density, length variance & punctuation |
| **Optional External Provider** | Hugging Face Inference API (`router.huggingface.co`) |
| **External Model Identifier** | `roberta-base-openai-detector` *(Legacy GPT-2 detector)* |
| **Environment Variable** | `HUGGINGFACE_API_KEY` (configured in `server/.env`) |
| **Current Operational Status** | **Heuristic Standalone Active** (`HUGGINGFACE_API_KEY` is unconfigured locally; running deterministic NLP engine with 100% uptime) |

---

## 3. Actual API Connectivity Test

### Direct Endpoint Probing Results:

```bash
# 1. Legacy Hugging Face Endpoint:
POST https://api-inference.huggingface.co/models/roberta-base-openai-detector
Result: getaddrinfo ENOTFOUND api-inference.huggingface.co
Root Cause: Subdomain deprecated by Hugging Face.

# 2. Modern Hugging Face Router Endpoint:
POST https://router.huggingface.co/hf-inference/models/roberta-base-openai-detector
Result: HTTP 401 Unauthorized
Root Cause: Requires active Hugging Face API User Access Token.
```

### Fallback & Anti-Silent Failure Verification:
When `HUGGINGFACE_API_KEY` is omitted or invalid, `detector.js` returns:
```json
{
  "activeEngineMode": "heuristic",
  "modelName": "AICheck Heuristic Linguistic & Statistical Engine",
  "modelVersion": "1.5.0",
  "externalProviderStatus": {
    "configured": false,
    "status": "unconfigured",
    "provider": "Hugging Face Inference API",
    "message": "Running standalone deterministic linguistic heuristic engine."
  }
}
```
The application **never falsely claims** neural hybrid status when the external provider was not reached.

---

## 4. Multi-Sample Test Matrix & Results

Seven diverse writing samples spanning informal prose, formal academic papers, modern AI outputs, and human-edited AI text were evaluated through the engine:

| # | Test Category & Writing Style | Words | AI% | Human% | Uncertain% | Dominant Verdict | Analysis & Validation Notes |
|:---:|:---|:---:|:---:|:---:|:---:|:---:|:---|
| **1** | **Short Informal Human** (Text message to friend) | 22 | 33% | 67% | 0% | **HUMAN-LIKE** | High burstiness (74/100) and high lexical diversity (TTR 95%) correctly flagged human syntax. |
| **2** | **Short Formal AI** (Executive buzzword snippet) | 15 | 100% | 0% | 0% | **AI-LIKE** | Low burstiness (0/100) and dense marker vocabulary (`furthermore`, `paramount`, `paradigms`) triggered AI classification. |
| **3** | **Long Informal Human** (Childhood fishing memoir) | 127 | 38% | 0% | 62% | **UNCERTAIN** | Conversational narrative fell into the 40–59% inconclusive band; neither formulaic AI transitions nor academic phrasing dominated. |
| **4** | **Long Formal Academic Paper** (Biophysics abstract) | 80 | 100% | 0% | 0% | **AI-LIKE (FALSE POSITIVE)** | **Empirical False Positive**: Formal human research papers share syntactic uniformity and structured transitions with AI text. |
| **5** | **Long Modern AI Article** (Smart cities & IoT) | 88 | 100% | 0% | 0% | **AI-LIKE** | Accurately captured formulaic transitions (`In the modern era`, `crucial role`, `furthermore`, `moreover`, `paramount`). |
| **6** | **Edited / Paraphrased AI Text** (Humanized IoT text) | 90 | 40% | 0% | 60% | **LEANING-AI / UNCERTAIN** | **Empirical Evasion**: Inserting conversational idioms and sentence splices reduced the AI score from 100% down to 40% AI / 60% Uncertain. |
| **7** | **Human Legal Contract** (Non-disclosure clause) | 74 | 100% | 0% | 0% | **AI-LIKE (FALSE POSITIVE)** | **Empirical False Positive**: Standard legal drafting demands repetitive terminology ("the Recipient shall") and low burstiness (8/100). |

---

## 5. Documented False Positives and False Negatives

### A. False Positives (Human Writing Flagged as AI)
1. **Formal Academic Research**: Scholarly papers written by human researchers often exhibit low sentence length variance (low burstiness) and formal transition vocabulary, which overlaps with AI writing signatures.
2. **Legal & Regulatory Drafting**: Contracts, NDAs, and statutory clauses require rigid repetition and standardized boilerplate phrases, triggering low burstiness and repetitive token patterns.
3. **Non-Native English (ESL/EFL) Writers**: Writers using simpler vocabulary or relying heavily on standard textbook connectors (e.g., `In conclusion`, `Furthermore`, `Moreover`) can trigger elevated AI scores.

### B. False Negatives (AI Writing Flagged as Human or Uncertain)
1. **Human-Paraphrased AI Content**: Breaking up long AI sentences, introducing casual colloquialisms, or running text through paraphrasing tools disrupts the burstiness signature, pushing scores into the Uncertain (40–59%) or Human band.
2. **Creative or Persona-Prompted AI**: Prompting an LLM to write in a chaotic, poetic, or fragmented style artificially inflates the burstiness score.
3. **Very Short Text (<30 words)**: Short snippets lack sufficient token volume to calculate meaningful variance or type-token ratios.

---

## 6. Mathematical & Calculation Verification

- **Sentence-Level Determinism**: Every sentence score is computed mathematically:
  $$\text{Score} = \text{clamp}\left(50 + \Delta_{\text{markers}} + \Delta_{\text{length}} + \Delta_{\text{punctuation}}, 5, 95\right)$$
- **Score Normalization**: Document percentages are strictly bound:
  $$\text{AI\%} + \text{Human\%} + \text{Uncertain\%} = 100\%$$
- **Uncertainty Band**:
  - `< 40%`: Human-like stylistic patterns
  - `40% – 59%`: Uncertain / Inconclusive content
  - `≥ 60%`: AI-like stylistic patterns
- **Zero Fabrication**: No random number generation (`Math.random()`) is used in any calculation.

---

## 7. Recommended Production Configuration

To deploy AICheck with modern AI detection capabilities:

### Option 1: Standalone Deterministic Heuristic Engine (Recommended Baseline)
- **Setup**: Leave `HUGGINGFACE_API_KEY` empty.
- **Benefits**: Zero external API costs, zero latency overhead, 100% deterministic availability, and transparent heuristic labeling.

### Option 2: Modern Neural Classifier Integration
- Rather than relying on the legacy 2019 GPT-2 checkpoint (`roberta-base-openai-detector`), integrate a modern transformer model:
  - Hugging Face modern endpoints: e.g. `deshwal/ai-text-detector` or a fine-tuned DeBERTa-v3 / RoBERTa-large checkpoint trained on ChatGPT/GPT-4 corpora.
  - Or commercial specialized APIs (e.g. Sapling, Copyleaks, or Winston AI).
- To configure:
  ```env
  HUGGINGFACE_API_KEY=hf_your_actual_token
  HUGGINGFACE_MODEL_URL=https://router.huggingface.co/hf-inference/models/<MODERN_MODEL_NAME>
  ```

---

## 8. Summary of UI & Documentation Transparency Updates

1. **Document Analyzer Workspace**: Added notice banner:
   *"Probabilistic Heuristic Engine: Results indicate stylistic patterns, not definitive proof of authorship."*
2. **Analysis Result Page**:
   - Replaced misleading "probability" labels with *"heuristic score"*.
   - Added **Transparent Engine & Qualitative Indicators Panel** displaying active engine name, provider connection status, AI markers, and Human markers.
3. **PDF Audit Report**: Enhanced legal disclaimer explicitly warning against false positives in academic/legal contexts.
4. **Landing Page FAQ**: Clarified that AICheck evaluates stylistic patterns and burstiness rather than claiming infallibility.
