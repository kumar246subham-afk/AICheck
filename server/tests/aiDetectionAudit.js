import { detectAiContent } from '../services/aiDetector/detector.js';

const HUMAN_SAMPLE = `
I woke up late yesterday, around 10:45 AM, and my head was pounding from the loud concert the night before. 
Honestly, I didn't even want to get out of bed! But my dog was barking like crazy because he needed to go outside, so I stumbled into the kitchen, threw on some mismatched slippers, and burned my toast. What a chaotic morning.
Later on, though, things picked up when my friend Sarah swung by with iced coffee and we ended up laughing about the show.
`;

const AI_SAMPLE = `
Furthermore, artificial intelligence plays a crucial and pivotal role in modern digital transformation across multifaceted industries.
Moreover, navigating this intricate tapestry allows enterprises to seamlessly utilize optimal solutions and delve into innovative paradigms.
In conclusion, it is important to note that the comprehensive interplay of deep neural architectures fosters unprecedented efficiency and underscores sustainable technological progress.
`;

const MIXED_SAMPLE = `
I couldn't believe my eyes when I saw the final exam score yesterday—I literally screamed with joy in the library!
Furthermore, artificial intelligence plays a pivotal role in multifaceted sectors, and navigating this intricate realm allows organizations to optimize holistic productivity.
My mom made pancakes to celebrate, and we watched an old comedy movie on the couch until midnight.
Moreover, it is important to note that comprehensive technological frameworks foster nuanced collaboration across enterprise workflows.
`;

async function testSamples() {
  console.log('===============================================================');
  console.log('       AICHECK REAL AI MODEL DETECTION SAMPLES AUDIT           ');
  console.log('===============================================================\n');

  console.log('--- 1. Testing Human Sample ---');
  const humanResult = await detectAiContent(HUMAN_SAMPLE);
  console.log(`Model Used: ${humanResult.modelName} (v${humanResult.modelVersion})`);
  console.log(`Words: ${humanResult.totalWords}, Sentences: ${humanResult.totalSentences}`);
  console.log(`AI%: ${humanResult.overallAiLikePercentage}%, Human%: ${humanResult.overallHumanLikePercentage}%, Uncertain%: ${humanResult.uncertainPercentage}%`);
  console.log(`Linguistic Diagnostics:`, humanResult.linguisticDiagnostics);

  console.log('\n--- 2. Testing AI Sample ---');
  const aiResult = await detectAiContent(AI_SAMPLE);
  console.log(`Model Used: ${aiResult.modelName} (v${aiResult.modelVersion})`);
  console.log(`Words: ${aiResult.totalWords}, Sentences: ${aiResult.totalSentences}`);
  console.log(`AI%: ${aiResult.overallAiLikePercentage}%, Human%: ${aiResult.overallHumanLikePercentage}%, Uncertain%: ${aiResult.uncertainPercentage}%`);
  console.log(`Linguistic Diagnostics:`, aiResult.linguisticDiagnostics);

  console.log('\n--- 3. Testing Mixed Sample ---');
  const mixedResult = await detectAiContent(MIXED_SAMPLE);
  console.log(`Model Used: ${mixedResult.modelName} (v${mixedResult.modelVersion})`);
  console.log(`Words: ${mixedResult.totalWords}, Sentences: ${mixedResult.totalSentences}`);
  console.log(`AI%: ${mixedResult.overallAiLikePercentage}%, Human%: ${mixedResult.overallHumanLikePercentage}%, Uncertain%: ${mixedResult.uncertainPercentage}%`);
  console.log(`Linguistic Diagnostics:`, mixedResult.linguisticDiagnostics);

  console.log('\nSentence Classifications in Mixed Sample:');
  mixedResult.sentenceResults.forEach((s, idx) => {
    console.log(`  [S${idx + 1} - ${s.classification.toUpperCase()} (${s.score}%)]: "${s.text.substring(0, 50)}..."`);
  });

  console.log('\n===============================================================');
}

testSamples().catch(console.error);
