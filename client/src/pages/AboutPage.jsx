import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Cpu, Eye, Lock, Layers, Heart, Sparkles, ArrowRight } from 'lucide-react';
import TiltCard from '../components/TiltCard';

export function AboutPage() {
  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      <div className="max-w-5xl mx-auto space-y-16 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyber-blue/10 border border-cyber-blue/30 text-xs font-mono text-cyber-blue">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Our Principles & Architecture</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Elevating Content Integrity Through Transparent AI
          </h1>
          <p className="text-slate-300 text-base leading-relaxed">
            AICheck was founded on a simple conviction: AI text detection should be transparent, verifiable, and grounded in rigorous mathematical linguistics — never opaque black boxes or fabricated probabilities.
          </p>
        </div>

        {/* Core Principles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TiltCard glowColor="rgba(0, 210, 255, 0.25)">
            <div className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyber-blue/10 border border-cyber-blue/30 flex items-center justify-center text-cyber-blue">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Dual-Path Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                We combine deep neural classifiers (open-source RoBERTa models) with deterministic local linguistic heuristics measuring Perplexity, Burstiness, and Lexical Diversity.
              </p>
            </div>
          </TiltCard>

          <TiltCard glowColor="rgba(139, 92, 246, 0.25)">
            <div className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyber-violet/10 border border-cyber-violet/30 flex items-center justify-center text-cyber-violet">
                <Eye className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Granular Transparency</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Rather than stamping an arbitrary binary score on a thesis, we segment text into sentences so you can trace individual syntax patterns with precision.
              </p>
            </div>
          </TiltCard>

          <TiltCard glowColor="rgba(16, 185, 129, 0.25)">
            <div className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Zero Data Retention</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Submitted manuscripts and documents are scrubbed from server memory immediately after extraction. We never train commercial models on your private intellectual property.
              </p>
            </div>
          </TiltCard>
        </div>

        {/* Detailed Narrative Section */}
        <div className="p-8 sm:p-12 rounded-3xl glass-card border-white/10 space-y-6 text-sm text-slate-300 leading-relaxed">
          <h2 className="text-2xl font-extrabold text-white">Our Stand on Ethical Detection</h2>
          <p>
            The explosion of Large Language Models (LLMs) has transformed writing, research, and coding. However, as generative tools become ubiquitous, preserving authentic human creativity and maintaining academic transparency has never been more vital.
          </p>
          <p>
            Many first-generation AI detectors marketed "100% guaranteed authorship proofs", resulting in false positives that unjustly penalized non-native English speakers and formal academic writers. We reject this approach.
          </p>
          <div className="p-4 rounded-2xl bg-midnight-900 border border-cyber-blue/30 text-xs font-mono text-cyber-blue">
            "AICheck measures statistical pattern affinity — not criminal guilt. Detection results must always be viewed as probabilistic indicators that complement, rather than replace, human editorial judgment."
          </div>
          <p>
            By computing an explicit <strong>Uncertainty Band</strong> (for sentences between 40% and 59% probability), we highlight where writing patterns are ambiguous, fostering constructive dialogue between authors and editors.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center pt-4">
          <Link
            to="/analyzer"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold bg-gradient-to-r from-cyber-blue to-cyber-violet text-midnight-950 hover:shadow-glow-blue transition-all"
          >
            <span>Try the Analyzer Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>

    </div>
  );
}

export default AboutPage;
