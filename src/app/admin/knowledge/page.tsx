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
  RefreshCw
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Approved Business Knowledge Base (RAG)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict zero-hallucination ground truth sources. Only indexed content is used for customer responses.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 text-xs bg-sky-600 hover:bg-sky-700 text-white font-medium px-3.5 py-2 rounded-lg shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ingest Source</span>
          </button>
        </div>
      </div>

      {/* Grounding Simulation & Inspection Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-sky-600" />
            <h2 className="text-sm font-bold text-slate-900">RAG Grounding & Zero-Hallucination Tester</h2>
          </div>
          <span className="text-[11px] text-slate-400">Evaluates actual tenant chunks in real-time</span>
        </div>

        <form onSubmit={handleRunTestQuery} className="flex gap-2">
          <input
            type="text"
            value={testQuery}
            onChange={(e) => setTestQuery(e.target.value)}
            placeholder="Try: 'What is your refund policy?', 'Do you support WhatsApp CRM?', or test unknown pricing..."
            className="flex-1 bg-slate-50 border border-slate-300 text-xs rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isTesting}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs px-4 py-2 rounded-lg transition font-medium"
          >
            {isTesting ? 'Evaluating...' : 'Test Grounding'}
          </button>
        </form>

        {testResult && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800">Synthesized Grounded Response:</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                testResult.citations?.length > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {testResult.citations?.length > 0 ? 'Verified Grounded Answer' : 'Safe Fallback Triggered (No Hallucination)'}
              </span>
            </div>
            <p className="text-slate-700 whitespace-pre-line leading-relaxed">{testResult.content}</p>

            {testResult.citations?.length > 0 && (
              <div className="pt-2 border-t border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold block mb-1">Citations Used:</span>
                <div className="flex flex-wrap gap-1.5">
                  {testResult.citations.map((c: any, idx: number) => (
                    <span key={idx} className="bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded text-[10px] font-medium">
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
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Indexed Business Documentation ({sources.length})</h2>
          <span className="text-xs text-slate-500">Auto-chunked and tenant isolated</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Source Title / Type</th>
                <th className="px-5 py-3">Indexed Chunks</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Published</th>
                <th className="px-5 py-3">Last Synchronized</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {sources.map((src) => (
                <tr key={src.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                      {src.type === 'FAQ' ? <HelpCircle className="w-3.5 h-3.5 text-sky-600" /> : <FileText className="w-3.5 h-3.5 text-slate-500" />}
                      <span>{src.title}</span>
                    </div>
                    {src.source_url && (
                      <span className="text-[11px] text-sky-600 block truncate max-w-xs">{src.source_url}</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 font-mono">{src.chunk_count} chunks</td>
                  <td className="px-5 py-3.5">
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      {src.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => handleTogglePublish(src.id, Boolean(src.is_published))}
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full transition ${
                        src.is_published ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {src.is_published ? 'Active (Published)' : 'Draft (Unpublished)'}
                    </button>
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 text-[11px]">
                    {new Date(src.last_indexed_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => handleDelete(src.id)}
                      className="text-rose-600 hover:text-rose-800 p-1 rounded hover:bg-rose-50 transition"
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="font-bold text-sm">Ingest Verified Knowledge Source</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddSource} className="p-5 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Source Ingestion Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['TEXT', 'FAQ', 'URL'] as const).map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setFormType(t)}
                      className={`py-2 rounded-lg border text-center font-medium transition ${
                        formType === t ? 'bg-sky-600 text-white border-sky-600' : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Enterprise SLA & Security Compliance Terms"
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              {formType === 'URL' ? (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Public URL (Protected against SSRF)</label>
                  <input
                    type="url"
                    required
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="https://yourcompany.com/approved-docs"
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Strict SSRF validation prohibits RFC1918 private subnets and cloud metadata endpoints.
                  </span>
                </div>
              ) : (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Content Body</label>
                  <textarea
                    rows={6}
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Paste verified business facts, service details, pricing policies, or FAQs here..."
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-sky-500 focus:outline-none font-sans"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-medium"
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
