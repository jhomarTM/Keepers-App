"use client";

import { useState } from "react";
import type { VideoAnalysis } from "@/types";
import { formatBytes } from "@/lib/utils";

interface VideoGridProps {
  keepers: VideoAnalysis[];
  deletable: VideoAnalysis[];
  title: string;
}

export function VideoGrid({ keepers, deletable, title }: VideoGridProps) {
  const [activeTab, setActiveTab] = useState<"keepers" | "deletable">("keepers");
  const videos = activeTab === "keepers" ? keepers : deletable;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("keepers")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "keepers"
              ? "bg-emerald-600 text-white"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
          }`}
        >
          Keepers ({keepers.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("deletable")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "deletable"
              ? "bg-rose-600 text-white"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
          }`}
        >
          Borrables ({deletable.length})
        </button>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <h3 className="mb-3 font-medium text-zinc-800">{title}</h3>
        <div className="max-h-48 space-y-2 overflow-y-auto">
          {videos.length === 0 ? (
            <p className="py-4 text-center text-sm text-zinc-500">No hay videos</p>
          ) : (
            videos.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 text-sm"
              >
                <span className="truncate">{v.filename}</span>
                <span className="shrink-0 text-zinc-500">{formatBytes(v.size_mb * 1024 * 1024)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
