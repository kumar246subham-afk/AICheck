import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Github, Twitter, Linkedin, Mail, Heart, AlertCircle } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative bg-[#050816] border-t border-white/[0.08] pt-16 pb-12 overflow-hidden">
      {/* Background radial gradient accent */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#00D9FF]/05 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00D9FF] to-[#8B5CF6] p-[2px] shadow-glow-cyan">
                <div className="w-full h-full bg-[#0B1224] rounded-[10px] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-[#00D9FF]" />
                </div>
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                AICheck
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm mb-6">
              Advanced 3D AI content detection platform combining sentence-level linguistic analysis, perplexity metrics, and neural classifiers to evaluate writing patterns.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-[#0B1224] border border-white/10 flex items-center justify-center text-slate-400 hover:text-[#00D9FF] hover:border-[#00D9FF]/40 transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-[#0B1224] border border-white/10 flex items-center justify-center text-slate-400 hover:text-[#00D9FF] hover:border-[#00D9FF]/40 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-[#0B1224] border border-white/10 flex items-center justify-center text-slate-400 hover:text-[#00D9FF] hover:border-[#00D9FF]/40 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <Link
                to="/contact"
                className="w-9 h-9 rounded-lg bg-[#0B1224] border border-white/10 flex items-center justify-center text-slate-400 hover:text-[#00D9FF] hover:border-[#00D9FF]/40 transition-colors"
                aria-label="Contact Email"
              >
                <Mail className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-4 font-mono text-[#00D9FF]">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/analyzer" className="text-slate-400 hover:text-white transition-colors">
                  Document Analyzer
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-slate-400 hover:text-white transition-colors">
                  Subscription Plans
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-slate-400 hover:text-white transition-colors">
                  User Workspace
                </Link>
              </li>
              <li>
                <Link to="/history" className="text-slate-400 hover:text-white transition-colors">
                  Analysis History
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-4 font-mono text-[#8B5CF6]">
              Company
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/about" className="text-slate-400 hover:text-white transition-colors">
                  About AICheck
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-400 hover:text-white transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <a href="#features" className="text-slate-400 hover:text-white transition-colors">
                  Key Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="text-slate-400 hover:text-white transition-colors">
                  How It Works
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-4 font-mono text-pink-400">
              Compliance
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/privacy" className="text-slate-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-slate-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/settings" className="text-slate-400 hover:text-white transition-colors">
                  Account Privacy
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-slate-400 hover:text-white transition-colors">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Ethical AI & Probabilistic Notice Banner */}
        <div className="p-4 rounded-xl bg-[#0B1224]/80 border border-white/[0.08] mb-8 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#00D9FF] shrink-0 mt-0.5" />
          <p className="text-xs text-slate-400 leading-relaxed">
            <strong className="text-slate-200">Ethical AI Disclosure:</strong> AICheck produces probabilistic classification estimates based on statistical writing pattern indicators (such as perplexity and burstiness). Detection results do not constitute definitive proof of actual human authorship and should never be used as the sole criterion for punitive decisions.
          </p>
        </div>

        {/* Bottom Credits & Copyright */}
        <div className="pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} AICheck SaaS Inc. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 inline fill-rose-500" /> for academic integrity & content authenticity
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
