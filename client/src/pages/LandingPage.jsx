import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  ShieldCheck,
  Zap,
  Cpu,
  Eye,
  Lock,
  Layers,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  FileCheck2,
  BarChart3,
  HelpCircle,
  FileSpreadsheet,
  AlertTriangle,
  UploadCloud,
  Scale,
  RefreshCw,
  ExternalLink,
  Info
} from 'lucide-react';
import Scene3D from '../three/Scene3D';
import TiltCard from '../components/TiltCard';
import MagneticButton from '../components/MagneticButton';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../services/api';

export function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Live Analyzer Preview State
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);

  // Sample texts for live preview
  const sampleTexts = {
    ai: "Artificial intelligence has rapidly transformed various sectors of modern industry. It is crucial to acknowledge the multifaceted nature of machine learning algorithms. Furthermore, the integration of automation fosters sustainable operational efficiency. In conclusion, proactive adaptation remains an imperative paradigm for continued growth.",
    human: "I woke up at 6 AM yesterday and noticed something really weird about our server logs. Honestly, the query wasn't even complex, but it kept choking after ten minutes. I tossed some console.log statements into the parser just to see where it broke. Turns out a single missing comma in an old regex rule was causing an infinite loop.",
    mixed: "We decided to test the new natural language toolkit on our internal dataset. The system facilitates seamless computational processing across distributed architectures. Several edge cases still require manual inspection before release. Overall, our team observed promising performance metrics during trial runs."
  };

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const charCount = inputText.length;

  const handleLoadSample = (type) => {
    setInputText(sampleTexts[type]);
    setAnalysisResult(null);
    setAnalysisError(null);
  };

  // Real in-place analysis using actual backend API
  const handleLiveAnalyze = async () => {
    if (!inputText.trim()) {
      setAnalysisError('Please enter or load some text to analyze.');
      return;
    }
    if (wordCount < 15) {
      setAnalysisError('Please enter at least 15 words for a reliable statistical evaluation.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const token = user ? await user.getIdToken() : null;
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(apiUrl('/detect'), {
        method: 'POST',
        headers,
        body: JSON.stringify({
          text: inputText,
          title: 'Live Preview Analysis'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Analysis failed. Please try again.');
      }

      setAnalysisResult(data.data);
    } catch (err) {
      setAnalysisError(err.message || 'Unable to connect to analysis engine.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const [openFaq, setOpenFaq] = useState(0);

  const faqs = [
    {
      q: "How does AICheck evaluate AI writing patterns?",
      a: "AICheck utilizes a deterministic linguistic heuristic engine that evaluates Burstiness (sentence length variance), Lexical Diversity (Type-Token Ratio), and Heuristic Perplexity Index. Automated models frequently produce uniform sentence lengths and predictable transitions, whereas authentic human writing displays high variance and conversational asymmetry."
    },
    {
      q: "Does AICheck claim 100% absolute authorship detection?",
      a: "Never. AI detection evaluates statistical pattern similarity, not absolute mathematical proof of authorship. We explicitly calculate an 'Uncertain' band (40% to 59%) to highlight ambiguous phrasing and avoid false accusations."
    },
    {
      q: "What document formats can I upload for analysis?",
      a: "AICheck supports direct upload and parsing of PDF (.pdf), Microsoft Word (.docx, .doc), and plain text (.txt) files. All files are extracted in memory with zero disk retention."
    },
    {
      q: "Is my document stored permanently or used to train models?",
      a: "No. Uploaded files are processed strictly in volatile RAM and immediately discarded. Your documents are never stored permanently, sold, or used to train third-party machine learning models."
    },
    {
      q: "Can I download verifiable analysis reports?",
      a: "Yes. Every analysis generates a downloadable, multi-page executive PDF report complete with donut score charts, burstiness diagnostics, sentence-by-sentence highlights, and methodology disclaimers."
    }
  ];

  return (
    <div className="relative pt-24 pb-20 overflow-hidden bg-[#050816]">
      
      {/* Background Ambient Radial Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-[#00D9FF]/10 via-[#8B5CF6]/05 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -left-64 w-96 h-96 bg-[#00D9FF]/05 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-64 w-96 h-96 bg-[#8B5CF6]/05 rounded-full blur-3xl pointer-events-none" />

      {/* =========================================================================
          HERO SECTION
          ========================================================================= */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headline, Copy & CTAs */}
          <div className="lg:col-span-6 z-10 space-y-6">
            
            {/* Small Label Pill */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111B30]/80 border border-white/[0.08] backdrop-blur-md shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-[#00D9FF]" />
              <span className="text-xs font-mono font-semibold tracking-wider text-slate-300 uppercase">
                INTELLIGENT CONTENT ANALYSIS
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12]"
            >
              Understand the{' '}
              <span className="text-gradient-highlight">
                Patterns Behind Every Word.
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-[#94A3B8] leading-relaxed max-w-xl"
            >
              Explore AI-like and human-like writing indicators with intelligent content analysis, sentence-level insights and transparent reporting.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <Link to="/analyzer">
                <MagneticButton className="px-6 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#00D9FF] to-[#8B5CF6] text-white shadow-glow-cyan hover:opacity-95 transition-all flex items-center gap-2.5">
                  <span>Start Analyzing</span>
                  <ArrowRight className="w-4 h-4" />
                </MagneticButton>
              </Link>

              <button
                onClick={() => {
                  const el = document.querySelector('#features');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3.5 rounded-xl font-semibold text-sm text-slate-300 bg-[#111B30]/70 hover:bg-[#162340] border border-white/[0.08] hover:border-white/[0.15] transition-all cursor-pointer"
              >
                Explore Platform
              </button>
            </motion.div>

            {/* Supporting Value Labels */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-white/[0.06]"
            >
              <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-[#00D9FF] shrink-0" />
                <span>Intelligent Writing Analysis</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-[#8B5CF6] shrink-0" />
                <span>Multi-Format Documents</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                <span>Transparent Results</span>
              </div>
            </motion.div>

          </div>

          {/* Right Column: 3D Holographic AI Orb & Floating Data Panels */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            
            {/* 3D WebGL Canvas */}
            <div className="w-full h-[480px] sm:h-[550px] relative">
              <Scene3D showDocs={true} className="w-full h-full" />
            </div>

            {/* Floating Glassmorphic Data Panel 1: Document Analysis (Top-Left) */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-2 left-2 sm:-left-4 bg-[#111B30]/85 border border-[#00D9FF]/25 backdrop-blur-xl rounded-xl p-3 shadow-glass-card max-w-[210px] hidden sm:block"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono font-semibold text-[#00D9FF] uppercase tracking-wider">
                  Document Analysis
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/[0.08] text-slate-400 font-mono">
                  Visual Preview
                </span>
              </div>
              <p className="text-xs font-semibold text-white truncate">Research_Thesis.docx</p>
              <div className="flex items-center justify-between text-[11px] text-[#94A3B8] mt-1">
                <span>1,420 words</span>
                <span className="text-[#10B981] font-mono">Completed</span>
              </div>
            </motion.div>

            {/* Floating Glassmorphic Data Panel 2: AI Indicators (Top-Right) */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute top-8 -right-2 sm:-right-4 bg-[#111B30]/85 border border-[#F59E0B]/25 backdrop-blur-xl rounded-xl p-3 shadow-glass-card max-w-[190px] hidden sm:block"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono font-semibold text-[#F59E0B] uppercase tracking-wider">
                  AI Indicators
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/[0.08] text-slate-400 font-mono">
                  Preview
                </span>
              </div>
              <div className="text-xl font-bold text-white flex items-baseline gap-1">
                88% <span className="text-xs font-normal text-slate-400">Pattern Affinity</span>
              </div>
              <p className="text-[10px] text-[#94A3B8] mt-0.5">Low burstiness variance</p>
            </motion.div>

            {/* Floating Glassmorphic Data Panel 3: Sentence Insights (Bottom-Left) */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute bottom-6 left-0 sm:-left-6 bg-[#111B30]/85 border border-white/[0.1] backdrop-blur-xl rounded-xl p-3 shadow-glass-card max-w-[220px] hidden sm:block"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono font-semibold text-slate-300 uppercase tracking-wider">
                  Sentence Insights
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/[0.08] text-slate-400 font-mono">
                  Preview
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="h-1.5 rounded-full bg-[#F59E0B]/40 w-full" />
                <div className="h-1.5 rounded-full bg-[#10B981]/50 w-3/4" />
                <div className="h-1.5 rounded-full bg-[#64748B]/40 w-5/6" />
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-mono">Color-coded breakdown</p>
            </motion.div>

            {/* Floating Glassmorphic Data Panel 4: Human Indicators (Bottom-Right) */}
            <motion.div
              animate={{ y: [0, 7, 0] }}
              transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
              className="absolute -bottom-2 right-2 sm:right-0 bg-[#111B30]/85 border border-[#10B981]/25 backdrop-blur-xl rounded-xl p-3 shadow-glass-card max-w-[190px] hidden sm:block"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono font-semibold text-[#10B981] uppercase tracking-wider">
                  Human Indicators
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/[0.08] text-slate-400 font-mono">
                  Preview
                </span>
              </div>
              <div className="text-xl font-bold text-white flex items-baseline gap-1">
                92% <span className="text-xs font-normal text-slate-400">Cadence</span>
              </div>
              <p className="text-[10px] text-[#94A3B8] mt-0.5">High lexical diversity (TTR)</p>
            </motion.div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          LIVE ANALYZER PREVIEW (Interactive & Verifiable)
          ========================================================================= */}
      <section className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-[#0B1224]/90 border border-white/[0.09] rounded-2xl p-6 sm:p-8 backdrop-blur-2xl shadow-glass-card">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-[#00D9FF]" />
                Live Analyzer Preview
              </h2>
              <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
                Test the actual AICheck heuristic linguistic engine in real time.
              </p>
            </div>

            {/* Preset Sample Text Chips */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-400 font-mono">Samples:</span>
              <button
                onClick={() => handleLoadSample('ai')}
                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30 hover:bg-[#F59E0B]/20 transition-colors cursor-pointer"
              >
                AI Sample
              </button>
              <button
                onClick={() => handleLoadSample('human')}
                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 hover:bg-[#10B981]/20 transition-colors cursor-pointer"
              >
                Human Sample
              </button>
              <button
                onClick={() => handleLoadSample('mixed')}
                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/20 transition-colors cursor-pointer"
              >
                Mixed Sample
              </button>
            </div>
          </div>

          {/* Text Input Area */}
          <div className="relative">
            <textarea
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste or write content here (minimum 15 words) to evaluate linguistic patterns..."
              className="w-full bg-[#111B30]/80 border border-white/[0.08] focus:border-[#00D9FF] rounded-xl p-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none transition-all resize-y"
            />
            
            {/* Word & Character Counter */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 px-1">
              <span className="font-mono">
                {wordCount} words · {charCount} characters
              </span>
              <span className="text-[11px] text-slate-500">
                Processed in volatile memory · Never stored
              </span>
            </div>
          </div>

          {/* Error Banner */}
          {analysisError && (
            <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{analysisError}</span>
            </div>
          )}

          {/* Action Bar */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/[0.06]">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Info className="w-3.5 h-3.5 text-[#00D9FF]" />
              <span>Uses real backend NLP API without fabrication</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setInputText('')}
                disabled={!inputText}
                className="text-xs font-medium text-slate-400 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
              >
                Clear
              </button>
              
              <MagneticButton
                onClick={handleLiveAnalyze}
                disabled={isAnalyzing}
                className="px-5 py-2.5 rounded-xl font-semibold text-xs bg-gradient-to-r from-[#00D9FF] to-[#8B5CF6] text-white shadow-glow-cyan hover:opacity-95 transition-all flex items-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    <span>Analyze Content</span>
                  </>
                )}
              </MagneticButton>
            </div>
          </div>

          {/* Real Analysis Result Display */}
          <AnimatePresence>
            {analysisResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6 p-5 rounded-xl bg-[#111B30]/90 border border-[#00D9FF]/20 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
                  <div>
                    <span className="text-xs font-mono font-semibold text-[#00D9FF] uppercase tracking-wider">
                      Genuine Engine Evaluation
                    </span>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {analysisResult.modelProvider || 'AICheck Linguistic & Statistical Engine'}
                    </p>
                  </div>
                  <Link
                    to="/analyzer"
                    className="inline-flex items-center gap-1.5 text-xs text-[#00D9FF] hover:underline"
                  >
                    <span>Open full workspace</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                {/* Score Gauges */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-[#0B1224] border border-[#F59E0B]/20">
                    <span className="text-[11px] font-mono text-[#F59E0B]">AI Pattern Score</span>
                    <div className="text-2xl font-bold text-white mt-0.5">
                      {analysisResult.aiProbability ?? analysisResult.overallScore}%
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0B1224] border border-[#10B981]/20">
                    <span className="text-[11px] font-mono text-[#10B981]">Human Cadence</span>
                    <div className="text-2xl font-bold text-white mt-0.5">
                      {analysisResult.humanProbability ?? (100 - (analysisResult.overallScore || 0))}%
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0B1224] border border-[#64748B]/20">
                    <span className="text-[11px] font-mono text-slate-400">Uncertainty Band</span>
                    <div className="text-2xl font-bold text-white mt-0.5">
                      {analysisResult.uncertainProbability ?? 0}%
                    </div>
                  </div>
                </div>

                {/* Sentence Breakdown Preview */}
                {analysisResult.sentences && analysisResult.sentences.length > 0 && (
                  <div className="pt-2">
                    <span className="text-xs font-mono text-slate-300 block mb-2">
                      Sentence Highlight Preview:
                    </span>
                    <div className="space-y-1.5 text-xs leading-relaxed max-h-48 overflow-y-auto pr-2">
                      {analysisResult.sentences.map((s, idx) => {
                        const isAi = (s.score || s.aiProbability) >= 60;
                        const isHuman = (s.score || s.aiProbability) < 40;
                        const badgeColor = isAi
                          ? 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30'
                          : isHuman
                          ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30'
                          : 'bg-[#64748B]/15 text-slate-300 border-[#64748B]/30';
                        return (
                          <div key={idx} className={`p-2 rounded-lg border ${badgeColor}`}>
                            <span className="font-mono text-[10px] mr-2 opacity-75">#{idx + 1}</span>
                            <span>{s.text}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </section>

      {/* =========================================================================
          TECHNOLOGY TRUST STRIP
          ========================================================================= */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center mb-6">
          <p className="text-xs uppercase font-mono tracking-widest text-[#94A3B8]">
            Built with production-grade technologies & verifiable architectures
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-slate-400 opacity-80">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <span className="w-2 h-2 rounded-full bg-[#00D9FF]" />
            React 18 & Vite
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
            Three.js & R3F
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
            Node.js & Express
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
            Firebase Authentication
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            Cloud Firestore
          </div>
        </div>
      </section>

      {/* =========================================================================
          FEATURES SECTION (8 Interactive Cards with 3D Tilt)
          ========================================================================= */}
      <section id="features" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-mono font-semibold text-[#00D9FF] tracking-wider uppercase">
            COMPREHENSIVE CAPABILITIES
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Engineered for Precision & Transparency
          </h2>
          <p className="text-[#94A3B8] text-sm sm:text-base">
            Every feature in AICheck is designed to provide actionable linguistic clarity, multi-format flexibility, and verifiable security.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: AI Pattern Analysis */}
          <TiltCard className="p-6 rounded-2xl bg-[#111B30]/70 border border-white/[0.08] hover:border-[#00D9FF]/40 transition-all shadow-glass-subtle">
            <div className="w-11 h-11 rounded-xl bg-[#00D9FF]/10 text-[#00D9FF] flex items-center justify-center mb-4">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">1. AI Pattern Analysis</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Detects uniform sentence lengths, formulaic transitional adverbs, and automated syntactic rhythm.
            </p>
          </TiltCard>

          {/* Card 2: Human-like Writing Indicators */}
          <TiltCard className="p-6 rounded-2xl bg-[#111B30]/70 border border-white/[0.08] hover:border-[#10B981]/40 transition-all shadow-glass-subtle">
            <div className="w-11 h-11 rounded-xl bg-[#10B981]/10 text-[#10B981] flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">2. Human-like Writing Indicators</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Measures authentic human writing cadence through high sentence length variance (burstiness) and lexical diversity.
            </p>
          </TiltCard>

          {/* Card 3: Sentence-Level Insights */}
          <TiltCard className="p-6 rounded-2xl bg-[#111B30]/70 border border-white/[0.08] hover:border-[#8B5CF6]/40 transition-all shadow-glass-subtle">
            <div className="w-11 h-11 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center mb-4">
              <Eye className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">3. Sentence-Level Insights</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Granular sentence-by-sentence evaluation categorizing each segment into AI-like, human-like, or uncertain markers.
            </p>
          </TiltCard>

          {/* Card 4: Multi-Format Upload */}
          <TiltCard className="p-6 rounded-2xl bg-[#111B30]/70 border border-white/[0.08] hover:border-[#3B82F6]/40 transition-all shadow-glass-subtle">
            <div className="w-11 h-11 rounded-xl bg-[#3B82F6]/10 text-[#3B82F6] flex items-center justify-center mb-4">
              <UploadCloud className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">4. PDF/DOCX/TXT/DOC Upload</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              In-memory document stream extraction with zero permanent disk retention and immediate client cancellation support.
            </p>
          </TiltCard>

          {/* Card 5: PDF Audit Reports */}
          <TiltCard className="p-6 rounded-2xl bg-[#111B30]/70 border border-white/[0.08] hover:border-[#00D9FF]/40 transition-all shadow-glass-subtle">
            <div className="w-11 h-11 rounded-xl bg-[#00D9FF]/10 text-[#00D9FF] flex items-center justify-center mb-4">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">5. PDF Audit Reports</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Generate and download executive multi-page audit summaries with score gauges, burstiness charts, and full breakdowns.
            </p>
          </TiltCard>

          {/* Card 6: Analysis History */}
          <TiltCard className="p-6 rounded-2xl bg-[#111B30]/70 border border-white/[0.08] hover:border-[#F59E0B]/40 transition-all shadow-glass-subtle">
            <div className="w-11 h-11 rounded-xl bg-[#F59E0B]/10 text-[#F59E0B] flex items-center justify-center mb-4">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">6. Analysis History</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Firestore-backed scan history with multi-tenant UID isolation, instant search, status filtering, and inspection modals.
            </p>
          </TiltCard>

          {/* Card 7: Secure Authentication */}
          <TiltCard className="p-6 rounded-2xl bg-[#111B30]/70 border border-white/[0.08] hover:border-[#10B981]/40 transition-all shadow-glass-subtle">
            <div className="w-11 h-11 rounded-xl bg-[#10B981]/10 text-[#10B981] flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">7. Secure Authentication</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Firebase Auth with server-side Admin SDK verification, live revocation checking, and immutable client roles.
            </p>
          </TiltCard>

          {/* Card 8: Transparent Uncertainty Reporting */}
          <TiltCard className="p-6 rounded-2xl bg-[#111B30]/70 border border-white/[0.08] hover:border-[#8B5CF6]/40 transition-all shadow-glass-subtle">
            <div className="w-11 h-11 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center mb-4">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">8. Transparent Uncertainty</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Explicit 40%–59% uncertain band highlighting nuanced text and reinforcing that AI detection does not prove authorship.
            </p>
          </TiltCard>

        </div>
      </section>

      {/* =========================================================================
          HOW IT WORKS (4 Animated Steps with Connecting Progression)
          ========================================================================= */}
      <section id="how-it-works" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-mono font-semibold text-[#8B5CF6] tracking-wider uppercase">
            INTUITIVE WORKFLOW
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How AICheck Works
          </h2>
          <p className="text-[#94A3B8] text-sm sm:text-base">
            From raw document input to executive report delivery in four straightforward steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          
          {/* Step 1 */}
          <div className="relative p-6 rounded-2xl bg-[#0B1224]/80 border border-white/[0.08] space-y-3">
            <div className="w-8 h-8 rounded-lg bg-[#00D9FF]/20 text-[#00D9FF] font-mono font-bold text-sm flex items-center justify-center">
              01
            </div>
            <h3 className="text-base font-bold text-white">Upload or Paste</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Drop any PDF, DOCX, DOC, or TXT file into the dropzone or paste raw text into the interactive editor.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative p-6 rounded-2xl bg-[#0B1224]/80 border border-white/[0.08] space-y-3">
            <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/20 text-[#8B5CF6] font-mono font-bold text-sm flex items-center justify-center">
              02
            </div>
            <h3 className="text-base font-bold text-white">Analyze Patterns</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              The deterministic NLP engine processes sentence length variance (burstiness), vocabulary diversity, and formulaic repetition.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative p-6 rounded-2xl bg-[#0B1224]/80 border border-white/[0.08] space-y-3">
            <div className="w-8 h-8 rounded-lg bg-[#10B981]/20 text-[#10B981] font-mono font-bold text-sm flex items-center justify-center">
              03
            </div>
            <h3 className="text-base font-bold text-white">Review Indicators</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Inspect interactive color-coded sentences isolating AI-like (orange), human-like (green), and uncertain (slate) phrasing.
            </p>
          </div>

          {/* Step 4 */}
          <div className="relative p-6 rounded-2xl bg-[#0B1224]/80 border border-white/[0.08] space-y-3">
            <div className="w-8 h-8 rounded-lg bg-[#3B82F6]/20 text-[#3B82F6] font-mono font-bold text-sm flex items-center justify-center">
              04
            </div>
            <h3 className="text-base font-bold text-white">Export Audit Report</h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Download an executive PDF report with score gauges, linguistic diagnostics, and methodology disclaimers.
            </p>
          </div>

        </div>
      </section>

      {/* =========================================================================
          TECHNOLOGY SECTION (Architecture Breakdown)
          ========================================================================= */}
      <section id="technology" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/[0.06]">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-mono font-semibold text-[#00D9FF] tracking-wider uppercase">
              MODERN CLOUD ARCHITECTURE
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Built on Modern Standards
            </h2>
            <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed">
              AICheck delivers zero-disk document security, real-time WebGL rendering, and Firebase cloud authentication with server-side verification.
            </p>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-[#111B30]/70 border border-white/[0.08]">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00D9FF]" />
                  Frontend Layer
                </h4>
                <p className="text-xs text-[#94A3B8] mt-1">
                  React 18 + Vite 5 + Tailwind CSS with Three.js WebGL canvas and Framer Motion spring interactions.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#111B30]/70 border border-white/[0.08]">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
                  Backend Engine
                </h4>
                <p className="text-xs text-[#94A3B8] mt-1">
                  Node.js + Express with in-memory buffer streaming (PDF, DOCX, DOC, TXT) and PDFKit report generation.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#111B30]/70 border border-white/[0.08]">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                  Security & Persistence
                </h4>
                <p className="text-xs text-[#94A3B8] mt-1">
                  Firebase Authentication with live token revocation checks, Cloud Firestore with 115 hardened security rules.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-[#0B1224] border border-white/[0.08] rounded-2xl p-6 font-mono text-xs text-slate-300 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <span className="text-[#00D9FF]">AICheck Pipeline Telemetry</span>
              <span className="text-[10px] text-slate-500">v1.5.0-PROD</span>
            </div>
            
            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between py-1 border-b border-white/[0.04]">
                <span className="text-slate-400">Primary Classifier:</span>
                <span className="text-white">Deterministic NLP Heuristic Engine</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/[0.04]">
                <span className="text-slate-400">Sentence Variance (Burstiness):</span>
                <span className="text-[#10B981]">Active (CV = σ / μ)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/[0.04]">
                <span className="text-slate-400">Lexical Diversity:</span>
                <span className="text-[#00D9FF]">Type-Token Ratio (TTR)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/[0.04]">
                <span className="text-slate-400">Heuristic Perplexity Index:</span>
                <span className="text-[#8B5CF6]">Active (0 – 100 bounded)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/[0.04]">
                <span className="text-slate-400">External Model Endpoint:</span>
                <span className="text-amber-400">router.huggingface.co</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/[0.04]">
                <span className="text-slate-400">Disk Retention Policy:</span>
                <span className="text-[#10B981]">0 MB (In-Memory RAM Streaming)</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Firestore Ruleset:</span>
                <span className="text-[#00D9FF]">115 Lines Hardened</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          TRANSPARENCY & ETHICAL AI SECTION
          ========================================================================= */}
      <section id="about" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/[0.06]">
        
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-mono font-semibold text-[#10B981] tracking-wider uppercase">
            ETHICAL AI STANDARDS
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Transparent Uncertainty Reporting
          </h2>
          <p className="text-[#94A3B8] text-sm sm:text-base">
            AICheck measures surface-level stylistic markers and pattern similarities. We never present heuristic scores as absolute mathematical proof of authorship.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="p-6 rounded-2xl bg-[#0B1224] border border-[#F59E0B]/20 space-y-3">
            <div className="inline-flex px-2.5 py-1 rounded bg-[#F59E0B]/15 text-[#F59E0B] font-mono text-xs font-semibold">
              AI-like Indicators (≥ 60%)
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Characterized by low sentence length variance, symmetric paragraph construction, repetitive transition adverbs (e.g., <em>furthermore</em>, <em>moreover</em>), and uniform syntactic flow.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0B1224] border border-[#10B981]/20 space-y-3">
            <div className="inline-flex px-2.5 py-1 rounded bg-[#10B981]/15 text-[#10B981] font-mono text-xs font-semibold">
              Human-like Indicators (&lt; 40%)
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Characterized by high burstiness (mixing 4-word fragments with 35-word complex sentences), varied idioms, natural conversational asymmetry, and high lexical diversity.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0B1224] border border-[#64748B]/30 space-y-3">
            <div className="inline-flex px-2.5 py-1 rounded bg-[#64748B]/20 text-slate-300 font-mono text-xs font-semibold">
              Uncertain Content (40% – 59%)
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Represents ambiguous text where human editing, heavy revision, or formulaic academic styles overlap. AICheck explicitly isolates this band to prevent false accusations.
            </p>
          </div>

        </div>

        {/* Ethical Notice Box */}
        <div className="mt-8 p-4 rounded-xl bg-[#111B30]/60 border border-white/[0.08] text-xs text-slate-400 leading-relaxed flex items-start gap-3 max-w-4xl mx-auto">
          <Info className="w-5 h-5 text-[#00D9FF] shrink-0 mt-0.5" />
          <p>
            <strong>Authorship Notice:</strong> AI pattern analysis is fundamentally probabilistic. External factors such as technical terminology, legal drafting styles, and non-native English writing may naturally exhibit lower burstiness. AICheck outputs should be used as informative diagnostics rather than conclusive evidence for disciplinary actions.
          </p>
        </div>

      </section>

      {/* =========================================================================
          FAQ ACCORDION
          ========================================================================= */}
      <section className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            Clear answers about detection methodologies, privacy, and file formats.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="rounded-xl bg-[#0B1224] border border-white/[0.08] overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? -1 : index)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between text-sm font-semibold text-white hover:text-[#00D9FF] transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#00D9FF] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-5 pb-4 text-xs text-[#94A3B8] leading-relaxed border-t border-white/[0.04] pt-3"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </section>

      {/* =========================================================================
          FINAL BOTTOM CTA BANNER
          ========================================================================= */}
      <section className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <div className="relative rounded-3xl bg-gradient-to-tr from-[#111B30] via-[#0B1224] to-[#162340] border border-[#00D9FF]/20 p-8 sm:p-12 text-center space-y-6 shadow-glass-card overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#00D9FF]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#8B5CF6]/10 rounded-full blur-3xl pointer-events-none" />

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to Analyze Content with Precision?
          </h2>
          <p className="text-sm text-[#94A3B8] max-w-xl mx-auto">
            Experience our interactive 3D platform, sentence-level analysis, and transparent reporting today.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link to="/register">
              <MagneticButton className="px-7 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#00D9FF] to-[#8B5CF6] text-white shadow-glow-cyan hover:opacity-95 transition-all flex items-center gap-2">
                <span>Create Free Account</span>
                <ArrowRight className="w-4 h-4" />
              </MagneticButton>
            </Link>
            <Link
              to="/analyzer"
              className="px-7 py-3.5 rounded-xl font-semibold text-sm text-slate-300 bg-[#111B30] hover:bg-[#162340] border border-white/[0.1] transition-all"
            >
              Open Analyzer Directly
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

export default LandingPage;
