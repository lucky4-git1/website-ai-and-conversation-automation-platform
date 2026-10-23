'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Code,
  Shield,
  CheckCircle2,
  Copy,
  Globe,
  Sliders,
  Clock,
  Key
} from 'lucide-react';

export default function SettingsAdminPage() {
  const [siteId, setSiteId] = useState('site_apex_live_01');
  const [allowedDomains, setAllowedDomains] = useState('localhost, 127.0.0.1, example.com');
  const [welcomeMessage, setWelcomeMessage] = useState('Hi there! 👋 Welcome to Apex Enterprise Solutions. How can I help you accelerate your business operations today?');
  const [primaryColor, setPrimaryColor] = useState('#0284c7');
  const [copied, setCopied] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  const embedScript = `<script src="${typeof window !== 'undefined' ? window.location.origin : 'https://app.yourdomain.com'}/widget.js" data-site-id="${siteId}" async></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedFeedback('Settings and domain allowlist updated successfully.');
    setTimeout(() => setSavedFeedback(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Widget Settings & Domain Allowlist</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Embed code generator, domain security isolation, branding options, and operating hours.
          </p>
        </div>
      </div>

      {savedFeedback && (
        <div className="p-4 rounded-xl bg-slate-900 text-white text-xs border border-slate-800 flex items-center justify-between">
          <span>{savedFeedback}</span>
          <button onClick={() => setSavedFeedback(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Embed Code Snippet Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Code className="w-4 h-4 text-sky-600" />
            <h2 className="text-sm font-bold text-slate-900">Website Installation Embed Code</h2>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 text-xs bg-sky-50 hover:bg-sky-100 text-sky-700 px-3 py-1.5 rounded-lg border border-sky-200 font-medium transition"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Embed Script'}</span>
          </button>
        </div>

        <p className="text-xs text-slate-500">
          Paste this single tag before the closing <code>&lt;/body&gt;</code> tag on any client website. The widget loads asynchronously in an isolated iframe.
        </p>

        <div className="bg-slate-950 text-slate-200 p-4 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800">
          <code>{embedScript}</code>
        </div>
      </div>

      {/* Form Grid */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security & Isolation */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Shield className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">Domain Security & Isolation</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Public Site Identifier (Site ID)</label>
              <input
                type="text"
                readOnly
                value={siteId}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-mono text-slate-600 cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Public identifier used by the embed script. Privileged actions remain authenticated on the server.
              </span>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Allowed Hostname Domains (Comma-separated)</label>
              <input
                type="text"
                value={allowedDomains}
                onChange={(e) => setAllowedDomains(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Requests originating from unauthorized origins will be rejected by the server with HTTP 403.
              </span>
            </div>
          </div>
        </div>

        {/* Branding & Welcome Configuration */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Sliders className="w-4 h-4 text-sky-600" />
            <h3 className="font-bold text-sm text-slate-900">Branding & Greeting Configuration</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Widget Brand Accent Color</label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded border border-slate-300 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-32 border border-slate-300 rounded-lg p-2 font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Welcome Message</label>
              <textarea
                rows={3}
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-sky-500 focus:outline-none leading-relaxed"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-medium py-2.5 rounded-lg transition shadow-sm mt-2"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
