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
        {result.top_shorts.map((short) => (
          <div
            key={short.video_id}
            className="aspect-[9/16] bg-zinc-100"
          >
            <div className="flex h-full w-full items-center justify-center text-zinc-300 text-xs">
              —
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
