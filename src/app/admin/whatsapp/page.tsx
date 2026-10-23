'use client';

import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  CheckCircle2,
  AlertCircle,
  Shield,
  Send,
  RefreshCw,
  Key,
  Globe,
  MessageSquare,
  HelpCircle,
  FileText
} from 'lucide-react';

export default function WhatsAppAdminPage() {
  const [configData, setConfigData] = useState<any>(null);
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [wabaId, setWabaId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [appSecret, setAppSecret] = useState('');
  const [verifyToken, setVerifyToken] = useState('speakforme_secure_verify_token_2026');

  // Test send state
  const [testPhone, setTestPhone] = useState('');
  const [testTemplate, setTestTemplate] = useState('lead_followup_utility_v1');
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/v1/integrations');
      const data = await res.json();
      const wa = data.integrations?.whatsapp;
      setConfigData(wa);
      if (wa?.config) {
        setPhoneNumberId(wa.config.phoneNumberId || '');
        setWabaId(wa.config.wabaId || '');
        setVerifyToken(wa.config.webhookVerifyToken || 'speakforme_secure_verify_token_2026');
      }
    } catch (err) {
      console.error('Failed to load WhatsApp config:', err);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/v1/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'WHATSAPP',
          config: {
            phoneNumberId,
            wabaId,
            accessToken,
            appSecret,
            webhookVerifyToken: verifyToken,
            templates: ['lead_followup_utility_v1', 'appointment_reminder_v1']
          }
        })
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage('Configuration saved successfully. Testing verification handshake...');
        const testRes = await fetch('/api/v1/integrations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: 'WHATSAPP',
            action: 'TEST_CONNECTION',
            config: { phoneNumberId, accessToken }
          })
        });
        const testData = await testRes.json();
        setStatusMessage(testData.message);
        await fetchConfig();
      }
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTestMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone.trim()) return;

    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/v1/webhooks/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          object: 'whatsapp_business_account',
          entry: [{
            id: wabaId || 'simulated_waba',
            changes: [{
              value: {
                messaging_product: 'whatsapp',
                metadata: { display_phone_number: '15550192834', phone_number_id: phoneNumberId || 'sim_phone' },
                contacts: [{ profile: { name: 'Simulated WhatsApp User' }, wa_id: testPhone }],
                messages: [{
                  from: testPhone,
                  id: `wamid_${Date.now()}`,
                  timestamp: Math.floor(Date.now() / 1000).toString(),
                  text: { body: 'Hello, what are your pricing options and packages?' },
                  type: 'text'
                }]
              },
              field: 'messages'
            }]
          }]
        })
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({ error: err.message });
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
              Meta Cloud Gateway
            </span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Official WhatsApp Business Cloud API</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Meta Cloud API adapter with verified webhook signatures, 24h care window compliance, and immediate opt-out enforcement.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-2 border font-mono ${
            configData?.status === 'CONNECTED'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
          }`}>
            <span className={`w-2 h-2 rounded-full ${configData?.status === 'CONNECTED' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
            <span>{configData?.status === 'CONNECTED' ? 'Live Connected' : 'Setup Required (Honest State)'}</span>
          </span>
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-xl bg-[#151724] text-white text-xs border border-indigo-500/30 flex items-center justify-between shadow-[0_2px_12px_rgba(99,102,241,0.15)]">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="text-zinc-400 hover:text-white p-1">✕</button>
        </div>
      )}

      {/* Grid: Config Form & Policy Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Credentials Form (7 cols) */}
        <div className="lg:col-span-7 bg-[#12131c] rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] p-6 space-y-4">
          <div className="flex items-center space-x-2.5 border-b border-white/[0.08] pb-3">
            <Key className="w-4 h-4 text-indigo-400" />
            <h3 className="font-bold text-sm text-white">Meta WhatsApp Cloud API Credentials</h3>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
            <div>
              <label className="block text-zinc-300 font-semibold mb-1.5">WhatsApp Phone Number ID</label>
              <input
                type="text"
                value={phoneNumberId}
                onChange={(e) => setPhoneNumberId(e.target.value)}
                placeholder="e.g. 108392019482910"
                className="w-full bg-[#0a0b0e] border border-zinc-700/80 text-white rounded-xl p-2.5 font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none placeholder:text-zinc-600"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1.5">WhatsApp Business Account ID (WABA)</label>
              <input
                type="text"
                value={wabaId}
                onChange={(e) => setWabaId(e.target.value)}
                placeholder="e.g. 984729104820192"
                className="w-full bg-[#0a0b0e] border border-zinc-700/80 text-white rounded-xl p-2.5 font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none placeholder:text-zinc-600"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1.5">Permanent System User Access Token</label>
              <input
                type="password"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="Paste Meta System User Token (EAA...)"
                className="w-full bg-[#0a0b0e] border border-zinc-700/80 text-white rounded-xl p-2.5 font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none placeholder:text-zinc-600"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">
                Never exposed to the client. Token is used exclusively for server-to-server Meta Graph API calls.
              </span>
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1.5">Meta App Secret (for HMAC Webhook Validation)</label>
              <input
                type="password"
                value={appSecret}
                onChange={(e) => setAppSecret(e.target.value)}
                placeholder="Paste Meta App Secret from App Settings > Basic"
                className="w-full bg-[#0a0b0e] border border-zinc-700/80 text-white rounded-xl p-2.5 font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none placeholder:text-zinc-600"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1.5">Webhook Verify Token</label>
              <input
                type="text"
                value={verifyToken}
                onChange={(e) => setVerifyToken(e.target.value)}
                className="w-full bg-[#0a0b0e] border border-zinc-700/80 text-white rounded-xl p-2.5 font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
              <div className="mt-2 p-3 bg-[#0a0b0e] border border-white/[0.06] rounded-xl text-[11px] text-zinc-400 font-mono">
                Webhook Callback URL: <strong className="text-white">https://yourdomain.com/api/v1/webhooks/whatsapp</strong>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-semibold py-2.5 rounded-xl transition duration-150 shadow-[0_2px_8px_rgba(99,102,241,0.35),inset_0_1px_0_0_rgba(255,255,255,0.2)] disabled:opacity-50"
            >
              {isSaving ? 'Verifying with Meta Cloud API...' : 'Save & Verify Connection'}
            </button>
          </form>
        </div>

        {/* Messaging Policy & Test Dispatch (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Policy Compliance Card */}
          <div className="bg-[#12131c] rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] p-6 space-y-3">
            <div className="flex items-center space-x-2.5 border-b border-white/[0.08] pb-3">
              <Shield className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-sm text-white">Official WhatsApp Policy Guardrails</h3>
            </div>

            <ul className="text-xs text-zinc-300 space-y-2.5">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">24-Hour Customer Care Window:</strong> Freeform replies allowed only within 24h of visitor message.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">Immediate Opt-Out Compliance:</strong> Inbound keyword <code>STOP</code>, <code>UNSUBSCRIBE</code>, or <code>CANCEL</code> revokes consent instantly.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">No Unsolicited Broadcasts:</strong> Outbound follow-ups verify active consent ledger prior to dispatch.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-white">HMAC SHA-256 Signature Verification:</strong> Rejects spoofed or replayed webhook payloads.</span>
              </li>
            </ul>
          </div>

          {/* Test Inbound & Outbound Dispatch */}
          <div className="bg-[#12131c] rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] p-6 space-y-4">
            <h3 className="font-bold text-sm text-white">Test Inbound Webhook Processing</h3>
            <p className="text-xs text-zinc-400">
              Simulates an incoming WhatsApp message payload through the verified webhook handler.
            </p>

            <form onSubmit={handleSendTestMessage} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1.5">Simulated Sender Phone Number</label>
                <input
                  type="tel"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="+1 (555) 019-2834"
                  className="w-full bg-[#0a0b0e] border border-zinc-700/80 text-white rounded-xl p-2.5 font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none placeholder:text-zinc-600"
                />
              </div>

              <button
                type="submit"
                disabled={isTesting}
                className="w-full bg-zinc-800 hover:bg-zinc-700 active:scale-[0.98] text-zinc-200 font-medium py-2.5 rounded-xl border border-white/[0.08] transition duration-150 disabled:opacity-50"
              >
                {isTesting ? 'Processing Webhook...' : 'Simulate Inbound WhatsApp Webhook'}
              </button>
            </form>

            {testResult && (
              <div className="p-3.5 bg-[#0a0b0e] border border-white/[0.08] rounded-xl text-xs space-y-1.5">
                <span className="font-bold text-white block">Webhook Processing Outcome:</span>
                <pre className="text-[10px] text-zinc-400 font-mono overflow-x-auto">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
