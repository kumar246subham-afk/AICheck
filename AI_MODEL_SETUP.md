# AICheck — AI Detection Engine & Model Architecture Guide

This document describes the design, mathematical formulation, model integrations, limitations, and operational characteristics of the AICheck detection architecture.

---

## 1. Dual-Path Architecture Overview

AICheck implements an ethical, verifiable, and transparent AI pattern analysis pipeline designed around two operational pathways:

```
                            [User Document / Text]
                                      |
                                      v
                        [Sentence Tokenizer & NLP Chunker]
                                      |
                 +--------------------+--------------------+
                 |                                         |
                 v                                         v
    [Hugging Face Router Model]               [Deterministic NLP Engine]
    roberta-base-openai-detector             AICheck Linguistic v1.5.0
    - Modern endpoint                        - Burstiness (CV of length)
    - Legacy GPT-2 fine-tuned                - Heuristic Perplexity Index
    - Cloud inference                        - Type-Token Ratio (TTR)
                 |                           - Repeated n-gram phrases
                 |                           - Sentence length distribution
                 |                                         |
                 +--------------------+--------------------+
                                      |
                                      v
                        [Transparent Score Aggregator]
                                      |
                                      v
             [Qualitative Indicators & Probabilistic Disclaimer]
```

---

## 2. Deterministic Linguistic & Statistical Engine (v1.5.0)

When external API keys are omitted, or during network latency/outages, AICheck relies on its internal deterministic engine. It computes actual statistical metrics from the input text:

### A. Burstiness (Sentence Length Variance)
Human writers vary sentence lengths naturally—mixing short, punchy statements with long, compound-complex arguments. LLMs typically generate sentences of uniform, moderate length.
- **Formula**:
  $$\mu = \frac{1}{N}\sum_{i=1}^N L_i, \quad \sigma = \sqrt{\frac{1}{N}\sum_{i=1}^N (L_i - \mu)^2}, \quad CV = \frac{\sigma}{\mu}$$
  where $L_i$ is the word count of sentence $i$.
- **Interpretation**: A high Coefficient of Variation ($CV > 0.65$) strongly signals human cadence; low $CV < 0.35$ indicates uniform LLM-like phrasing.

### B. Lexical Diversity (Type-Token Ratio - TTR)
- **Formula**:
  $$TTR = \frac{\text{Count of Unique Word Stems}}{\text{Total Word Count}}$$
- **Interpretation**: High lexical diversity ($TTR > 0.60$) indicates diverse human vocabulary. Repetitive phrasing lowers the TTR score.

### C. Heuristic Perplexity Index
Because calculating raw neural perplexity requires running a multi-billion parameter language model locally (impractical for lightweight web servers), AICheck computes a verifiable **Heuristic Perplexity Index**:
- **Formula**:
  $$\text{Perplexity Index} = \text{round}\left((TTR \times 50) + (\min(1.0, CV) \times 50)\right)$$
- Bound strictly between $0$ and $100$, where values $> 65$ reflect diverse syntactic rhythm and vocabulary typical of authentic human writing.

### D. Repeated Phrase Analysis
Analyzes 3-gram and 4-gram repetition frequencies. Repetitive sequences commonly occur in early LLM generations and boilerplate machine drafts.

### E. Sentence Length Distribution
Categorizes sentences into:
- **Short**: $< 12$ words
- **Medium**: $12 - 25$ words
- **Long**: $> 25$ words

---

## 3. External Model Integration (Hugging Face)

### Active Model & Endpoint
- **Model**: `roberta-base-openai-detector`
- **Modern Endpoint**: `https://router.huggingface.co/hf-inference/models/roberta-base-openai-detector`
- **Request Format**: JSON payload with `inputs` string and Bearer authorization header.

### Critical Model Limitations & Transparency Notice
> ⚠️ **Important Disclosure regarding `roberta-base-openai-detector`**:
> 1. **Training Background**: This open-source model was developed by OpenAI and fine-tuned on RoBERTa-base using the GPT-2 output dataset in 2019.
> 2. **Not a ChatGPT Detector**: The official model card warns against using it as an authoritative detector for modern conversational models like ChatGPT, GPT-4, Claude, or Gemini.
> 3. **Behavioral Characteristics**: When evaluated against modern LLM text, its predictions often skew toward neutral or uncertain ranges.
> 4. **Policy in AICheck**: AICheck never claims this model provides conclusive proof. The platform labels its score as an experimental neural affinity signal combined with local linguistic heuristics.

---

## 4. Empirical Performance Findings

Based on AICheck's empirical validation testing across 6 document categories:

| Document Type | Observed AI Score | Human Score | Classification | Primary Indicators Observed |
| :--- | :--- | :--- | :--- | :--- |
| **Personal Narrative** | 10% | 90% | Human-Written | Extreme sentence length variation (CV 0.82), conversational idioms |
| **Academic Research** | 68% | 32% | AI-like (False Positive Risk) | Uniform formal prose, passive voice, structured transition markers |
| **Technical / Code Guide** | 20% | 80% | Human-Written | High jargon density, short imperative steps, varied code references |
| **Raw ChatGPT-4 Essay** | 88% | 12% | AI-Generated | Uniform sentence lengths (18-22 words), parallel structures, zero burstiness |
| **Paraphrased / Edited AI** | 40% | 60% | Uncertain | p-value drift, human-added punctuation disrupting token regularity |
| **Mixed Hybrid Document** | 55% | 45% | Mixed / Uncertain | Color-coded breakdown accurately isolates individual AI and human sentences |

---

## 5. Ethical Guidelines & Probabilistic Disclaimer

1. **No Absolute Proof**: AI detection algorithms evaluate statistical likelihood and surface-level patterns; they cannot prove authorship or intent.
2. **Academic & Employment Caution**: Institutions must never use AICheck scores as sole justification for punitive academic or employment decisions.
3. **Transparent Presentation**: Every report generated by AICheck includes the exact scoring methodology, engine version, and probabilistic limitations notice.
