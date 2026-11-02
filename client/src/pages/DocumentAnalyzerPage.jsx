import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileText,
  X,
  FileCheck2,
  Trash2,
  Sparkles,
  AlertCircle,
  Cpu,
  Layers,
  ArrowRight,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';
import HolographicScanner from '../components/HolographicScanner';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { apiUrl } from '../services/api';
import toast from 'react-hot-toast';

export function DocumentAnalyzerPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [text, setText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef(null);
  const abortControllerRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Word & character counts
  const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;
  const charCount = text.length;

  // Handle file selection and backend extraction
  const processUploadedFile = async (file) => {
    setErrorMsg('');
    if (!file) return;

    // Check size limit (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('File size exceeds the 10MB limit. Please upload a smaller file.');
      toast.error('File size exceeds 10MB.');
      return;
    }

    // Check extension
    const allowed = /\.(pdf|docx|doc|txt)$/i;
    if (!allowed.test(file.name)) {
      setErrorMsg('Unsupported format. Please upload a PDF, DOCX, DOC, or TXT file.');
      toast.error('Invalid document format.');
      return;
    }

    setSelectedFile(file);
    setIsExtracting(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = user ? await user.getIdToken() : null;
      const response = await fetch(apiUrl('/documents/extract'), {
        method: 'POST',
        signal: controller.signal,
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to extract text from document.');
      }

      setText(data.data.text || '');
      toast.success(`Extracted ${data.data.wordCount} words from ${file.name}`);
    } catch (err) {
      if (err.name === 'AbortError') {
        toast('Extraction cancelled.', { icon: '⏹️' });
        return;
      }
      console.error('Extraction error:', err);
      setErrorMsg(err.message || 'Error parsing document file.');
      toast.error('Could not parse document.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleCancelOperation = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsAnalyzing(false);
      setIsExtracting(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClearAll = () => {
    handleRemoveFile();
    setText('');
    setErrorMsg('');
  };

  // Sample texts
  const loadSample = (type) => {
    if (type === 'academic') {
      setText(
        "Recent developments in quantum computing have introduced novel approaches to classical cryptography. " +
        "While traditional RSA algorithms rely upon the mathematical intractability of prime factorization, Shor's algorithm demonstrates that a sufficiently coherent quantum computer could solve this in polynomial time. " +
        "Consequently, post-quantum cryptographic standards such as lattice-based algorithms are now undergoing widespread evaluation across academic institutions and defense organizations."
      );
    } else if (type === 'ai') {
      setText(
        "Furthermore, artificial intelligence plays a crucial role in modern industrial optimization. " +
        "It is important to note that the multifaceted nature of automated neural architectures provides a testament to innovative digital transformation. " +
        "In addition, organizations can leverage these comprehensive paradigms to foster sustainable efficiency and seamlessly navigate operational complexity."
      );
    }
    setSelectedFile(null);
    toast.success('Sample text loaded');
  };

  // Run AI Detection Analysis
  const handleAnalyze = async () => {
    setErrorMsg('');
    if (wordCount < 15) {
      setErrorMsg('Please provide at least 15 words for a reliable statistical pattern evaluation.');
      toast.error('Minimum 15 words required.');
      return;
    }

    setIsAnalyzing(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const token = user ? await user.getIdToken() : null;
      const response = await fetch(apiUrl('/detect'), {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          text,
          documentName: selectedFile ? selectedFile.name : 'Text Submission',
        }),
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.message || 'Detection analysis failed.');
      }

      const scanResult = json.data;

      // Save to Firestore if user logged in & db is active
      if (db && user?.uid) {
        try {
          const docRef = await addDoc(collection(db, 'analyses'), {
            ...scanResult,
            userId: user.uid,
          });
          scanResult.id = docRef.id;
        } catch (dbErr) {
          console.warn('Could not save to Firestore; persisting locally:', dbErr);
        }
      }

      // Also persist to localStorage for offline / recent history
      const savedScans = JSON.parse(localStorage.getItem('aicheck_local_scans') || '[]');
      savedScans.unshift(scanResult);
      localStorage.setItem('aicheck_local_scans', JSON.stringify(savedScans.slice(0, 30)));

      toast.success('Analysis complete!');
      navigate(`/result/${scanResult.id}`, { state: { analysisData: scanResult } });
    } catch (err) {
      if (err.name === 'AbortError') {
        toast('Analysis cancelled.', { icon: '⏹️' });
        return;
      }
      console.error('Detection error:', err);
      setErrorMsg(err.message || 'Analysis failed. Please check network connection.');
      toast.error(err.message || 'Analysis failed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl glass-card border-cyber-blue/20">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyber-blue/10 text-cyber-blue text-xs font-mono border border-cyber-blue/30 mb-1">
            <Cpu className="w-3.5 h-3.5" />
            <span>Dual-Engine Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">AI Document Analyzer</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Upload PDF, DOCX, DOC, or TXT documents, or paste written text directly to evaluate heuristic writing patterns.
          </p>
          <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-mono">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Probabilistic Heuristic Engine: Results indicate stylistic patterns, not definitive proof of authorship.</span>
          </div>
        </div>

        {/* Preset sample buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadSample('academic')}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-midnight-900 border border-white/10 hover:border-cyber-blue/40 text-slate-300 hover:text-white transition-colors"
          >
            Human Academic Sample
          </button>
          <button
            onClick={() => loadSample('ai')}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-midnight-900 border border-amber-500/30 hover:border-amber-500 text-amber-300 transition-colors"
          >
            AI Cliché Sample
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{errorMsg}</span>
        </div>
      )}

      {/* Main Studio Grid: Left Upload, Right Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* =========================================================================
            LEFT COLUMN: DOCUMENT UPLOAD & FILE INFO
        ========================================================================= */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="rounded-3xl glass-card border-white/10 p-6 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-cyber-blue" />
              <span>Document Upload</span>
            </h3>

            {/* Drag & Drop Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer text-center relative overflow-hidden ${
                isDragging
                  ? 'border-cyber-blue bg-cyber-blue/10 scale-[1.01]'
                  : 'border-white/15 bg-midnight-900/40 hover:border-cyber-blue/50 hover:bg-midnight-900/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-14 h-14 rounded-2xl bg-cyber-blue/10 border border-cyber-blue/30 flex items-center justify-center mx-auto text-cyber-blue mb-4 shadow-glow-blue/20">
                <FileCheck2 className="w-7 h-7" />
              </div>

              <p className="text-sm font-bold text-white mb-1">
                Drop your document here or <span className="text-cyber-blue underline">Browse</span>
              </p>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                Supports PDF, DOCX, DOC, TXT (Maximum 10MB per document)
              </p>
            </div>

            {/* Uploaded File Info Card */}
            {selectedFile && (
              <div className="p-4 rounded-2xl bg-midnight-900/80 border border-cyber-blue/30 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-cyber-blue/20 border border-cyber-blue/40 flex items-center justify-center text-cyber-blue font-mono font-bold text-xs shrink-0">
                    {selectedFile.name.split('.').pop()?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{selectedFile.name}</p>
                    <p className="text-[10px] text-slate-400">
                      {(selectedFile.size / 1024).toFixed(1)} KB • Ready for analysis
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Replace file"
                    className="p-1.5 text-slate-400 hover:text-cyber-blue rounded-lg"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    title="Remove file"
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Parsing State */}
            {isExtracting && (
              <div className="p-4 rounded-2xl bg-cyber-blue/10 border border-cyber-blue/30 flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-cyber-blue border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs text-cyber-blue font-mono">Extracting and sanitizing document content...</span>
              </div>
            )}

            {/* Information Tips */}
            <div className="pt-4 border-t border-white/5 space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyber-blue"></div>
                <span>Server automatically strips formatting and null bytes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyber-violet"></div>
                <span>Zero retention: Document buffers deleted immediately</span>
              </div>
            </div>

          </div>

        </div>

        {/* =========================================================================
            RIGHT COLUMN: TEXT WORKSPACE & LIVE ANALYSIS BUTTON
        ========================================================================= */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="rounded-3xl glass-card border-white/10 p-6 space-y-4">
            
            {/* Workspace Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyber-blue" />
                <span>Text Content Workspace</span>
              </h3>

              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="text-slate-400">
                  Words: <strong className="text-white">{wordCount}</strong>
                </span>
                <span className="text-slate-400">
                  Chars: <strong className="text-white">{charCount}</strong>
                </span>
                {text && (
                  <button
                    onClick={handleClearAll}
                    title="Clear text"
                    className="text-slate-500 hover:text-rose-400 transition-colors flex items-center gap-1 font-sans"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                )}
              </div>
            </div>

            {/* Holographic Scanner Container for Editor */}
            <HolographicScanner isScanning={isAnalyzing} className="border border-white/10 bg-midnight-950/60">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste or type your manuscript, article, or essay text here, or upload a document file on the left (minimum 15 words)..."
                rows={14}
                className="w-full p-4 bg-transparent text-slate-100 placeholder:text-slate-600 font-sans text-sm leading-relaxed resize-none focus:outline-none"
              />
            </HolographicScanner>

            {/* Analysis Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${wordCount >= 15 ? 'bg-emerald-400' : 'bg-slate-600'}`}></div>
                <span>
                  {wordCount >= 15
                    ? `Ready for analysis (${wordCount} words)`
                    : `Need ${Math.max(0, 15 - wordCount)} more words`}
                </span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {(isAnalyzing || isExtracting) && (
                  <button
                    type="button"
                    onClick={handleCancelOperation}
                    className="px-4 py-3 rounded-xl font-medium text-xs bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 transition-colors"
                  >
                    Cancel Analysis
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || isExtracting || wordCount < 15}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyber-blue to-cyber-violet text-midnight-950 hover:shadow-glow-blue transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-40 disabled:hover:shadow-none cursor-pointer"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-midnight-950 border-t-transparent rounded-full animate-spin"></div>
                      <span>Evaluating Writing Patterns...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-midnight-950" />
                      <span>Analyze Content Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default DocumentAnalyzerPage;
