"use client";

import type { UploadProgress } from "@/types";

interface ProgressBarProps {
  items: UploadProgress[];
}

export function ProgressBar({ items }: ProgressBarProps) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.filename} className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="truncate font-medium text-zinc-700">{item.filename}</span>
            <span className="shrink-0 text-zinc-500">
              {item.status === "complete" && "✓"}
              {item.status === "uploading" && `${item.progress}%`}
              {item.status === "pending" && "En cola"}
              {item.status === "error" && "Error"}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-zinc-200">
            <div
              className="h-full bg-amber-500 transition-all duration-300"
              style={{ width: `${item.progress}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
