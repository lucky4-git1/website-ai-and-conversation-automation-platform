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
      console.error('Failed to update status:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Lead Qualification & CRM Synchronization</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent heuristic scoring, progressive profiling history, and verified CRM sync queue.
          </p>
        </div>

        <button
          onClick={fetchLeads}
          disabled={isLoading}
          className="flex items-center space-x-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg border border-slate-200 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-sky-600' : ''}`} />
          <span>Refresh Leads</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or company..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <button type="submit" className="bg-sky-600 hover:bg-sky-700 text-white text-xs px-3.5 py-2 rounded-lg transition font-medium">
            Search
          </button>
        </form>

        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Status:</span>
          {['ALL', 'QUALIFIED', 'NEW', 'CONTACTED', 'CLOSED_WON'].map((st) => (
            <button
              key={st}
              onClick={() => setQualificationFilter(st)}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition ${
                qualificationFilter === st
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Leads Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Lead Contact</th>
                <th className="px-5 py-3">Company</th>
                <th className="px-5 py-3">Service Interest</th>
                <th className="px-5 py-3 text-center">Intent Score</th>
                <th className="px-5 py-3">Qualification</th>
                <th className="px-5 py-3">CRM Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                    No leads found matching current filters.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5 font-medium text-slate-900">
                      <div>{lead.name}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{lead.email || lead.phone || 'No direct contact'}</div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{lead.company || '—'}</td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-slate-800">{lead.service_interest || 'General'}</div>
                      <div className="text-[10px] text-slate-400">{lead.budget_range || 'Standard'}</div>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`inline-block font-mono font-bold text-xs px-2.5 py-0.5 rounded-full ${
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
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleSelectLead(lead)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium px-2.5 py-1.5 rounded-md border border-slate-200 transition"
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-end z-50">
          <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-sm tracking-wide">{leadDetail.lead?.name}</h3>
                <span className="text-[11px] text-slate-400 font-mono">{leadDetail.lead?.id}</span>
              </div>
              <button onClick={() => setSelectedLead(null)} className="text-slate-400 hover:text-white p-1 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
              {/* Feedback Alert */}
              {syncFeedback && (
                <div className={`p-3 rounded-lg border text-xs ${
                  syncFeedback.includes('Successfully')
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}>
                  {syncFeedback}
                </div>
              )}

              {/* Explainable Lead Score Card */}
              <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                    <span className="font-bold text-slate-900">Explainable Intent Score</span>
                  </div>
                  <span className="font-mono text-base font-black text-indigo-700">
                    {leadDetail.lead?.score} / 100
                  </span>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-semibold text-slate-700">Contributing Heuristics:</div>
                  <ul className="space-y-1 text-slate-600">
                    {leadDetail.lead?.scoreBreakdown?.reasons?.map((r: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Contact Information & Consent Records */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
                <span className="font-bold text-slate-900 block">Contact & Profile Data</span>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Email</span>
                    <span className="font-medium text-slate-800">{leadDetail.lead?.email || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Phone</span>
                    <span className="font-medium text-slate-800">{leadDetail.lead?.phone || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Company</span>
                    <span className="font-medium text-slate-800">{leadDetail.lead?.company || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Timeline</span>
                    <span className="font-medium text-slate-800">{leadDetail.lead?.timeline || 'Immediate'}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[10px] text-slate-400 block mb-1">Consent & Privacy Ledger</span>
                  {leadDetail.consentRecords?.length > 0 ? (
                    leadDetail.consentRecords.map((c: any) => (
                      <div key={c.id} className="text-[11px] text-slate-600 flex items-center justify-between py-0.5">
                        <span>{c.channel} ({c.purpose}):</span>
                        <span className={`font-semibold ${c.status === 'OPTED_IN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {c.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="text-slate-400 italic">No marketing consent stored.</span>
                  )}
                </div>
              </div>

              {/* Activity Timeline */}
              <div className="space-y-2">
                <span className="font-bold text-slate-900 block">Activity & Conversion Timeline</span>
                <div className="border-l-2 border-slate-200 ml-2 space-y-3 pl-3">
                  {leadDetail.activities?.map((act: any) => (
                    <div key={act.id} className="relative">
                      <div className="w-2 h-2 rounded-full bg-sky-600 absolute -left-[17px] top-1"></div>
                      <span className="text-[10px] text-slate-400 block">
                        {new Date(act.created_at).toLocaleString()} • {act.activity_type}
                      </span>
                      <p className="text-slate-700 font-medium">{act.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
              <button
                onClick={() => handleResyncCRM(selectedLead.id)}
                disabled={isSyncing}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition shadow-2xs"
              >
                <Database className="w-3.5 h-3.5" />
                <span>{isSyncing ? 'Synchronizing...' : 'Resync to HubSpot CRM'}</span>
              </button>

              <button
                onClick={() => handleUpdateStatus(selectedLead.id, 'QUALIFIED')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-3 rounded-lg transition shadow-2xs"
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
