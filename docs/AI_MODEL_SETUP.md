# AICheck — AI Detection Engine & Model Setup Guide

This document describes how AICheck's multi-layered AI detection system works, how to configure external Hugging Face inference models, and how the built-in local linguistic classifier operates.

---

## 1. Detection Architecture Overview

AICheck implements a genuine, non-fabricated, probabilistic analysis framework composed of:
1. **Sentence Segmentation & Tokenization**: Normalizes whitespace, extracts sentence boundaries, and calculates sentence-level word counts.
2. **Dual-Path Classification**:
   - **Primary (Cloud Hugging Face Endpoint)**: Sends chunked text to RoBERTa-based open-source classifiers (`roberta-base-openai-detector` or `Hello-SimpleAI/chatgpt-detector-roberta`).
   - **Local NLP Heuristic Classifier**: Evaluates linguistic indicators including:
     - **Perplexity & Word Frequency**: Deviation against natural Zipfian distributions.
     - **Burstiness**: Variance in sentence length and syntactic complexity across consecutive sentences (human writing displays high burstiness; LLMs tend to produce uniform, moderate sentence lengths).
     - **Lexical Diversity (Type-Token Ratio)**: Repetitive phrasing and uniform vocabulary patterns.
     - **Entropy & Transition Uniformity**: Uniform n-gram distributions.
3. **Score Aggregation & Uncertainty Thresholding**:
   - Predictor outputs within `40% – 60%` probability are classified as **Uncertain**.
   - Scores `>= 60%` are classified as **AI-like Patterns**.
   - Scores `< 40%` are classified as **Human-like Patterns**.
4. **Probabilistic Disclaimer**: Results represent pattern affinity, never definitive proof of human vs. AI authorship.

---

## 2. Setting Up Hugging Face Inference API

### Step 1: Create a Hugging Face Account
1. Visit [Hugging Face](https://huggingface.co/).
2. Sign up or log into your account.

### Step 2: Generate an Access Token
1. Go to **Settings > Access Tokens** (`https://huggingface.co/settings/tokens`).
2. Click **New token**.
3. Name: `AICheck-Inference`.
4. Type: `Read`.
5. Copy the generated token (`hf_...`).

### Step 3: Configure `server/.env`
Add your key to `server/.env`:
```env
HUGGINGFACE_API_KEY=hf_yourHuggingFaceTokenHere
HUGGINGFACE_MODEL_URL=https://api-inference.huggingface.co/models/roberta-base-openai-detector
```

Alternative supported open-source models:
- `Hello-SimpleAI/chatgpt-detector-roberta`
- `openai-community/roberta-base-openai-detector`

---

## 3. Local NLP Fallback Mode

If `HUGGINGFACE_API_KEY` is not provided or if the Hugging Face API experiences cold-start timeouts (HTTP 503), AICheck smoothly switches to the internal **Local Linguistic Classifier**:
- Does not call external APIs.
- Operates 100% offline.
- Returns deterministic, mathematically evaluated metrics (never random).
- Transparently labels `modelProvider: "AICheck Local Linguistic & Statistical Classifier v1.0"` in the report.
