'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Plus,
  Trash2,
  Edit,
  Tag,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Search,
  DollarSign
} from 'lucide-react';

export default function CatalogAdminPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState(499);
  const [priceDisplay, setPriceDisplay] = useState('$499 / mo');
  const [description, setDescription] = useState('');
  const [featuresStr, setFeaturesStr] = useState('');
  const [tagsStr, setTagsStr] = useState('');
  const [actionUrl, setActionUrl] = useState('/demo');

  // Simulator
  const [simQuery, setSimQuery] = useState('');
  const [simResults, setSimResults] = useState<any[] | null>(null);

  const fetchCatalog = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/catalog');
      const data = await res.json();
      setItems(data.items || []);
    } catch (err) {
      console.error('Failed to load catalog:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const features = featuresStr.split('\n').map((s) => s.trim()).filter(Boolean);
      const tags = tagsStr.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);

      await fetch('/api/v1/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category,
          price: Number(price),
          priceDisplay,
          description,
          features,
          tags,
          actionUrl
        })
      });

      setShowAddModal(false);
      setName('');
      setCategory('');
      setDescription('');
      setFeaturesStr('');
      setTagsStr('');
      await fetchCatalog();
    } catch (err) {
      console.error('Failed to add catalog item:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this catalog item?')) return;
    try {
      await fetch(`/api/v1/catalog/${id}`, { method: 'DELETE' });
      await fetchCatalog();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleRunSimulator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simQuery.trim()) return;

    const lower = simQuery.toLowerCase();
    const matches: any[] = [];

    for (const item of items) {
      let score = 0;
      const reasons: string[] = [];

      if (lower.includes(item.category.toLowerCase()) || lower.includes(item.name.toLowerCase())) {
        score += 40;
        reasons.push(`Direct match with category "${item.category}"`);
      }

      for (const feat of item.features) {
        if (lower.includes(feat.toLowerCase().slice(0, 8))) {
          score += 20;
          reasons.push(`Contains requested capability: "${feat}"`);
        }
      }

      for (const tag of item.tags) {
        if (lower.includes(tag)) {
          score += 15;
          reasons.push(`Matched tag: #${tag}`);
        }
      }

      if (score > 0) {
        matches.push({ item, score, reasons });
      }
    }

    setSimResults(matches.sort((a, b) => b.score - a.score));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Product & Service Catalog</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified structured packages, pricing tiers, and capabilities used for grounded recommendations.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1.5 text-xs bg-sky-600 hover:bg-sky-700 text-white font-medium px-3.5 py-2 rounded-lg shadow-sm transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Catalog Item</span>
        </button>
      </div>

      {/* Recommendation Engine Simulator */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-sky-600" />
            <h2 className="text-sm font-bold text-slate-900">Recommendation Rule Simulator</h2>
          </div>
          <span className="text-[11px] text-slate-400">Tests catalog heuristic matching against visitor queries</span>
        </div>

        <form onSubmit={handleRunSimulator} className="flex gap-2">
          <input
            type="text"
            value={simQuery}
            onChange={(e) => setSimQuery(e.target.value)}
            placeholder="Try: 'Need WhatsApp and CRM sync for our sales team' or 'Looking for starter chatbot'..."
            className="flex-1 bg-slate-50 border border-slate-300 text-xs rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
          <button
            type="submit"
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs px-4 py-2 rounded-lg font-medium transition"
          >
            Simulate Match
          </button>
        </form>

        {simResults && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-800">
              Matched {simResults.length} Recommendation Card(s):
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {simResults.map((m, idx) => (
                <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{m.item.name}</span>
                    <span className="text-sky-600 font-bold">{m.item.priceDisplay}</span>
                  </div>
                  <ul className="text-[11px] text-slate-600 space-y-0.5">
                    {m.reasons.map((r: string, i: number) => (
                      <li key={i} className="flex items-center gap-1 text-emerald-700">
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Catalog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {item.category}
                </span>
                <span className="text-slate-400 text-xs font-mono">{item.availability}</span>
              </div>

              <div>
                <h3 className="font-bold text-base text-slate-900">{item.name}</h3>
                <div className="text-lg font-extrabold text-sky-600 mt-0.5">{item.priceDisplay}</div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>

              <div>
                <span className="text-[10px] text-slate-400 font-semibold block mb-1">Key Features:</span>
                <ul className="text-xs text-slate-700 space-y-1">
                  {item.features?.map((f: string, i: number) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {item.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-2">
                  {item.tags.map((t: string, i: number) => (
                    <span key={i} className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded font-mono">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">{item.id}</span>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-rose-600 hover:text-rose-800 text-xs flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="font-bold text-sm">Create New Product / Service Tier</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddItem} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Package Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Starter Automation Tier"
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Conversational AI"
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Price Display</label>
                  <input
                    type="text"
                    required
                    value={priceDisplay}
                    onChange={(e) => setPriceDisplay(e.target.value)}
                    placeholder="$499 / mo"
                    className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Summary Description</label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description of this service tier..."
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Features (One per line)</label>
                <textarea
                  rows={3}
                  value={featuresStr}
                  onChange={(e) => setFeaturesStr(e.target.value)}
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-sky-500 focus:outline-none font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={tagsStr}
                  onChange={(e) => setTagsStr(e.target.value)}
                  placeholder="popular, crm, smb"
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

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
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-medium"
                >
                  Create Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
