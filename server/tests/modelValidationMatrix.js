import { detectAiContent } from '../services/aiDetector/detector.js';

const TEST_MATRIX = [
  {
    category: 'Short Informal Human Writing',
    topic: 'Casual message to a friend',
    expectedClassification: 'human or uncertain',
    text: `Hey, I just landed in Chicago! The flight was crazy bumpy and the baby next to me wouldn't stop crying. Grab coffee later?`,
  },
  {
    category: 'Short Formal AI Writing',
    topic: 'Executive summary snippet',
    expectedClassification: 'ai',
    text: `Furthermore, leveraging holistic paradigms fosters paramount synergy across multifaceted enterprise ecosystems, seamlessly optimizing organizational efficacy.`,
  },
  {
    category: 'Long Informal Human Memoir',
    topic: 'Childhood memory',
    expectedClassification: 'human',
    text: `Every summer, my grandfather took us fishing at Lake Seneca before dawn. It was freezing cold—teeth-chattering cold—and the mist hung thick over the water like damp wool.
My older brother Jack always complained about baiting the worms. "They're slimy, Pop!" he'd whine, wiping his hands on his denim jacket.
Pop would just chuckle, adjust his lucky faded red ballcap, and cast his reel with a smooth, effortless flick of his wrist.
I remember the smell of black coffee steaming from his stainless steel thermos, mixed with wet pine needles and motor oil from the dinghy.
We rarely caught anything bigger than a sunfish, but honestly, nobody cared. By noon, we were back on the dock eating cold bologna sandwiches and watching the dragonflies skim the surface.`,
  },
  {
    category: 'Long Formal Human Academic Abstract (False Positive Risk)',
    topic: 'Biophysics peer-reviewed abstract',
    expectedClassification: 'uncertain or ai (false positive risk due to formal syntax)',
    text: `The thermodynamic stability of globular proteins remains fundamentally dependent on non-covalent conformational equilibria.
In this study, high-resolution circular dichroism spectroscopy was utilized to quantify secondary structure transitions under varying hydrostatic pressure regimes.
Experimental observations demonstrate that intermediate molten globule states exhibit pronounced resistance to thermal denaturation.
Furthermore, solvent-accessible surface area calculations correlate with Gibbs free energy discrepancies observed across homologous mutant variants.
These empirical findings substantiate thermodynamic folding hypotheses and provide structural constraints for computational macromolecular simulations.`,
  },
  {
    category: 'Long Modern AI-Generated Article',
    topic: 'Smart cities and IoT',
    expectedClassification: 'ai',
    text: `In the modern era, the integration of Internet of Things devices plays a crucial role in the sustainable evolution of smart cities.
Furthermore, urban municipalities must delve into comprehensive data frameworks to navigate complex infrastructural challenges effectively.
Moreover, the intricate interplay between cloud computing and edge telemetry enables metropolitan authorities to optimize energy consumption seamlessly.
It is important to note that citizen privacy remains a paramount consideration in deploying pervasive surveillance sensor arrays.
In conclusion, fostering multifaceted technological collaborations serves as a vital testament to progressive municipal governance and digital resilience.`,
  },
  {
    category: 'Edited / Paraphrased AI Text (False Negative Risk)',
    topic: 'AI text with human-injected noise and sentence splices',
    expectedClassification: 'uncertain or human (false negative risk due to evaded markers)',
    text: `Smart cities are getting really popular nowadays with all the IoT devices everywhere.
Urban planners definitely need to figure out better data systems, though—it's way harder than it looks on paper.
Also, when you connect cloud servers with sensors on streetlights, cities can save tons of electricity without much hassle.
Obviously privacy is a huge deal, so nobody wants cameras staring at them on every street corner.
Bottom line: cities have to work together with tech companies if they want any of this stuff to actually work down the road.`,
  },
  {
    category: 'Human Legal Contract Clause',
    topic: 'Non-disclosure agreement',
    expectedClassification: 'uncertain or ai (false positive risk due to repetitive formal terms)',
    text: `The Recipient agrees that all Confidential Information disclosed by the Disclosing Party shall be held in strict confidence.
The Recipient shall not disclose, publish, or disseminate Confidential Information to any third party without prior written consent.
Furthermore, the Recipient shall employ the same degree of care as it uses for its own proprietary materials of like sensitivity.
In the event of a judicial subpoena, the Recipient shall provide prompt notice to permit protective legal recourse.`,
  },
];

async function runMatrix() {
  console.log('=================================================================================');
  console.log('           AICHECK AI DETECTION QUALITY & MODEL VALIDATION MATRIX                ');
  console.log('=================================================================================\n');

  const summary = [];

  for (let i = 0; i < TEST_MATRIX.length; i++) {
    const item = TEST_MATRIX[i];
    console.log(`▶ [TEST ${i + 1}] ${item.category} (${item.topic})`);

    const result = await detectAiContent(item.text);
    const aiPct = result.overallAiLikePercentage;
    const humanPct = result.overallHumanLikePercentage;
    const uncPct = result.uncertainPercentage;

    let dominant = 'UNCERTAIN';
    if (aiPct >= 60) dominant = 'AI-LIKE';
    else if (humanPct >= 60) dominant = 'HUMAN-LIKE';
    else if (aiPct > humanPct && aiPct >= 40) dominant = 'LEANING-AI';
    else if (humanPct > aiPct && humanPct >= 40) dominant = 'LEANING-HUMAN';

    console.log(`  Engine: ${result.modelName} (v${result.modelVersion}) [${result.activeEngineMode}]`);
    console.log(`  Scores: AI ${aiPct}% | Human ${humanPct}% | Uncertain ${uncPct}% (Avg Heuristic Score: ${result.averageAiScore}%)`);
    console.log(`  Linguistic Metrics: Burstiness: ${result.linguisticDiagnostics.burstinessScore}, TTR: ${result.linguisticDiagnostics.lexicalDiversity}%, Perplexity: ${result.linguisticDiagnostics.perplexityIndex}`);
    console.log(`  Dominant Classification: ${dominant} (Expected: ${item.expectedClassification})`);
    if (result.qualitativeIndicators.aiIndicators.length > 0) {
      console.log(`  AI Markers: ${result.qualitativeIndicators.aiIndicators.join('; ')}`);
    }
    if (result.qualitativeIndicators.humanIndicators.length > 0) {
      console.log(`  Human Markers: ${result.qualitativeIndicators.humanIndicators.join('; ')}`);
    }
    console.log('---------------------------------------------------------------------------------');

    summary.push({
      category: item.category,
      words: result.totalWords,
      aiPct,
      humanPct,
      uncPct,
      dominant,
      expected: item.expectedClassification,
    });
  }

  console.log('\n=================================================================================');
  console.log('                            VALIDATION SUMMARY TABLE                             ');
  console.log('=================================================================================');
  console.table(summary);
  console.log('=================================================================================\n');
}

runMatrix().catch(console.error);
