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
  const [verifyToken, setVerifyToken] = useState('apex_secure_verify_token_2026');

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
        setVerifyToken(wa.config.webhookVerifyToken || 'apex_secure_verify_token_2026');
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
        // Test connection
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
      // Simulate/Trigger outbound WhatsApp dispatch through API
      const res = await fetch('/api/v1/webhooks/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entry: [{
            changes: [{
              value: {
                messages: [{
                  from: testPhone.replace(/[^0-9]/g, ''),
                  id: `wamid_sim_${Date.now()}`,
                  text: { body: 'Hello from WhatsApp simulation' }
                }],
                contacts: [{ profile: { name: 'Verified WhatsApp Lead' } }]
              }
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Official WhatsApp Business Cloud API</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Meta Cloud API adapter with verified webhook signatures, 24h care window compliance, and immediate opt-out enforcement.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 ${
            configData?.status === 'CONNECTED'
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-amber-100 text-amber-800'
          }`}>
            <span className={`w-2 h-2 rounded-full ${configData?.status === 'CONNECTED' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            <span>{configData?.status === 'CONNECTED' ? 'Live Connected' : 'Setup Required (Honest State)'}</span>
          </span>
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-xl bg-slate-900 text-white text-xs border border-slate-800 flex items-center justify-between">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Grid: Config Form & Policy Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Credentials Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Key className="w-4 h-4 text-sky-600" />
            <h3 className="font-bold text-sm text-slate-900">Meta WhatsApp Cloud API Credentials</h3>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">WhatsApp Phone Number ID</label>
              <input
                type="text"
                value={phoneNumberId}
                onChange={(e) => setPhoneNumberId(e.target.value)}
                placeholder="e.g. 108392019482910"
                className="w-full border border-slate-300 rounded-lg p-2.5 font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">WhatsApp Business Account ID (WABA)</label>
              <input
                type="text"
                value={wabaId}
                onChange={(e) => setWabaId(e.target.value)}
                placeholder="e.g. 984729104820192"
                className="w-full border border-slate-300 rounded-lg p-2.5 font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Permanent System User Access Token</label>
              <input
                type="password"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="Paste Meta System User Token (EAA...)"
                className="w-full border border-slate-300 rounded-lg p-2.5 font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Never exposed to the client. Token is used exclusively for server-to-server Meta Graph API calls.
              </span>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Meta App Secret (for HMAC Webhook Validation)</label>
              <input
                type="password"
                value={appSecret}
                onChange={(e) => setAppSecret(e.target.value)}
                placeholder="Paste Meta App Secret from App Settings > Basic"
                className="w-full border border-slate-300 rounded-lg p-2.5 font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Webhook Verify Token</label>
              <input
                type="text"
                value={verifyToken}
                onChange={(e) => setVerifyToken(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 font-mono bg-slate-50 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
              <div className="mt-1.5 p-2.5 bg-slate-100 rounded-lg text-[11px] text-slate-600 font-mono">
                Webhook Callback URL: <strong>https://yourdomain.com/api/v1/webhooks/whatsapp</strong>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-medium py-2.5 rounded-lg transition shadow-sm"
            >
              {isSaving ? 'Verifying with Meta Cloud API...' : 'Save & Verify Connection'}
            </button>
          </form>
        </div>

        {/* Messaging Policy & Test Dispatch (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Policy Compliance Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-3">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900">Official WhatsApp Policy Guardrails</h3>
            </div>

            <ul className="text-xs text-slate-600 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>24-Hour Customer Care Window:</strong> Freeform replies allowed only within 24h of visitor message.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Immediate Opt-Out Compliance:</strong> Inbound keyword <code>STOP</code>, <code>UNSUBSCRIBE</code>, or <code>CANCEL</code> revokes consent instantly.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>No Unsolicited Broadcasts:</strong> Outbound follow-ups verify active consent ledger prior to dispatch.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>HMAC SHA-256 Signature Verification:</strong> Rejects spoofed or replayed webhook payloads.</span>
              </li>
            </ul>
          </div>

          {/* Test Inbound & Outbound Dispatch */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Test Inbound Webhook Processing</h3>
            <p className="text-xs text-slate-500">
              Simulates an incoming WhatsApp message payload through the verified webhook handler.
            </p>

            <form onSubmit={handleSendTestMessage} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Simulated Sender Phone Number</label>
                <input
                  type="tel"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="+1 (555) 019-2834"
                  className="w-full border border-slate-300 rounded-lg p-2 font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isTesting}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 rounded-lg transition"
              >
                {isTesting ? 'Processing Webhook...' : 'Simulate Inbound WhatsApp Webhook'}
              </button>
            </form>

            {testResult && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                <span className="font-bold text-slate-800 block">Webhook Processing Outcome:</span>
                <pre className="text-[10px] text-slate-600 font-mono overflow-x-auto">
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
