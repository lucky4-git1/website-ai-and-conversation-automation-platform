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

  // Embed script injection
  useEffect(() => {
    const existing = document.getElementById('apex-widget-script');
    if (!existing) {
      const script = document.createElement('script');
      script.id = 'apex-widget-script';
      script.src = '/widget.js';
      script.setAttribute('data-site-id', 'site_apex_live_01');
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
        setFormSuccessMessage(data.message || 'Quotation request successfully registered! Our enterprise team has received your submission.');
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
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Banner */}
      <div className="bg-sky-600 px-4 py-2 text-center text-xs text-white font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-sky-200" />
        <span>Grounded Conversational AI & Omnichannel Conversion Automation Platform</span>
        <Link href="/admin" className="underline font-bold hover:text-sky-100 ml-2 inline-flex items-center gap-1">
          Open Admin Console <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500 flex items-center justify-center font-black text-white text-base shadow-lg shadow-sky-500/20">
              A
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block">Apex Enterprise</span>
              <span className="text-[10px] text-sky-400 font-medium uppercase tracking-widest block">AI & Automation</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-6 text-xs font-medium text-slate-300">
            <a href="#services" className="hover:text-white transition">Services</a>
            <a href="#pricing" className="hover:text-white transition">Pricing & Packages</a>
            <a href="#quote" className="hover:text-white transition">Get Quotation</a>
          </nav>

          <div className="flex items-center space-x-3">
            <Link
              href="/admin"
              className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg transition shadow-md shadow-sky-500/20 flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Admin Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center space-x-2 bg-slate-800/80 border border-slate-700 text-sky-400 text-xs px-3.5 py-1.5 rounded-full font-medium shadow-inner">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span>Strict Zero-Hallucination AI Grounding Active</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Turn Website Visitors into Qualified Pipeline with <span className="text-sky-400">Grounded AI</span> & Live Handoff.
          </h1>

          <p className="text-slate-400 text-base leading-relaxed">
            Eliminate customer support friction and accelerate lead conversion. Our assistant answers inquiries strictly from approved documentation, syncs verified contacts to HubSpot CRM, and routes hot prospects directly to live human specialists.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href="#quote"
              className="w-full sm:w-auto bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs px-6 py-3 rounded-xl transition shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2"
            >
              <span>Request Custom Quotation</span>
              <ChevronRight className="w-4 h-4" />
            </a>

            <Link
              href="/admin/conversations"
              className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs px-6 py-3 rounded-xl transition flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-sky-400" />
              <span>Inspect Operator Live Inbox</span>
            </Link>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Sub-second latency
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> WhatsApp Cloud API
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Bi-directional HubSpot Sync
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Consent & Quiet Hours
            </span>
          </div>
        </div>
      </section>

      {/* Flagship Enterprise Services */}
      <section id="services" className="py-16 bg-slate-950/60 border-t border-slate-800 px-6">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-xs uppercase tracking-widest text-sky-400 font-bold">Engineered For Conversion</h2>
            <p className="text-2xl font-bold text-white tracking-tight">Enterprise Platform Capabilities</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 hover:border-slate-700 transition">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Grounded Conversational AI</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Answers inquiries strictly from your approved knowledge base, FAQs, and product catalogs. Never hallucinates unapproved prices, stock, or policies.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 hover:border-slate-700 transition">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Explainable Lead Scoring</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Heuristic intent evaluation derived from explicit buyer actions (quote requests, callback intent, budget ceiling). Automatically classifies High (60+), Medium, and Low priority.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3 hover:border-slate-700 transition">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">HubSpot CRM & WhatsApp Cloud</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Bi-directional synchronization with deduplication, retry queues with exponential backoff, and 24-hour WhatsApp messaging care window adherence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Transparent Pricing Plans */}
      <section id="pricing" className="py-16 px-6 max-w-7xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-xs uppercase tracking-widest text-sky-400 font-bold">Transparent Investment</h2>
          <p className="text-2xl font-bold text-white tracking-tight">Service Packages & Pricing</p>
          <p className="text-xs text-slate-400">Zero hidden fees. 30-day satisfaction guarantee on all plans.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Plan 1 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Growth Tier</div>
              <div className="text-3xl font-extrabold text-white">$499 <span className="text-xs font-normal text-slate-400">/ month</span></div>
              <p className="text-xs text-slate-400">Perfect for growing businesses needing automated lead capture and grounded FAQ answering.</p>
              <ul className="text-xs text-slate-300 space-y-2 pt-2">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" /> Up to 5,000 monthly conversations</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" /> Strict zero-hallucination RAG</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" /> Customizable website widget</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" /> Email lead alerts</li>
              </ul>
            </div>
            <a href="#quote" className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs py-2.5 rounded-xl text-center transition">
              Select Growth Plan
            </a>
          </div>

          {/* Plan 2 */}
          <div className="bg-slate-900 border-2 border-sky-500 rounded-2xl p-6 flex flex-col justify-between space-y-6 relative shadow-xl shadow-sky-500/10">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-sky-500 text-slate-950 font-black text-[10px] px-3 py-0.5 rounded-full uppercase tracking-wider">
              Most Popular
            </div>
            <div className="space-y-4">
              <div className="text-xs font-bold text-sky-400 uppercase tracking-wider">Professional Suite</div>
              <div className="text-3xl font-extrabold text-white">$1,299 <span className="text-xs font-normal text-slate-400">/ month</span></div>
              <p className="text-xs text-slate-400">Omnichannel customer engagement with WhatsApp Cloud API and real-time live human handoff.</p>
              <ul className="text-xs text-slate-300 space-y-2 pt-2">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" /> Up to 25,000 monthly conversations</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" /> Official WhatsApp Cloud API</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" /> Real-time live operator inbox</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" /> Bi-directional HubSpot CRM sync</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" /> Consent-aware follow-up workflows</li>
              </ul>
            </div>
            <a href="#quote" className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs py-2.5 rounded-xl text-center transition shadow-md shadow-sky-500/20">
              Select Professional Suite
            </a>
          </div>

          {/* Plan 3 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Enterprise Custom</div>
              <div className="text-3xl font-extrabold text-white">Starting $2,999 <span className="text-xs font-normal text-slate-400">/ mo</span></div>
              <p className="text-xs text-slate-400">Bespoke LLM fine-tuning, multi-tenant isolation, on-premise database support, and dedicated SLA.</p>
              <ul className="text-xs text-slate-300 space-y-2 pt-2">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" /> Unlimited monthly conversations</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" /> Dedicated Solutions Architect</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" /> 99.99% Uptime SLA Guarantee</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" /> Custom ERP & Webhook pipelines</li>
              </ul>
            </div>
            <a href="#quote" className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs py-2.5 rounded-xl text-center transition">
              Contact Enterprise Solutions
            </a>
          </div>
        </div>
      </section>

      {/* Interactive Quotation Form (Backed by Server Engine) */}
      <section id="quote" className="py-16 bg-slate-950/80 border-t border-slate-800 px-6">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-xs uppercase tracking-widest text-sky-400 font-bold">Fast-Track Qualification</h2>
            <p className="text-2xl font-bold text-white tracking-tight">Request an Enterprise Quotation</p>
            <p className="text-xs text-slate-400">
              Submissions automatically trigger server-side qualification, lead scoring, and HubSpot sync queues.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
            {formSuccessMessage ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-white">Quotation Request Received</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">{formSuccessMessage}</p>
                <div className="pt-4">
                  <Link
                    href="/admin/leads"
                    className="inline-flex items-center gap-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl transition"
                  >
                    <span>View Newly Created Lead in Admin Console</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                {formErrors.general && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500 text-rose-300 rounded-lg">
                    {formErrors.general}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.f_name}
                      onChange={(e) => setFormData({ ...formData, f_name: e.target.value })}
                      placeholder="e.g. Marcus Vance"
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                    {formErrors.f_name && <p className="text-rose-400 text-[10px] mt-0.5">{formErrors.f_name}</p>}
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Work Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.f_email}
                      onChange={(e) => setFormData({ ...formData, f_email: e.target.value })}
                      placeholder="marcus@apexenterprises.example.com"
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                    {formErrors.f_email && <p className="text-rose-400 text-[10px] mt-0.5">{formErrors.f_email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Company / Organization *</label>
                    <input
                      type="text"
                      required
                      value={formData.f_company}
                      onChange={(e) => setFormData({ ...formData, f_company: e.target.value })}
                      placeholder="Vance Logistics Global"
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                    {formErrors.f_company && <p className="text-rose-400 text-[10px] mt-0.5">{formErrors.f_company}</p>}
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Direct Phone / WhatsApp</label>
                    <input
                      type="tel"
                      value={formData.f_phone}
                      onChange={(e) => setFormData({ ...formData, f_phone: e.target.value })}
                      placeholder="+1 (555) 019-2834"
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Interested Plan *</label>
                    <select
                      value={formData.f_tier}
                      onChange={(e) => setFormData({ ...formData, f_tier: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    >
                      <option value="Growth ($499/mo)">Growth Tier ($499/mo)</option>
                      <option value="Professional ($1,299/mo)">Professional Suite ($1,299/mo)</option>
                      <option value="Enterprise (Custom)">Enterprise Custom</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Target Launch Timeline *</label>
                    <select
                      value={formData.f_timeline}
                      onChange={(e) => setFormData({ ...formData, f_timeline: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-sky-500 focus:outline-none"
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
                    className="mt-0.5 rounded text-sky-500 focus:ring-sky-500 bg-slate-950 border-slate-700"
                  />
                  <label htmlFor="quoteConsent" className="text-[11px] text-slate-400 leading-tight">
                    I agree to receive communications regarding this quotation in accordance with the Privacy Policy. Consent can be revoked at any time.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-3 rounded-xl transition shadow-lg shadow-sky-500/20 mt-2 text-xs"
                >
                  {formSubmitting ? 'Evaluating Heuristics & Submitting...' : 'Submit Quotation Request'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-10 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-sky-500" />
            <span>Apex Enterprise Solutions • Production-Grade Website AI & Conversion Engine</span>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/admin" className="hover:text-slate-300 transition">Admin Console</Link>
            <Link href="/widget" target="_blank" className="hover:text-slate-300 transition">Direct Widget View</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
