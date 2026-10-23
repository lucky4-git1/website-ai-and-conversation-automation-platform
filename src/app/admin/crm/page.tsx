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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">HubSpot & CRM Integration Adapter</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Normalized CRM synchronization with idempotency tokens, field mappings, and automated retry queues.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 ${
            configData?.status === 'CONNECTED'
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-amber-100 text-amber-800'
          }`}>
            <span className={`w-2 h-2 rounded-full ${configData?.status === 'CONNECTED' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            <span>{configData?.status === 'CONNECTED' ? 'Connected & Verified' : 'Setup Required (Honest State)'}</span>
          </span>
        </div>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-slate-900 text-white text-xs border border-slate-800 flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Configuration Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Key className="w-4 h-4 text-sky-600" />
            <h3 className="font-bold text-sm text-slate-900">HubSpot Private App Credentials</h3>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">HubSpot Portal / Account ID</label>
              <input
                type="text"
                value={portalId}
                onChange={(e) => setPortalId(e.target.value)}
                placeholder="e.g. 24891024"
                className="w-full border border-slate-300 rounded-lg p-2.5 font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Private App Access Token</label>
              <input
                type="password"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="Paste HubSpot Private App Token (pat-...)"
                className="w-full border border-slate-300 rounded-lg p-2.5 font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Acquire from HubSpot Settings &gt; Integrations &gt; Private Apps. Required scopes: <code>crm.objects.contacts.write</code>, <code>crm.objects.deals.write</code>.
              </span>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Generic Outbound CRM Webhook (Optional Fallback)</label>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://hooks.zapier.com/hooks/catch/..."
                className="w-full border border-slate-300 rounded-lg p-2.5 font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
              >
                {isTesting ? 'Testing...' : 'Test Connection'}
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-medium py-2.5 rounded-lg transition shadow-sm"
              >
                {isSaving ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>
          </form>
        </div>

        {/* Normalized Property Mapping & Architecture (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Normalized Field Mappings</h3>
            <p className="text-xs text-slate-500">
              Platform lead attributes are mapped to HubSpot CRM contact properties:
            </p>

            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-600">lead.name</span>
                <span className="text-slate-400">→</span>
                <span className="text-sky-700 font-bold">firstname</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-600">lead.email</span>
                <span className="text-slate-400">→</span>
                <span className="text-sky-700 font-bold">email (unique key)</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-600">lead.company</span>
                <span className="text-slate-400">→</span>
                <span className="text-sky-700 font-bold">company</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-600">lead.score</span>
                <span className="text-slate-400">→</span>
                <span className="text-sky-700 font-bold">lead_score</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-600">lead.service_interest</span>
                <span className="text-slate-400">→</span>
                <span className="text-sky-700 font-bold">service_interest</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-3">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900">Data Consistency Guarantees</h3>
            </div>
            <ul className="text-xs text-slate-600 space-y-1.5">
              <li>• <strong>Idempotency:</strong> Prevents duplicate records by indexing on normalized email.</li>
              <li>• <strong>No Silent Overwrite:</strong> Low-confidence data never overwrites existing contact fields.</li>
              <li>• <strong>Durable Retry Queue:</strong> Failed synchronizations retry up to 5 times with exponential backoff.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
