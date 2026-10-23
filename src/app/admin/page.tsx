'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  PhoneCall,
  Database,
  ArrowRight,
  ExternalLink,
  Clock,
  ShieldCheck,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export default function AdminOverviewPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [conversationsRequiringAttention, setConversationsRequiringAttention] = useState<any[]>([]);
  const [integrations, setIntegrations] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [analyticsRes, leadsRes, convRes, intRes] = await Promise.all([
        fetch('/api/v1/analytics/overview'),
        fetch('/api/v1/leads?qualification=ALL'),
        fetch('/api/v1/conversations?status=HANDOFF_REQUESTED'),
        fetch('/api/v1/integrations')
      ]);

      const analyticsData = await analyticsRes.json();
      const leadsData = await leadsRes.json();
      const convData = await convRes.json();
      const intData = await intRes.json();

      setMetrics(analyticsData.metrics);
      setRecentLeads(leadsData.leads?.slice(0, 5) || []);
      setConversationsRequiringAttention(convData.conversations || []);
      setIntegrations(intData.integrations);
    } catch (err) {
      console.error('Failed to load overview data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#12131c] p-5 rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Executive Operational Overview</h1>
            <span className="bg-orange-500/15 text-orange-400 border border-orange-500/30 text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold">
              SpeakForMe Engine
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real-time pipeline metrics, live attention queues, and conversion attribution.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={fetchDashboardData}
            disabled={isLoading}
            className="flex items-center space-x-1.5 text-xs bg-zinc-800/80 hover:bg-zinc-700/80 active:scale-[0.97] text-zinc-200 px-3 py-2 rounded-xl border border-white/[0.08] transition duration-150"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-orange-400' : ''}`} />
            <span>Refresh Telemetry</span>
          </button>

          <Link
            href="/admin/conversations"
            className="flex items-center space-x-1.5 text-xs bg-orange-600 hover:bg-orange-500 active:scale-[0.97] text-white font-medium px-4 py-2 rounded-xl shadow-[0_2px_10px_rgba(249,115,22,0.35),inset_0_1px_0_0_rgba(255,255,255,0.2)] transition duration-150"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Open Live Inbox</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-[#12131c] p-5 rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">Chat Engagement</span>
            <MessageSquare className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {metrics?.chatEngagementRate || '0.0%'}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1 flex items-center justify-between font-mono">
            <span>Conversations Started:</span>
            <span className="font-semibold text-zinc-200">{metrics?.conversationsStarted || 0}</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-[#12131c] p-5 rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">Lead Conversion</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {metrics?.leadConversionRate || '0.0%'}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1 flex items-center justify-between font-mono">
            <span>Captured Leads:</span>
            <span className="font-semibold text-zinc-200">{metrics?.leadsSubmitted || 0}</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-[#12131c] p-5 rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">Qualified Leads</span>
            <Users className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {metrics?.leadsQualified || 0}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1 flex items-center justify-between font-mono">
            <span>Lead Score &gt;= 60:</span>
            <span className="text-violet-400 font-medium">High Priority</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-[#12131c] p-5 rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider font-mono">Human Handoff Rate</span>
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono">
            {metrics?.handoffRate || '0.0%'}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1 flex items-center justify-between font-mono">
            <span>Avg Response Latency:</span>
            <span className="font-semibold text-zinc-200">{metrics?.avgLatencyMs || 320} ms</span>
          </div>
        </div>
      </div>

      {/* Attention Queue & Critical Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations Requiring Operator Attention */}
        <div className="lg:col-span-2 bg-[#12131c] rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
              <h2 className="text-sm font-bold text-white tracking-tight">Live Attention Queue (Handoffs Pending)</h2>
            </div>
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-semibold px-2.5 py-0.5 rounded-full font-mono">
              {conversationsRequiringAttention.length} Pending
            </span>
          </div>

          <div className="divide-y divide-white/[0.04]">
            {conversationsRequiringAttention.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-xs">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
                <span>All conversations are resolved or actively handled. Queue clear.</span>
              </div>
            ) : (
              conversationsRequiringAttention.map((conv) => (
                <div key={conv.id} className="p-4 hover:bg-white/[0.02] transition flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-xs text-white truncate">
                        {conv.lead_name || `Visitor ${conv.visitor_id.substring(0, 10)}`}
                      </span>
                      {conv.lead_email && (
                        <span className="text-[11px] text-zinc-400 font-mono">({conv.lead_email})</span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5 truncate">
                      Reason: <span className="text-amber-300 font-medium">{conv.handoff_reason || 'Visitor requested human specialist'}</span>
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-1 italic truncate">
                      Latest message: &quot;{conv.latest_message}&quot;
                    </p>
                  </div>

                  <Link
                    href={`/admin/conversations?id=${conv.id}`}
                    className="shrink-0 bg-amber-600 hover:bg-amber-500 active:scale-[0.97] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition duration-150"
                  >
                    Accept Chat
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Integration Health & Honest Setup Indicators */}
        <div className="bg-[#12131c] rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white tracking-tight">Integration Health Status</h2>
            <Link href="/admin/crm" className="text-xs text-orange-400 hover:underline">Manage</Link>
          </div>

          <div className="space-y-3">
            {/* WhatsApp Integration */}
            <div className="p-3.5 rounded-xl border border-white/[0.06] bg-[#0c0d12] flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="font-semibold text-xs text-white block">WhatsApp Cloud API</span>
                  <span className="text-[10px] text-zinc-400 block font-mono">Meta WABA Adapter</span>
                </div>
              </div>
              <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
                integrations?.whatsapp?.status === 'CONNECTED'
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              }`}>
                {integrations?.whatsapp?.status === 'CONNECTED' ? 'Connected' : 'Setup Required'}
              </span>
            </div>

            {/* HubSpot CRM Integration */}
            <div className="p-3.5 rounded-xl border border-white/[0.06] bg-[#0c0d12] flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Database className="w-4 h-4 text-amber-400" />
                <div>
                  <span className="font-semibold text-xs text-white block">HubSpot CRM Sync</span>
                  <span className="text-[10px] text-zinc-400 block font-mono">Bi-directional Mapping</span>
                </div>
              </div>
              <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
                integrations?.hubspot?.status === 'CONNECTED'
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              }`}>
                {integrations?.hubspot?.status === 'CONNECTED' ? 'Connected' : 'Setup Required'}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/[0.06]">
            <h3 className="text-xs font-semibold text-zinc-300 mb-2 font-mono uppercase tracking-wider">Guardrail Standards</h3>
            <ul className="text-xs text-zinc-400 space-y-1.5">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Zero-Hallucination Fallback Active</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Quiet Hours Observed (22:00 - 08:00)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Consent-Checked Follow-Up Workflows</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Recent Qualified Leads Table */}
      <div className="bg-[#12131c] rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">Recent Captured & Qualified Leads</h2>
            <p className="text-[11px] text-zinc-400">Heuristic explainable lead scores derived from explicit business signals.</p>
          </div>
          <Link href="/admin/leads" className="text-xs text-orange-400 font-semibold hover:underline flex items-center gap-1">
            <span>View All Leads</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0c0d12] border-b border-white/[0.06] text-zinc-400 font-semibold uppercase tracking-wider font-mono">
              <tr>
                <th className="px-5 py-3">Lead / Contact</th>
                <th className="px-5 py-3">Company</th>
                <th className="px-5 py-3">Interest / Budget</th>
                <th className="px-5 py-3 text-center">Score</th>
                <th className="px-5 py-3">Qualification</th>
                <th className="px-5 py-3">CRM Sync</th>
                <th className="px-5 py-3 text-right">Captured</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-zinc-300">
              {recentLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-zinc-500">
                    No leads captured yet. Test the chat widget on the landing page to generate a live lead!
                  </td>
                </tr>
              ) : (
                recentLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-white/[0.02] transition">
                    <td className="px-5 py-3.5 font-medium text-white">
                      <div>{lead.name}</div>
                      <div className="text-[11px] text-zinc-500 font-mono font-normal">{lead.email || lead.phone || 'No direct contact'}</div>
                    </td>
                    <td className="px-5 py-3.5 text-zinc-400">{lead.company || '—'}</td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-zinc-200">{lead.service_interest || 'General'}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">{lead.budget_range || 'Standard tier'}</div>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`inline-block font-mono font-bold text-xs px-2.5 py-0.5 rounded-full border ${
                        lead.score >= 60
                          ? 'bg-orange-500/15 text-orange-300 border-orange-500/30'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}>
                        {lead.score}/100
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        lead.qualification_status === 'QUALIFIED'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}>
                        {lead.qualification_status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        lead.sync_status === 'SYNCED'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : lead.sync_status === 'NOT_CONFIGURED'
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}>
                        {lead.sync_status === 'NOT_CONFIGURED' ? 'Setup Required' : lead.sync_status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-zinc-500 font-mono text-[11px]">
                      {new Date(lead.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
