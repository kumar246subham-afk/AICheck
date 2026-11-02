import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, X, Sparkles, ShieldCheck, Zap, ArrowRight, HelpCircle } from 'lucide-react';
import TiltCard from '../components/TiltCard';

export function PricingPage() {
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'annual'

  const plans = [
    {
      name: 'Starter',
      price: billingCycle === 'monthly' ? '$0' : '$0',
      period: 'forever',
      description: 'Ideal for students, casual writers, and quick single-document checks.',
      popular: false,
      ctaText: 'Get Started Free',
      ctaLink: '/register',
      features: [
        'Up to 1,500 words per scan',
        'PDF, DOCX, DOC, and TXT upload',
        'Sentence-level pattern highlighting',
        'Standard local linguistic engine',
        'Downloadable PDF reports (Watermarked)',
        '30-day analysis history',
      ],
      notIncluded: [
        'Batch multi-document upload',
        'Unwatermarked PDF reports',
        'REST API access',
        'Dedicated support',
      ],
    },
    {
      name: 'Professional',
      price: billingCycle === 'monthly' ? '$19' : '$15',
      period: 'per month',
      description: 'For educators, journalists, agencies, and professional researchers.',
      popular: true,
      ctaText: 'Upgrade to Professional',
      ctaLink: '/register',
      features: [
        'Up to 25,000 words per scan',
        'Batch multi-document processing',
        'Sentence-level pattern highlighting',
        'Dual-Engine (RoBERTa + Local NLP)',
        'Unwatermarked executive PDF reports',
        'Unlimited analysis history',
        'Priority queue processing',
        'Standard email support',
      ],
      notIncluded: [
        'Custom fine-tuned neural models',
        'Dedicated SLA & custom contracts',
      ],
    },
    {
      name: 'Institution',
      price: billingCycle === 'monthly' ? '$89' : '$72',
      period: 'per month',
      description: 'For university departments, large publishers, and enterprise platforms.',
      popular: false,
      ctaText: 'Contact Enterprise Sales',
      ctaLink: '/contact',
      features: [
        'Unlimited word scan volume',
        'Full REST API access with bearer auth',
        'Custom department team seats (Up to 25)',
        'Dual-Engine (RoBERTa + Local NLP)',
        'Unwatermarked executive PDF reports',
        'Dedicated customer success manager',
        'Custom model threshold tuning',
        '99.9% uptime SLA guarantee',
      ],
      notIncluded: [],
    },
  ];

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-cyber-blue/10 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyber-blue/10 border border-cyber-blue/30 text-xs font-mono text-cyber-blue mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fair & Transparent Pricing</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Flexible Plans for Every Scale
          </h1>
          <p className="text-slate-400 text-base mt-4 leading-relaxed">
            Choose the plan that suits your personal editing or institutional content verification workflow.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="mt-8 inline-flex items-center gap-3 p-1.5 rounded-2xl bg-midnight-900 border border-white/10">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-cyber-blue text-midnight-950 shadow-glow-blue/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingCycle === 'annual'
                  ? 'bg-cyber-blue text-midnight-950 shadow-glow-blue/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500 text-midnight-950 font-mono">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <TiltCard
              key={plan.name}
              glowColor={plan.popular ? 'rgba(0, 210, 255, 0.35)' : 'rgba(255, 255, 255, 0.1)'}
              className={plan.popular ? 'border-cyber-blue/40 shadow-glow-blue/20' : 'border-white/10'}
            >
              <div className="p-8 h-full flex flex-col justify-between relative">
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-cyber-blue to-cyber-violet text-[10px] font-mono font-bold text-midnight-950 uppercase tracking-wider shadow-md">
                    Recommended
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 min-h-[32px]">{plan.description}</p>

                  <div className="my-6">
                    <span className="text-4xl sm:text-5xl font-extrabold text-white font-mono">{plan.price}</span>
                    <span className="text-slate-400 text-xs ml-2">/ {plan.period}</span>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-white/5 text-xs text-slate-300">
                    <p className="text-[10px] font-mono uppercase text-slate-500 tracking-wider font-semibold">
                      Included Capabilities
                    </p>
                    {plan.features.map((feat) => (
                      <div key={feat} className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-cyber-blue shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                    {plan.notIncluded.map((feat) => (
                      <div key={feat} className="flex items-center gap-2.5 text-slate-500">
                        <X className="w-4 h-4 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link
                  to={plan.ctaLink}
                  className={`mt-8 w-full py-3 rounded-xl font-bold text-xs text-center flex items-center justify-center gap-2 transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-cyber-blue to-cyber-violet text-midnight-950 hover:shadow-glow-blue'
                      : 'bg-midnight-900 border border-white/10 hover:border-cyber-blue/40 text-slate-200'
                  }`}
                >
                  <span>{plan.ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

              </div>
            </TiltCard>
          ))}
        </div>

      </div>

    </div>
  );
}

export default PricingPage;
