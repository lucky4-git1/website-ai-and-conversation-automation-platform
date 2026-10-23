'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  MessageSquare,
  User,
  Bot,
  Send,
  CheckCircle2,
  Clock,
  Shield,
  Search,
  Filter,
  AlertCircle,
  Building2,
  Mail,
  Phone,
  RefreshCw
} from 'lucide-react';

function ConversationsAdminContent() {
  const searchParams = useSearchParams();
  const urlConvId = searchParams.get('id');

  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(urlConvId);
  const [selectedConvData, setSelectedConvData] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [replyText, setReplyText] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async () => {
    try {
      const res = await fetch(`/api/v1/conversations?status=${statusFilter}`);
      const data = await res.json();
      setConversations(data.conversations || []);

      if (!selectedConvId && data.conversations?.length > 0) {
        setSelectedConvId(data.conversations[0].id);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  const fetchConversationDetail = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/conversations/${id}`);
      const data = await res.json();
      setSelectedConvData(data);
    } catch (err) {
      console.error('Failed to load conversation details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [statusFilter]);

  useEffect(() => {
    if (selectedConvId) {
      fetchConversationDetail(selectedConvId);
    }
  }, [selectedConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConvData?.messages]);

  const handleSendOperatorReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedConvId || isSending) return;

    setIsSending(true);
    try {
      const res = await fetch(`/api/v1/conversations/${selectedConvId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REPLY',
          content: replyText,
          userId: 'user_admin_01',
          operatorName: 'Alex Mercer (Lead Architect)'
        })
      });

      const data = await res.json();
      if (data.success) {
        setReplyText('');
        await fetchConversationDetail(selectedConvId);
        await fetchConversations();
      }
    } catch (err) {
      console.error('Failed to send operator reply:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleResolve = async () => {
    if (!selectedConvId) return;
    try {
      await fetch(`/api/v1/conversations/${selectedConvId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RESOLVE' })
      });
      await fetchConversationDetail(selectedConvId);
      await fetchConversations();
    } catch (err) {
      console.error('Failed to resolve conversation:', err);
    }
  };

  const handleAssignToMe = async () => {
    if (!selectedConvId) return;
    try {
      await fetch(`/api/v1/conversations/${selectedConvId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ASSIGN', userId: 'user_admin_01' })
      });
      await fetchConversationDetail(selectedConvId);
      await fetchConversations();
    } catch (err) {
      console.error('Failed to assign conversation:', err);
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col space-y-4 max-w-7xl mx-auto">
      {/* Top Filter Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-700">Filter Status:</span>
          {['ALL', 'HANDOFF_REQUESTED', 'HUMAN_ACTIVE', 'AI_ACTIVE', 'RESOLVED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition ${
                statusFilter === st
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            fetchConversations();
            if (selectedConvId) fetchConversationDetail(selectedConvId);
          }}
          className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5 transition"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Refresh Inbox</span>
        </button>
      </div>

      {/* Main Conversation Workspace: 2-Column or 3-Column layout */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 min-h-0">
        {/* Left List of Conversations (4 cols) */}
        <div className="md:col-span-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col min-h-0 overflow-hidden">
          <div className="p-3 border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 flex items-center justify-between shrink-0">
            <span>Conversations ({conversations.length})</span>
            <span className="text-[11px] text-slate-400">Real-time Stream</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                No conversations found in this category.
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  className={`p-3.5 cursor-pointer transition text-xs ${
                    selectedConvId === conv.id
                      ? 'bg-sky-50/80 border-l-4 border-sky-600'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-900 truncate">
                      {conv.lead_name || `Visitor (${conv.visitor_id.substring(0, 8)})`}
                    </span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                      conv.status === 'HANDOFF_REQUESTED'
                        ? 'bg-amber-100 text-amber-800 animate-pulse'
                        : conv.status === 'HUMAN_ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : conv.status === 'RESOLVED'
                        ? 'bg-slate-100 text-slate-500'
                        : 'bg-sky-100 text-sky-800'
                    }`}>
                      {conv.status.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-slate-500 line-clamp-1 italic text-[11px] mb-1">
                    {conv.latest_message || 'Session initialized'}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Channel: {conv.channel}</span>
                    <span>{new Date(conv.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Active Conversation & Details (8 cols) */}
        <div className="md:col-span-8 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col min-h-0 overflow-hidden">
          {selectedConvData ? (
            <>
              {/* Conversation Top Header */}
              <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-sm text-slate-900">
                      {selectedConvData.conversation?.lead_name || 'Anonymous Visitor'}
                    </h3>
                    <span className="text-xs text-slate-400 font-mono">
                      ({selectedConvData.conversation?.visitor_id})
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-3">
                    <span>Status: <strong className="text-slate-800">{selectedConvData.conversation?.status}</strong></span>
                    <span>Assigned: <strong className="text-slate-800">{selectedConvData.conversation?.assigned_agent_name || 'Unassigned'}</strong></span>
                    {selectedConvData.conversation?.handoff_reason && (
                      <span className="text-amber-700">Reason: {selectedConvData.conversation?.handoff_reason}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {selectedConvData.conversation?.status !== 'HUMAN_ACTIVE' && selectedConvData.conversation?.status !== 'RESOLVED' && (
                    <button
                      onClick={handleAssignToMe}
                      className="text-xs bg-sky-600 hover:bg-sky-700 text-white font-medium px-3 py-1.5 rounded-lg transition shadow-2xs"
                    >
                      Assign to Me
                    </button>
                  )}
                  {selectedConvData.conversation?.status !== 'RESOLVED' && (
                    <button
                      onClick={handleResolve}
                      className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-3 py-1.5 rounded-lg border border-slate-200 transition"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>

              {/* Message Transcript */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
                {selectedConvData.messages?.map((msg: any) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.senderType === 'VISITOR'
                        ? 'items-start'
                        : msg.senderType === 'AGENT'
                        ? 'items-end'
                        : msg.senderType === 'SYSTEM'
                        ? 'items-center'
                        : 'items-start'
                    }`}
                  >
                    <div className="flex items-end gap-2 max-w-[85%]">
                      {msg.senderType !== 'AGENT' && msg.senderType !== 'SYSTEM' && (
                        <div className="w-6 h-6 rounded-full bg-sky-100 border border-sky-300 flex items-center justify-center shrink-0 text-sky-700 text-xs">
                          {msg.senderType === 'AI' ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                        </div>
                      )}

                      <div
                        className={`rounded-xl px-4 py-2.5 text-xs leading-relaxed shadow-2xs ${
                          msg.senderType === 'VISITOR'
                            ? 'bg-white border border-slate-200 text-slate-800'
                            : msg.senderType === 'AGENT'
                            ? 'bg-sky-600 text-white'
                            : msg.senderType === 'SYSTEM'
                            ? 'bg-amber-50 border border-amber-200 text-amber-900 text-center w-full'
                            : 'bg-white border border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-semibold mb-1 opacity-75">
                          <span>{msg.senderName}</span>
                          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="whitespace-pre-line">{msg.content}</div>

                        {msg.citations && msg.citations.length > 0 && (
                          <div className="mt-2 pt-1.5 border-t border-slate-100 flex flex-wrap gap-1">
                            {msg.citations.map((c: any, i: number) => (
                              <span key={i} className="bg-slate-100 text-slate-600 text-[9px] px-1.5 py-0.5 rounded font-mono">
                                {c.title}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Live Operator Input Bar */}
              <div className="p-3 bg-white border-t border-slate-200 shrink-0">
                <form onSubmit={handleSendOperatorReply} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Reply as Human Operator (Alex Mercer)..."
                    className="flex-1 bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
                    disabled={isSending}
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim() || isSending}
                    className="bg-sky-600 hover:bg-sky-700 disabled:opacity-40 text-white px-4 py-2.5 rounded-lg text-xs font-medium shadow-2xs transition flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Reply</span>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
              Select a conversation from the left to view the live transcript and respond.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ConversationsAdminPage() {
  return (
    <Suspense fallback={<div className="p-6 text-xs text-slate-500">Loading conversation workspace...</div>}>
      <ConversationsAdminContent />
    </Suspense>
  );
}
