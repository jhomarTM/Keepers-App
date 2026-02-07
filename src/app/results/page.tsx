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
