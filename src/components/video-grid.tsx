"use client";

import { useState } from "react";
import type { VideoAnalysis } from "@/types";
import { formatBytes } from "@/lib/utils";

interface VideoGridProps {
  keepers: VideoAnalysis[];
  deletable: VideoAnalysis[];
}

function VideoPreview({ video, label }: { video: VideoAnalysis; label: string }) {
  const [playing, setPlaying] = useState(false);
  const thumbnailUrl = `/api/thumbnail?public_id=${encodeURIComponent(video.cloudinary_public_id)}`;
  const videoUrl = video.video_url;

  return (
    <div className="flex gap-3 rounded-lg border border-zinc-100 bg-zinc-50/50 p-3">
      <div className="relative aspect-[9/16] w-20 shrink-0 overflow-hidden rounded-md bg-zinc-200">
        {playing && videoUrl ? (
          <video
            src={videoUrl}
            controls
            autoPlay
            playsInline
            className="h-full w-full object-cover"
            onEnded={() => setPlaying(false)}
          />
        ) : (
          <>
            <img
              src={thumbnailUrl}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
            {videoUrl && (
              <button
                type="button"
                onClick={() => setPlaying(true)}
                className="absolute inset-0 flex items-center justify-center bg-black/30 transition hover:bg-black/40"
                aria-label="Reproducir"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-zinc-900">
                  ▶
                </span>
              </button>
            )}
          </>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-zinc-800">{video.filename}</p>
        <p className="mt-0.5 text-xs text-zinc-500">
          {formatBytes(video.size_mb * 1024 * 1024)}
          {video.duration > 0 && ` · ${Math.round(video.duration)} s`}
        </p>
        {video.reason && (
          <p className="mt-1 text-xs text-zinc-400 italic">{label}: {video.reason}</p>
        )}
      </div>
    </div>
  );
}

export function VideoGrid({ keepers, deletable }: VideoGridProps) {
  const [activeTab, setActiveTab] = useState<"keepers" | "deletable">("keepers");
  const videos = activeTab === "keepers" ? keepers : deletable;
  const label = activeTab === "keepers" ? "Guardar" : "Borrar";

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

      <div className="max-h-[320px] space-y-3 overflow-y-auto">
        {videos.length === 0 ? (
          <p className="py-4 text-xs text-zinc-400">Sin videos</p>
        ) : (
          videos.map((v) => (
            <VideoPreview key={v.cloudinary_public_id} video={v} label={label} />
          ))
        )}
      </div>
    </div>
  );
}
