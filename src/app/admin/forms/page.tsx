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
  Sparkles
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Conversion Forms & Multistep Journeys</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configurable conversion flows with server-side validation and progressive lead attribution.
          </p>
        </div>
      </div>

      {/* Conversion Journey Lifecycle Architecture */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-sky-600" />
          <h2 className="text-sm font-bold text-slate-900">Standard Conversion Journey Lifecycle</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {journeySteps.map((step, idx) => (
            <div key={step.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs relative flex flex-col justify-between">
              <div>
                <span className="font-bold text-slate-900 block mb-1">{step.name}</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">{step.description}</p>
              </div>
              {idx < 4 && (
                <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-400">
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
        <div className="md:col-span-5 bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Active Conversion Forms</h3>
            <span className="text-xs text-slate-400 font-mono">{forms.length} Defined</span>
          </div>

          <div className="space-y-3">
            {forms.map((f) => (
              <div
                key={f.id}
                onClick={() => setSelectedForm(f)}
                className={`p-3.5 rounded-xl border cursor-pointer transition text-xs space-y-1.5 ${
                  selectedForm?.id === f.id
                    ? 'border-sky-500 bg-sky-50/50 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>{f.name}</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                    {f.submission_count || 0} Submissions
                  </span>
                </div>
                <p className="text-slate-500 text-[11px]">{f.description}</p>
                <div className="text-[10px] text-slate-400 font-mono">
                  Slug: /{f.slug} • {f.fields?.length || 0} Fields
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Form Preview & Field Schema (7 cols) */}
        <div className="md:col-span-7 bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          {selectedForm ? (
            <>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{selectedForm.name}</h3>
                  <span className="text-xs text-slate-500">API Endpoint: /api/v1/forms/{selectedForm.slug}/submit</span>
                </div>
                <span className="bg-sky-100 text-sky-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  Server-Validated
                </span>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-700 block">Configured Form Fields:</span>
                <div className="space-y-2">
                  {selectedForm.fields?.map((field: any) => (
                    <div key={field.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-800 mr-2">{field.label}</span>
                        {field.required && (
                          <span className="text-rose-600 font-bold text-[10px]">*Required</span>
                        )}
                        <span className="text-slate-400 text-[11px] block mt-0.5 font-mono">
                          ID: {field.id} • Type: {field.type}
                        </span>
                      </div>
                      {field.options && (
                        <div className="text-right text-[10px] text-slate-500">
                          {field.options.length} options
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 bg-slate-50 p-3 rounded-lg text-xs space-y-1">
                <span className="font-semibold text-slate-800 block">Form Confirmation Settings:</span>
                <p className="text-slate-600">{selectedForm.settings?.successMessage}</p>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              Select a form to inspect its schema and settings.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
