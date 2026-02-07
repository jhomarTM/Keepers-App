"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { ResultsSummary } from "@/components/results-summary";
import { VideoGrid } from "@/components/video-grid";
import { ShortsPreview } from "@/components/shorts-preview";
import type { SessionResult, VideoAnalysis } from "@/types";

function buildResultFromStorage(data: Record<string, unknown>): SessionResult {
  const keepers = (data.keepers as VideoAnalysis[]) || [];
  const deletable = (data.deletable as VideoAnalysis[]) || [];
  const shorts = (data.shorts as { video_id: string; short_url: string; thumbnail_url: string }[]) || [];

  return {
    artist: (data.artist as string) || "Artista",
    date: (data.date as string) || new Date().toLocaleDateString("es"),
    city: (data.city as string) || "",
    total_videos: keepers.length + deletable.length,
    keepers,
    deletable,
    duplicates: [],
    original_size_gb: (data.original_size_gb as number) || 0,
    optimized_size_gb: (data.optimized_size_gb as number) || 0,
    savings_gb: (data.savings_gb as number) || 0,
    savings_percentage: (data.savings_percentage as number) || 0,
    top_shorts: shorts.length > 0 ? shorts : [{ video_id: "", short_url: "", thumbnail_url: "" }],
    zip_url: "",
    folder_name: (data.folder_name as string) || "Concert",
  };
}

export default function ResultsPage() {
  const [result, setResult] = useState<SessionResult | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem("concert_result");
    if (stored) {
      try {
        setResult(buildResultFromStorage(JSON.parse(stored)));
      } catch {
        setResult(null);
      }
    } else {
      setResult(null);
    }
  }, []);

  if (!result) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-zinc-500">No hay resultados.</p>
        <Link href="/" className="text-xs text-zinc-500 underline hover:text-zinc-700">
          Volver
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-md px-5 py-12">
        <Header subtitle={`${result.artist} · ${result.date}`} />

        <div className="mt-12 space-y-8">
          <ResultsSummary result={result} />
          <VideoGrid keepers={result.keepers} deletable={result.deletable} />
          <ShortsPreview result={result} />

          <div className="space-y-4 border-t border-zinc-100 pt-8">
            <button
              type="button"
              className="w-full border border-zinc-900 bg-zinc-900 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
              onClick={() => alert("Descarga - integrar cuando Cloudinary/Groq estén listos")}
            >
              Descargar ({result.optimized_size_gb.toFixed(1)} GB)
            </button>
            <p className="text-center text-xs text-zinc-400">{result.folder_name}.zip</p>
          </div>

          <div className="pt-4 text-center">
            <Link href="/" className="text-xs text-zinc-500 underline hover:text-zinc-700">
              Nuevo análisis
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
