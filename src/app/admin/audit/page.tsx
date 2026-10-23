'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Clock,
  User,
  Search,
  Filter,
  RefreshCw,
  FileText,
  ShieldCheck
} from 'lucide-react';

export default function AuditAdminPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/audit?limit=50');
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#12131c] p-6 rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
              Compliance Ledger
            </span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">System & Administrative Audit Ledger</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Immutable records of administrative changes, source deletions, role authorizations, and data exports.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={isLoading}
          className="flex items-center space-x-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 active:scale-[0.98] text-zinc-200 px-3.5 py-2.5 rounded-xl border border-white/[0.08] transition duration-150"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-orange-400' : ''}`} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Audit Log Table */}
      <div className="bg-[#12131c] rounded-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0e0f15] border-b border-white/[0.06] text-zinc-400 font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Timestamp</th>
                <th className="px-6 py-3.5">Operator / Principal</th>
                <th className="px-6 py-3.5">Action</th>
                <th className="px-6 py-3.5">Target Entity</th>
                <th className="px-6 py-3.5">Details / Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-zinc-300">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 font-mono">
                    No administrative audit events recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition duration-150">
                    <td className="px-6 py-4 text-zinc-500 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-white">
                      {log.user_email}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded text-[11px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-400 font-mono text-[11px]">
                      {log.target_type} {log.target_id && <span className="text-[10px] text-zinc-500">({log.target_id})</span>}
                    </td>
                    <td className="px-6 py-4">
                      <pre className="text-[10px] text-zinc-400 font-mono bg-[#0a0b0e] border border-white/[0.06] p-2 rounded-lg max-w-md overflow-x-auto">
                        {JSON.stringify(log.details || {}, null, 1)}
                      </pre>
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
