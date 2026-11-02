import test from 'node:test';
import assert from 'node:assert/strict';
import { parseDocumentBuffer } from '../services/documentParser/parser.js';
import { tokenizeSentences } from '../services/aiDetector/sentenceTokenizer.js';
import { analyzeLinguisticPatterns } from '../services/aiDetector/localLinguisticAnalyzer.js';
import { detectAiContent } from '../services/aiDetector/detector.js';

test('Document Parser: parses raw text buffer cleanly', async () => {
  const sample = Buffer.from('This is a test plain text document for parsing evaluation.');
  const res = await parseDocumentBuffer(sample, 'sample.txt', 'text/plain');
  assert.equal(res.format, 'TXT');
  assert.equal(res.wordCount, 10);
  assert.ok(res.text.includes('plain text document'));
});

test('Document Parser: rejects empty buffer with clear error', async () => {
  await assert.rejects(
    async () => {
      await parseDocumentBuffer(Buffer.alloc(0), 'empty.txt', 'text/plain');
    },
    { message: /empty/i }
  );
});

test('Sentence Tokenizer: splits sentences while preserving abbreviations', () => {
  const text = "Dr. Smith examined the specimen at 6 A.M. The findings were conclusive! Did you review them?";
  const sentences = tokenizeSentences(text);
  assert.ok(sentences.length >= 2);
  assert.ok(sentences[0].text.includes('Dr. Smith'));
});

test('AI Detection Engine: rejects input with fewer than 15 words', async () => {
  await assert.rejects(
    async () => {
      await detectAiContent('Too short text sample.');
    },
    { message: /at least 15 words/i }
  );
});

test('AI Detection Engine: percentages strictly sum to 100%', async () => {
  const text = (
    "Furthermore, machine learning represents a pivotal paradigm in modern technological optimization. " +
    "I personally remember writing our very first prototype late on a Sunday evening back in California. " +
    "Consequently, the interplay between autonomous algorithms and human agency demands nuanced evaluation."
  );

  const res = await detectAiContent(text);
  assert.ok(typeof res.overallAiLikePercentage === 'number');
  assert.ok(typeof res.overallHumanLikePercentage === 'number');
  assert.ok(typeof res.uncertainPercentage === 'number');

  const sum = res.overallAiLikePercentage + res.overallHumanLikePercentage + res.uncertainPercentage;
  assert.equal(sum, 100, `Scores must sum to exactly 100%, got ${sum}`);
  assert.ok(res.sentenceResults.length >= 3);
});

test('AI Detection Engine: produces deterministic results for identical input', async () => {
  const text = (
    "In conclusion, proactive adaptation remains an imperative paradigm for continued technological growth. " +
    "We observed significant divergence between the experimental group and our baseline control metrics. " +
    "Further investigation will be conducted during the forthcoming academic quarter."
  );

  const run1 = await detectAiContent(text);
  const run2 = await detectAiContent(text);

  assert.equal(run1.overallAiLikePercentage, run2.overallAiLikePercentage);
  assert.equal(run1.overallHumanLikePercentage, run2.overallHumanLikePercentage);
  assert.equal(run1.uncertainPercentage, run2.uncertainPercentage);
});
