"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { ResultsSummary } from "@/components/results-summary";
import { VideoGrid } from "@/components/video-grid";
import { ShortsPreview } from "@/components/shorts-preview";
import type { SessionResult, VideoAnalysis } from "@/types";

// Mock data para la UI - sin Cloudinary/Groq integrados
function getMockResult(artist: string): SessionResult {
  const keepers: VideoAnalysis[] = [
    {
      id: "1",
      filename: "clima_001.mov",
      cloudinary_public_id: "mock_1",
      duration: 45,
      size_mb: 120,
      created_at: "2024-06-15",
      quality_score: 85,
      is_blurry: false,
      is_dark: false,
      phash: "abc123",
      decision: "keep",
      reason: "Buena calidad",
    },
    {
      id: "2",
      filename: "clima_002.mov",
      cloudinary_public_id: "mock_2",
      duration: 38,
      size_mb: 95,
      created_at: "2024-06-15",
      quality_score: 78,
      is_blurry: false,
      is_dark: false,
      phash: "def456",
      decision: "keep",
      reason: "Momento único",
    },
  ];

  const deletable: VideoAnalysis[] = [
    {
      id: "3",
      filename: "clima_003.mov",
      cloudinary_public_id: "mock_3",
      duration: 12,
      size_mb: 320,
      created_at: "2024-06-15",
      quality_score: 25,
      is_blurry: true,
      is_dark: true,
      phash: "ghi789",
      decision: "delete",
      reason: "Borroso y oscuro",
    },
  ];

  return {
    artist,
    date: "15 Jun 2024",
    city: "Lima",
    total_videos: 3,
    keepers,
    deletable,
    duplicates: [],
    original_size_gb: 7.5,
    optimized_size_gb: 1.8,
    savings_gb: 5.7,
    savings_percentage: 76,
    top_shorts: [
      { video_id: "1", short_url: "", thumbnail_url: "" },
      { video_id: "2", short_url: "", thumbnail_url: "" },
      { video_id: "1", short_url: "", thumbnail_url: "" },
    ],
    zip_url: "",
    folder_name: `Concert_${artist.replace(/\s/g, "")}_2024-06-15_Lima`,
  };
}

export default function ResultsPage() {
  const [result, setResult] = useState<SessionResult | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const artist = sessionStorage.getItem("concert_artist") || "Artista";
    setResult(getMockResult(artist));
  }, []);

  if (!result) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-500">Cargando resultados...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <Header
          subtitle={`${result.artist} • ${result.date} • ${result.city}`}
        />

        <div className="mt-12 space-y-10">
          <ResultsSummary result={result} />

          <VideoGrid
            keepers={result.keepers}
            deletable={result.deletable}
            title="Ver videos"
          />

          <ShortsPreview result={result} />

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-800">📦 DESCARGAR</h2>
            <div className="rounded-xl border border-zinc-200 bg-white p-4">
              <p className="font-mono text-sm text-zinc-700">
                📁 {result.folder_name}.zip
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                ├── 📁 Keepers/ ({result.keepers.length} videos)
              </p>
              <p className="text-xs text-zinc-500">
                └── 📁 Stories/ (3 shorts)
              </p>
            </div>

            <button
              type="button"
              className="w-full rounded-xl border-2 border-dashed border-amber-400 bg-amber-50 py-4 font-semibold text-amber-800 transition-colors hover:bg-amber-100"
              onClick={() => alert("Descarga - integrar cuando Cloudinary/Groq estén listos")}
            >
              ⬇️ DESCARGAR TODO ({result.optimized_size_gb.toFixed(1)} GB)
            </button>

            <p className="text-center text-sm text-zinc-500">
              💡 Tip: Descomprime y copia la carpeta a tu galería
            </p>
          </div>

          <div className="pt-8 text-center">
            <Link
              href="/"
              className="text-amber-600 hover:text-amber-700 hover:underline"
            >
              ← Analizar otro concierto
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
