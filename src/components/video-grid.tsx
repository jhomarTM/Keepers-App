"use client";

import { useState } from "react";
import type { VideoAnalysis } from "@/types";
import { formatBytes } from "@/lib/utils";

interface VideoGridProps {
  keepers: VideoAnalysis[];
  deletable: VideoAnalysis[];
}

export function VideoGrid({ keepers, deletable }: VideoGridProps) {
  const [activeTab, setActiveTab] = useState<"keepers" | "deletable">("keepers");
  const videos = activeTab === "keepers" ? keepers : deletable;

  return (
    <div className="space-y-3">
      <div className="flex gap-4 border-b border-zinc-100 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("keepers")}
          className={`text-sm ${activeTab === "keepers" ? "font-medium text-zinc-900" : "text-zinc-400"}`}
        >
          Guardar ({keepers.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("deletable")}
          className={`text-sm ${activeTab === "deletable" ? "font-medium text-zinc-900" : "text-zinc-400"}`}
        >
          Borrar ({deletable.length})
        </button>
      </div>

      <div className="max-h-40 space-y-1 overflow-y-auto">
        {videos.length === 0 ? (
          <p className="py-4 text-xs text-zinc-400">Sin videos</p>
        ) : (
          videos.map((v) => (
            <div key={v.id} className="flex items-center justify-between text-sm">
              <span className="truncate text-zinc-600">{v.filename}</span>
              <span className="shrink-0 text-zinc-400">{formatBytes(v.size_mb * 1024 * 1024)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
