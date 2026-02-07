"use client";

import type { SessionResult } from "@/types";

interface ShortsPreviewProps {
  result: SessionResult;
}

export function ShortsPreview({ result }: ShortsPreviewProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-zinc-800">🎬 TOP 3 MEJORES MOMENTOS</h2>
        <p className="text-sm text-zinc-600">Listos para Instagram Stories</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {result.top_shorts.map((short, i) => (
          <div
            key={short.video_id}
            className="aspect-[9/16] overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100"
          >
            {/* Placeholder hasta integrar Cloudinary - mostrar thumbnail o video */}
            <div className="flex h-full w-full flex-col items-center justify-center bg-zinc-200 text-zinc-500">
              <span className="text-3xl">▶️</span>
              <span className="mt-2 text-xs">9:16</span>
              <span className="text-xs">5 seg</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
