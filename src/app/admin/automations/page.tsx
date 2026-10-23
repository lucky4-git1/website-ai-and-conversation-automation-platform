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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Consent-Aware Workflows & Follow-Ups</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Durable background sequences, quiet-hours observance, and automatic cancellation upon visitor opt-out.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleRunWorkerNow}
            disabled={isRunningWorker}
            className="flex items-center space-x-1.5 text-xs bg-sky-600 hover:bg-sky-700 text-white font-medium px-3.5 py-2 rounded-lg shadow-sm transition"
          >
            <Play className={`w-3.5 h-3.5 ${isRunningWorker ? 'animate-spin' : ''}`} />
            <span>{isRunningWorker ? 'Executing Background Jobs...' : 'Trigger Workflow Worker'}</span>
          </button>
        </div>
      </div>

      {/* Worker Run Feedback Alert */}
      {workerResult && (
        <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-800 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-white block">Workflow Worker Execution Finished</span>
              <span className="text-slate-400">
                Processed {workerResult.processedWorkflows || 0} scheduled sequence(s), {workerResult.processedCrmSyncs || 0} CRM sync queue item(s).
              </span>
            </div>
          </div>
          <button onClick={() => setWorkerResult(null)} className="text-slate-400 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* Workflows Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {workflows.map((wf) => (
          <div key={wf.id} className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Workflow className="w-4 h-4 text-sky-600" />
                <h3 className="font-bold text-sm text-slate-900">{wf.name}</h3>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                {wf.isActive ? 'Active' : 'Disabled'}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{wf.description}</p>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Trigger Event:</span>
                <span className="font-mono font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded">{wf.trigger_event}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Quiet Hours:</span>
                <span className="font-medium text-slate-800 flex items-center gap-1">
                  <Moon className="w-3.5 h-3.5 text-indigo-500" />
                  {wf.quietHours?.enabled ? `${wf.quietHours.start} - ${wf.quietHours.end} (${wf.quietHours.timezone || 'UTC'})` : 'Disabled'}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-700 block mb-2">Configured Action Sequence:</span>
              <div className="space-y-1.5">
                {wf.actions?.map((act: any, idx: number) => (
                  <div key={idx} className="flex items-center space-x-2 text-xs bg-slate-100 text-slate-800 px-2.5 py-1.5 rounded-md font-mono">
                    <span className="text-slate-400">Step {act.step}:</span>
                    <span className="font-bold">{act.action}</span>
                    {act.provider && <span className="text-sky-600">({act.provider})</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Execution History Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Workflow Execution Logs & Reliability Ledger</h2>
            <p className="text-[11px] text-slate-500">Idempotency checks, retry tracking, and opt-out suppression.</p>
          </div>
          <button onClick={fetchData} className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Execution ID / Workflow</th>
                <th className="px-5 py-3">Associated Lead</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-center">Attempts</th>
                <th className="px-5 py-3">Execution History / Details</th>
                <th className="px-5 py-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {executions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                    No workflow executions recorded yet. Submit a quotation request to trigger an automated sequence.
                  </td>
                </tr>
              ) : (
                executions.map((ex) => (
                  <tr key={ex.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900">{ex.workflow_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{ex.id}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-slate-800">{ex.lead_name || 'Anonymous'}</div>
                      <div className="text-[10px] text-slate-400">{ex.lead_email || '—'}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        ex.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ex.status === 'CANCELLED'
                          ? 'bg-rose-100 text-rose-800'
                          : ex.status === 'RUNNING'
                          ? 'bg-sky-100 text-sky-800 animate-pulse'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ex.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center font-mono">
                      {ex.attempts} / {ex.max_attempts}
                    </td>
                    <td className="px-5 py-3.5">
                      {ex.error_log ? (
                        <span className="text-rose-600 font-medium">{ex.error_log}</span>
                      ) : ex.executionHistory?.length > 0 ? (
                        <div className="space-y-0.5 text-[11px] text-slate-600">
                          {ex.executionHistory.map((h: any, i: number) => (
                            <div key={i} className="flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>{h.action}: {h.status}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Scheduled for dispatch</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right text-slate-400 text-[11px]">
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
