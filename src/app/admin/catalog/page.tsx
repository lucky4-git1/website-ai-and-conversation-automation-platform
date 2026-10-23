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
  DollarSign,
  Package
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

      if (lower.includes(item.category.toLowerCase())) {
        score += 30;
        reasons.push(`Direct category match: "${item.category}"`);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#12131c] p-6 rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
              Commercial Engine
            </span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Product & Service Catalog</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Verified structured packages, pricing tiers, and capabilities used for grounded recommendations.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1.5 text-xs bg-orange-600 hover:bg-orange-500 active:scale-[0.98] text-white font-medium px-4 py-2.5 rounded-xl shadow-[0_2px_10px_rgba(249,115,22,0.35),inset_0_1px_0_0_rgba(255,255,255,0.25)] transition duration-150"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Catalog Item</span>
        </button>
      </div>

      {/* Recommendation Engine Simulator */}
      <div className="bg-[#12131c] rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <h2 className="text-sm font-bold text-white">Recommendation Rule Simulator</h2>
          </div>
          <span className="text-[11px] text-zinc-400 font-mono">Tests catalog heuristic matching against visitor queries</span>
        </div>

        <form onSubmit={handleRunSimulator} className="flex gap-2">
          <input
            type="text"
            value={simQuery}
            onChange={(e) => setSimQuery(e.target.value)}
            placeholder="Try: 'Need WhatsApp and CRM sync for our sales team' or 'Looking for starter chatbot'..."
            className="flex-1 bg-[#0a0b0e] border border-zinc-700/80 text-white text-xs rounded-xl px-3.5 py-2.5 focus:ring-1 focus:ring-orange-500 focus:outline-none placeholder:text-zinc-600"
          />
          <button
            type="submit"
            className="bg-orange-600 hover:bg-orange-500 active:scale-[0.98] text-white text-xs px-4 py-2.5 rounded-xl font-medium transition duration-150 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]"
          >
            Simulate Match
          </button>
        </form>

        {simResults && (
          <div className="p-4 bg-[#0a0b0e] rounded-xl border border-white/[0.08] space-y-3">
            <span className="text-xs font-bold text-zinc-200">
              Matched {simResults.length} Recommendation Card(s):
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {simResults.map((m, idx) => (
                <div key={idx} className="bg-[#12131c] p-3.5 rounded-xl border border-white/[0.08] text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{m.item.name}</span>
                    <span className="text-orange-400 font-bold font-mono">{m.item.priceDisplay}</span>
                  </div>
                  <ul className="text-[11px] text-zinc-400 space-y-1">
                    {m.reasons.map((r: string, i: number) => (
                      <li key={i} className="flex items-center gap-1.5 text-emerald-400">
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
          <div key={item.id} className="bg-[#12131c] rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="bg-orange-500/20 text-orange-300 border border-orange-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                  {item.category}
                </span>
                <span className="text-zinc-500 text-xs font-mono">{item.availability}</span>
              </div>

              <div>
                <h3 className="font-bold text-base text-white">{item.name}</h3>
                <div className="text-xl font-extrabold text-orange-400 mt-1 font-mono">{item.priceDisplay}</div>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">{item.description}</p>

              <div>
                <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider block mb-1.5">Key Features:</span>
                <ul className="text-xs text-zinc-300 space-y-1.5">
                  {item.features?.map((f: string, i: number) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {item.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {item.tags.map((t: string, i: number) => (
                    <span key={i} className="bg-[#0a0b0e] text-zinc-400 border border-white/[0.06] text-[10px] px-2 py-0.5 rounded font-mono">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 mt-2 border-t border-white/[0.06] flex items-center justify-between">
              <span className="text-[11px] text-zinc-500 font-mono">{item.id}</span>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-rose-400 hover:text-rose-300 text-xs flex items-center gap-1.5 hover:bg-rose-500/10 px-2 py-1 rounded-lg transition duration-150"
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#12131c] rounded-2xl shadow-2xl border border-white/[0.1] w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#151724] border-b border-white/[0.08] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm tracking-tight">Create New Product / Service Tier</h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-white transition">✕</button>
            </div>

            <form onSubmit={handleAddItem} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1.5">Package Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Starter Automation Tier"
                  className="w-full bg-[#0a0b0e] border border-zinc-700/80 text-white rounded-xl p-2.5 focus:ring-1 focus:ring-orange-500 focus:outline-none placeholder:text-zinc-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1.5">Category</label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Conversational AI"
                    className="w-full bg-[#0a0b0e] border border-zinc-700/80 text-white rounded-xl p-2.5 focus:ring-1 focus:ring-orange-500 focus:outline-none placeholder:text-zinc-600"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-semibold mb-1.5">Price Display</label>
                  <input
                    type="text"
                    required
                    value={priceDisplay}
                    onChange={(e) => setPriceDisplay(e.target.value)}
                    placeholder="$499 / mo"
                    className="w-full bg-[#0a0b0e] border border-zinc-700/80 text-white rounded-xl p-2.5 focus:ring-1 focus:ring-orange-500 focus:outline-none placeholder:text-zinc-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1.5">Summary Description</label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description of this service tier..."
                  className="w-full bg-[#0a0b0e] border border-zinc-700/80 text-white rounded-xl p-2.5 focus:ring-1 focus:ring-orange-500 focus:outline-none placeholder:text-zinc-600"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1.5">Features (One per line)</label>
                <textarea
                  rows={3}
                  value={featuresStr}
                  onChange={(e) => setFeaturesStr(e.target.value)}
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                  className="w-full bg-[#0a0b0e] border border-zinc-700/80 text-white rounded-xl p-2.5 focus:ring-1 focus:ring-orange-500 focus:outline-none font-mono text-[11px] placeholder:text-zinc-600"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1.5">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={tagsStr}
                  onChange={(e) => setTagsStr(e.target.value)}
                  placeholder="popular, crm, smb"
                  className="w-full bg-[#0a0b0e] border border-zinc-700/80 text-white rounded-xl p-2.5 focus:ring-1 focus:ring-orange-500 focus:outline-none placeholder:text-zinc-600"
                />
              </div>

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
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 active:scale-[0.98] text-white font-semibold transition duration-150 shadow-[0_2px_8px_rgba(249,115,22,0.35),inset_0_1px_0_0_rgba(255,255,255,0.2)]"
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
