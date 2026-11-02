import React from 'react';
import { ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';

export function TermsPage() {
  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      <div className="max-w-4xl mx-auto space-y-12 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyber-blue/10 border border-cyber-blue/30 text-xs font-mono text-cyber-blue">
            <FileText className="w-3.5 h-3.5" />
            <span>Legal Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Terms and Conditions</h1>
          <p className="text-xs font-mono text-slate-400">Effective Date: November 1, 2026 • Version 2.0</p>
        </div>

        <div className="p-8 sm:p-12 rounded-3xl glass-card border-white/10 space-y-8 text-sm text-slate-300 leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the AICheck platform ("Service"), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, you must not access or use the Service.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-white/5">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <span>2. Critical Disclaimer: Probabilistic Detection</span>
            </h2>
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 leading-relaxed space-y-2">
              <p className="font-bold uppercase tracking-wider">
                IMPORTANT AI DETECTION LIMITATIONS:
              </p>
              <p>
                AICheck utilizes probabilistic neural models and linguistic heuristics (such as perplexity and burstiness) to evaluate statistical writing pattern signatures. <strong>AICheck does not and cannot definitively prove who authored any piece of text.</strong>
              </p>
              <p>
                Under no circumstances should AICheck's percentage scores be treated as conclusive evidence of academic dishonesty, intellectual theft, or disciplinary misconduct without independent human review and verification.
              </p>
            </div>
          </section>

          <section className="space-y-3 pt-4 border-t border-white/5">
            <h2 className="text-xl font-bold text-white">3. Acceptable Use Policy</h2>
            <p>
              You agree not to use AICheck to:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>Upload documents containing malicious code, exploit payloads, or illegal material.</li>
              <li>Attempt to reverse-engineer, decompile, or launch automated Denial of Service (DoS) attacks against our inference endpoints.</li>
              <li>Abuse free tier limits via programmatic bot creation or account cycling.</li>
              <li>Impose punitive academic or employment sanctions solely on the basis of model percentages without human editorial corroboration.</li>
            </ul>
          </section>

          <section className="space-y-3 pt-4 border-t border-white/5">
            <h2 className="text-xl font-bold text-white">4. Intellectual Property Rights</h2>
            <p>
              You retain all ownership, copyright, and intellectual property rights in the documents you submit for analysis. AICheck claims zero ownership over your submitted texts and does not retain or republish your content.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-white/5">
            <h2 className="text-xl font-bold text-white">5. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, AICheck and its operators shall not be liable for any indirect, incidental, punitive, or consequential damages resulting from false positives, false negatives, or any decisions made based on analysis reports.
            </p>
          </section>

        </div>

      </div>

    </div>
  );
}

export default TermsPage;
