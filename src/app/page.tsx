'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Bot,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Database,
  PhoneCall,
  Clock,
  TrendingUp,
  LayoutDashboard,
  Building2,
  ChevronRight,
  ExternalLink,
  DollarSign
} from 'lucide-react';

export default function ClientLandingPage() {
  const [formData, setFormData] = useState({
    f_name: '',
    f_email: '',
    f_phone: '',
    f_company: '',
    f_tier: 'Professional ($1,299/mo)',
    f_timeline: 'Immediate (Within 2 weeks)',
    f_consent: true
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccessMessage, setFormSuccessMessage] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const existing = document.getElementById('speakforme-widget-script');
    if (!existing) {
      const script = document.createElement('script');
      script.id = 'speakforme-widget-script';
      script.src = '/widget.js';
      script.setAttribute('data-site-id', 'site_speakforme_01');
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormErrors({});
    setFormSuccessMessage(null);

    try {
      const res = await fetch('/api/v1/forms/enterprise-quote/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: 'tenant_default_01',
          data: formData
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setFormErrors(data.errors || { general: data.error || 'Submission failed.' });
      } else {
        setFormSuccessMessage(data.message || 'Quotation request registered! Our enterprise team has received your submission.');
        setFormData({
          f_name: '',
          f_email: '',
          f_phone: '',
          f_company: '',
          f_tier: 'Professional ($1,299/mo)',
          f_timeline: 'Immediate (Within 2 weeks)',
          f_consent: true
        });
      }
    } catch (err: any) {
      setFormErrors({ general: err.message });
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-zinc-100 font-sans selection:bg-indigo-500 selection:text-white antialiased">
      {/* Top Banner */}
      <div className="bg-[#12131c] border-b border-white/[0.06] px-4 py-2 text-center text-xs text-zinc-300 font-medium flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
        <span>SpeakForMe Grounded Conversational AI & Omnichannel Conversion Engine</span>
        <Link href="/admin" className="text-indigo-400 underline font-semibold hover:text-indigo-300 ml-2 inline-flex items-center gap-1">
          Open Admin Console <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Navigation Bar */}
      <header className="border-b border-white/[0.06] bg-[#090a0f]/85 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white text-base shadow-[0_4px_16px_rgba(99,102,241,0.35),inset_0_1px_0_0_rgba(255,255,255,0.25)]">
              S
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white block">SpeakForMe</span>
              <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest block">AI & Live Handoff</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-6 text-xs font-medium text-zinc-400">
            <a href="#services" className="hover:text-zinc-100 transition duration-150">Capabilities</a>
            <a href="#pricing" className="hover:text-zinc-100 transition duration-150">Pricing & Tiers</a>
            <a href="#quote" className="hover:text-zinc-100 transition duration-150">Request Quote</a>
          </nav>

          <div className="flex items-center space-x-3">
            <Link
              href="/admin"
              className="bg-indigo-600 hover:bg-indigo-500 active:scale-[0.97] text-white font-semibold text-xs px-4 py-2 rounded-xl transition duration-150 shadow-[0_4px_16px_rgba(99,102,241,0.3),inset_0_1px_0_0_rgba(255,255,255,0.25)] flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Admin Console</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-20 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center space-x-2 bg-zinc-900 border border-white/[0.1] text-indigo-300 text-xs px-3.5 py-1.5 rounded-full font-medium shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Strict Zero-Hallucination Grounding Active</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Turn Casual Browsers into High-Intent Pipeline with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-300">SpeakForMe</span>.
          </h1>

          <p className="text-zinc-400 text-base leading-relaxed">
            Eliminate customer support friction and capture qualified buyers 24/7. SpeakForMe answers inquiries strictly from approved documentation, syncs verified contacts to HubSpot CRM, and routes hot prospects directly to live human specialists.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href="#quote"
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 active:scale-[0.97] text-white font-bold text-xs px-6 py-3 rounded-xl transition duration-150 shadow-[0_6px_20px_rgba(99,102,241,0.4),inset_0_1px_0_0_rgba(255,255,255,0.25)] flex items-center justify-center gap-2"
            >
              <span>Request Custom Quotation</span>
              <ChevronRight className="w-4 h-4" />
            </a>

            <Link
              href="/admin/conversations"
              className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 active:scale-[0.97] text-zinc-200 border border-white/[0.08] font-semibold text-xs px-6 py-3 rounded-xl transition duration-150 flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <span>Inspect Operator Live Inbox</span>
            </Link>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5 font-mono text-[11px]">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Sub-second latency
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[11px]">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> WhatsApp Cloud API
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[11px]">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Bi-directional HubSpot Sync
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[11px]">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Consent & Quiet Hours
            </span>
          </div>
        </div>
      </section>

      {/* Flagship Enterprise Services */}
      <section id="services" className="py-16 bg-[#0c0d13] border-t border-white/[0.06] px-6">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-xs uppercase tracking-widest text-indigo-400 font-bold font-mono">Precision Architecture</h2>
            <p className="text-2xl font-bold text-white tracking-tight">Core Platform Capabilities</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#12131c] border border-white/[0.08] rounded-2xl p-6 space-y-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] hover:border-indigo-500/30 transition duration-150">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Grounded Conversational AI</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Answers inquiries strictly from your approved knowledge base, FAQs, and product catalogs. Never hallucinates unapproved prices, stock, or policies.
              </p>
            </div>

            <div className="bg-[#12131c] border border-white/[0.08] rounded-2xl p-6 space-y-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] hover:border-indigo-500/30 transition duration-150">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Explainable Lead Scoring</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Heuristic intent evaluation derived from explicit buyer actions (quote requests, callback intent, budget ceiling). Automatically classifies High (60+), Medium, and Low priority.
              </p>
            </div>

            <div className="bg-[#12131c] border border-white/[0.08] rounded-2xl p-6 space-y-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] hover:border-indigo-500/30 transition duration-150">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">HubSpot CRM & WhatsApp Cloud</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Bi-directional synchronization with deduplication, retry queues with exponential backoff, and 24-hour WhatsApp messaging care window adherence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Transparent Pricing Plans */}
      <section id="pricing" className="py-16 px-6 max-w-7xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-xs uppercase tracking-widest text-indigo-400 font-bold font-mono">Transparent Investment</h2>
          <p className="text-2xl font-bold text-white tracking-tight">Service Packages & Pricing</p>
          <p className="text-xs text-zinc-400">Zero hidden fees. 30-day satisfaction guarantee on all plans.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Plan 1 */}
          <div className="bg-[#12131c] border border-white/[0.08] rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
            <div className="space-y-4">
              <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono">Growth Tier</div>
              <div className="text-3xl font-extrabold text-white font-mono">$499 <span className="text-xs font-normal text-zinc-400">/ month</span></div>
              <p className="text-xs text-zinc-400">Perfect for growing businesses needing automated lead capture and grounded FAQ answering.</p>
              <ul className="text-xs text-zinc-300 space-y-2 pt-2">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> Up to 5,000 monthly conversations</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> Strict zero-hallucination RAG</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> Customizable website widget</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> Email lead alerts</li>
              </ul>
            </div>
            <a href="#quote" className="w-full bg-zinc-800 hover:bg-zinc-700 active:scale-[0.98] text-white font-semibold text-xs py-2.5 rounded-xl text-center transition duration-150">
              Select Growth Plan
            </a>
          </div>

          {/* Plan 2 */}
          <div className="bg-[#151724] border-2 border-indigo-500 rounded-2xl p-6 flex flex-col justify-between space-y-6 relative shadow-[0_10px_35px_-8px_rgba(99,102,241,0.35),inset_0_1px_0_0_rgba(255,255,255,0.2)]">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white font-bold text-[10px] px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
              Most Popular
            </div>
            <div className="space-y-4">
              <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider font-mono">Professional Suite</div>
              <div className="text-3xl font-extrabold text-white font-mono">$1,299 <span className="text-xs font-normal text-zinc-400">/ month</span></div>
              <p className="text-xs text-zinc-400">Omnichannel customer engagement with WhatsApp Cloud API and real-time live human handoff.</p>
              <ul className="text-xs text-zinc-300 space-y-2 pt-2">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> Up to 25,000 monthly conversations</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> Official WhatsApp Cloud API</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> Real-time live operator inbox</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> Bi-directional HubSpot CRM sync</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> Consent-aware follow-up workflows</li>
              </ul>
            </div>
            <a href="#quote" className="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-bold text-xs py-2.5 rounded-xl text-center transition duration-150 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25)]">
              Select Professional Suite
            </a>
          </div>

          {/* Plan 3 */}
          <div className="bg-[#12131c] border border-white/[0.08] rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
            <div className="space-y-4">
              <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono">Enterprise Custom</div>
              <div className="text-3xl font-extrabold text-white font-mono">Starting $2,999 <span className="text-xs font-normal text-zinc-400">/ mo</span></div>
              <p className="text-xs text-zinc-400">Bespoke LLM fine-tuning, multi-tenant isolation, on-premise database support, and dedicated SLA.</p>
              <ul className="text-xs text-zinc-300 space-y-2 pt-2">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> Unlimited monthly conversations</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> Dedicated Solutions Architect</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> 99.99% Uptime SLA Guarantee</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" /> Custom ERP & Webhook pipelines</li>
              </ul>
            </div>
            <a href="#quote" className="w-full bg-zinc-800 hover:bg-zinc-700 active:scale-[0.98] text-white font-semibold text-xs py-2.5 rounded-xl text-center transition duration-150">
              Contact Enterprise Solutions
            </a>
          </div>
        </div>
      </section>

      {/* Interactive Quotation Form */}
      <section id="quote" className="py-16 bg-[#0c0d13] border-t border-white/[0.06] px-6">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-xs uppercase tracking-widest text-indigo-400 font-bold font-mono">Instant Qualification</h2>
            <p className="text-2xl font-bold text-white tracking-tight">Request an Enterprise Quotation</p>
            <p className="text-xs text-zinc-400">
              Submissions automatically trigger server-side qualification, lead scoring, and HubSpot sync queues.
            </p>
          </div>

          <div className="bg-[#12131c] border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
            {formSuccessMessage ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-white">Quotation Request Received</h3>
                <p className="text-xs text-zinc-300 max-w-md mx-auto leading-relaxed">{formSuccessMessage}</p>
                <div className="pt-4">
                  <Link
                    href="/admin/leads"
                    className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.97] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition duration-150 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25)]"
                  >
                    <span>View Newly Created Lead in Admin Console</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                {formErrors.general && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-lg">
                    {formErrors.general}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.f_name}
                      onChange={(e) => setFormData({ ...formData, f_name: e.target.value })}
                      placeholder="e.g. Marcus Vance"
                      className="w-full bg-[#0a0b0e] border border-zinc-700/80 text-white rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                    {formErrors.f_name && <p className="text-rose-400 text-[10px] mt-0.5">{formErrors.f_name}</p>}
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">Work Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.f_email}
                      onChange={(e) => setFormData({ ...formData, f_email: e.target.value })}
                      placeholder="marcus@company.example.com"
                      className="w-full bg-[#0a0b0e] border border-zinc-700/80 text-white rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                    {formErrors.f_email && <p className="text-rose-400 text-[10px] mt-0.5">{formErrors.f_email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">Company / Organization *</label>
                    <input
                      type="text"
                      required
                      value={formData.f_company}
                      onChange={(e) => setFormData({ ...formData, f_company: e.target.value })}
                      placeholder="Vance Logistics Global"
                      className="w-full bg-[#0a0b0e] border border-zinc-700/80 text-white rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                    {formErrors.f_company && <p className="text-rose-400 text-[10px] mt-0.5">{formErrors.f_company}</p>}
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">Direct Phone / WhatsApp</label>
                    <input
                      type="tel"
                      value={formData.f_phone}
                      onChange={(e) => setFormData({ ...formData, f_phone: e.target.value })}
                      placeholder="+1 (555) 019-2834"
                      className="w-full bg-[#0a0b0e] border border-zinc-700/80 text-white rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">Interested Plan *</label>
                    <select
                      value={formData.f_tier}
                      onChange={(e) => setFormData({ ...formData, f_tier: e.target.value })}
                      className="w-full bg-[#0a0b0e] border border-zinc-700/80 text-white rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="Growth ($499/mo)">Growth Tier ($499/mo)</option>
                      <option value="Professional ($1,299/mo)">Professional Suite ($1,299/mo)</option>
                      <option value="Enterprise (Custom)">Enterprise Custom</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-300 font-semibold mb-1">Target Launch Timeline *</label>
                    <select
                      value={formData.f_timeline}
                      onChange={(e) => setFormData({ ...formData, f_timeline: e.target.value })}
                      className="w-full bg-[#0a0b0e] border border-zinc-700/80 text-white rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    >
                      <option value="Immediate (Within 2 weeks)">Immediate (Within 2 weeks)</option>
                      <option value="This Quarter (1-3 months)">This Quarter (1-3 months)</option>
                      <option value="Exploring / Planning">Exploring / Planning</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-start space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="quoteConsent"
                    required
                    checked={formData.f_consent}
                    onChange={(e) => setFormData({ ...formData, f_consent: e.target.checked })}
                    className="mt-0.5 rounded text-indigo-500 focus:ring-indigo-500 bg-[#0a0b0e] border-zinc-700"
                  />
                  <label htmlFor="quoteConsent" className="text-[11px] text-zinc-400 leading-tight">
                    I agree to receive communications regarding this quotation in accordance with the Privacy Policy. Consent can be revoked at any time.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-bold py-3 rounded-xl transition duration-150 shadow-[0_4px_16px_rgba(99,102,241,0.35),inset_0_1px_0_0_rgba(255,255,255,0.25)] mt-2 text-xs"
                >
                  {formSubmitting ? 'Evaluating Heuristics & Submitting...' : 'Submit Quotation Request'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-[#07080b] py-10 px-6 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
            <span>SpeakForMe Technologies • Conversational AI & Lead Automation Engine</span>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/admin" className="hover:text-zinc-300 transition">Admin Console</Link>
            <Link href="/widget" target="_blank" className="hover:text-zinc-300 transition">Direct Widget View</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
