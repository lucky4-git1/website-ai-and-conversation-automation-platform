'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, HelpCircle, Shield, X, Minimize2, Sparkles, PhoneCall, CheckCircle2, ChevronRight, AlertCircle, Building2, Mail } from 'lucide-react';

interface Citation {
  sourceId: string;
  title: string;
  snippet: string;
}

interface CatalogItem {
  id: string;
  name: string;
  category: string;
  priceDisplay: string;
  description: string;
  features: string[];
  actionUrl: string;
}

interface Message {
  id: string;
  senderType: 'VISITOR' | 'AI' | 'AGENT' | 'SYSTEM';
  senderName: string;
  content: string;
  citations?: Citation[];
  recommendedItems?: CatalogItem[];
  suggestedAction?: string;
  createdAt: string;
}

export default function ChatWidgetPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [visitorId, setVisitorId] = useState<string>('');
  const [status, setStatus] = useState<string>('AI_ACTIVE');
  const [showLeadModal, setShowLeadModal] = useState(false);

  // Lead capture state
  const [leadForm, setLeadForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    serviceInterest: 'Conversational AI & Omnichannel',
    budgetRange: '$1,000 - $3,000',
    consentGiven: true
  });
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadScoreResult, setLeadScoreResult] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let vid = localStorage.getItem('speakforme_visitor_id');
    if (!vid) {
      vid = 'vis_' + Math.random().toString(36).substring(2, 10);
      localStorage.setItem('speakforme_visitor_id', vid);
    }
    setVisitorId(vid);

    const initialGreeting: Message = {
      id: 'greeting_01',
      senderType: 'AI',
      senderName: 'SpeakForMe Assistant',
      content: 'Hi there! 👋 Welcome to SpeakForMe. I am your grounded conversion assistant. How can I help you automate conversations and accelerate your business today?',
      createdAt: new Date().toISOString()
    };
    setMessages([initialGreeting]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: 'usr_' + Date.now(),
      senderType: 'VISITOR',
      senderName: 'You',
      content: text,
      createdAt: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/v1/widget/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId: 'site_speakforme_01',
          tenantId: 'tenant_default_01',
          conversationId,
          visitorId,
          content: text
        })
      });

      const data = await res.json();
      if (data.conversationId) setConversationId(data.conversationId);
      if (data.status) setStatus(data.status);

      if (data.reply) {
        const botMsg: Message = {
          id: data.reply.id || 'bot_' + Date.now(),
          senderType: 'AI',
          senderName: 'SpeakForMe Assistant',
          content: data.reply.content,
          citations: data.reply.citations,
          recommendedItems: data.reply.recommendedItems,
          suggestedAction: data.reply.suggestedAction,
          createdAt: data.reply.createdAt || new Date().toISOString()
        };
        setMessages((prev) => [...prev, botMsg]);

        if (data.reply.suggestedAction === 'REQUEST_QUOTE' && !leadSubmitted) {
          setShowLeadModal(true);
        }
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      const errorMsg: Message = {
        id: 'err_' + Date.now(),
        senderType: 'SYSTEM',
        senderName: 'System',
        content: 'Connection interrupted. Please verify your network connection and retry.',
        createdAt: new Date().toISOString()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestHandoff = async () => {
    if (!conversationId) {
      await handleSendMessage('I would like to speak to a human representative.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch('/api/v1/widget/handoff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          reason: 'Visitor requested human specialist in SpeakForMe widget'
        })
      });
      const data = await res.json();
      if (data.success) {
        setStatus('HANDOFF_REQUESTED');
        const systemMsg: Message = {
          id: 'sys_' + Date.now(),
          senderType: 'SYSTEM',
          senderName: 'Live Operator Queue',
          content: 'You have been placed in the priority human operator queue. An enterprise specialist will join this conversation shortly.',
          createdAt: new Date().toISOString()
        };
        setMessages((prev) => [...prev, systemMsg]);
        setShowLeadModal(true);
      }
    } catch (err) {
      console.error('Handoff error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.email && !leadForm.phone) return;

    try {
      setIsLoading(true);
      const res = await fetch('/api/v1/widget/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: 'tenant_default_01',
          conversationId,
          visitorId,
          name: leadForm.name,
          email: leadForm.email,
          phone: leadForm.phone,
          company: leadForm.company,
          serviceInterest: leadForm.serviceInterest,
          budgetRange: leadForm.budgetRange,
          consentGiven: leadForm.consentGiven,
          intentSignal: status === 'HANDOFF_REQUESTED' ? 'CALLBACK_REQUEST' : 'QUOTE_REQUEST'
        })
      });

      const data = await res.json();
      if (data.success) {
        setLeadSubmitted(true);
        setLeadScoreResult(data);
        setShowLeadModal(false);

        const confirmMsg: Message = {
          id: 'conf_' + Date.now(),
          senderType: 'SYSTEM',
          senderName: 'Verification Confirmed',
          content: `Thank you, ${leadForm.name || 'there'}! Your profile has been registered. Priority Intent Score: **${data.score}/100** (${data.qualificationStatus}). A specialist will follow up shortly.`,
          createdAt: new Date().toISOString()
        };
        setMessages((prev) => [...prev, confirmMsg]);
      }
    } catch (err) {
      console.error('Lead submission failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (window.parent) {
      window.parent.postMessage('speakforme-close-widget', '*');
      window.parent.postMessage('apex-ai-close-widget', '*');
    }
  };

  const suggestedChips = [
    'What enterprise AI services do you offer?',
    'What are your pricing plans?',
    'How does live-chat handoff work?',
    'Speak to a human consultant'
  ];

  return (
    <div className="flex flex-col h-screen w-full bg-[#0d0e12] text-zinc-100 overflow-hidden font-sans select-text border border-zinc-800/80 antialiased">
      {/* Header - Tactile Obsidian & Electric Iris */}
      <header className="bg-[#12131a] text-white px-4 py-3 flex items-center justify-between border-b border-white/[0.08] shadow-[0_4px_16px_rgba(0,0,0,0.4)] shrink-0">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-orange-400 font-bold shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]">
              <Bot className="w-5 h-5 text-orange-400" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#12131a] rounded-full"></span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-semibold text-xs tracking-tight text-zinc-100">SpeakForMe</h1>
              <span className="bg-orange-500/15 text-orange-300 border border-orange-500/30 text-[9px] font-semibold px-1.5 py-0.2 rounded uppercase tracking-wider">
                Grounded
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 flex items-center gap-1.5">
              {status === 'HANDOFF_REQUESTED' ? (
                <span className="text-amber-400 font-medium animate-pulse">● Waiting for live agent...</span>
              ) : status === 'HUMAN_ACTIVE' ? (
                <span className="text-emerald-400 font-medium">● Connected with Live Specialist</span>
              ) : (
                <span>Online • 24/7 Verified Grounding</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          {status === 'AI_ACTIVE' && (
            <button
              onClick={handleRequestHandoff}
              className="text-[11px] bg-zinc-800 hover:bg-zinc-700 active:scale-[0.96] border border-white/10 text-zinc-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition duration-150 shadow-xs"
              title="Speak with a live human specialist"
            >
              <User className="w-3 h-3 text-orange-400" />
              <span className="hidden sm:inline">Human Agent</span>
            </button>
          )}

          <button
            onClick={handleClose}
            className="text-zinc-400 hover:text-white hover:bg-zinc-800/80 active:scale-[0.94] p-1.5 rounded-lg transition duration-150"
            aria-label="Close widget"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Status Bar for Live Queue */}
      {status === 'HANDOFF_REQUESTED' && (
        <div className="bg-amber-950/40 border-b border-amber-800/40 px-3.5 py-2 flex items-center justify-between text-xs text-amber-200 shrink-0">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Human operator requested. Queue position: #1</span>
          </div>
          {!leadSubmitted && (
            <button
              onClick={() => setShowLeadModal(true)}
              className="underline font-semibold text-amber-300 hover:text-amber-100 ml-2"
            >
              Leave Contact
            </button>
          )}
        </div>
      )}

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#0a0b0e]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.senderType === 'VISITOR' ? 'items-end' : 'items-start'
            }`}
          >
            <div className="flex items-end gap-2 max-w-[88%]">
              {msg.senderType !== 'VISITOR' && (
                <div className="w-6 h-6 rounded-lg bg-zinc-800 border border-zinc-700/80 flex items-center justify-center shrink-0 text-zinc-300 text-xs shadow-xs">
                  {msg.senderType === 'AI' ? <Bot className="w-3.5 h-3.5 text-orange-400" /> : <User className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
              )}

              <div
                className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed transition shadow-sm ${
                  msg.senderType === 'VISITOR'
                    ? 'bg-orange-600 text-white rounded-br-xs shadow-[0_2px_8px_rgba(249,115,22,0.35),inset_0_1px_0_0_rgba(255,255,255,0.2)]'
                    : msg.senderType === 'SYSTEM'
                    ? 'bg-zinc-900 border border-amber-500/30 text-amber-200 rounded-xl w-full text-[11px]'
                    : 'bg-[#15171e] border border-white/[0.08] text-zinc-200 rounded-bl-xs shadow-[0_2px_6px_rgba(0,0,0,0.25)]'
                }`}
              >
                {msg.senderType !== 'VISITOR' && msg.senderType !== 'SYSTEM' && (
                  <div className="text-[10px] font-semibold text-zinc-400 mb-1">
                    {msg.senderName}
                  </div>
                )}

                <div className="whitespace-pre-line text-zinc-100">{msg.content}</div>

                {/* Grounded Source Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-white/[0.06] flex flex-wrap gap-1.5">
                    {msg.citations.map((c, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 bg-zinc-800/80 border border-zinc-700/60 text-zinc-300 text-[10px] px-2 py-0.5 rounded-full font-mono"
                        title={c.snippet}
                      >
                        <Shield className="w-2.5 h-2.5 text-orange-400" />
                        {c.title}
                      </span>
                    ))}
                  </div>
                )}

                {/* Structured Catalog Recommendation Cards */}
                {msg.recommendedItems && msg.recommendedItems.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {msg.recommendedItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-[#1b1d26] border border-white/[0.08] rounded-xl p-3 text-xs space-y-1.5 hover:border-orange-500/40 transition duration-150"
                      >
                        <div className="flex items-center justify-between font-semibold text-zinc-100">
                          <span>{item.name}</span>
                          <span className="text-orange-400 font-bold font-mono">{item.priceDisplay}</span>
                        </div>
                        <p className="text-zinc-400 text-[11px] leading-relaxed">{item.description}</p>
                        <ul className="text-zinc-400 text-[11px] list-disc list-inside space-y-0.5">
                          {item.features.slice(0, 2).map((f, i) => (
                            <li key={i}>{f}</li>
                          ))}
                        </ul>
                        <button
                          onClick={() => {
                            setLeadForm((prev) => ({ ...prev, serviceInterest: item.name }));
                            setShowLeadModal(true);
                          }}
                          className="w-full mt-1 bg-orange-600 hover:bg-orange-500 active:scale-[0.98] text-white font-medium py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition duration-150 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)] text-[11px]"
                        >
                          Request Quotation for {item.name}
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <span className="text-[10px] text-zinc-500 mt-1 px-1 font-mono">
              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center space-x-2 text-zinc-400 text-xs py-2">
            <div className="w-5 h-5 rounded-lg bg-zinc-800 flex items-center justify-center animate-pulse">
              <Bot className="w-3 h-3 text-orange-400" />
            </div>
            <span className="italic text-[11px]">Verifying approved business knowledge...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Questions */}
      {messages.length <= 2 && (
        <div className="px-4 py-2.5 bg-[#101116] border-t border-white/[0.06] shrink-0">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-orange-400" /> Suggested Inquiries:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {suggestedChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip)}
                className="bg-zinc-800/80 hover:bg-zinc-700/80 active:scale-[0.97] text-zinc-300 border border-zinc-700/60 text-[11px] px-2.5 py-1 rounded-lg text-left transition duration-150"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <footer className="p-3 bg-[#12131a] border-t border-white/[0.08] shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={status === 'HUMAN_ACTIVE' ? 'Type your message to human specialist...' : 'Ask about services, pricing, SLA, or WhatsApp sync...'}
            className="flex-1 bg-[#0a0b0e] border border-white/[0.1] text-zinc-100 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 placeholder-zinc-500 transition duration-150"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="bg-orange-600 hover:bg-orange-500 active:scale-[0.95] disabled:opacity-40 text-white p-2.5 rounded-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)] transition duration-150 flex items-center justify-center"
            aria-label="Send message"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="mt-2 text-center">
          <p className="text-[10px] text-zinc-500 font-mono">
            SpeakForMe Zero-Hallucination Engine • Encrypted Session
          </p>
        </div>
      </footer>

      {/* Lead Qualification Modal / Drawer */}
      {showLeadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 z-50">
          <div className="bg-[#14151e] rounded-2xl shadow-2xl border border-white/10 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-orange-600 px-4 py-3 flex items-center justify-between text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25)]">
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-white" />
                <h3 className="font-semibold text-xs tracking-tight">Priority Consultation & Quote</h3>
              </div>
              <button
                onClick={() => setShowLeadModal(false)}
                className="text-white/80 hover:text-white p-1 rounded transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLeadSubmit} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={leadForm.name}
                  onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                  placeholder="e.g. Sarah Connor"
                  className="w-full bg-[#0a0b0e] border border-zinc-700 rounded-lg p-2 text-zinc-100 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Work Email Address</label>
                <input
                  type="email"
                  required
                  value={leadForm.email}
                  onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                  placeholder="sarah@company.com"
                  className="w-full bg-[#0a0b0e] border border-zinc-700 rounded-lg p-2 text-zinc-100 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Phone / WhatsApp (Optional)</label>
                <input
                  type="tel"
                  value={leadForm.phone}
                  onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                  placeholder="+1 (555) 019-2834"
                  className="w-full bg-[#0a0b0e] border border-zinc-700 rounded-lg p-2 text-zinc-100 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Company / Organization</label>
                <input
                  type="text"
                  value={leadForm.company}
                  onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })}
                  placeholder="Cyberdyne Systems"
                  className="w-full bg-[#0a0b0e] border border-zinc-700 rounded-lg p-2 text-zinc-100 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Target Package Interest</label>
                <select
                  value={leadForm.serviceInterest}
                  onChange={(e) => setLeadForm({ ...leadForm, serviceInterest: e.target.value })}
                  className="w-full bg-[#0a0b0e] border border-zinc-700 rounded-lg p-2 text-zinc-100 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                >
                  <option value="Growth Conversational AI Package">Growth Package ($499/mo)</option>
                  <option value="Professional Omnichannel & CRM Suite">Professional Suite ($1,299/mo)</option>
                  <option value="Enterprise Bespoke Automation Infrastructure">Enterprise Custom (Starting $2,999/mo)</option>
                </select>
              </div>

              <div className="flex items-start space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="consent"
                  required
                  checked={leadForm.consentGiven}
                  onChange={(e) => setLeadForm({ ...leadForm, consentGiven: e.target.checked })}
                  className="mt-0.5 rounded text-orange-600 focus:ring-orange-500 bg-[#0a0b0e] border-zinc-700"
                />
                <label htmlFor="consent" className="text-[11px] text-zinc-400 leading-tight">
                  I agree to receive communications regarding this inquiry. You can opt out at any time.
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-orange-600 hover:bg-orange-500 active:scale-[0.98] text-white font-medium py-2 rounded-lg transition duration-150 mt-2 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]"
              >
                {isLoading ? 'Submitting & Qualifying...' : 'Submit & Connect with Specialist'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
