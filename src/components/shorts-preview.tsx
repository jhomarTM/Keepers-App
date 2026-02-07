"use client";

import { useState } from "react";
import type { SessionResult } from "@/types";

interface ShortsPreviewProps {
  result: SessionResult;
}

export function ShortsPreview({ result }: ShortsPreviewProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const shorts = result.top_shorts.filter((s) => s.short_url || s.thumbnail_url);

  if (shorts.length === 0) return null;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-zinc-900">Top 3 shorts</h3>
        <p className="mt-0.5 text-xs text-zinc-500">
          Los mejores clips para Instagram Stories. Toca para ver y descargar.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {shorts.map((short, i) => (
          <a
            key={short.video_id || i}
            href={short.short_url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block overflow-hidden rounded-xl bg-zinc-100 shadow-sm ring-1 ring-zinc-200/60 transition-all hover:shadow-md hover:ring-zinc-300"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="aspect-[9/16] overflow-hidden">
              {short.thumbnail_url ? (
                <img
                  src={short.thumbnail_url}
                  alt={`Short ${i + 1}`}
                  className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-zinc-300 text-xs">
                  —
                </div>
              )}
            </div>
            <div
              className={`absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity ${
                hovered === i ? "opacity-100" : "opacity-0"
              }`}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-lg text-zinc-900 shadow-lg">
                ▶
              </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-2">
              <span className="text-xs font-medium text-white drop-shadow">#{i + 1}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
