import test, { describe } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Writable } from 'stream';
import { generatePdfReport } from '../services/reportGenerator/pdfGenerator.js';
import { parseDocumentBuffer } from '../services/documentParser/parser.js';
import { detectAiContent } from '../services/aiDetector/detector.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to compile PDF to buffer
function generatePdfBuffer(analysisData) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const stream = new Writable({
      write(chunk, encoding, callback) {
        chunks.push(chunk);
        callback();
      },
    });

    stream.on('finish', () => {
      resolve(Buffer.concat(chunks));
    });

    stream.on('error', reject);

    generatePdfReport(analysisData, stream);
  });
}

describe('PDF Audit Report Layout Engine', () => {
  // Exactly 343-Word Resume Text Sample
  const resume343Words = `Experienced Lead Full Stack Engineer with over eight years of hands-on expertise in architecting, engineering, and scaling mission-critical web applications across distributed cloud ecosystems. Proven track record of spearheading cross-functional engineering squads, establishing rigorous DevOps deployment pipelines, and modernizing legacy monolithic architectures into modular, event-driven microservices utilizing Node.js, TypeScript, React, and Kubernetes. Directed the end-to-end migration of enterprise cloud infrastructure to AWS and Google Cloud Platform, achieving a 42% reduction in compute overhead, eliminating infrastructure bottlenecks, and securing 99.99% system availability under peak holiday concurrency. Engineered high-throughput, low-latency RESTful APIs and GraphQL endpoints processing more than fifteen million daily requests with sub-50ms response times. Spearheaded the enterprise adoption of automated continuous integration and continuous delivery workflows using GitHub Actions, Docker containers, Terraform infrastructure as code, and SonarQube quality gates, which reduced software release cycles from fortnightly releases to multiple production deployments each day. Designed and implemented hardened multi-tenant authentication protocols using Firebase Authentication, OAuth 2.0, OpenID Connect, and JSON Web Tokens, paired with granular role-based access control and strict Firestore security rules that completely resolved historical authorization vulnerabilities. Led performance optimization initiatives across responsive client applications, reducing First Contentful Paint by 1.8 seconds and boosting Google Lighthouse performance scores from 64 to 98 through intelligent code splitting, asset preloading, and dynamic WebGL rendering optimizations. Mentored fifteen junior and mid-level software engineers through structured pair programming sessions, detailed architectural reviews, and technical workshops on asynchronous patterns and distributed database caching strategies with Redis. Collaborated closely with executive leadership, product managers, UI/UX design specialists, and enterprise cybersecurity auditors to deliver mission-critical software solutions adhering strictly to SOC 2, HIPAA, and GDPR compliance standards. Holds a Bachelor of Science in Computer Science from the University of California, Berkeley, and active professional certifications in AWS Solutions Architect Professional, Certified Kubernetes Administrator, and Google Professional Cloud Architect. Maintained robust test coverage exceeding ninety percent using automated unit, integration, and end-to-end test suites. Recognized by company executive leadership with the annual engineering excellence award for delivering scalable distributed cloud architecture ahead of schedule and under budget across global regions.`;

  test('343-word Resume text is verified and generates a non-empty valid PDF', async () => {
    const words = resume343Words.trim().split(/\s+/).filter(Boolean);
    console.log(`ℹ️ Resume sample word count: ${words.length} words`);
    assert.strictEqual(words.length, 343, 'Sample must have exactly 343 words');

    const analysisData = await detectAiContent(resume343Words);
    assert.ok(analysisData.sentenceResults.length > 0, 'Must have parsed sentences');

    const pdfBuffer = await generatePdfBuffer({
      documentName: 'Senior_Engineer_Resume_343Words.txt',
      overallAiLikePercentage: analysisData.overallAiLikePercentage,
      overallHumanLikePercentage: analysisData.overallHumanLikePercentage,
      uncertainPercentage: analysisData.uncertainPercentage,
      totalWords: words.length,
      totalSentences: analysisData.sentenceResults.length,
      modelName: analysisData.modelName,
      modelVersion: analysisData.modelVersion,
      linguisticDiagnostics: analysisData.linguisticDiagnostics,
      sentenceResults: analysisData.sentenceResults,
      analysisTimestamp: new Date().toISOString(),
    });

    assert.ok(pdfBuffer.length > 5000, 'PDF buffer should be substantial');

    // Extract text from the generated PDF to verify text integrity
    const extracted = await parseDocumentBuffer(pdfBuffer, 'GeneratedReport.pdf', 'application/pdf');
    assert.ok(extracted.text.includes('AICheck'), 'Extracted PDF text must contain brand name');
    assert.ok(extracted.text.includes('Lead Full Stack Engineer') || extracted.text.includes('microservices'), 'Extracted text must contain resume content');
    assert.ok(extracted.text.includes('ETHICAL & PROBABILISTIC DISCLAIMER'), 'Extracted text must contain disclaimer');
    
    // Save sample corrected PDF to disk for user inspection
    const samplePath = path.join(__dirname, 'sample_corrected_report.pdf');
    fs.writeFileSync(samplePath, pdfBuffer);
    console.log(`✅ Sample corrected PDF saved to: ${samplePath} (${pdfBuffer.length} bytes)`);
  });

  test('Multi-page stress test with 35 long sentences and dynamic wrapping', async () => {
    // Generate 35 long realistic sentences
    const longSentences = [];
    for (let i = 1; i <= 35; i++) {
      longSentences.push({
        classification: i % 3 === 0 ? 'ai' : (i % 3 === 1 ? 'human' : 'uncertain'),
        score: Math.floor(Math.random() * 80) + 15,
        text: `Item ${i}: The architectural paradigm of distributed decentralized messaging protocols demonstrates exceptional resilience under high-concurrency event streams, particularly when microservices employ asynchronous backpressure algorithms, circuit breaker patterns, and fault-tolerant dead-letter queues across global edge clusters (https://docs.enterprise-system.io/v2/cluster/failover-strategy?region=us-east-1&tenant=aicheck-prod#diagnostics).`,
      });
    }

    const pdfBuffer = await generatePdfBuffer({
      documentName: 'Stress_Test_35_Long_Sentences.pdf',
      overallAiLikePercentage: 55,
      overallHumanLikePercentage: 35,
      uncertainPercentage: 10,
      totalWords: 1450,
      totalSentences: 35,
      modelName: 'AICheck Heuristic Linguistic & Statistical Engine',
      modelVersion: '1.5.0',
      linguisticDiagnostics: {
        burstinessScore: 68,
        perplexityIndex: 54,
        lexicalDiversity: 78.4,
        sentenceDistribution: { short: 5, medium: 12, long: 18 },
      },
      sentenceResults: longSentences,
      analysisTimestamp: new Date().toISOString(),
    });

    assert.ok(pdfBuffer.length > 5000, 'Multi-page PDF buffer should be substantial');

    const extracted = await parseDocumentBuffer(pdfBuffer, 'StressTest.pdf', 'application/pdf');
    assert.ok(extracted.text.includes('Item 1:'), 'Contains early items');
    assert.ok(extracted.text.includes('Item 35:'), 'Contains last item on subsequent pages');
    assert.ok(extracted.text.includes('Page 1 of') || extracted.text.includes('Page '), 'Contains page numbers');
    assert.ok(extracted.text.includes('ETHICAL & PROBABILISTIC DISCLAIMER'), 'Contains disclaimer');
  });
});
