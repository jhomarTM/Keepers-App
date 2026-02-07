"use client";

import type { SessionResult } from "@/types";

interface ShortsPreviewProps {
  result: SessionResult;
}

export function ShortsPreview({ result }: ShortsPreviewProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-zinc-500">Top 3 shorts</p>
      <div className="grid grid-cols-3 gap-2">
        {result.top_shorts
          .filter((s) => s.short_url || s.thumbnail_url)
          .map((short, i) => (
            <a
              key={short.video_id || i}
              href={short.short_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block aspect-[9/16] overflow-hidden bg-zinc-100"
            >
              {short.thumbnail_url ? (
                <img
                  src={short.thumbnail_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-zinc-300 text-xs">
                  —
                </div>
              )}
            </a>
          ))}
      </div>
    </div>
  );
}
