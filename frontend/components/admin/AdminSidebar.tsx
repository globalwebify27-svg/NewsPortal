"use client";

import React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  Video,
  ImageIcon,
  BarChart3,
  Bot,
  LogOut,
} from "lucide-react";

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function AdminSidebar({ activeTab, setActiveTab }: AdminSidebarProps) {
  const navItems = [
    { id: "dashboard", label: "Dashboard Overview", icon: LayoutDashboard },
    { id: "articles", label: "Articles CMS", icon: FileText },
    { id: "videos", label: "YouTube Videos", icon: Video },
    { id: "media", label: "Media Library", icon: ImageIcon },
    { id: "ai", label: "AI Newsroom Tools", icon: Bot },
    { id: "analytics", label: "Analytics & Traffic", icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col justify-between border-r border-slate-800 shrink-0">
      <div>
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="bg-red-600 text-white font-extrabold px-2 py-0.5 rounded text-lg tracking-wider">
              GA
            </span>
            <span className="font-bold text-white text-lg tracking-tight">
              Global<span className="text-red-500">Awaaz</span>
            </span>
          </Link>
          <span className="text-[10px] uppercase tracking-wider font-semibold bg-red-950/80 text-red-400 border border-red-800/60 px-2 py-0.5 rounded">
            CMS v2.4
          </span>
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-red-600 text-white shadow-md shadow-red-900/40"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800">
        <Link
          href="/"
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          Exit to Main Site
        </Link>
      </div>
    </aside>
  );
}
