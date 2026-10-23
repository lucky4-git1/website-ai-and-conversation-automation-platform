'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Users,
  Settings,
  Workflow,
  Sparkles,
  Layers
} from 'lucide-react';

export default function FormsAdminPage() {
  const [forms, setForms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedForm, setSelectedForm] = useState<any>(null);

  const fetchForms = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/forms');
      const data = await res.json();
      setForms(data.forms || []);
      if (data.forms?.length > 0) {
        setSelectedForm(data.forms[0]);
      }
    } catch (err) {
      console.error('Failed to load forms:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const journeySteps = [
    { id: 'step_1', name: '1. Landing Page', description: 'Visitor views value proposition and catalog tiers' },
    { id: 'step_2', name: '2. Service Discovery', description: 'AI Assistant answers FAQs or user browses options' },
    { id: 'step_3', name: '3. Qualification', description: 'Intent scoring evaluates budget, timeline & requirements' },
    { id: 'step_4', name: '4. Contact Capture', description: 'Form or chat captures email, phone & explicit consent' },
    { id: 'step_5', name: '5. Follow-Up & CRM', description: 'Durable workflow syncs HubSpot & queues confirmation' }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#12131c] p-6 rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
              Lead Generation
            </span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Conversion Forms & Multistep Journeys</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Configurable conversion flows with server-side validation and progressive lead attribution.
          </p>
        </div>
      </div>

      {/* Conversion Journey Lifecycle Architecture */}
      <div className="bg-[#12131c] rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] p-6 space-y-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-orange-400" />
          <h2 className="text-sm font-bold text-white">Standard Conversion Journey Lifecycle</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {journeySteps.map((step, idx) => (
            <div key={step.id} className="bg-[#0a0b0e] border border-white/[0.08] rounded-xl p-4 text-xs relative flex flex-col justify-between">
              <div>
                <span className="font-bold text-white block mb-1 font-mono text-[11px]">{step.name}</span>
                <p className="text-zinc-400 text-[11px] leading-relaxed">{step.description}</p>
              </div>
              {idx < 4 && (
                <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-orange-400 text-xs font-bold">
                  ▶
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Forms Table & Form Detail Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Form List (5 cols) */}
        <div className="md:col-span-5 bg-[#12131c] rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <h3 className="text-sm font-bold text-white">Active Conversion Forms</h3>
            <span className="text-xs text-zinc-500 font-mono">{forms.length} Defined</span>
          </div>

          <div className="space-y-3">
            {forms.map((f) => (
              <div
                key={f.id}
                onClick={() => setSelectedForm(f)}
                className={`p-4 rounded-xl border cursor-pointer transition duration-150 text-xs space-y-2 ${
                  selectedForm?.id === f.id
                    ? 'border-orange-500 bg-[#151724] shadow-[0_2px_10px_rgba(249,115,22,0.25)]'
                    : 'border-white/[0.06] hover:border-white/[0.15] bg-[#0a0b0e]'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-white">
                  <span>{f.name}</span>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full font-mono">
                    {f.submission_count || 0} Submissions
                  </span>
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">{f.description}</p>
                <div className="text-[10px] text-zinc-500 font-mono">
                  Slug: /{f.slug} • {f.fields?.length || 0} Fields
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Form Preview & Field Schema (7 cols) */}
        <div className="md:col-span-7 bg-[#12131c] rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] p-6 space-y-4">
          {selectedForm ? (
            <>
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div>
                  <h3 className="font-bold text-sm text-white">{selectedForm.name}</h3>
                  <span className="text-xs text-zinc-400 font-mono">Endpoint: /api/v1/forms/{selectedForm.slug}/submit</span>
                </div>
                <span className="bg-orange-500/20 text-orange-300 border border-orange-500/30 text-[10px] font-semibold px-2.5 py-0.5 rounded-full font-mono">
                  Server-Validated
                </span>
              </div>

              <div className="space-y-2.5">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 block">Configured Form Fields:</span>
                <div className="space-y-2">
                  {selectedForm.fields?.map((field: any) => (
                    <div key={field.id} className="p-3.5 bg-[#0a0b0e] border border-white/[0.06] rounded-xl text-xs flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white mr-2">{field.label}</span>
                        {field.required && (
                          <span className="text-rose-400 font-mono text-[10px]">*Required</span>
                        )}
                        <span className="text-zinc-500 text-[11px] block mt-0.5 font-mono">
                          ID: {field.id} • Type: {field.type}
                        </span>
                      </div>
                      {field.options && (
                        <div className="text-right text-[10px] text-zinc-500 font-mono">
                          {field.options.length} options
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.08] bg-[#0a0b0e] p-4 rounded-xl text-xs space-y-1">
                <span className="font-mono uppercase tracking-wider text-zinc-400 text-[10px] block">Form Confirmation Settings:</span>
                <p className="text-zinc-300 text-xs leading-relaxed">{selectedForm.settings?.successMessage}</p>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-zinc-500 text-xs font-mono">
              Select a form to inspect its schema and settings.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
