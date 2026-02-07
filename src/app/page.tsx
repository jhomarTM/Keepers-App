"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { UploadZone } from "@/components/upload-zone";
import { InstallPrompt } from "@/components/install-prompt";

export default function Home() {
  const [artist, setArtist] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const router = useRouter();

  const handleAnalyze = () => {
    if (files.length === 0) return;
    // Guardar datos para la página de procesamiento (Cloudinary/Groq comentados - simulamos)
    if (typeof window !== "undefined") {
      sessionStorage.setItem("concert_artist", artist || "Artista");
      sessionStorage.setItem("concert_file_count", String(files.length));
      sessionStorage.setItem("concert_filenames", JSON.stringify(files.map((f) => f.name)));
    }
    router.push("/processing");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <Header />

        <div className="mt-8">
          <InstallPrompt />
        </div>

        <div className="mt-12 space-y-8">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <label htmlFor="artist" className="block text-sm font-medium text-zinc-700">
              ¿De qué concierto son estos videos?
            </label>
            <input
              id="artist"
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="ej. Bad Bunny, Taylor Swift..."
              className="mt-2 w-full rounded-lg border border-zinc-300 px-4 py-3 text-zinc-800 placeholder-zinc-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <UploadZone onFilesSelected={setFiles} selectedFiles={files} />
          </div>

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={files.length === 0}
            className="w-full rounded-xl bg-amber-500 px-6 py-4 text-lg font-semibold text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            🚀 Analizar videos
          </button>
        </div>
      </div>
    </div>
  );
}
