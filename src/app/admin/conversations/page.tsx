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
      <div className="bg-[#12131c] p-3 rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-zinc-500" />
          <span className="text-xs font-semibold text-zinc-300 font-mono">Filter Status:</span>
          {['ALL', 'HANDOFF_REQUESTED', 'HUMAN_ACTIVE', 'AI_ACTIVE', 'RESOLVED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`text-xs px-2.5 py-1 rounded-xl font-medium transition duration-150 ${
                statusFilter === st
                  ? 'bg-orange-600 text-white shadow-[0_2px_8px_rgba(249,115,22,0.35)]'
                  : 'bg-zinc-850 hover:bg-zinc-800 text-zinc-400 border border-white/[0.04]'
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
          className="text-xs bg-zinc-800 hover:bg-zinc-700 active:scale-[0.97] text-zinc-200 px-3 py-1.5 rounded-xl border border-white/[0.08] flex items-center gap-1.5 transition duration-150"
        >
          <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
          <span>Refresh Inbox</span>
        </button>
      </div>

      {/* Main Conversation Workspace: 2-Column layout */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 min-h-0">
        {/* Left List of Conversations (4 cols) */}
        <div className="md:col-span-4 bg-[#12131c] rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] flex flex-col min-h-0 overflow-hidden">
          <div className="p-3 border-b border-white/[0.06] bg-[#0c0d12] text-xs font-semibold text-zinc-300 flex items-center justify-between shrink-0 font-mono">
            <span>Conversations ({conversations.length})</span>
            <span className="text-[10px] text-zinc-500">Live Socket</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04]">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-zinc-500 text-xs">
                No conversations found in this category.
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  className={`p-3.5 cursor-pointer transition duration-150 text-xs ${
                    selectedConvId === conv.id
                      ? 'bg-orange-950/40 border-l-2 border-orange-500'
                      : 'hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-white truncate">
                      {conv.lead_name || `Visitor (${conv.visitor_id.substring(0, 8)})`}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      conv.status === 'HANDOFF_REQUESTED'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'
                        : conv.status === 'HUMAN_ACTIVE'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : conv.status === 'RESOLVED'
                        ? 'bg-zinc-800 text-zinc-500 border-zinc-700'
                        : 'bg-orange-500/20 text-orange-300 border-orange-500/30'
                    }`}>
                      {conv.status.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-zinc-400 line-clamp-1 italic text-[11px] mb-1">
                    {conv.latest_message || 'Session initialized'}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                    <span>Channel: {conv.channel}</span>
                    <span>{new Date(conv.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Active Conversation & Details (8 cols) */}
        <div className="md:col-span-8 bg-[#12131c] rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] flex flex-col min-h-0 overflow-hidden">
          {selectedConvData ? (
            <>
              {/* Conversation Top Header */}
              <div className="px-5 py-3.5 border-b border-white/[0.06] bg-[#0c0d12] flex items-center justify-between shrink-0">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-sm text-white">
                      {selectedConvData.conversation?.lead_name || 'Anonymous Visitor'}
                    </h3>
                    <span className="text-xs text-zinc-500 font-mono">
                      ({selectedConvData.conversation?.visitor_id})
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-3 font-mono">
                    <span>Status: <strong className="text-zinc-200">{selectedConvData.conversation?.status}</strong></span>
                    <span>Assigned: <strong className="text-zinc-200">{selectedConvData.conversation?.assigned_agent_name || 'Unassigned'}</strong></span>
                    {selectedConvData.conversation?.handoff_reason && (
                      <span className="text-amber-400">Reason: {selectedConvData.conversation?.handoff_reason}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {selectedConvData.conversation?.status !== 'HUMAN_ACTIVE' && selectedConvData.conversation?.status !== 'RESOLVED' && (
                    <button
                      onClick={handleAssignToMe}
                      className="text-xs bg-orange-600 hover:bg-orange-500 active:scale-[0.97] text-white font-medium px-3.5 py-1.5 rounded-xl transition duration-150 shadow-[0_2px_8px_rgba(249,115,22,0.3)]"
                    >
                      Assign to Me
                    </button>
                  )}
                  {selectedConvData.conversation?.status !== 'RESOLVED' && (
                    <button
                      onClick={handleResolve}
                      className="text-xs bg-zinc-800 hover:bg-zinc-700 active:scale-[0.97] text-zinc-200 font-medium px-3.5 py-1.5 rounded-xl border border-white/[0.08] transition duration-150"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>

              {/* Message Transcript */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0a0b0e]">
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
                        <div className="w-6 h-6 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 text-zinc-300 text-xs shadow-xs">
                          {msg.senderType === 'AI' ? <Bot className="w-3.5 h-3.5 text-orange-400" /> : <User className="w-3.5 h-3.5 text-emerald-400" />}
                        </div>
                      )}

                      <div
                        className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-sm ${
                          msg.senderType === 'VISITOR'
                            ? 'bg-[#181a24] border border-white/[0.08] text-zinc-100'
                            : msg.senderType === 'AGENT'
                            ? 'bg-orange-600 text-white shadow-[0_2px_10px_rgba(249,115,22,0.35),inset_0_1px_0_0_rgba(255,255,255,0.2)]'
                            : msg.senderType === 'SYSTEM'
                            ? 'bg-amber-950/40 border border-amber-800/40 text-amber-200 text-center w-full'
                            : 'bg-[#181a24] border border-white/[0.08] text-zinc-100'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-semibold mb-1 opacity-75 font-mono">
                          <span>{msg.senderName}</span>
                          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="whitespace-pre-line text-zinc-100">{msg.content}</div>

                        {msg.citations && msg.citations.length > 0 && (
                          <div className="mt-2 pt-1.5 border-t border-white/[0.06] flex flex-wrap gap-1">
                            {msg.citations.map((c: any, i: number) => (
                              <span key={i} className="bg-zinc-800 text-zinc-400 text-[9px] px-1.5 py-0.5 rounded font-mono">
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
              <div className="p-3 bg-[#12131a] border-t border-white/[0.08] shrink-0">
                <form onSubmit={handleSendOperatorReply} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Reply as Human Specialist (Alex Mercer)..."
                    className="flex-1 bg-[#0a0b0e] border border-white/[0.1] text-zinc-100 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition duration-150"
                    disabled={isSending}
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim() || isSending}
                    className="bg-orange-600 hover:bg-orange-500 active:scale-[0.97] disabled:opacity-40 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-[0_2px_8px_rgba(249,115,22,0.3)] transition duration-150 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Reply</span>
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-zinc-500 text-xs">
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
    <Suspense fallback={<div className="p-6 text-xs text-zinc-500">Loading conversation workspace...</div>}>
      <ConversationsAdminContent />
    </Suspense>
  );
}
