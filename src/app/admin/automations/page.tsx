'use client';

import React, { useState, useEffect } from 'react';
import {
  Workflow,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Moon,
  Database,
  Mail,
  PhoneCall,
  RefreshCw,
  Plus,
  ShieldCheck,
  Ban
} from 'lucide-react';

export default function AutomationsAdminPage() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [executions, setExecutions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRunningWorker, setIsRunningWorker] = useState(false);
  const [workerResult, setWorkerResult] = useState<any>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/workflows');
      const data = await res.json();
      setWorkflows(data.workflows || []);
      setExecutions(data.executions || []);
    } catch (err) {
      console.error('Failed to load workflows:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRunWorkerNow = async () => {
    setIsRunningWorker(true);
    setWorkerResult(null);
    try {
      const res = await fetch('/api/v1/workflows/run', { method: 'POST' });
      const data = await res.json();
      setWorkerResult(data);
      await fetchData();
    } catch (err: any) {
      setWorkerResult({ error: err.message });
    } finally {
      setIsRunningWorker(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#12131c] p-6 rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
              Autonomous Sequences
            </span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Consent-Aware Workflows & Follow-Ups</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Durable background sequences, quiet-hours observance, and automatic cancellation upon visitor opt-out.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleRunWorkerNow}
            disabled={isRunningWorker}
            className="flex items-center space-x-1.5 text-xs bg-orange-600 hover:bg-orange-500 active:scale-[0.98] text-white font-medium px-4 py-2.5 rounded-xl shadow-[0_2px_10px_rgba(249,115,22,0.35),inset_0_1px_0_0_rgba(255,255,255,0.25)] transition duration-150 disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${isRunningWorker ? 'animate-spin' : ''}`} />
            <span>{isRunningWorker ? 'Executing Background Jobs...' : 'Trigger Workflow Worker'}</span>
          </button>
        </div>
      </div>

      {/* Worker Run Feedback Alert */}
      {workerResult && (
        <div className="p-4 rounded-xl bg-[#151724] text-white border border-orange-500/30 text-xs flex items-center justify-between shadow-[0_2px_12px_rgba(249,115,22,0.15)]">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-white block">Workflow Worker Execution Finished</span>
              <span className="text-zinc-400">
                Processed {workerResult.processedWorkflows || 0} scheduled sequence(s), {workerResult.processedCrmSyncs || 0} CRM sync queue item(s).
              </span>
            </div>
          </div>
          <button onClick={() => setWorkerResult(null)} className="text-zinc-400 hover:text-white text-xs p-1">✕</button>
        </div>
      )}

      {/* Workflows Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {workflows.map((wf) => (
          <div key={wf.id} className="bg-[#12131c] rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Workflow className="w-4 h-4 text-orange-400" />
                <h3 className="font-bold text-sm text-white">{wf.name}</h3>
              </div>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold px-2 py-0.5 rounded-full font-mono">
                {wf.isActive ? 'Active' : 'Disabled'}
              </span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">{wf.description}</p>

            <div className="bg-[#0a0b0e] border border-white/[0.08] rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 font-mono text-[11px]">Trigger Event:</span>
                <span className="font-mono font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded text-[11px]">{wf.trigger_event}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-zinc-400 font-mono text-[11px]">Quiet Hours:</span>
                <span className="font-medium text-zinc-200 flex items-center gap-1.5 font-mono text-[11px]">
                  <Moon className="w-3.5 h-3.5 text-orange-400" />
                  {wf.quietHours?.enabled ? `${wf.quietHours.start} - ${wf.quietHours.end} (${wf.quietHours.timezone || 'UTC'})` : 'Disabled'}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-2">Configured Action Sequence:</span>
              <div className="space-y-1.5">
                {wf.actions?.map((act: any, idx: number) => (
                  <div key={idx} className="flex items-center space-x-2 text-xs bg-[#0a0b0e] border border-white/[0.06] text-zinc-300 px-3 py-2 rounded-xl font-mono">
                    <span className="text-zinc-500">Step {act.step}:</span>
                    <span className="font-bold text-white">{act.action}</span>
                    {act.provider && <span className="text-orange-400">({act.provider})</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Execution History Table */}
      <div className="bg-[#12131c] rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">Workflow Execution Logs & Reliability Ledger</h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">Idempotency checks, retry tracking, and opt-out suppression.</p>
          </div>
          <button onClick={fetchData} className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 bg-zinc-800 px-2.5 py-1.5 rounded-lg border border-white/[0.08] transition duration-150">
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0e0f15] border-b border-white/[0.06] text-zinc-400 font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Execution ID / Workflow</th>
                <th className="px-6 py-3.5">Associated Lead</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-center">Attempts</th>
                <th className="px-6 py-3.5">Execution History / Details</th>
                <th className="px-6 py-3.5 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-zinc-300">
              {executions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 font-mono">
                    No workflow executions recorded yet. Submit a quotation request to trigger an automated sequence.
                  </td>
                </tr>
              ) : (
                executions.map((ex) => (
                  <tr key={ex.id} className="hover:bg-white/[0.02] transition duration-150">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{ex.workflow_name}</div>
                      <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{ex.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{ex.lead_name || 'Anonymous'}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">{ex.lead_email || '—'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border font-mono ${
                        ex.status === 'COMPLETED'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : ex.status === 'CANCELLED'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : ex.status === 'RUNNING'
                          ? 'bg-orange-500/20 text-orange-300 border-orange-500/30 animate-pulse'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}>
                        {ex.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-zinc-400">
                      {ex.attempts} / {ex.max_attempts}
                    </td>
                    <td className="px-6 py-4">
                      {ex.error_log ? (
                        <span className="text-rose-400 font-medium font-mono text-[11px]">{ex.error_log}</span>
                      ) : ex.executionHistory?.length > 0 ? (
                        <div className="space-y-1 text-[11px] text-zinc-400">
                          {ex.executionHistory.map((h: any, i: number) => (
                            <div key={i} className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span>{h.action}: {h.status}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-zinc-500 italic">Scheduled for dispatch</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-zinc-500 text-[11px] font-mono">
                      {new Date(ex.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
