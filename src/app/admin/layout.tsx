'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  BookOpen,
  ShoppingBag,
  Workflow,
  FileText,
  PhoneCall,
  Database,
  BarChart3,
  Settings,
  ShieldAlert,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Bell,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Live Conversations', href: '/admin/conversations', icon: MessageSquare, badge: 'Live' },
    { name: 'Leads & Scoring', href: '/admin/leads', icon: Users },
    { name: 'Knowledge Base (RAG)', href: '/admin/knowledge', icon: BookOpen },
    { name: 'Products & Services', href: '/admin/catalog', icon: ShoppingBag },
    { name: 'Workflows & Follow-Ups', href: '/admin/automations', icon: Workflow },
    { name: 'Forms & Journeys', href: '/admin/forms', icon: FileText },
    { name: 'WhatsApp Cloud API', href: '/admin/whatsapp', icon: PhoneCall },
    { name: 'CRM Integration', href: '/admin/crm', icon: Database },
    { name: 'Conversion Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings & Security', href: '/admin/settings', icon: Settings },
    { name: 'Audit Logs', href: '/admin/audit', icon: ShieldAlert }
  ];

  return (
    <div className="flex h-screen bg-slate-100 text-slate-800 font-sans antialiased overflow-hidden">
      {/* Sidebar */}
      <aside className={`w-64 bg-slate-900 text-slate-200 flex flex-col shrink-0 transition-all duration-200 border-r border-slate-800 z-30`}>
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center font-bold text-white shadow-md">
              A
            </div>
            <div>
              <span className="font-bold text-sm tracking-wide text-white block">Apex Enterprise</span>
              <span className="text-[10px] text-sky-400 font-medium block">Conversion Platform</span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="bg-sky-500/20 text-sky-300 text-[10px] px-1.5 py-0.5 rounded-full font-semibold border border-sky-400/30">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Live Site Demo Link & Status */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-xs">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between p-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            <div className="flex items-center space-x-2">
              <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
              <span>View Client Portal</span>
            </div>
            <ChevronRight className="w-3 h-3 text-slate-400" />
          </Link>

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Core System Healthy
            </span>
            <span className="text-slate-500 font-mono">v1.0.0</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 h-14 px-6 flex items-center justify-between shrink-0 shadow-2xs">
          <div className="flex items-center space-x-3">
            <h2 className="text-sm font-semibold text-slate-800">
              {navItems.find((n) => n.href === pathname)?.name || 'Platform Console'}
            </h2>
            <span className="text-slate-300">|</span>
            <span className="text-xs text-slate-500">Tenant: Apex Enterprise Solutions (Default Workspace)</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full border border-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
              <span>Grounded Knowledge Mode: <strong>Strict (No-Hallucination)</strong></span>
            </div>

            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
              <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
                AM
              </div>
              <div className="text-xs">
                <span className="font-medium text-slate-800 block">Alex Mercer</span>
                <span className="text-[10px] text-slate-500 block">Lead Architect</span>
              </div>
            </div>
          </div>
        </header>

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {children}
        </main>
      </div>
    </div>
  );
}
