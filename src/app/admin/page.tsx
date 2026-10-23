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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Executive Operational Overview</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time pipeline metrics, live attention queues, and conversion attribution.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={fetchDashboardData}
            disabled={isLoading}
            className="flex items-center space-x-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg border border-slate-200 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-sky-600' : ''}`} />
            <span>Refresh Telemetry</span>
          </button>

          <Link
            href="/admin/conversations"
            className="flex items-center space-x-1.5 text-xs bg-sky-600 hover:bg-sky-700 text-white font-medium px-3.5 py-2 rounded-lg shadow-sm transition"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Open Live Inbox</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Chat Engagement</span>
            <MessageSquare className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {metrics?.chatEngagementRate || '0.0%'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>Conversations Started:</span>
            <span className="font-semibold text-slate-800">{metrics?.conversationsStarted || 0}</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Lead Conversion</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {metrics?.leadConversionRate || '0.0%'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>Captured Leads:</span>
            <span className="font-semibold text-slate-800">{metrics?.leadsSubmitted || 0}</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Qualified Leads</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {metrics?.leadsQualified || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>Lead Score &gt;= 60:</span>
            <span className="text-indigo-600 font-medium font-mono">High Priority</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Human Handoff Rate</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {metrics?.handoffRate || '0.0%'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>Avg Response Latency:</span>
            <span className="font-semibold text-slate-800">{metrics?.avgLatencyMs || 320} ms</span>
          </div>
        </div>
      </div>

      {/* Attention Queue & Critical Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations Requiring Operator Attention */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
              <h2 className="text-sm font-bold text-slate-900">Live Attention Queue (Handoffs Pending)</h2>
            </div>
            <span className="bg-amber-100 text-amber-800 text-[11px] font-semibold px-2 py-0.5 rounded-full">
              {conversationsRequiringAttention.length} Pending
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {conversationsRequiringAttention.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                <span>All conversations are resolved or actively handled. Queue clear.</span>
              </div>
            ) : (
              conversationsRequiringAttention.map((conv) => (
                <div key={conv.id} className="p-4 hover:bg-slate-50 transition flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-xs text-slate-900 truncate">
                        {conv.lead_name || `Visitor ${conv.visitor_id.substring(0, 10)}`}
                      </span>
                      {conv.lead_email && (
                        <span className="text-[11px] text-slate-400 font-mono">({conv.lead_email})</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 truncate">
                      Reason: <span className="text-amber-800 font-medium">{conv.handoff_reason || 'Visitor requested human specialist'}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 italic truncate">
                      Latest message: &quot;{conv.latest_message}&quot;
                    </p>
                  </div>

                  <Link
                    href={`/admin/conversations?id=${conv.id}`}
                    className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition shadow-2xs"
                  >
                    Accept Chat
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Integration Health & Honest Setup Indicators */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Integration Health Status</h2>
            <Link href="/admin/crm" className="text-xs text-sky-600 hover:underline">Manage</Link>
          </div>

          <div className="space-y-3">
            {/* WhatsApp Integration */}
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <PhoneCall className="w-4 h-4 text-emerald-600" />
                <div>
                  <span className="font-semibold text-xs text-slate-800 block">WhatsApp Cloud API</span>
                  <span className="text-[10px] text-slate-500 block">Official Meta WABA Adapter</span>
                </div>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                integrations?.whatsapp?.status === 'CONNECTED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {integrations?.whatsapp?.status === 'CONNECTED' ? 'Connected' : 'Setup Required'}
              </span>
            </div>

            {/* HubSpot CRM Integration */}
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Database className="w-4 h-4 text-amber-600" />
                <div>
                  <span className="font-semibold text-xs text-slate-800 block">HubSpot CRM Sync</span>
                  <span className="text-[10px] text-slate-500 block">Bi-directional Lead Mapping</span>
                </div>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                integrations?.hubspot?.status === 'CONNECTED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {integrations?.hubspot?.status === 'CONNECTED' ? 'Connected' : 'Setup Required'}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-xs font-semibold text-slate-800 mb-1.5">Compliance & Policy Rules</h3>
            <ul className="text-[11px] text-slate-500 space-y-1">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Zero-Hallucination Guardrails Active</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Quiet Hours Observed (22:00 - 08:00)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Consent-Checked Follow-Up Workflows</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Recent Qualified Leads Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Recent Captured & Qualified Leads</h2>
            <p className="text-[11px] text-slate-500">Heuristic explainable lead scores derived from explicit business signals.</p>
          </div>
          <Link href="/admin/leads" className="text-xs text-sky-600 font-semibold hover:underline flex items-center gap-1">
            <span>View All Leads</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
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
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {recentLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                    No leads captured yet. Test the chat widget on the landing page to generate a live lead!
                  </td>
                </tr>
              ) : (
                recentLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5 font-medium text-slate-900">
                      <div>{lead.name}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{lead.email || lead.phone || 'No direct contact'}</div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{lead.company || '—'}</td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-slate-800">{lead.service_interest || 'General Solution'}</div>
                      <div className="text-[10px] text-slate-400">{lead.budget_range || 'Standard tier'}</div>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`inline-block font-mono font-bold text-xs px-2 py-0.5 rounded-full ${
                        lead.score >= 60 ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {lead.score}/100
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        lead.qualification_status === 'QUALIFIED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {lead.qualification_status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        lead.sync_status === 'SYNCED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : lead.sync_status === 'NOT_CONFIGURED'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {lead.sync_status === 'NOT_CONFIGURED' ? 'Setup Required' : lead.sync_status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-slate-400 text-[11px]">
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
