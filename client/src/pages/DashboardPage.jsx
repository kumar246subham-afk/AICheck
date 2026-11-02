import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Upload,
  Cpu,
  TrendingUp,
  Clock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  BarChart2,
  FileCheck2,
  AlertCircle,
  Eye,
  Plus
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import TiltCard from '../components/TiltCard';

export function DashboardPage() {
  const { user, userProfile, plan } = useAuth();
  const navigate = useNavigate();

  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDocs: 0,
    totalWords: 0,
    avgAiScore: 0,
    avgHumanScore: 0
  });

  const displayName = userProfile?.fullName || user?.displayName || user?.email?.split('@')[0] || 'Researcher';

  // Load user's real analyses from Firestore or localStorage fallback
  useEffect(() => {
    const fetchUserAnalyses = async () => {
      setLoading(true);
      try {
        if (db && user?.uid) {
          const q = query(
            collection(db, 'analyses'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc'),
            limit(10)
          );
          const snap = await getDocs(q);
          const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          setAnalyses(docs);

          // Calculate summary metrics
          if (docs.length > 0) {
            const words = docs.reduce((acc, curr) => acc + (curr.totalWords || 0), 0);
            const totalAi = docs.reduce((acc, curr) => acc + (curr.overallAiLikePercentage || 0), 0);
            const totalHuman = docs.reduce((acc, curr) => acc + (curr.overallHumanLikePercentage || 0), 0);
            setStats({
              totalDocs: docs.length,
              totalWords: words,
              avgAiScore: Math.round(totalAi / docs.length),
              avgHumanScore: Math.round(totalHuman / docs.length)
            });
          }
        } else {
          // Check local stored session scans
          const localScans = JSON.parse(localStorage.getItem('aicheck_local_scans') || '[]');
          setAnalyses(localScans);
          if (localScans.length > 0) {
            const words = localScans.reduce((acc, curr) => acc + (curr.totalWords || 0), 0);
            const totalAi = localScans.reduce((acc, curr) => acc + (curr.overallAiLikePercentage || 0), 0);
            const totalHuman = localScans.reduce((acc, curr) => acc + (curr.overallHumanLikePercentage || 0), 0);
            setStats({
              totalDocs: localScans.length,
              totalWords: words,
              avgAiScore: Math.round(totalAi / localScans.length),
              avgHumanScore: Math.round(totalHuman / localScans.length)
            });
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard analyses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAnalyses();
  }, [user]);

  // Chart data from recent analyses or fallback trajectory
  const chartData = analyses.length > 0
    ? analyses.slice(0, 7).reverse().map((a, idx) => ({
        name: a.documentName ? (a.documentName.length > 10 ? a.documentName.substring(0, 10) + '...' : a.documentName) : `Doc ${idx + 1}`,
        ai: a.overallAiLikePercentage || 0,
        human: a.overallHumanLikePercentage || 0,
      }))
    : [
        { name: 'Mon', ai: 20, human: 75 },
        { name: 'Tue', ai: 45, human: 50 },
        { name: 'Wed', ai: 15, human: 80 },
        { name: 'Thu', ai: 60, human: 35 },
        { name: 'Fri', ai: 30, human: 65 },
      ];

  return (
    <div className="space-y-8 pb-10">
      
      {/* =========================================================================
          TOP BANNER: WELCOME & QUICK ACTIONS
      ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl glass-card border-cyber-blue/20 bg-gradient-to-r from-midnight-900 via-midnight-850 to-midnight-900 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyber-blue/10 text-cyber-blue text-xs font-mono border border-cyber-blue/30">
            <Sparkles className="w-3 h-3" />
            <span>Workspace Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome back, {displayName}
          </h1>
          <p className="text-sm text-slate-400">
            Manage your document scans, inspect sentence-level writing patterns, and export audit reports.
          </p>
        </div>

        <Link
          to="/analyzer"
          className="px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-cyber-blue to-cyber-violet text-midnight-950 flex items-center gap-2 hover:shadow-glow-blue transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Analysis</span>
        </Link>
      </div>

      {/* =========================================================================
          STATISTICS CARDS (REAL DATA OR CLEAN ZERO STATE)
      ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Documents */}
        <TiltCard glowColor="rgba(0, 210, 255, 0.25)">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Documents Analyzed</span>
              <div className="w-10 h-10 rounded-xl bg-cyber-blue/10 border border-cyber-blue/30 flex items-center justify-center text-cyber-blue">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold font-mono text-white">
              {stats.totalDocs}
            </div>
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
              <span>Lifetime scan count</span>
            </p>
          </div>
        </TiltCard>

        {/* Total Words */}
        <TiltCard glowColor="rgba(139, 92, 246, 0.25)">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Total Words Processed</span>
              <div className="w-10 h-10 rounded-xl bg-cyber-violet/10 border border-cyber-violet/30 flex items-center justify-center text-cyber-violet">
                <BarChart2 className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold font-mono text-white">
              {stats.totalWords.toLocaleString()}
            </div>
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
              <span>Granular word tokens</span>
            </p>
          </div>
        </TiltCard>

        {/* Avg AI-Like Score */}
        <TiltCard glowColor="rgba(245, 158, 11, 0.25)">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Average AI Score</span>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Cpu className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold font-mono text-amber-400">
              {stats.avgAiScore}%
            </div>
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
              <span>Across submitted documents</span>
            </p>
          </div>
        </TiltCard>

        {/* Current Plan */}
        <TiltCard glowColor="rgba(16, 185, 129, 0.25)">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Current Plan</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold font-mono text-white">
              {plan}
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-emerald-400 font-mono">Active Tier</span>
              <Link to="/pricing" className="text-xs text-cyber-blue hover:underline">
                Upgrade →
              </Link>
            </div>
          </div>
        </TiltCard>

      </div>

      {/* =========================================================================
          ANALYTICS CHART & QUICK UPLOAD WIDGET
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Activity & Score Trajectory Chart */}
        <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl glass-card border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Pattern Trajectory</h3>
              <p className="text-xs text-slate-400 mt-0.5">Historical AI-like vs Human-like score distribution</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-amber-400">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div> AI-Like %
              </span>
              <span className="flex items-center gap-1.5 text-cyber-blue">
                <div className="w-2.5 h-2.5 rounded-full bg-cyber-blue"></div> Human-Like %
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="aiGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="humanGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d2ff" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#00d2ff" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={11} tickLine={false} />
                <YAxis stroke="#6b7280" fontSize={11} domain={[0, 100]} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#070d1e',
                    borderColor: 'rgba(0, 210, 255, 0.3)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Area type="monotone" dataKey="ai" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#aiGradient)" />
                <Area type="monotone" dataKey="human" stroke="#00d2ff" strokeWidth={2} fillOpacity={1} fill="url(#humanGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Upload Widget */}
        <div className="lg:col-span-4 p-6 sm:p-8 rounded-3xl glass-card border-cyber-blue/30 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-cyber-blue/10 border border-cyber-blue/30 flex items-center justify-center text-cyber-blue mb-4">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Quick Scan Dropzone</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Upload PDF, DOCX, DOC, or TXT directly into our scanner engine to generate a fresh writing breakdown.
            </p>
          </div>

          <div className="my-6 p-6 rounded-2xl border-2 border-dashed border-cyber-blue/30 bg-midnight-900/40 text-center hover:border-cyber-blue transition-colors cursor-pointer"
            onClick={() => navigate('/analyzer')}
          >
            <FileCheck2 className="w-8 h-8 text-cyber-blue mx-auto mb-2 opacity-80" />
            <p className="text-xs font-semibold text-white">Click or Drop File Here</p>
            <p className="text-[10px] text-slate-500 mt-1">PDF, DOCX, DOC, TXT (up to 10MB)</p>
          </div>

          <Link
            to="/analyzer"
            className="w-full py-2.5 rounded-xl text-xs font-bold text-center bg-midnight-900 border border-cyber-blue/40 text-cyber-blue hover:bg-cyber-blue/10 transition-colors"
          >
            Open Full Analyzer Studio →
          </Link>
        </div>

      </div>

      {/* =========================================================================
          RECENT ACTIVITY TABLE (REAL FIRESTORE DATA & EMPTY STATE)
      ========================================================================= */}
      <div className="rounded-3xl glass-card border-white/10 p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Recent Analyses</h3>
            <p className="text-xs text-slate-400 mt-0.5">Your most recent document inspections</p>
          </div>
          <Link
            to="/history"
            className="text-xs font-semibold text-cyber-blue hover:underline flex items-center gap-1"
          >
            <span>View All History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {analyses.length === 0 ? (
          /* Empty State for New Users */
          <div className="p-12 text-center rounded-2xl bg-midnight-900/40 border border-white/5 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-cyber-blue/10 border border-cyber-blue/20 flex items-center justify-center mx-auto text-cyber-blue">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">No Analyses Yet</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                You haven't scanned any documents yet. Upload your first PDF, Word document, or plain text to begin.
              </p>
            </div>
            <Link
              to="/analyzer"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs bg-cyber-blue text-midnight-950 hover:bg-cyber-blue-light transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Start First Analysis</span>
            </Link>
          </div>
        ) : (
          /* Table of Real Scans */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  <th className="pb-3 font-semibold">Document Name</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Words</th>
                  <th className="pb-3 font-semibold">AI Pattern</th>
                  <th className="pb-3 font-semibold">Human Pattern</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-xs">
                {analyses.map((scan) => (
                  <tr key={scan.id} className="hover:bg-white/5 transition-colors group">
                    <td className="py-3.5 font-sans font-medium text-white flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-cyber-blue shrink-0" />
                      <span className="truncate max-w-xs">{scan.documentName || 'Untitled Analysis'}</span>
                    </td>
                    <td className="py-3.5 text-slate-400">
                      {new Date(scan.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 text-slate-300">
                      {scan.totalWords?.toLocaleString() || 0}
                    </td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
                        {scan.overallAiLikePercentage || 0}%
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                        {scan.overallHumanLikePercentage || 0}%
                      </span>
                    </td>
                    <td className="py-3.5 text-right font-sans">
                      <Link
                        to={`/result/${scan.id}`}
                        state={{ analysisData: scan }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-cyber-blue/10 text-cyber-blue border border-cyber-blue/30 hover:bg-cyber-blue/20 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

export default DashboardPage;
