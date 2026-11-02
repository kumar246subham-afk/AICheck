import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Search,
  Trash2,
  Eye,
  ArrowRight,
  Filter,
  Calendar,
  AlertTriangle,
  Download,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/firebaseConfig';
import { collection, query, where, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import toast from 'react-hot-toast';

export function AnalysisHistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'high_ai', 'high_human'
  const [deleteCandidate, setDeleteCandidate] = useState(null);

  // Load user's history
  const loadHistory = async () => {
    setLoading(true);
    try {
      if (db && user?.uid) {
        const q = query(
          collection(db, 'analyses'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        setAnalyses(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } else {
        const local = JSON.parse(localStorage.getItem('aicheck_local_scans') || '[]');
        setAnalyses(local);
      }
    } catch (err) {
      console.error('Error loading history:', err);
      // Fallback local
      const local = JSON.parse(localStorage.getItem('aicheck_local_scans') || '[]');
      setAnalyses(local);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [user]);

  // Delete analysis item with confirmation
  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    try {
      if (db && user?.uid) {
        await deleteDoc(doc(db, 'analyses', deleteCandidate.id));
      }
      // Also update local storage
      const local = JSON.parse(localStorage.getItem('aicheck_local_scans') || '[]');
      const filtered = local.filter((s) => s.id !== deleteCandidate.id);
      localStorage.setItem('aicheck_local_scans', JSON.stringify(filtered));

      setAnalyses((prev) => prev.filter((a) => a.id !== deleteCandidate.id));
      toast.success('Document scan removed from history.');
    } catch (err) {
      console.error('Error deleting record:', err);
      toast.error('Failed to delete history record.');
    } finally {
      setDeleteCandidate(null);
    }
  };

  // Filtered & searched list
  const filteredList = analyses.filter((scan) => {
    const nameMatch = (scan.documentName || '').toLowerCase().includes(searchTerm.toLowerCase());
    if (!nameMatch) return false;

    if (statusFilter === 'high_ai') {
      return (scan.overallAiLikePercentage || 0) >= 60;
    }
    if (statusFilter === 'high_human') {
      return (scan.overallHumanLikePercentage || 0) >= 60;
    }
    return true;
  });

  return (
    <div className="space-y-8 pb-12">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl glass-card border-cyber-blue/20">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Analysis History</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Search, filter, inspect, and manage your verified document audit trail.
          </p>
        </div>

        <Link
          to="/analyzer"
          className="px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyber-blue to-cyber-violet text-midnight-950 flex items-center gap-2 hover:shadow-glow-blue transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Document Scan</span>
        </Link>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl glass-card border-white/10">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search document name..."
            className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs text-white placeholder:text-slate-500"
          />
        </div>

        {/* Filter Dropdown / Tabs */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">Filter:</span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-cyber-blue/20 text-cyber-blue border border-cyber-blue/40 font-bold'
                : 'text-slate-400 hover:text-white bg-midnight-900 border border-white/5'
            }`}
          >
            All Scans
          </button>
          <button
            onClick={() => setStatusFilter('high_ai')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'high_ai'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold'
                : 'text-slate-400 hover:text-white bg-midnight-900 border border-white/5'
            }`}
          >
            AI-Like (≥60%)
          </button>
          <button
            onClick={() => setStatusFilter('high_human')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === 'high_human'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold'
                : 'text-slate-400 hover:text-white bg-midnight-900 border border-white/5'
            }`}
          >
            Human-Like (≥60%)
          </button>
        </div>

      </div>

      {/* History List */}
      <div className="rounded-3xl glass-card border-white/10 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-cyber-blue flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-cyber-blue border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-mono">Loading analysis records...</span>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-midnight-900 border border-white/10 flex items-center justify-center mx-auto text-slate-400">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">No Matching Analyses</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchTerm ? 'No document matched your search query.' : 'You have not scanned any documents yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-[11px] font-mono uppercase tracking-wider text-slate-400 bg-midnight-900/40">
                  <th className="py-3.5 px-6 font-semibold">Document Name</th>
                  <th className="py-3.5 px-4 font-semibold">Date Analyzed</th>
                  <th className="py-3.5 px-4 font-semibold">Word Count</th>
                  <th className="py-3.5 px-4 font-semibold">AI-Like</th>
                  <th className="py-3.5 px-4 font-semibold">Human-Like</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-xs">
                {filteredList.map((scan) => (
                  <tr key={scan.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 font-sans font-medium text-white flex items-center gap-3">
                      <FileText className="w-4 h-4 text-cyber-blue shrink-0" />
                      <span className="truncate max-w-xs">{scan.documentName || 'Untitled Document'}</span>
                    </td>
                    <td className="py-4 px-4 text-slate-400">
                      {new Date(scan.createdAt).toLocaleDateString()} {new Date(scan.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-4 px-4 text-slate-300">
                      {scan.totalWords?.toLocaleString() || 0}
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
                        {scan.overallAiLikePercentage || 0}%
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                        {scan.overallHumanLikePercentage || 0}%
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-sans">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/result/${scan.id}`}
                          state={{ analysisData: scan }}
                          className="px-3 py-1 rounded-lg text-xs font-semibold bg-cyber-blue/10 text-cyber-blue border border-cyber-blue/30 hover:bg-cyber-blue/20 transition-all flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </Link>
                        <button
                          onClick={() => setDeleteCandidate(scan)}
                          title="Delete from history"
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="max-w-md w-full p-6 rounded-3xl glass-card border-rose-500/40 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Delete Analysis Record?</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete the audit record for{' '}
              <strong className="text-white">"{deleteCandidate.documentName}"</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-midnight-900 border border-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default AnalysisHistoryPage;
