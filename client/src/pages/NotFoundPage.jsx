import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home, Sparkles } from 'lucide-react';
import Scene3D from '../three/Scene3D';

export function NotFoundPage() {
  return (
    <div className="min-h-screen pt-20 pb-12 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyber-blue/10 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="max-w-md w-full rounded-3xl glass-card border-cyber-blue/30 p-8 sm:p-12 text-center shadow-2xl relative z-10 space-y-6">
        
        <div className="h-40 relative">
          <Scene3D showDocs={false} className="h-full w-full" />
        </div>

        <div className="space-y-2">
          <span className="text-5xl font-extrabold font-mono text-gradient-cyan">404</span>
          <h1 className="text-xl font-bold text-white">Dimension Not Found</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            The page coordinates you entered do not exist on the AICheck network.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2.5">
          <Link
            to="/"
            className="w-full py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-cyber-blue to-cyber-violet text-midnight-950 flex items-center justify-center gap-2 hover:shadow-glow-blue transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Return to Safe Harbor (Home)</span>
          </Link>
          <Link
            to="/analyzer"
            className="w-full py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-midnight-900 border border-white/10 hover:border-cyber-blue/40 transition-colors"
          >
            Open Document Analyzer
          </Link>
        </div>

      </div>

    </div>
  );
}

export default NotFoundPage;
