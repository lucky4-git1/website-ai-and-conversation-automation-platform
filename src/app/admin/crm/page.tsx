'use client';

import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  Key,
  RefreshCw,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Server
} from 'lucide-react';

export default function CRMAdminPage() {
  const [configData, setConfigData] = useState<any>(null);
  const [accessToken, setAccessToken] = useState('');
  const [portalId, setPortalId] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/v1/integrations');
      const data = await res.json();
      const hs = data.integrations?.hubspot;
      setConfigData(hs);
      if (hs?.config) {
        setPortalId(hs.config.portalId || '');
        setWebhookUrl(hs.config.webhookUrl || '');
      }
    } catch (err) {
      console.error('Failed to load CRM config:', err);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/v1/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'HUBSPOT',
          config: {
            portalId,
            accessToken,
            webhookUrl,
            fieldMappings: {
              email: 'email',
              name: 'firstname',
              company: 'company',
              score: 'lead_score',
              serviceInterest: 'service_interest'
            }
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        setFeedback('HubSpot CRM configuration saved successfully.');
        await fetchConfig();
      }
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/v1/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'HUBSPOT',
          action: 'TEST_CONNECTION',
          config: { accessToken }
        })
      });
      const data = await res.json();
      setFeedback(data.message);
      await fetchConfig();
    } catch (err: any) {
      setFeedback(`Connection test error: ${err.message}`);
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
              Enterprise Bi-Directional Sync
            </span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">HubSpot & CRM Integration Adapter</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Normalized CRM synchronization with idempotency tokens, field mappings, and automated retry queues.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-2 border font-mono ${
            configData?.status === 'CONNECTED'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
          }`}>
            <span className={`w-2 h-2 rounded-full ${configData?.status === 'CONNECTED' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
            <span>{configData?.status === 'CONNECTED' ? 'Connected & Verified' : 'Setup Required (Honest State)'}</span>
          </span>
        </div>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-[#151724] text-white text-xs border border-indigo-500/30 flex items-center justify-between shadow-[0_2px_12px_rgba(99,102,241,0.15)]">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-zinc-400 hover:text-white p-1">✕</button>
        </div>
      )}

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Configuration Form (7 cols) */}
        <div className="lg:col-span-7 bg-[#12131c] rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] p-6 space-y-4">
          <div className="flex items-center space-x-2.5 border-b border-white/[0.08] pb-3">
            <Key className="w-4 h-4 text-indigo-400" />
            <h3 className="font-bold text-sm text-white">HubSpot Private App Credentials</h3>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
            <div>
              <label className="block text-zinc-300 font-semibold mb-1.5">HubSpot Portal / Account ID</label>
              <input
                type="text"
                value={portalId}
                onChange={(e) => setPortalId(e.target.value)}
                placeholder="e.g. 24891024"
                className="w-full bg-[#0a0b0e] border border-zinc-700/80 text-white rounded-xl p-2.5 font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none placeholder:text-zinc-600"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1.5">Private App Access Token</label>
              <input
                type="password"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="Paste HubSpot Private App Token (pat-...)"
                className="w-full bg-[#0a0b0e] border border-zinc-700/80 text-white rounded-xl p-2.5 font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none placeholder:text-zinc-600"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">
                Acquire from HubSpot Settings &gt; Integrations &gt; Private Apps. Required scopes: <code>crm.objects.contacts.write</code>, <code>crm.objects.deals.write</code>.
              </span>
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1.5">Generic Outbound CRM Webhook (Optional Fallback)</label>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://hooks.zapier.com/hooks/catch/..."
                className="w-full bg-[#0a0b0e] border border-zinc-700/80 text-white rounded-xl p-2.5 font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none placeholder:text-zinc-600"
              />
            </div>

            <div className="flex gap-2.5 pt-3">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-[0.98] text-zinc-300 font-medium transition duration-150 border border-white/[0.08]"
              >
                {isTesting ? 'Testing...' : 'Test Connection'}
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-semibold py-2.5 rounded-xl transition duration-150 shadow-[0_2px_8px_rgba(99,102,241,0.35),inset_0_1px_0_0_rgba(255,255,255,0.2)]"
              >
                {isSaving ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </form>
        </div>

        {/* Normalized Property Mapping & Architecture (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#12131c] rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] p-6 space-y-4">
            <h3 className="font-bold text-sm text-white">Normalized Field Mappings</h3>
            <p className="text-xs text-zinc-400">
              Platform lead attributes are mapped to HubSpot CRM contact properties:
            </p>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between p-2.5 bg-[#0a0b0e] rounded-xl border border-white/[0.06]">
                <span className="text-zinc-400">lead.name</span>
                <span className="text-zinc-600">→</span>
                <span className="text-indigo-400 font-bold">firstname</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-[#0a0b0e] rounded-xl border border-white/[0.06]">
                <span className="text-zinc-400">lead.email</span>
                <span className="text-zinc-600">→</span>
                <span className="text-indigo-400 font-bold">email (unique key)</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-[#0a0b0e] rounded-xl border border-white/[0.06]">
                <span className="text-zinc-400">lead.company</span>
                <span className="text-zinc-600">→</span>
                <span className="text-indigo-400 font-bold">company</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-[#0a0b0e] rounded-xl border border-white/[0.06]">
                <span className="text-zinc-400">lead.score</span>
                <span className="text-zinc-600">→</span>
                <span className="text-indigo-400 font-bold">lead_score</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-[#0a0b0e] rounded-xl border border-white/[0.06]">
                <span className="text-zinc-400">lead.service_interest</span>
                <span className="text-zinc-600">→</span>
                <span className="text-indigo-400 font-bold">service_interest</span>
              </div>
            </div>
          </div>

          <div className="bg-[#12131c] rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] p-6 space-y-3">
            <div className="flex items-center space-x-2.5 border-b border-white/[0.08] pb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-sm text-white">Data Consistency Guarantees</h3>
            </div>
            <ul className="text-xs text-zinc-300 space-y-2">
              <li>• <strong className="text-white">Idempotency:</strong> Prevents duplicate records by indexing on normalized email.</li>
              <li>• <strong className="text-white">No Silent Overwrite:</strong> Low-confidence data never overwrites existing contact fields.</li>
              <li>• <strong className="text-white">Durable Retry Queue:</strong> Failed synchronizations retry up to 5 times with exponential backoff.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
