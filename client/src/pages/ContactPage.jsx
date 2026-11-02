import React, { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle2, Sparkles, MapPin, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

export function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast.success('Your message has been received! We will reply within 24 hours.');
    }, 800);
  };

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      <div className="max-w-5xl mx-auto space-y-12 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyber-blue/10 border border-cyber-blue/30 text-xs font-mono text-cyber-blue">
            <Mail className="w-3.5 h-3.5" />
            <span>Support & Inquiries</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Get in Touch With Our Team
          </h1>
          <p className="text-slate-400 text-sm">
            Have questions about institutional volume pricing, model integration, or technical support? We're here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Info Column */}
          <div className="lg:col-span-5 p-8 rounded-3xl glass-card border-white/10 space-y-6">
            <h3 className="text-xl font-bold text-white">Contact Information</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our engineering and client success teams are available across US and European business hours.
            </p>

            <div className="space-y-4 pt-2 text-xs text-slate-300">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyber-blue/10 border border-cyber-blue/30 flex items-center justify-center text-cyber-blue shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase text-slate-500">Direct Email</p>
                  <p className="text-slate-200 font-semibold">support@aicheck.ai</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyber-violet/10 border border-cyber-violet/30 flex items-center justify-center text-cyber-violet shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase text-slate-500">Enterprise Inquiries</p>
                  <p className="text-slate-200 font-semibold">sales@aicheck.ai</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase text-slate-500">Headquarters</p>
                  <p className="text-slate-200 font-semibold">San Francisco, CA & London, UK</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-midnight-900 border border-cyber-blue/20 text-xs text-slate-400">
              ⚡ Average response time: <strong className="text-white">Under 2 hours</strong> for enterprise clients.
            </div>
          </div>

          {/* Right Form Column */}
          <div className="lg:col-span-7 p-8 rounded-3xl glass-card border-white/10">
            {isSubmitted ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white">Message Dispatched!</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Thank you, <strong className="text-white">{name}</strong>. An AICheck specialist has been notified and will reach out to <strong className="text-cyber-blue">{email}</strong> shortly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    setMessage('');
                  }}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-midnight-900 border border-white/10 text-slate-200"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Morgan"
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@organization.com"
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-white text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                    Subject / Topic
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-white text-sm bg-midnight-900"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Enterprise / Institutional Plan">Enterprise / Institutional Plan</option>
                    <option value="API Integration Support">API Integration Support</option>
                    <option value="Bug Report / False Positive Feedback">Bug Report / False Positive Feedback</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                    Your Message
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about your team size, expected document volume, or question..."
                    className="w-full p-4 rounded-xl glass-input text-white text-sm resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-cyber-blue to-cyber-violet text-midnight-950 hover:shadow-glow-blue transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-midnight-950 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Transmit Message</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}

export default ContactPage;
