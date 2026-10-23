'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Search,
  Sparkles,
  ShieldAlert,
  Globe,
  FileText,
  HelpCircle,
  Eye,
  RefreshCw,
  Layers
} from 'lucide-react';

export default function KnowledgeBaseAdminPage() {
  const [sources, setSources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New source form
  const [formType, setFormType] = useState<'TEXT' | 'FAQ' | 'URL'>('TEXT');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Query tester
  const [testQuery, setTestQuery] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  const fetchSources = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/knowledge');
      const data = await res.json();
      setSources(data.sources || []);
    } catch (err) {
      console.error('Failed to load knowledge sources:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/v1/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: formType,
          title,
          content: formType === 'URL' ? undefined : content,
          sourceUrl: formType === 'URL' ? sourceUrl : undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to ingest knowledge source');
        return;
      }

      setShowAddModal(false);
      setTitle('');
      setContent('');
      setSourceUrl('');
      await fetchSources();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this knowledge source and all its indexed chunks?')) return;
    try {
      await fetch(`/api/v1/knowledge/${id}`, { method: 'DELETE' });
      await fetchSources();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleTogglePublish = async (id: string, current: boolean) => {
    try {
      await fetch(`/api/v1/knowledge/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !current })
      });
      await fetchSources();
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  const handleRunTestQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testQuery.trim()) return;

    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/v1/widget/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorId: 'test_admin_evaluator',
          content: testQuery
        })
      });
      const data = await res.json();
      setTestResult(data.reply);
    } catch (err) {
      console.error('Test query error:', err);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#12131c] p-6 rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              Grounded AI Core
            </span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Approved Business Knowledge Base (RAG)</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Strict zero-hallucination ground truth sources. Only indexed content is used for customer responses.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-medium px-4 py-2.5 rounded-xl shadow-[0_2px_10px_rgba(99,102,241,0.35),inset_0_1px_0_0_rgba(255,255,255,0.25)] transition duration-150"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ingest Source</span>
          </button>
        </div>
      </div>

      {/* Grounding Simulation & Inspection Card */}
      <div className="bg-[#12131c] rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-white">RAG Grounding & Zero-Hallucination Tester</h2>
          </div>
          <span className="text-[11px] text-zinc-400 font-mono">Evaluates actual tenant chunks in real-time</span>
        </div>

        <form onSubmit={handleRunTestQuery} className="flex gap-2">
          <input
            type="text"
            value={testQuery}
            onChange={(e) => setTestQuery(e.target.value)}
            placeholder="Try: 'What is your refund policy?', 'Do you support WhatsApp CRM?', or test unknown pricing..."
            className="flex-1 bg-[#0a0b0e] border border-zinc-700/80 text-white text-xs rounded-xl px-3.5 py-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none placeholder:text-zinc-600"
          />
          <button
            type="submit"
            disabled={isTesting}
            className="bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-xs px-4 py-2.5 rounded-xl transition duration-150 font-medium shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)] disabled:opacity-50"
          >
            {isTesting ? 'Evaluating...' : 'Test Grounding'}
          </button>
        </form>

        {testResult && (
          <div className="p-4 bg-[#0a0b0e] rounded-xl border border-white/[0.08] space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-200">Synthesized Grounded Response:</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                testResult.citations?.length > 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {testResult.citations?.length > 0 ? 'Verified Grounded Answer' : 'Safe Fallback Triggered (No Hallucination)'}
              </span>
            </div>
            <p className="text-zinc-300 whitespace-pre-line leading-relaxed font-sans">{testResult.content}</p>

            {testResult.citations?.length > 0 && (
              <div className="pt-2 border-t border-white/[0.08]">
                <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider block mb-1.5">Citations Used:</span>
                <div className="flex flex-wrap gap-1.5">
                  {testResult.citations.map((c: any, idx: number) => (
                    <span key={idx} className="bg-[#151724] border border-indigo-500/30 text-indigo-300 px-2.5 py-1 rounded-lg text-[10px] font-mono">
                      {c.title}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Knowledge Sources Table */}
      <div className="bg-[#12131c] rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-white">Indexed Business Documentation ({sources.length})</h2>
          </div>
          <span className="text-xs text-zinc-400 font-mono">Auto-chunked and tenant isolated</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0e0f15] border-b border-white/[0.06] text-zinc-400 font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Source Title / Type</th>
                <th className="px-6 py-3.5">Indexed Chunks</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Published</th>
                <th className="px-6 py-3.5">Last Synchronized</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-zinc-300">
              {sources.map((src) => (
                <tr key={src.id} className="hover:bg-white/[0.02] transition duration-150">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white flex items-center gap-2">
                      {src.type === 'FAQ' ? <HelpCircle className="w-3.5 h-3.5 text-indigo-400" /> : <FileText className="w-3.5 h-3.5 text-zinc-400" />}
                      <span>{src.title}</span>
                    </div>
                    {src.source_url && (
                      <span className="text-[11px] text-indigo-400 block truncate max-w-xs mt-0.5">{src.source_url}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-mono text-zinc-300">{src.chunk_count} chunks</td>
                  <td className="px-6 py-4">
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold px-2 py-0.5 rounded-full font-mono">
                      {src.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleTogglePublish(src.id, Boolean(src.is_published))}
                      className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full transition duration-150 border ${
                        src.is_published 
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/30' 
                          : 'bg-zinc-800 text-zinc-400 border-white/[0.08] hover:bg-zinc-700'
                      }`}
                    >
                      {src.is_published ? 'Active (Published)' : 'Draft (Unpublished)'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-[11px] font-mono">
                    {new Date(src.last_indexed_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(src.id)}
                      className="text-rose-400 hover:text-rose-300 p-1.5 rounded-lg hover:bg-rose-500/10 transition duration-150"
                      title="Delete Source"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Knowledge Source Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#12131c] rounded-2xl shadow-2xl border border-white/[0.1] w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#151724] border-b border-white/[0.08] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm tracking-tight">Ingest Verified Knowledge Source</h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-white transition">✕</button>
            </div>

            <form onSubmit={handleAddSource} className="p-6 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-zinc-300 font-semibold mb-1.5">Source Ingestion Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['TEXT', 'FAQ', 'URL'] as const).map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setFormType(t)}
                      className={`py-2 rounded-xl border text-center font-semibold transition duration-150 ${
                        formType === t 
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_2px_8px_rgba(99,102,241,0.35)]' 
                          : 'bg-[#0a0b0e] border-zinc-700/80 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1.5">Document Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Enterprise SLA & Security Compliance Terms"
                  className="w-full bg-[#0a0b0e] border border-zinc-700/80 text-white rounded-xl p-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none placeholder:text-zinc-600"
                />
              </div>

              {formType === 'URL' ? (
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1.5">Public URL (Protected against SSRF)</label>
                  <input
                    type="url"
                    required
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="https://yourcompany.com/approved-docs"
                    className="w-full bg-[#0a0b0e] border border-zinc-700/80 text-white rounded-xl p-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none placeholder:text-zinc-600 font-mono text-[11px]"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1 block">
                    Strict SSRF validation prohibits RFC1918 private subnets and cloud metadata endpoints.
                  </span>
                </div>
              ) : (
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1.5">Content Body</label>
                  <textarea
                    rows={6}
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Paste verified business facts, service details, pricing policies, or FAQs here..."
                    className="w-full bg-[#0a0b0e] border border-zinc-700/80 text-white rounded-xl p-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-sans placeholder:text-zinc-600"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-[0.98] text-zinc-300 transition duration-150"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-semibold transition duration-150 shadow-[0_2px_8px_rgba(99,102,241,0.35),inset_0_1px_0_0_rgba(255,255,255,0.2)] disabled:opacity-50"
                >
                  {isSubmitting ? 'Validating & Chunking...' : 'Publish & Index'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
