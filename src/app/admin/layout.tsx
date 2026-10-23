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
  Sparkles
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

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
    <div className="flex h-screen bg-[#0a0b0e] text-zinc-100 font-sans antialiased overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0e0f14] text-zinc-200 flex flex-col shrink-0 border-r border-white/[0.08] z-30">
        {/* Brand Header */}
        <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-600 flex items-center justify-center font-bold text-white shadow-[0_2px_10px_rgba(249,115,22,0.4),inset_0_1px_0_0_rgba(255,255,255,0.25)]">
              S
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-white block">SpeakForMe</span>
              <span className="text-[10px] text-orange-400 font-mono block">Enterprise Console</span>
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
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition duration-150 ${
                  isActive
                    ? 'bg-orange-600 text-white shadow-[0_2px_8px_rgba(249,115,22,0.35),inset_0_1px_0_0_rgba(255,255,255,0.2)]'
                    : 'text-zinc-400 hover:bg-zinc-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.5 rounded-full font-semibold border border-emerald-500/30">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Live Site Demo Link & Status */}
        <div className="p-3 border-t border-white/[0.06] bg-[#090a0d] text-xs">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between p-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-200 border border-white/[0.06] transition duration-150"
          >
            <div className="flex items-center space-x-2">
              <ExternalLink className="w-3.5 h-3.5 text-orange-400" />
              <span>View Client Portal</span>
            </div>
            <ChevronRight className="w-3 h-3 text-zinc-500" />
          </Link>

          <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500 px-1 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              SpeakForMe Engine
            </span>
            <span>v1.2.0</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-[#12131a] border-b border-white/[0.08] h-14 px-6 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center space-x-3">
            <h2 className="text-sm font-semibold text-zinc-100">
              {navItems.find((n) => n.href === pathname)?.name || 'Platform Console'}
            </h2>
            <span className="text-zinc-700">|</span>
            <span className="text-xs text-zinc-400">Workspace: SpeakForMe Technologies</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-xs bg-zinc-900 text-zinc-300 px-3 py-1.5 rounded-full border border-white/[0.08]">
              <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
              <span>Grounded Knowledge Mode: <strong>Strict (No-Hallucination)</strong></span>
            </div>

            <div className="flex items-center space-x-2 pl-2 border-l border-zinc-800">
              <div className="w-7 h-7 rounded-lg bg-orange-600/30 border border-orange-500/40 text-orange-300 font-bold flex items-center justify-center text-xs">
                AM
              </div>
              <div className="text-xs">
                <span className="font-medium text-zinc-200 block">Alex Mercer</span>
                <span className="text-[10px] text-zinc-500 block">Lead Architect</span>
              </div>
            </div>
          </div>
        </header>

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#090a0f]">
          {children}
        </main>
      </div>
    </div>
  );
}
