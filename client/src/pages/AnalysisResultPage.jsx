import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  Download,
  ArrowLeft,
  ShieldAlert,
  Sparkles,
  AlertCircle,
  HelpCircle,
  FileCheck2,
  RefreshCw,
  Cpu,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import TiltCard from '../components/TiltCard';
import { apiUrl } from '../services/api';
import toast from 'react-hot-toast';

export function AnalysisResultPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [analysisData, setAnalysisData] = useState(location.state?.analysisData || null);
  const [selectedSentence, setSelectedSentence] = useState(null);
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'ai', 'human', 'uncertain'
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // If page was directly navigated to or refreshed without location.state, load from local storage
  useEffect(() => {
    if (!analysisData) {
      const savedScans = JSON.parse(localStorage.getItem('aicheck_local_scans') || '[]');
      const match = savedScans.find((s) => s.id === id);
      if (match) {
        setAnalysisData(match);
      }
    }
  }, [id, analysisData]);

  if (!analysisData) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <div className="w-16 h-16 rounded-2xl bg-cyber-blue/10 border border-cyber-blue/30 flex items-center justify-center text-cyber-blue mb-4">
          <FileText className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Analysis Report Not Found</h2>
        <p className="text-sm text-slate-400 mt-2 max-w-md">
          The requested analysis could not be located in your local session.
        </p>
        <Link
          to="/analyzer"
          className="mt-6 px-6 py-2.5 rounded-xl font-bold text-xs bg-cyber-blue text-midnight-950 hover:bg-cyber-blue-light transition-colors"
        >
          Run New Analysis
        </Link>
      </div>
    );
  }

  const {
    documentName = 'Document Analysis',
    overallAiLikePercentage = 0,
    overallHumanLikePercentage = 0,
    uncertainPercentage = 0,
    totalWords = 0,
    totalSentences = 0,
    sentenceResults = [],
    modelName = 'AICheck Heuristic Linguistic & Statistical Engine',
    modelVersion = '1.5.0',
    activeEngineMode = 'heuristic',
    externalProviderStatus = null,
    qualitativeIndicators = null,
    createdAt = new Date().toISOString(),
    linguisticDiagnostics = {},
  } = analysisData;

  // Donut chart dataset
  const chartData = [
    { name: 'AI-Like Patterns', value: overallAiLikePercentage, color: '#f59e0b' },
    { name: 'Human-Like Patterns', value: overallHumanLikePercentage, color: '#10b981' },
    { name: 'Uncertain Content', value: uncertainPercentage, color: '#64748b' },
  ];

  // Download PDF Report
  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      const response = await fetch(apiUrl('/reports/pdf'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analysisData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF report.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AICheck_Report_${(documentName || 'analysis').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Audit report PDF downloaded successfully!');
    } catch (err) {
      console.error('PDF error:', err);
      toast.error('Failed to download PDF report.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Filter sentences
  const filteredSentences = sentenceResults.filter((s) => {
    if (filterMode === 'all') return true;
    return s.classification === filterMode;
  });

  return (
    <div className="space-y-8 pb-16">
      
      {/* =========================================================================
          TOP EXECUTIVE BAR
      ========================================================================= */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl glass-card border-cyber-blue/20">
        
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-xs text-slate-400 hover:text-cyber-blue flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>
            <span className="text-slate-600">/</span>
            <span className="text-xs font-mono text-cyber-blue uppercase tracking-wider">Report Audit</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <span className="truncate max-w-md">{documentName}</span>
          </h1>

          <p className="text-xs text-slate-400 font-mono flex flex-wrap items-center gap-4 pt-1">
            <span>Date: {new Date(createdAt).toLocaleString()}</span>
            <span>•</span>
            <span>Words: <strong className="text-white">{totalWords.toLocaleString()}</strong></span>
            <span>•</span>
            <span>Sentences: <strong className="text-white">{totalSentences}</strong></span>
            <span>•</span>
            <span>Engine: <strong className="text-cyber-blue">{modelName}</strong></span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-cyber-blue text-midnight-950 hover:bg-cyber-blue-light transition-all flex items-center gap-2 shadow-glow-blue/20 disabled:opacity-50"
          >
            {isDownloadingPdf ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>Download Audit PDF</span>
          </button>

          <Link
            to="/analyzer"
            className="px-5 py-2.5 rounded-xl font-semibold text-xs bg-midnight-900 border border-white/10 hover:border-cyber-blue/40 text-slate-200 transition-colors flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-cyber-blue" />
            <span>Scan Another Document</span>
          </Link>
        </div>

      </div>

      {/* =========================================================================
          MAIN SCORE GAUGES & VISUAL INDICATORS
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Visual Donut Chart Card */}
        <div className="lg:col-span-4 p-6 sm:p-8 rounded-3xl glass-card border-white/10 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Pattern Composition</h3>
            <p className="text-xs text-slate-400 mt-0.5">Aggregate sentence classification share</p>
          </div>

          <div className="h-56 relative my-4 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={88}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => `${val}%`}
                  contentStyle={{
                    backgroundColor: '#070d1e',
                    borderColor: 'rgba(0, 210, 255, 0.3)',
                    borderRadius: '10px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Inner Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-extrabold font-mono text-white">
                {overallAiLikePercentage}%
              </span>
              <span className="text-[10px] font-mono uppercase text-amber-400">AI-Like</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/5 text-center font-mono">
            <div>
              <p className="text-[10px] text-amber-400">AI-LIKE</p>
              <p className="text-base font-bold text-white">{overallAiLikePercentage}%</p>
            </div>
            <div>
              <p className="text-[10px] text-emerald-400">HUMAN</p>
              <p className="text-base font-bold text-white">{overallHumanLikePercentage}%</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400">UNCERTAIN</p>
              <p className="text-base font-bold text-white">{uncertainPercentage}%</p>
            </div>
          </div>
        </div>

        {/* 3 Metric Indicator Cards */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          
          {/* AI-Like Pattern Card (Orange) */}
          <TiltCard glowColor="rgba(245, 158, 11, 0.3)">
            <div className="p-6 h-full flex flex-col justify-between border-t-2 border-amber-500">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
                  AI-Like Writing
                </span>
                <div className="mt-4 mb-2">
                  <span className="text-4xl font-extrabold font-mono text-white">
                    {overallAiLikePercentage}%
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Represents sentences matching uniform syntax, predictable tokens, or neural AI signatures.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-amber-300">
                Threshold: ≥ 60% heuristic score
              </div>
            </div>
          </TiltCard>

          {/* Human-Like Pattern Card (Green) */}
          <TiltCard glowColor="rgba(16, 185, 129, 0.3)">
            <div className="p-6 h-full flex flex-col justify-between border-t-2 border-emerald-500">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                  Human-Like Writing
                </span>
                <div className="mt-4 mb-2">
                  <span className="text-4xl font-extrabold font-mono text-white">
                    {overallHumanLikePercentage}%
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Represents sentences with authentic burstiness, idiomatic nuance, or non-uniform complexity.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-emerald-300">
                Threshold: &lt; 40% heuristic score
              </div>
            </div>
          </TiltCard>

          {/* Uncertain Content Card (Grey) */}
          <TiltCard glowColor="rgba(100, 116, 139, 0.3)">
            <div className="p-6 h-full flex flex-col justify-between border-t-2 border-slate-500">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Uncertain Content
                </span>
                <div className="mt-4 mb-2">
                  <span className="text-4xl font-extrabold font-mono text-white">
                    {uncertainPercentage}%
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Represents transitional, edited, or short sentences where statistical markers are inconclusive.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-slate-400">
                Threshold: 40% – 59% (Inconclusive band)
              </div>
            </div>
          </TiltCard>

        </div>

      </div>

      {/* =========================================================================
          TRANSPARENT ENGINE & QUALITATIVE INDICATORS PANEL
      ========================================================================= */}
      <div className="rounded-3xl glass-card border-cyber-blue/20 p-6 space-y-4 bg-midnight-950/70">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyber-blue" />
            <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
              Active Evaluation Engine:
            </span>
            <span className="text-xs font-mono text-cyber-blue font-bold">
              {modelName} (v{modelVersion})
            </span>
          </div>
          {externalProviderStatus && (
            <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border ${
              externalProviderStatus.status === 'connected'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}>
              {externalProviderStatus.status === 'connected' ? 'External Neural Connected' : 'Deterministic Heuristic Mode'}
            </span>
          )}
        </div>

        {/* Qualitative indicators */}
        {qualitativeIndicators && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-1.5">
              <span className="text-xs font-bold text-amber-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                AI Writing Markers
              </span>
              {qualitativeIndicators.aiIndicators?.length > 0 ? (
                <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                  {qualitativeIndicators.aiIndicators.map((ind, i) => (
                    <li key={i}>{ind}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400 italic">No strong repetitive AI markers detected.</p>
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-1.5">
              <span className="text-xs font-bold text-emerald-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Human Writing Markers
              </span>
              {qualitativeIndicators.humanIndicators?.length > 0 ? (
                <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                  {qualitativeIndicators.humanIndicators.map((ind, i) => (
                    <li key={i}>{ind}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400 italic">Limited burstiness variance observed.</p>
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-500/5 border border-slate-500/20 space-y-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                Probabilistic Notice
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Heuristic pattern scores evaluate stylistic rhythm, burstiness, and vocabulary repetition. They do not constitute certified mathematical probability or proof of authorship.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          SENTENCE-BY-SENTENCE HIGHLIGHTED ANALYSIS
      ========================================================================= */}
      <div className="rounded-3xl glass-card border-white/10 p-6 sm:p-8 space-y-6">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-cyber-blue" />
              <span>Sentence-Level Pattern Highlighting</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any sentence to inspect individual probability scores and diagnostic details
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-midnight-900 border border-white/10 text-xs font-medium">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterMode === 'all' ? 'bg-cyber-blue/20 text-cyber-blue font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({sentenceResults.length})
            </button>
            <button
              onClick={() => setFilterMode('ai')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterMode === 'ai' ? 'bg-amber-500/20 text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              AI-Like
            </button>
            <button
              onClick={() => setFilterMode('human')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterMode === 'human' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Human-Like
            </button>
            <button
              onClick={() => setFilterMode('uncertain')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterMode === 'uncertain' ? 'bg-slate-700/30 text-slate-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Uncertain
            </button>
          </div>
        </div>

        {/* Selected Sentence Inspector Box */}
        {selectedSentence && (
          <div className="p-4 rounded-2xl bg-midnight-900/90 border border-cyber-blue/40 shadow-glow-blue/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-200">
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-cyber-blue font-bold">
                  Sentence #{selectedSentence.index + 1}
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${
                  selectedSentence.classification === 'ai'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : selectedSentence.classification === 'human'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-slate-700/20 text-slate-300 border-slate-600/30'
                }`}>
                  {selectedSentence.classification} pattern ({selectedSentence.score}%)
                </span>
              </div>
              <p className="text-xs text-slate-300 italic">"{selectedSentence.text}"</p>
            </div>

            <button
              onClick={() => setSelectedSentence(null)}
              className="text-xs text-slate-400 hover:text-white shrink-0 px-2.5 py-1 rounded bg-white/5"
            >
              Close
            </button>
          </div>
        )}

        {/* Highlighted Sentences Grid */}
        <div className="space-y-3 font-sans text-sm leading-relaxed">
          {filteredSentences.map((sentence) => {
            const isSelected = selectedSentence?.index === sentence.index;
            let badgeBg = 'bg-slate-800 text-slate-300 border-slate-700';
            let cardBg = 'bg-slate-500/5 border-slate-500/20 hover:border-slate-400/50';

            if (sentence.classification === 'ai') {
              badgeBg = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
              cardBg = 'bg-amber-500/10 border-amber-500/30 hover:border-amber-400 text-amber-50';
            } else if (sentence.classification === 'human') {
              badgeBg = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
              cardBg = 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-400 text-emerald-50';
            }

            return (
              <div
                key={sentence.index}
                onClick={() => setSelectedSentence(sentence)}
                className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${cardBg} ${
                  isSelected ? 'ring-2 ring-cyber-blue shadow-glow-blue/20' : ''
                }`}
              >
                <p className="text-sm flex-1 leading-relaxed">
                  <span className="font-mono text-xs text-slate-400 mr-2">[{sentence.index + 1}]</span>
                  {sentence.text}
                </p>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[11px] font-mono px-2.5 py-1 rounded-md border uppercase font-semibold ${badgeBg}`}>
                    {sentence.classification} ({sentence.score}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* =========================================================================
          CRITICAL ETHICAL & PROBABILISTIC DISCLAIMER
      ========================================================================= */}
      <div className="p-6 rounded-3xl bg-midnight-900/60 border border-cyber-blue/20 flex items-start gap-4">
        <AlertCircle className="w-6 h-6 text-cyber-blue shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white">Ethical AI Model Disclosure</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            AI detection is probabilistic. These results indicate writing patterns and are not proof of who authored the content. Do not treat model probabilities as definitive proof of actual authorship.
          </p>
        </div>
      </div>

    </div>
  );
}

export default AnalysisResultPage;
