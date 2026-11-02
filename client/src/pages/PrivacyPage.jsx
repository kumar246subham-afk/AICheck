import React from 'react';
import { ShieldCheck, Lock, Eye, FileText, CheckCircle2 } from 'lucide-react';

export function PrivacyPage() {
  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      <div className="max-w-4xl mx-auto space-y-12 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyber-blue/10 border border-cyber-blue/30 text-xs font-mono text-cyber-blue">
            <Lock className="w-3.5 h-3.5" />
            <span>Data Protection & Privacy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Privacy Policy</h1>
          <p className="text-xs font-mono text-slate-400">Effective Date: November 1, 2026 • Version 2.2</p>
        </div>

        <div className="p-8 sm:p-12 rounded-3xl glass-card border-white/10 space-y-8 text-sm text-slate-300 leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyber-blue" />
              <span>1. Zero Document Retention Guarantee</span>
            </h2>
            <p>
              AICheck adheres to a strict <strong>Zero Permanent Document Retention Policy</strong>. When you upload a PDF, DOCX, DOC, or TXT file to our analyzer workspace:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>The file is held exclusively in volatile memory buffers for text extraction.</li>
              <li>Once text extraction concludes and statistical scoring is completed, the document buffer is completely purged.</li>
              <li>Your document text is <strong>never</strong> sold, shared, or indexed in public search repositories.</li>
              <li>We <strong>never</strong> use your uploaded content to train or fine-tune third-party commercial AI models.</li>
            </ul>
          </section>

          <section className="space-y-3 pt-4 border-t border-white/5">
            <h2 className="text-xl font-bold text-white">2. Information We Collect</h2>
            <p>
              To provide authentication and history services, we collect minimal account telemetry:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li><strong>Account Credentials:</strong> Name, email address, and authentication tokens via Google/Firebase Auth.</li>
              <li><strong>Analysis Metadata:</strong> Document name, date analyzed, word count, and statistical summary scores stored in your private Firestore record.</li>
              <li><strong>Technical Logs:</strong> IP address, browser user-agent, and error logs collected temporarily for DDoS prevention and rate limiting.</li>
            </ul>
          </section>

          <section className="space-y-3 pt-4 border-t border-white/5">
            <h2 className="text-xl font-bold text-white">3. How Information is Used</h2>
            <p>
              We use collected telemetry solely to:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>Authenticate your account session and prevent unauthorized access.</li>
              <li>Enable you to inspect your personal history of prior scans.</li>
              <li>Generate downloadable, tamper-verifiable PDF audit reports.</li>
              <li>Enforce platform fair-use rate limits and detect automated scraping.</li>
            </ul>
          </section>

          <section className="space-y-3 pt-4 border-t border-white/5">
            <h2 className="text-xl font-bold text-white">4. Data Security & Encryption</h2>
            <p>
              All traffic between your browser and our API is encrypted using TLS 1.3 encryption. Backend operations adhere to the principle of least privilege, and user records in Firestore are locked by strict security rules preventing cross-user reads or unauthorized elevation.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-white/5">
            <h2 className="text-xl font-bold text-white">5. Contact Privacy Officer</h2>
            <p>
              If you have questions regarding data privacy or wish to request an account scrub, contact our Data Protection Officer at <a href="mailto:privacy@aicheck.ai" className="text-cyber-blue hover:underline">privacy@aicheck.ai</a>.
            </p>
          </section>

        </div>

      </div>

    </div>
  );
}

export default PrivacyPage;
