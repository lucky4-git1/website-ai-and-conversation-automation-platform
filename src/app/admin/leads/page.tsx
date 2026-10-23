'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Database,
  RefreshCw,
  Building2,
  Mail,
  Phone,
  Clock,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  X
} from 'lucide-react';

export default function LeadsAdminPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [leadDetail, setLeadDetail] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [qualificationFilter, setQualificationFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/leads?qualification=${qualificationFilter}&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setLeads(data.leads || []);
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLeadDetail = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/leads/${id}`);
      const data = await res.json();
      setLeadDetail(data);
    } catch (err) {
      console.error('Failed to fetch lead details:', err);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [qualificationFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLeads();
  };

  const handleSelectLead = (lead: any) => {
    setSelectedLead(lead);
    setSyncFeedback(null);
    fetchLeadDetail(lead.id);
  };

  const handleResyncCRM = async (leadId: string) => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await fetch(`/api/v1/leads/${leadId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RESYNC_CRM' })
      });
      const data = await res.json();
      if (data.success) {
        setSyncFeedback(`Successfully synchronized to HubSpot CRM (Record ID: ${data.result.externalId})`);
      } else {
        setSyncFeedback(`Sync failed or unconfigured: ${data.result?.errorMessage || 'Check CRM credentials in Integrations'}`);
      }
      await fetchLeadDetail(leadId);
      await fetchLeads();
    } catch (err: any) {
      setSyncFeedback(`Sync error: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateStatus = async (leadId: string, newStatus: string) => {
    try {
      await fetch(`/api/v1/leads/${leadId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'UPDATE_STATUS', qualificationStatus: newStatus })
      });
      await fetchLeadDetail(leadId);
      await fetchLeads();
    } catch (err) {
      console.error('Status update error:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#12131c] p-6 rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
              Visitor Conversion Engine
            </span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Lead Qualification & CRM Synchronization</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Deterministic intent scoring, HubSpot CRM sync queue, and consent audit ledger.
          </p>
        </div>

        <button
          onClick={fetchLeads}
          disabled={isLoading}
          className="flex items-center space-x-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 active:scale-[0.98] text-zinc-200 px-3.5 py-2.5 rounded-xl border border-white/[0.08] transition duration-150"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-orange-400' : ''}`} />
          <span>Refresh Leads</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#12131c] p-4 sm:p-5 rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] flex flex-wrap items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or company..."
              className="w-full pl-9 pr-3 py-2 bg-[#0a0b0e] border border-zinc-700/80 text-white rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 placeholder:text-zinc-600"
            />
          </div>
          <button type="submit" className="bg-orange-600 hover:bg-orange-500 active:scale-[0.98] text-white text-xs px-4 py-2 rounded-xl transition duration-150 font-medium shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]">
            Search
          </button>
        </form>

        <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
          <Filter className="w-3.5 h-3.5 text-zinc-500 mr-1" />
          <span className="text-xs text-zinc-400 font-mono text-[11px] uppercase mr-1">Status:</span>
          {['ALL', 'QUALIFIED', 'NEW', 'CONTACTED', 'CLOSED_WON'].map((st) => (
            <button
              key={st}
              onClick={() => setQualificationFilter(st)}
              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition duration-150 border ${
                qualificationFilter === st
                  ? 'bg-orange-600 text-white border-orange-500 shadow-[0_2px_8px_rgba(249,115,22,0.35)]'
                  : 'bg-[#0a0b0e] border-zinc-700/80 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Leads Table */}
      <div className="bg-[#12131c] rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0e0f15] border-b border-white/[0.06] text-zinc-400 font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Lead Contact</th>
                <th className="px-6 py-3.5">Company</th>
                <th className="px-6 py-3.5">Service Interest</th>
                <th className="px-6 py-3.5 text-center">Intent Score</th>
                <th className="px-6 py-3.5">Qualification</th>
                <th className="px-6 py-3.5">CRM Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-zinc-300">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-zinc-500 font-mono">
                    No leads found matching current filters.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-white/[0.02] transition duration-150">
                    <td className="px-6 py-4 font-medium text-white">
                      <div>{lead.name}</div>
                      <div className="text-[11px] text-zinc-400 font-mono font-normal mt-0.5">{lead.email || lead.phone || 'No direct contact'}</div>
                    </td>
                    <td className="px-6 py-4 text-zinc-400">{lead.company || '—'}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-zinc-200">{lead.service_interest || 'General'}</div>
                      <div className="text-[10px] text-zinc-400 font-mono">{lead.budget_range || 'Standard'}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block font-mono font-bold text-xs px-2.5 py-0.5 rounded-full border ${
                        lead.score >= 60 
                          ? 'bg-orange-500/20 text-orange-300 border-orange-500/30' 
                          : 'bg-zinc-800 text-zinc-400 border-white/[0.08]'
                      }`}>
                        {lead.score}/100
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border font-mono ${
                        lead.qualification_status === 'QUALIFIED'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-zinc-800 text-zinc-400 border-white/[0.08]'
                      }`}>
                        {lead.qualification_status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border font-mono ${
                        lead.sync_status === 'SYNCED'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : lead.sync_status === 'NOT_CONFIGURED'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-zinc-800 text-zinc-400 border-white/[0.08]'
                      }`}>
                        {lead.sync_status === 'NOT_CONFIGURED' ? 'Setup Required' : lead.sync_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleSelectLead(lead)}
                        className="bg-zinc-800 hover:bg-zinc-700 active:scale-[0.98] text-zinc-200 text-xs font-medium px-3 py-1.5 rounded-lg border border-white/[0.08] transition duration-150"
                      >
                        Inspect Breakdown
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead Detail & Explainable Scoring Drawer */}
      {selectedLead && leadDetail && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-end z-50">
          <div className="bg-[#12131c] border-l border-white/[0.1] w-full max-w-lg h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="bg-[#151724] border-b border-white/[0.08] text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-sm tracking-wide">{leadDetail.lead?.name}</h3>
                <span className="text-[11px] text-zinc-400 font-mono">{leadDetail.lead?.id}</span>
              </div>
              <button onClick={() => setSelectedLead(null)} className="text-zinc-400 hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              {/* Feedback Alert */}
              {syncFeedback && (
                <div className={`p-3 rounded-xl border text-xs ${
                  syncFeedback.includes('Successfully')
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                }`}>
                  {syncFeedback}
                </div>
              )}

              {/* Explainable Lead Score Card */}
              <div className="bg-[#151724] border border-orange-500/30 rounded-xl p-5 space-y-3 shadow-[0_2px_12px_rgba(249,115,22,0.15)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-orange-400" />
                    <span className="font-bold text-white">Explainable Intent Score</span>
                  </div>
                  <span className="font-mono text-base font-black text-orange-400">
                    {leadDetail.lead?.score} / 100
                  </span>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Contributing Heuristics:</div>
                  <ul className="space-y-1 text-zinc-300">
                    {leadDetail.lead?.scoreBreakdown?.reasons?.map((r: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Contact Information & Consent Records */}
              <div className="bg-[#0a0b0e] border border-white/[0.08] rounded-xl p-5 space-y-3">
                <span className="font-bold text-white block">Contact & Profile Data</span>
                <div className="grid grid-cols-2 gap-3 text-zinc-300">
                  <div>
                    <span className="text-[10px] text-zinc-400 font-mono block">Email</span>
                    <span className="font-medium text-white break-all">{leadDetail.lead?.email || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 font-mono block">Phone</span>
                    <span className="font-medium text-white">{leadDetail.lead?.phone || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 font-mono block">Company</span>
                    <span className="font-medium text-white">{leadDetail.lead?.company || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 font-mono block">Timeline</span>
                    <span className="font-medium text-white">{leadDetail.lead?.timeline || 'Immediate'}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/[0.08]">
                  <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider block mb-2">Consent & Privacy Ledger</span>
                  {leadDetail.consentRecords?.length > 0 ? (
                    leadDetail.consentRecords.map((c: any) => (
                      <div key={c.id} className="text-[11px] text-zinc-300 flex items-center justify-between py-1 border-b border-white/[0.04]">
                        <span>{c.channel} ({c.purpose}):</span>
                        <span className={`font-semibold font-mono text-[10px] ${c.status === 'OPTED_IN' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {c.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="text-zinc-500 italic">No marketing consent stored.</span>
                  )}
                </div>
              </div>

              {/* Activity Timeline */}
              <div className="space-y-3">
                <span className="font-bold text-white block">Activity & Conversion Timeline</span>
                <div className="border-l border-zinc-700 ml-2 space-y-3 pl-3.5">
                  {leadDetail.activities?.map((act: any) => (
                    <div key={act.id} className="relative">
                      <div className="w-2 h-2 rounded-full bg-orange-500 absolute -left-[18px] top-1"></div>
                      <span className="text-[10px] text-zinc-500 font-mono block">
                        {new Date(act.created_at).toLocaleString()} • {act.activity_type}
                      </span>
                      <p className="text-zinc-300 font-medium text-xs mt-0.5">{act.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="p-4 bg-[#151724] border-t border-white/[0.08] flex items-center justify-between gap-3 shrink-0">
              <button
                onClick={() => handleResyncCRM(selectedLead.id)}
                disabled={isSyncing}
                className="flex-1 bg-amber-600 hover:bg-amber-500 active:scale-[0.98] text-white font-medium py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition duration-150 shadow-sm"
              >
                <Database className="w-3.5 h-3.5" />
                <span>{isSyncing ? 'Synchronizing...' : 'Resync to HubSpot CRM'}</span>
              </button>

              <button
                onClick={() => handleUpdateStatus(selectedLead.id, 'QUALIFIED')}
                className="bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-medium py-2.5 px-3 rounded-xl transition duration-150 shadow-sm"
              >
                Mark Qualified
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
