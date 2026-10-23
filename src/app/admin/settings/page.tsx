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
  const [siteId, setSiteId] = useState('site_speakforme_01');
  const [allowedDomains, setAllowedDomains] = useState('localhost, 127.0.0.1, example.com');
  const [welcomeMessage, setWelcomeMessage] = useState('Hi there! 👋 Welcome to SpeakForMe Technologies. How can I help you accelerate your business operations today?');
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#12131c] p-6 rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              Widget Configuration
            </span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Widget Settings & Domain Allowlist</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Embed code generator, domain security isolation, branding options, and operating hours.
          </p>
        </div>
      </div>

      {savedFeedback && (
        <div className="p-4 rounded-xl bg-[#151724] text-white text-xs border border-indigo-500/30 flex items-center justify-between shadow-[0_2px_12px_rgba(99,102,241,0.15)]">
          <span>{savedFeedback}</span>
          <button onClick={() => setSavedFeedback(null)} className="text-zinc-400 hover:text-white p-1">✕</button>
        </div>
      )}

      {/* Embed Code Snippet Card */}
      <div className="bg-[#12131c] rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Code className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-white">Website Installation Embed Code</h2>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 text-xs bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 px-3.5 py-1.5 rounded-xl border border-indigo-500/30 font-medium transition duration-150"
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Embed Script'}</span>
          </button>
        </div>

        <p className="text-xs text-zinc-400">
          Paste this single tag before the closing <code>&lt;/body&gt;</code> tag on any client website. The widget loads asynchronously in an isolated iframe.
        </p>

        <div className="bg-[#0a0b0e] text-zinc-200 p-4 rounded-xl font-mono text-xs overflow-x-auto border border-white/[0.08]">
          <code>{embedScript}</code>
        </div>
      </div>

      {/* Form Grid */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security & Isolation */}
        <div className="bg-[#12131c] rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] p-6 space-y-4">
          <div className="flex items-center space-x-2.5 border-b border-white/[0.08] pb-3">
            <Shield className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm text-white">Domain Security & Isolation</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-zinc-300 font-semibold mb-1.5">Public Site Identifier (Site ID)</label>
              <input
                type="text"
                readOnly
                value={siteId}
                className="w-full bg-[#0a0b0e] border border-white/[0.08] rounded-xl p-2.5 font-mono text-zinc-400 cursor-not-allowed"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">
                Public identifier used by the embed script. Privileged actions remain authenticated on the server.
              </span>
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1.5">Allowed Hostname Domains (Comma-separated)</label>
              <input
                type="text"
                value={allowedDomains}
                onChange={(e) => setAllowedDomains(e.target.value)}
                className="w-full bg-[#0a0b0e] border border-zinc-700/80 text-white rounded-xl p-2.5 font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">
                Requests originating from unauthorized origins will be rejected by the server with HTTP 403.
              </span>
            </div>
          </div>
        </div>

        {/* Branding & Welcome Configuration */}
        <div className="bg-[#12131c] rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] p-6 space-y-4">
          <div className="flex items-center space-x-2.5 border-b border-white/[0.08] pb-3">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <h3 className="font-bold text-sm text-white">Branding & Greeting Configuration</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-zinc-300 font-semibold mb-1.5">Widget Brand Accent Color</label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded-xl border border-white/[0.1] bg-[#0a0b0e] cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-32 bg-[#0a0b0e] border border-zinc-700/80 text-white rounded-xl p-2 font-mono text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1.5">Welcome Message</label>
              <textarea
                rows={3}
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                className="w-full bg-[#0a0b0e] border border-zinc-700/80 text-white rounded-xl p-2.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none leading-relaxed"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-semibold py-2.5 rounded-xl transition duration-150 shadow-[0_2px_8px_rgba(99,102,241,0.35),inset_0_1px_0_0_rgba(255,255,255,0.2)] mt-2"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
