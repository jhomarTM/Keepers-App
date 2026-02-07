"use client";

import type { UploadProgress } from "@/types";

interface ProgressBarProps {
  items: UploadProgress[];
}

export function ProgressBar({ items }: ProgressBarProps) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.filename} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="truncate text-zinc-600">{item.filename}</span>
            <span className="shrink-0 text-zinc-400">
              {item.status === "complete" && "✓"}
              {item.status === "uploading" && `${item.progress}%`}
              {item.status === "pending" && "—"}
            </span>
          </div>
          <div className="h-px bg-zinc-200">
            <div
              className="h-full bg-zinc-900 transition-all duration-300"
              style={{ width: `${item.progress}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
