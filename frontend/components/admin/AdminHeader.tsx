"use client";

import React from "react";
import { Plus, Youtube } from "lucide-react";

interface AdminHeaderProps {
  onOpenArticleModal: () => void;
  onOpenVideoModal: () => void;
}

export default function AdminHeader({ onOpenArticleModal, onOpenVideoModal }: AdminHeaderProps) {
  return (
    <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Editorial Control Room</h1>
        <p className="text-xs text-slate-400">Manage breaking news, video hub, and AI publish workflow</p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onOpenVideoModal}
          className="flex items-center gap-2 px-3.5 py-2 bg-red-950/70 hover:bg-red-900 border border-red-800/80 text-red-300 hover:text-white rounded-lg text-xs font-semibold transition shadow-sm"
        >
          <Youtube className="w-4 h-4 text-red-500" />
          Add Video
        </button>

        <button
          onClick={onOpenArticleModal}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition shadow-md shadow-red-900/30"
        >
          <Plus className="w-4 h-4" />
          Create Article
        </button>
      </div>
    </header>
  );
}
