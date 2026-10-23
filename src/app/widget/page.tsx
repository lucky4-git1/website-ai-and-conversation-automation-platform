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
    serviceInterest: 'Conversational AI',
    budgetRange: '$1,000 - $3,000',
    consentGiven: true
  });
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadScoreResult, setLeadScoreResult] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize visitor session from localStorage
  useEffect(() => {
    let vid = localStorage.getItem('apex_visitor_id');
    if (!vid) {
      vid = 'vis_' + Math.random().toString(36).substring(2, 10);
      localStorage.setItem('apex_visitor_id', vid);
    }
    setVisitorId(vid);

    // Initial greeting
    const initialGreeting: Message = {
      id: 'greeting_01',
      senderType: 'AI',
      senderName: 'Apex AI Concierge',
      content: 'Hi there! 👋 Welcome to Apex Enterprise Solutions. I am your grounded AI assistant. How can I help you accelerate your business operations today?',
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
          siteId: 'site_apex_live_01',
          tenantId: 'tenant_default_01',
          conversationId,
          visitorId,
          content: text
        })
      });

      const data = await res.json();
      if (data.conversationId) {
        setConversationId(data.conversationId);
      }
      if (data.status) {
        setStatus(data.status);
      }

      if (data.reply) {
        const botMsg: Message = {
          id: data.reply.id || 'bot_' + Date.now(),
          senderType: 'AI',
          senderName: 'Apex AI Concierge',
          content: data.reply.content,
          citations: data.reply.citations,
          recommendedItems: data.reply.recommendedItems,
          suggestedAction: data.reply.suggestedAction,
          createdAt: data.reply.createdAt || new Date().toISOString()
        };
        setMessages((prev) => [...prev, botMsg]);

        // Prompt lead capture if high intent detected
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
        content: 'Connection interrupted. Please verify your network and retry.',
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
          reason: 'Visitor clicked live operator handoff in widget header'
        })
      });
      const data = await res.json();
      if (data.success) {
        setStatus('HANDOFF_REQUESTED');
        const systemMsg: Message = {
          id: 'sys_' + Date.now(),
          senderType: 'SYSTEM',
          senderName: 'Live Operator Queue',
          content: 'You have been placed in the priority human operator queue. An enterprise solution specialist will join this conversation shortly.',
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
          content: `Thank you, ${leadForm.name || 'there'}! Your information has been registered. Your lead priority score is **${data.score}/100** (${data.qualificationStatus}). A specialist will reach out to you directly.`,
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
    <div className="flex flex-col h-screen w-full bg-slate-50 text-slate-900 overflow-hidden font-sans select-text border border-slate-200">
      {/* Header */}
      <header className="bg-sky-700 text-white px-4 py-3 flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-sky-900 border-2 border-sky-300 flex items-center justify-center text-sky-100 font-bold shadow-inner">
              <Bot className="w-6 h-6 text-sky-200" />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-sky-700 rounded-full"></span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-semibold text-sm tracking-wide">Apex AI Concierge</h1>
              <span className="bg-sky-800 text-sky-200 text-[10px] font-medium px-1.5 py-0.5 rounded uppercase tracking-wider">Grounded</span>
            </div>
            <p className="text-xs text-sky-200 flex items-center gap-1">
              {status === 'HANDOFF_REQUESTED' ? (
                <span className="text-amber-200 font-medium animate-pulse">● Waiting for live agent...</span>
              ) : status === 'HUMAN_ACTIVE' ? (
                <span className="text-emerald-200 font-medium">● Connected with Live Specialist</span>
              ) : (
                <span>Online • 24/7 Knowledge Verified</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {status === 'AI_ACTIVE' && (
            <button
              onClick={handleRequestHandoff}
              className="text-xs bg-sky-800 hover:bg-sky-900 border border-sky-500 text-sky-100 px-2.5 py-1 rounded-md flex items-center gap-1 transition"
              title="Request a human operator"
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Human Agent</span>
            </button>
          )}

          <button
            onClick={handleClose}
            className="text-sky-200 hover:text-white hover:bg-sky-800 p-1 rounded-md transition"
            aria-label="Close widget"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Status Bar */}
      {status === 'HANDOFF_REQUESTED' && (
        <div className="bg-amber-50 border-b border-amber-200 px-3 py-2 flex items-center justify-between text-xs text-amber-800 shrink-0">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Human operator requested. Queue position: #1</span>
          </div>
          {!leadSubmitted && (
            <button
              onClick={() => setShowLeadModal(true)}
              className="underline font-semibold hover:text-amber-900 ml-2"
            >
              Leave Details
            </button>
          )}
        </div>
      )}

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.senderType === 'VISITOR' ? 'items-end' : 'items-start'
            }`}
          >
            <div className="flex items-end gap-2 max-w-[88%]">
              {msg.senderType !== 'VISITOR' && (
                <div className="w-7 h-7 rounded-full bg-sky-100 border border-sky-300 flex items-center justify-center shrink-0 text-sky-700">
                  {msg.senderType === 'AI' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4 text-emerald-700" />}
                </div>
              )}

              <div
                className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                  msg.senderType === 'VISITOR'
                    ? 'bg-sky-600 text-white rounded-br-none'
                    : msg.senderType === 'SYSTEM'
                    ? 'bg-amber-50 border border-amber-200 text-amber-900 rounded-lg w-full text-xs'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                }`}
              >
                {/* Message Sender Name */}
                {msg.senderType !== 'VISITOR' && msg.senderType !== 'SYSTEM' && (
                  <div className="text-[11px] font-semibold text-slate-400 mb-1">
                    {msg.senderName}
                  </div>
                )}

                <div className="whitespace-pre-line">{msg.content}</div>

                {/* Grounded Source Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                    {msg.citations.map((c, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-medium"
                        title={c.snippet}
                      >
                        <Shield className="w-2.5 h-2.5 text-sky-600" />
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
                        className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1.5 hover:border-sky-300 transition"
                      >
                        <div className="flex items-center justify-between font-semibold text-slate-900">
                          <span>{item.name}</span>
                          <span className="text-sky-600 font-bold">{item.priceDisplay}</span>
                        </div>
                        <p className="text-slate-600 text-[11px]">{item.description}</p>
                        <ul className="text-slate-500 text-[11px] list-disc list-inside">
                          {item.features.slice(0, 2).map((f, i) => (
                            <li key={i}>{f}</li>
                          ))}
                        </ul>
                        <button
                          onClick={() => {
                            setLeadForm((prev) => ({ ...prev, serviceInterest: item.name }));
                            setShowLeadModal(true);
                          }}
                          className="w-full mt-1 bg-sky-600 hover:bg-sky-700 text-white font-medium py-1 px-2 rounded-lg flex items-center justify-center gap-1 transition"
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

            <span className="text-[10px] text-slate-400 mt-1 px-1">
              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center space-x-2 text-slate-400 text-xs py-2">
            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center animate-pulse">
              <Bot className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <span className="italic">Verifying grounded business knowledge...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Questions */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 bg-slate-100/70 border-t border-slate-200 shrink-0">
          <div className="text-[11px] font-medium text-slate-500 mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-sky-600" /> Suggested questions:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {suggestedChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip)}
                className="bg-white hover:bg-sky-50 hover:border-sky-300 text-slate-700 border border-slate-200 text-xs px-2.5 py-1 rounded-full text-left transition shadow-2xs"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <footer className="p-3 bg-white border-t border-slate-200 shrink-0">
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
            placeholder={status === 'HUMAN_ACTIVE' ? 'Type your message to human specialist...' : 'Ask about services, pricing, SLA, or CRM sync...'}
            className="flex-1 bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="bg-sky-600 hover:bg-sky-700 disabled:opacity-40 text-white p-2.5 rounded-xl shadow-sm transition flex items-center justify-center"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-2 text-center">
          <p className="text-[10px] text-slate-400">
            Strict Zero-Hallucination Grounding • Encrypted & Isolated Session
          </p>
        </div>
      </footer>

      {/* Lead Qualification Modal / Drawer */}
      {showLeadModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 z-50">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-sky-700 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-sky-200" />
                <h3 className="font-semibold text-sm">Priority Consultation & Quote</h3>
              </div>
              <button
                onClick={() => setShowLeadModal(false)}
                className="text-sky-200 hover:text-white p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLeadSubmit} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={leadForm.name}
                  onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                  placeholder="e.g. Sarah Connor"
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Work Email Address</label>
                <input
                  type="email"
                  required
                  value={leadForm.email}
                  onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                  placeholder="sarah@company.com"
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Phone / WhatsApp (Optional)</label>
                <input
                  type="tel"
                  value={leadForm.phone}
                  onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                  placeholder="+1 (555) 019-2834"
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Company / Organization</label>
                <input
                  type="text"
                  value={leadForm.company}
                  onChange={(e) => setLeadForm({ ...leadForm, company: e.target.value })}
                  placeholder="Cyberdyne Systems"
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Target Package Interest</label>
                <select
                  value={leadForm.serviceInterest}
                  onChange={(e) => setLeadForm({ ...leadForm, serviceInterest: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
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
                  className="mt-0.5 rounded text-sky-600 focus:ring-sky-500"
                />
                <label htmlFor="consent" className="text-[11px] text-slate-600 leading-tight">
                  I agree to receive communications regarding this inquiry in accordance with the Privacy Policy. You can opt out at any time.
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-medium py-2 rounded-lg transition mt-2 shadow-sm"
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
